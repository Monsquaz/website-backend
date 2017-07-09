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

const Acl = new GraphQLObjectType({
   description: 'An ACL mapping',
   name: 'Acl',
   sqlTable: `acl`,
   uniqueKey: ['action_id','administrable_id','user_id'],
   fields: () => ({
     id: {
       type: GraphQLInt,
       sqlColumn: 'action_id'
     },
     name: {
       type: GraphQLString,
       sqlColumn: 'action_name'
     }
   })
 });

export default Acl;
