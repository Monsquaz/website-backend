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
import AclCombined from './AclCombined';
import AclUser from './AclUser';

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
     administrable: Util.administrableField('administrable_id'),
     actions: Util.actionsField('administrable_id'),
     userCombinedActions: {
       type: new GraphQLList(AclCombined),
       sqlTable: 'acl',
       sqlJoin: (thisTable, aclTable, args) =>
         `${thisTable}.id = ${aclTable}.user_id`
     },
     userExplicitActions: {
       type: new GraphQLList(AclUser),
       sqlTable: 'users_actions_administrables',
       sqlJoin: (thisTable, aclTable, args) =>
         `${thisTable}.id = ${aclTable}.user_id`
     }
     /*,
     usergroups: {
       type: new GraphQLList(Usergroup),
       args: {},
       junction: {
         sqlTable: 'users_usergroups',
         sqlJoins: [
           (thisTable, junctionTable, args)       => `${thisTable}.id = ${junctionTable}.user_id`,
           (junctionTable, usergroupsTable, args) => `${junctionTable}.usergroup_id = ${usergroupsTable}.id`
         ]
       }
     }*/
   })
 });
