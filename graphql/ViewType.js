import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat
} from 'graphql';

import db from '../db';
import Translation from './Translation';
import Util from './Util';

const ViewType = new GraphQLObjectType({
   description: 'A view type',
   name: 'ViewType',
   sqlTable: 'view_types',
   uniqueKey: 'id',
   fields: () => ({
     id: {
       type: GraphQLInt
     },
     schema: {
       type: GraphQLString
     },
     schemaForm: {
       type: GraphQLString
     },
     component: {
       type: GraphQLString
     }
   })
 });

export default ViewType;
