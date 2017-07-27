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
   description: 'A message type',
   name: 'MessageType',
   sqlTable: 'message_types',
   uniqueKey: 'id',
   fields: () => ({
     id: {
       type: GraphQLInt
     },
     name: Util.translationField('name_translatable_id'),
     administrable: Util.administrableField('administrable_id'),
     _actions: Util.actionsField('administrable_id')
   })
 });
