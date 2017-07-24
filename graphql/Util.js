import {
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLError
} from 'graphql';

import Translation from './Translation';
import AclCombined from './AclCombined';
import Administrable from './Administrable';
import {
  uniq
} from 'lodash';

import {
  union,
  difference
} from 'lodash';

import db from '../db';

const Util = {

  askedFor: (resolveInfo) => {
    let result = [];
    (function traverse(selection, parentName){
      if(parentName) result.push(`${parentName}.${selection.name.value}`);
      if(selection.selectionSet) {
        for(let childSelection of selection.selectionSet.selections) {
          traverse(childSelection, selection.name.value);
        }
      }
    })(resolveInfo.fieldNodes[0])
    return result;
  },

  toTree: (selection) => {
    return _toTree(selection);
  },

  getInsertId: async (knex) => {
    knex = knex || db.knex;
    let res = await knex.raw('SELECT LAST_INSERT_ID() AS result');
    return res[0][0].result;
  },

  inAllLanguages: (content) => {
    return ['sv', 'en'].map( (lang) => ({lang, content}) );
  },

  isInt: (v) => {
    return typeof v === 'number' && (v % 1) === 0;
  },

  isValidSlug: (str) => {
    let pattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    return pattern.test(str);
  },

  slugify: (str) => {
    return str.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
  },

  translationField: (fieldName) => ({
    type: new GraphQLList(Translation),
    args: {
      lang: {
        type: GraphQLString
      }
    },
    junction: {
      sqlTable: 'translatables',
      sqlJoins: [
        (thisTable, translatablesTable, args) => `${thisTable}.${fieldName} = ${translatablesTable}.id`,
        (translatablesTable, translationsTable, args) => {
          let joins = [`${translatablesTable}.id = ${translationsTable}.translatable_id`];
          if(args.lang) joins.push(db.knex.raw(`${translationsTable}.lang = ?`, args.lang).toString());
          return joins.join(' AND ');
        }
      ]
    }
  }),

  administrableField: (fieldName) => ({
    type: Administrable,
    sqlTable: 'administrable',
    sqlJoin: (thisTable, administrablesTable, args) =>
      `${thisTable}.${fieldName} = ${administrablesTable}.id`
  }),

  treeField: (tableName, ItemType, parentKey) => ({
    type: new GraphQLList(ItemType),
    args: {
      root: {
        type: GraphQLInt
      },
      depth: {
        type: GraphQLInt
      }
    },
    sqlTable: tableName,
    sqlJoin: (thisTable, treeTable, args) => {
      let joinStr = `depth = 1`;
      if(parentKey) {
        joinStr += ` AND ${thisTable}.id = ${treeTable}.${parentKey}`;
      }
      if(args.root) {
         joinStr += ` AND (${treeTable}.ancestor = ${args.root} OR ${treeTable}.ancestor IN (SELECT descendant FROM ${tableName} WHERE ancestor = ${args.root}`
        if(args.depth) {
          joinStr += ` AND depth <= ${args.depth}`;
        }
        joinStr += '))';
      } else if(args.depth) {
        throw new Error('Depth without root');
      }
      return joinStr;
    }
  }),

  actionsField: (fieldName) => {
    let result = {
      type: new GraphQLList(AclCombined),
      sqlJoin: (thisTable, aclCombinedTable, args, context) => {
        let joinStr = `${thisTable}.${fieldName} = ${aclCombinedTable}.administrable_id AND (${aclCombinedTable}.user_id = 1`;
        /*
          TODO: Add argument to let us see which actions another user has on the administrable.
          What do we need to be allowed to do this => action "viewActions" on the administrable.
          It's OK to return empty list of actions if we lack the permission.
        */
        if(context.userId) joinStr += ` OR ${derivedTable}.user_id = ${context.userId}`;
        joinStr += ')';
        return joinStr;
      }
    };
    return result;
  },

  requireAction: (userId, tableName, fieldName, actionName) => {
    let userIdChecks = ['user_id = 1']; // Guest
    if(userId) userIdChecks.push(db.knex.raw(`user_id = ?`, userId).toString());
    return db.knex.raw(
      `? IN (
        SELECT action_name
        FROM acl
        WHERE (${userIdChecks.join(' OR ')})
          AND administrable_id=${tableName}.${fieldName})`, actionName).toString();
  },

  requireAllActions: (userId, tableName, fieldName, actionNames) => {
    if(actionNames.length == 1) {
      return Util.requireAction(userId, tableName, fieldName, actionNames[0]);
    }
    let userIdChecks = ['user_id = 1']; // Guest
    if(userId) userIdChecks.push(db.knex.raw(`user_id = ?`, userId).toString());
      return `(SELECT COUNT(*)
             FROM acl
             WHERE (${userIdChecks.join(' OR ')})
               AND administrable_id=${tableName}.${fieldName}
               AND action_name IN (${actionNames.map((e) => db.knex.raw('?', e)).join(',')})
             ) = ${actionNames.length}`
  },

  requireAnyActions: (userId, tableName, fieldName, actionNames) => {
    if(actionNames.length == 1) {
      return Util.requireAction(userId, tableName, fieldName, actionNames[0]);
    }
    let userIdChecks = ['user_id = 1']; // Guest
    if(userId) userIdChecks.push(db.knex.raw(`user_id = ?`, userId).toString());
    return `(SELECT COUNT(*)
             FROM acl
             WHERE (${userIdChecks.join(' OR ')})
               AND administrable_id=${tableName}.${fieldName}
               AND action_name IN (${actionNames.map((e) => db.knex.raw('?', e)).join(',')})
             ) > 0`;
  },

  // Standard arguments to be included via spread
  actionArguments: {
    action: {
      description: 'An action that we are required to have',
      type: GraphQLString
    },
    actionsAll: {
      description: 'Actions that we are required to have all of',
      type: new GraphQLList(GraphQLString)
    },
    actionsAny: {
      description: 'Actions that we are required to have at least one of',
      type: new GraphQLList(GraphQLString)
    }
  },

  handleActionArguments: (params) => {
    let actionsAll = union(
      params.args.action ? [params.args.action] : [],
      params.args.actionsAll || [],
      params.required || []);
    if(actionsAll) {
      params.wheres.push(Util.requireAllActions(
        params.user_id,
        params.tableName,
        params.fieldName,
        actionsAll
      ));
    }
    if(params.args.actionsAny) {
      let actionsAny = difference(args.actionsAny, actionsAll);
      params.wheres.push(Util.requireAnyActions(
        params.user_id,
        params.tableName,
        params.fieldName,
        actionsAny
      ));
    }
  },

  deleteTranslatable: async (id, knex) => {
    knex = knex || db.knex;
    await knex.transaction(async (t) => {
      await t('translations')
        .where({translatable_id: id})
        .delete();
      await t('translatable')
        .where({id})
        .delete();
    });
  },

  deleteAdministrable: async (params, knex) => {
    knex = knex || db.knex;

    await knex.transaction(async (t) => {
      let translatableId = await t('administrables')
        .where({id: params.id})
        .select('name_translatable_id');
      await Util.deleteTranslatable(translatableId, t);

      let canDelete = await Util.hasActionOnAdministrable(params.userId, params.id, 'delete', t);

      if(!canDelete) {
        throw new GraphQLError('Missing delete action on administrable.');
      }

      let res = await t.raw(`
        SELECT COUNT(*) > 0 AS result FROM administrables_administrables
        WHERE ancestor = ? AND descendant != ?
        `, [params.id, params.id]);

      let hasChildren = res[0][0].result;

      if(hasChildren) {
        throw new GraphQLError('Administrable has children. Delete them first.');
      }

      await t('administrables_administrables')
        .where({descendant: params.id})
        .delete();

      await t('administrables')
        .where({id: params.id})
        .delete();

    });
  },

  updateAdministrable: async (params, knex) => {
    knex = knex || db.knex;
    await knex.transaction(async (t) => {

      if(params.nameTranslations) {
        let translatableId = await t('administrable')
          .where({id: params.id})
          .select('name_translatable_id');
        let translations = [];
        let langs = [];
        for(translation of params.nameTranslations) {
          langs.push(translation.lang);
          translation.translatable_id = translatableId;
          translations.push(translation);
        }
        await t('translations')
          .where({translatable_id: translatableId})
          .andWhere(() => {
            this.whereIn('lang', langs);
          }).delete();
        await t('translations').insert(translations);
      }

      if(params.parentAdministrableId) {

        if(params.requiredActionsOnParent) {
          let hasRequiredActionsOnParent = await Util.hasAllActionsOnAdministrable(
            params.userId, params.parentAdministrableId, params.requiredActionsOnParent, t
          );
          if(!hasRequiredActionsOnParent) {
            throw new GraphQLError(`Missing one or more actions on parent: ${params.requiredActionsOnParent.join(', ')}`);
          }
        }
        if(params.requiredActions) {
          let hasActions = await Util.hasAllActionsOnAdministrable(
            params.userId, params.id, params.requiredActions, t
          );
          if(!hasActions) {
            throw new GraphQLError(`Missing one or more actions: ${params.requiredActions.join(', ')}`);
          }
        }

        let canMovePage = await Util.hasActionOnAdministrable(params.userId, params.id, 'move', t);

        if(!canMovePage) {
         throw new GraphQLError('Not allowed to move administrable.');
        }

        await t.raw(
          `DELETE FROM administrables_administrables WHERE descendant = ?`, [params.id]
        );

        await t.raw(`
          INSERT INTO administrables_administrables (depth, ancestor, descendant)
            SELECT depth+1, ancestor, ? FROM administrables_administrables
            WHERE descendant = ?
            UNION ALL SELECT 0, ?, ?
        `, [params.id, params.parentAdministrableId, params.id, params.id]);

      }
    });
  },

  createTranslatable: async (translations, knex) => {
    knex = knex || db.knex;
    let result;
    await knex.transaction(async (t) => {
      let langs = translations.map(e => e.lang);
      let uniqLangs = uniq(langs);
      if(langs.length != uniqLangs.length) {
        throw new GraphQLError('Multiple translations with the same language.');
      }
      await t('translatables').insert({});
      let translatableId = await Util.getInsertId(t);
      if(translations.length > 0) {
        let translationsData = [];
        for(let translation of translations) {
          translation.translatable_id = translatableId;
          translationsData.push(translation);
        }
        await t('translations').insert(translationsData);
      }
      result = translatableId;
    });
    return result;
  },

  updateTranslatable: async (id, translations, knex) => {
    knex = knex || db.knex;
    await db.knex.transaction(async (t) => {
      let langs = translations.map(e => e.lang);
      let uniqLangs = uniq(langs);
      if(langs.length != uniqLangs.length) {
        throw new GraphQLError('Multiple translations with the same language.');
      }
      await t('translations')
        .where({translatable_id: id})
        .whereIn('lang', uniqLangs)
        .delete();
      await t('translations')
        .insert(translations.map(e => ({translatable_id: id, ...e})));
    });
  },

  createAdministrable: async (params, knex) => {
    knex = knex || db.knex;

    let administrableId;
    await knex.transaction(async (t) => {

      if(params.requiredActionsOnParent) {
        let hasRequiredActionsOnParent = await Util.hasAllActionsOnAdministrable(
          params.userId, params.parentAdministrableId, params.requiredActionsOnParent, t
        );

        if(!hasRequiredActionsOnParent) {
          throw new GraphQLError(`Missing one or more actions: ${params.requiredActionsOnParent.join(', ')}`);
        }
      }

      let translatableId = await Util.createTranslatable(params.nameTranslations, t);

      await t('administrables').insert({
        'name_translatable_id': translatableId,
        'created': db.knex.fn.now(),
        'changed': db.knex.fn.now(),
        'created_by': params.userId,
        'changed_by': params.userId
      });

      administrableId = await Util.getInsertId(t);

      await t.raw(`
        INSERT INTO administrables_administrables (depth, ancestor, descendant)
          SELECT depth+1, ancestor, ? FROM administrables_administrables
          WHERE descendant = ?
          UNION ALL SELECT 0, ?, ?
      `, [
        administrableId,
        params.parentAdministrableId,
        administrableId,
        administrableId
      ]);

    });

    return administrableId;
  },

  hasActionOnAdministrable: async (userId, administrableId,  action, knex) => {
    knex = knex || db.knex;
    let res = await knex.raw(`SELECT COUNT(*) > 0 AS result
     FROM administrables
     WHERE administrables.id = ? AND ${Util.requireAction (
       userId, 'administrables', 'id', action
     )}`, administrableId);
    return res[0][0].result;
  },

  hasAllActionsOnAdministrable: async (userId, administrableId, actions, knex) => {
    knex = knex || db.knex;
    let res = await knex.raw(`SELECT COUNT(*) > 0 AS result
     FROM administrables
     WHERE administrables.id = ? AND ${Util.requireAllActions (
       userId, 'administrables', 'id', actions
     )}`, administrableId);
    return res[0][0].result;
  },

  hasAnyActionsOnAdministrable: async (userId, administrableId, actions, knex) => {
    knex = knex || db.knex;
    let res = await knex.raw(`SELECT COUNT(*) > 0 AS result
     FROM administrables
     WHERE administrables.id = ? AND ${Util.requireAnyActions (
       userId, 'administrables', 'id', actions
     )}`, administrableId);
    return res[0][0].result;
  },

  existanceAndActionCheck: async (userId, params, knex) => {
    knex = knex || db.knex;
    let foreignKeyName = params.foreignKeyName || 'administrable_id';
    let entities = await knex(params.tableName)
      .where({id: params.id})
      .select(foreignKeyName);
    if(entities.length == 0) {
      throw new GraphQLError(`${params.entityName} ${input.viewTypeId} doesn't exist.`);
    }
    let entity = entities[0];
    let canUseEntity = await Util.hasAllActionsOnAdministrable(
      userId, entity[foreignKeyName], params.actions, knex
    );
    if(!canUseEntity) {
      throw new GraphQLError(
        `Insufficient actions for ${params.entityName} (administrableId: ${entity[foreignKeyName]}).`
      + ` Requires: ${params.actions.join(', ')}`
      );
    }
  },

  existanceAndActionChecks: async (userId, batch, knex) => {
    await Promise.all(
      batch
        .filter(   params => params.id)
        .map(async params => await Util.existanceAndActionCheck(userId, params, knex))
    );
  },

  exists: async (params, knex) => {
    let check = await knex(params.tableName).where(params.where).count('*');
    for(let prop in check[0]) {
      if(check[0][prop] > 0) {
        return true;
      } else {
        return false;
      }
    }
  },

  alreadyExistsCheck: async (params, knex) => {
    if(await Util.exists(params, knex)) {
      throw new GraphQLError(params.errorMessage);
    }
  },

  alreadyExistsChecks: async (batch, knex) => {
    await Promise.all(
      batch.map(async params => await Util.alreadyExistsCheck(params, knex))
    )
  }

};

export default Util;
