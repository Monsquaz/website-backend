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

const AclUsergroup = new GraphQLObjectType({
   description: 'A user ACL mapping',
   name: 'AclUsergroup',
   sqlTable: `(SELECT uaa.*, a.name AS action_name
               FROM usersgroup_actions_administrables AS uaa
               JOIN actions AS a ON uaa.action_id = a.id)`,
   uniqueKey: 'id',
   fields: () => ({
     name: {
       type: GraphQLString,
       sqlColumn: 'action_name'
     },
     administrable: Util.administrableField('administrable_id')
   })
 });

export default AclUsergroup;
