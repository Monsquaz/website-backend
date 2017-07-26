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
import AclUsergroup from './AclUsergroup';

export default new GraphQLObjectType({
   description: 'A usergroup',
   name: 'Usergroup',
   sqlTable: 'usergroups',
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
     explicitActions: {
       type: new GraphQLList(AclUsergroup),
       args: {
         administrableIds: {
           type: new GraphQLList(GraphQLInt)
         },
         actions: {
           type: new GraphQLList(GraphQLString)
         }
       },
       sqlTable: 'usergroups_actions_administrables',
       sqlJoin: (thisTable, aclTable, args) => {
         let joins = [`${thisTable}.id = ${aclTable}.usergroup_id`];
         if(args.administrableIds) {
           joins.push(db.knex.raw(
             `${aclTable}.administrable_id IN (${args.administrableIds.join(',')})`).toString());
         }
         if(args.actions) {
           joins.push(db.knex.raw(`${aclTable}.action_name IN (${args.actions.map(e => db.knex.raw('?', e).toString()).join(',')})`).toString());
         }
         return joins.join(' AND ');
       }
     }
   })
 });
