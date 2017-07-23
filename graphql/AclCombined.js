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

const AclCombined = new GraphQLObjectType({
   description: 'A combined ACL mapping',
   name: 'AclCombined',
   sqlTable: `acl`,
   uniqueKey: ['action_id','administrable_id','user_id'],
   fields: () => ({
     name: {
       type: GraphQLString,
       sqlColumn: 'action_name'
     },
     administrable: Util.administrableField('administrable_id')
   })
 });

export default AclCombined;
