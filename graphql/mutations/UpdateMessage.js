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
import Message from '../Message';
import joinMonster from 'join-monster';
import db from '../../db';
import validator from 'validator';

const UpdateMessage = {
  type: Message,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    input: {
      type: new GraphQLInputObjectType({
        description: '',
        name: 'UpdateMessageInput',
        fields: () => ({
          recipientId:            { type: new GraphQLNonNull(GraphQLInt) },
          messageTypeId:          { type: new GraphQLNonNull(GraphQLInt) },
          content:                { type: new GraphQLNonNull(GraphQLString) },
          parentAdministrableId:  { type: new GraphQLNonNull(GraphQLInt) }
        })
      })
    }
  },
  where: async (messagesTable, args, context) => {
    await db.knex.transaction(async (t) => {
      let input = args.input;
      if(!input) throw new GraphQLError('No input supplied');
      // TODO
    });
    return `${messagesTable}.id = ${args.id}`;
  },
  resolve: (parent, args, context, resolveInfo) => {
    return joinMonster(resolveInfo, {}, sql => {
      return db.call(sql);
    }, { dialect: "mysql", minify: "true" })
  }
}

export default UpdateMessage;
