import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat
} from 'graphql';

import db from '../db';
import Translation from './Translation';

export default new GraphQLObjectType({
   description: 'A menu',
   name: 'Menu',
   sqlTable: 'menus',
   uniqueKey: 'id',
   fields: () => ({
     id: {
       type: GraphQLInt
     },
     name: {
       type: new GraphQLList(Translation),
       args: {
        lang: {
          type: GraphQLString
        }
       },
       junction: {
         sqlTable: 'translatables',
         sqlJoins: [
           (menusTable, translatablesTable, args) => `${menusTable}.name_translatable_id = ${translatablesTable}.id`,
           (translatablesTable, translationsTable, args) => {
             let joinStr = `${translatablesTable}.id = ${translationsTable}.translatable_id`;
             if(args.lang) joinStr += db.knex.raw(` AND ${translationsTable}.lang = ?`, args.lang).toString();
             return joinStr;
           },
         ]
       }
     }
     // TODO: items.
   })
 });
