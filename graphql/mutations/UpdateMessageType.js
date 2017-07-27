import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLError
} from 'graphql';


import Util from '../Util';
import TranslationInput from './TranslationInput';
import MessageType from '../MessageType';
import joinMonster from 'join-monster';
import db from '../../db';
import validator from 'validator';

const UpdateMessageType = {
  type: MessageType,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    input: {
      type: new GraphQLInputObjectType({
        description: '',
        name: 'UpdateMessageTypeInput',
        fields: () => ({
          name:                   { type: new GraphQLList(TranslationInput) },
          parentAdministrableId:  { type: new GraphQLNonNull(GraphQLInt) }
        })
      })
    }
  },
  where: async (messageTypesTable, args, context) => {
    await db.knex.transaction(async (t) => {
      let input = args.input;
      if(!input) throw new GraphQLError('No input supplied');
      // TODO
    });
    return `${messageTypesTable}.id = ${args.id}`;
  },
  resolve: (parent, args, context, resolveInfo) => {
    return joinMonster(resolveInfo, {}, sql => {
      return db.call(sql);
    }, { dialect: "mysql", minify: "true" })
  }
}

export default UpdateMessageType;
