import {
  GraphQLList,
  GraphQLString,
  GraphQLInt
} from 'graphql';

import Translation from './Translation';
import Acl from './Acl';
import Administrable from './Administrable';

import {
  union,
  difference
} from 'lodash';

import db from '../db';

const Util = {

  isInt: (v) => {
    return typeof v === 'number' && (v % 1) === 0;
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
          if(args.lang) joins.push(db.knex.raw(` AND ${translationsTable}.lang = ?`, args.lang).toString());
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
      type: new GraphQLList(Acl),
      sqlJoin: (thisTable, aclTable, args, context) => {
        let joinStr = `${thisTable}.${fieldName} = ${aclTable}.administrable_id AND (${aclTable}.user_id = 1`;
        /*
          TODO: Add argument to let us see which actions another user has on the administrable.
          What do we need to be allowed to do this => action "viewActions" on the administrable.
          It's OK to return empty list of actions if we lack the permission.
        */
        if(context.user_id) joinStr += ` OR ${derivedTable}.user_id = ${context.user_id}`;
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
               AND action_name = ANY(SELECT ${actionNames.map((e) => db.knex.raw('?', e)).join(',')})
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
               AND action_name = ANY(SELECT ${actionNames.map((e) => db.knex.raw('?', e)).join(',')})
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

  updateAdministrable: async (params) => {
    await db.knex.transaction(async (t) => {

      if(params.nameTranslations) {
        let translatableId = await db.knex('administrable')
          .where({id: params.id})
          .select('name_translatable_id');
        let translations = [];
        let langs = [];
        for(translation of params.nameTranslations) {
          langs.push(translation.lang);
          translation.translatable_id = translatableId;
          translations.push(translation);
        }
        await db.knex('translations')
          .where({translatable_id: translatableId})
          .andWhere(() => {
            this.whereIn('lang', langs);
          }).delete();
        await db.knex('translations').insert(translations);
      }

      if(params.parentAdministrableId) {

        let canCreatePages = await db.knex.raw(
          `SELECT COUNT(*)
           FROM administrables
           WHERE administrables.id = ? AND ${Util.requireAllActions (
             params.userId, 'administrables', 'id', ['createPages']
           )}`, params.parentAdministrableId);

        if(!canCreatePages) {
          throw new GraphQLError('Not allowed to create pages on new parent.');
        }

        let canMovePage = await db.knex.raw(
          `SELECT COUNT(*)
           FROM administrables
           WHERE administrables.id = ? AND ${Util.requireAllActions (
             params.userId, 'administrables', 'id', ['move']
           )}`, params.id);

        if(!canMovePage) {
         throw new GraphQLError('Not allowed to move administrable.');
        }

        await db.knex.raw(
          `DELETE FROM administrables_administrables WHERE descendant = ?`, [params.id]
        );
        
        await db.knex.raw(`
          INSERT INTO administrables_administrables (depth, ancestor, descendant)
            SELECT depth+1, ancestor, ? FROM administrables_administrables
            WHERE descendant = ?
            UNION ALL SELECT 0, ?, ?
        `, [params.id, params.parentAdministrableId, params.id, params.id]);

      }
    });
  },

  createAdministrable: async (params) => {

    let administrableId;
    await db.knex.transaction(async (t) => {

      let canCreatePages = await db.knex.raw(
        `SELECT COUNT(*)
         FROM administrables
         WHERE administrables.id = ? AND ${Util.requireAllActions (
           params.userId, 'administrables', 'id', ['createPages']
         )}`, params.parentAdministrableId);

      if(!canCreatePages) {
        throw new GraphQLError('Not allowed to create pages on administrable.');
      }

      await db.knex('translatables').insert({});

      let translatableId = await db.knex.raw('SELECT LAST_INSERT_ID()')[0];

      if(params.nameTranslations) {
        let translations = [];
        for(translation of params.nameTranslations) {
          translation.translatable_id = translatableId;
          translations.push(translation);
        }
        await db.knex('translations').insert(translations);
      }

      await db.knex('administrables').insert({
        'name_translatable_id': translatableId,
        'created': db.knex.fn.now(),
        'updated': db.knex.fn.now(),
        'created_by': params.userId,
        'changed_by': params.userId
      });

      administrableId = await db.knex.raw('SELECT LAST_INSERT_ID()')[0];

      await db.knex.raw(`
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
  }

};

export default Util;
