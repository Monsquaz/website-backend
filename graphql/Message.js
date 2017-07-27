import {
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLFloat
} from 'graphql';

import db from '../db';
import Translation from './Translation';
import Util from './Util';
import User from './User';
import MessageType from './MessageType';

export default new GraphQLObjectType({
   description: 'A message',
   name: 'Message',
   sqlTable: 'messages',
   uniqueKey: 'id',
   fields: () => ({
     id: {
       type: GraphQLInt
     },
     sender: {
       type: User,
       sqlTable: 'users',
       sqlJoin: (thisTable, otherTable, args) =>
         `${thisTable}.sender_user_id = ${otherTable}.id`
     },
     recipient: {
       type: User,
       sqlTable: 'users',
       sqlJoin: (thisTable, otherTable, args) =>
         `${thisTable}.recipient_user_id = ${otherTable}.id`
     },
     sent: { type: GraphQLBoolean },
     sendDate: {
       type: GraphQLString,
       sqlColumn: 'send_date'
     },
     content: {
       type: GraphQLString
     },
     messageType: {
       type: MessageType,
       sqlTable: 'message_types',
       sqlJoin: (thisTable, otherTable, args) =>
         `${thisTable}.message_type_id = ${otherTable}.id`
     },
     administrable: Util.administrableField('administrable_id'),
     _actions: Util.actionsField('administrable_id')
   })
 });
