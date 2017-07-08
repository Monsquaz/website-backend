import {
  GraphQLList,
  GraphQLString,
  GraphQLInt
} from 'graphql';

import Translation from './Translation';
import db from '../db';

export default {
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
  })
};
