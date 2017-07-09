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

const Action = new GraphQLObjectType({
   description: 'An action',
   name: 'Action',
   sqlTable: 'actions',
   uniqueKey: 'id',
   fields: () => ({
     id: {
       type: GraphQLInt
     },
     name: {
       type: GraphQLString
     },
     description: Util.translationField('description_translatable_id')
   })
 });
export default Action;
