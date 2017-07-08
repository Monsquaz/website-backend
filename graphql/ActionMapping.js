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

const ActionMapping = new GraphQLObjectType({
   description: 'An action mapping',
   name: 'ActionMapping',
   sqlTable: `(SELECT DISTINCT a.id, a.name, aa.descendant, u.id AS user_id FROM administrables_administrables AS aa
               LEFT JOIN users_actions_administrables AS uaa ON uaa.administrable_id=aa.ancestor
               LEFT JOIN users AS u ON uaa.user_id = u.id
               LEFT JOIN users_usergroups AS uu ON uu.user_id=u.id
               LEFT JOIN usergroups_actions_administrables AS ugaa ON ugaa.administrable_id=aa.ancestor AND ugaa.usergroup_id=uu.usergroup_id
               LEFT JOIN actions AS a ON (a.id=uaa.action_id OR a.id=ugaa.action_id))`,
   uniqueKey: 'id',
   fields: () => ({
     id: {
       type: GraphQLInt
     },
     name: {
       type: GraphQLString
     }
   })
 });

export default ActionMapping;
