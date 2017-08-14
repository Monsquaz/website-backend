import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLNonNull
} from 'graphql';

import db from '../db';
import Translation from './Translation';
import Util from './Util';

const AclUser = new GraphQLObjectType({
   description: 'An admin manifest',
   name: 'AdminManifest',
   sqlTable: `admin_manifests`,
   uniqueKey: ['type', 'id'],
   fields: () => ({
     id: {
       type: new GraphQLNonNull(GraphQLInt)
     },
     type: {
       type: GraphQLString
     },
     administrable: Util.administrableField('administrable_id')
   })
 });

export default AclUser;
