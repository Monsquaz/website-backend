import {
  GraphQLList,
  GraphQLString,
  GraphQLInt
} from 'graphql';

import Translation from './Translation';
import Acl from './Acl';

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

  treeField: (tableName, ItemType) => ({
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
      let joinStr = `${thisTable}.id = ${treeTable}.menu_id AND depth = 1`;
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

  requireAtLeastOneAction: (userId, tableName, fieldName, actionNames) => {
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
  }
};

export default Util;
