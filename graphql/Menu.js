import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat
} from 'graphql';

import knex from '../db';

export default new GraphQLObjectType({
   description: 'A menu',
   name: 'Menu',
   sqlTable: 'menus',
   uniqueKey: 'id',
   fields: () => ({
     id: {
       type: GraphQLInt
     }
     // name_translatable_id
     // administrable_id
   })
 });
