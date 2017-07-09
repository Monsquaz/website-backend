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

export default new GraphQLObjectType({
   description: 'A user',
   name: 'User',
   sqlTable: 'users',
   uniqueKey: 'id',
   fields: () => ({
     id: {
       type: GraphQLInt
     },
     name: {
       type: GraphQLString
     },
     actions: Util.actionsField('administrable_id')
   })
 });
