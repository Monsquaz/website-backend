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
import Usergroup from './Usergroup';

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
     _actions: Util.actionsField('administrable_id'),
     combinedActions: {
       type: new GraphQLList(AclCombined),
       args: {
         administrableIds: {
           type: new GraphQLList(GraphQLInt)
         },
         actions: {
           type: new GraphQLList(GraphQLString)
         }
       },
       sqlTable: 'acl',
       sqlJoin: (thisTable, aclTable, args) => {
         let joins = [`${thisTable}.id = ${aclTable}.user_id`];
         if(args.administrableIds) {
           joins.push(db.knex.raw(`${aclTable}.administrable_id IN (${args.administrableIds.join(',')})`).toString());
         }
         if(args.actions) {
           joins.push(db.knex.raw(`${aclTable}.action_name IN (${args.actions.map(e => db.knex.raw('?', e).toString()).join(',')})`).toString());
         }
         return joins.join(' AND ');
       }

     },
     explicitActions: {
       type: new GraphQLList(AclUser),
       args: {
         administrableIds: {
           type: new GraphQLList(GraphQLInt)
         },
         actions: {
           type: new GraphQLList(GraphQLString)
         }
       },
       sqlTable: 'users_actions_administrables',
       sqlJoin: (thisTable, aclTable, args) => {
         let joins = [`${thisTable}.id = ${aclTable}.user_id`];
         if(args.administrableIds) {
           joins.push(db.knex.raw(
             `${aclTable}.administrable_id IN (${args.administrableIds.join(',')})`).toString());
         }
         if(args.actions) {
           joins.push(db.knex.raw(`${aclTable}.action_name IN (${args.actions.map(e => db.knex.raw('?', e).toString()).join(',')})`).toString());
         }
         return joins.join(' AND ');
       }
     },
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
     }
   })
 });
