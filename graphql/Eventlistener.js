import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLFloat
} from 'graphql';

import db from '../db';
import Translation from './Translation';
import Util from './Util';

export default new GraphQLObjectType({
   description: 'An eventlistener',
   name: 'Eventlistener',
   sqlTable: 'eventlisteners',
   uniqueKey: 'id',
   fields: () => ({
     id: {
       type: GraphQLInt
     },
     resourceType: {
       type: new GraphQLNonNull(GraphQLString),
       sqlColumn: 'resource_type'
     },
     resourceId: {
       type: new GraphQLNonNull(GraphQLString),
       sqlColumn: 'resource_id'
     },
     resourceEventType: {
       type: new GraphQLNonNull(GraphQLString),
       sqlColumn: 'resource_event_type'
     },
     callbackUrl: {
       type: GraphQLString,
       sqlColumn: 'callback_url'
     },
     administrable: Util.administrableField('administrable_id'),
     _actions: Util.actionsField('administrable_id')
   })
 });
