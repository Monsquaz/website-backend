import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat
} from 'graphql';

import knex from '../db';

export default new GraphQLObjectType({
   description: 'A translation',
   name: 'Translation',
   sqlTable: 'translations',
   uniqueKey: 'id',
   fields: () => ({
     lang: {
       type: GraphQLString
     },
     content: {
       type: GraphQLString
     }
   })
 });
