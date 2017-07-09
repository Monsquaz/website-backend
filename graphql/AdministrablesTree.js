import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat
} from 'graphql';

import db from '../db';

const AdministrablesTree = new GraphQLObjectType({
   description: 'An administrable mapping',
   name: 'AdministrablesTree',
   sqlTable: 'administrables_administrables',
   uniqueKey: 'id',
   fields: () => ({
     id: {
       type: GraphQLInt
     },
     ancestor: {
       type: GraphQLInt
     },
     descendant: {
       type: GraphQLInt
     }
   })
 });

export default AdministrablesTree ;
