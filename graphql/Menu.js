import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat
} from 'graphql';

import knex from '../db';
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
       junction: {
         sqlTable: 'translatables',
         sqlJoins: [
           (menusTable, translatablesTable, args) => `${menusTable}.name_translatable_id = ${translatablesTable}.id`,
           (translatablesTable, translationsTable, args) => `${translatablesTable}.id = ${translationsTable}.translatable_id`,
         ]
       }
     }
     // name_translatable_id
     // administrable_id
   })
 });
