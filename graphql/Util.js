import {
  GraphQLList,
  GraphQLString,
  GraphQLInt
} from 'graphql';

import Translation from './Translation';
import Acl from './Acl';
import {
  union,
  difference
} from 'lodash';

import db from '../db';

const Util = {

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
          let joinStr = `${translatablesTable}.id = ${translationsTable}.translatable_id`;
          if(args.lang) joinStr += db.knex.raw(` AND ${translationsTable}.lang = ?`, args.lang).toString();
          return joinStr;
        }
      ]
    }
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
  }

};

export default Util;
