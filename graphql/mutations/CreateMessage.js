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

const CreateMessage = {
  type: Message,
  args: {
    input: {
      type: new GraphQLInputObjectType({
        description: '',
        name: 'CreateMessageInput',
        fields: () => ({
          recipientId:            { type: new GraphQLNonNull(GraphQLInt) },
          messageTypeId:          { type: new GraphQLNonNull(GraphQLInt) },
          content:                { type: new GraphQLNonNull(GraphQLString) },
          parentAdministrableId:  { type: new GraphQLNonNull(GraphQLInt) }
        })
      })
    }
  },
  where: async (messagesTable, args, { userId }) => {
    let insertId;
    await db.knex.transaction(async (t) => {
      let input = args.input;
      if(!input) { throw new GraphQLError('No input supplied');}
      if(!userId) { throw new GraphQLError('Not authenticated'); }

      let messageTypeExists = await Util.exists({
        tableName: 'message_types',
        where: {
          id: input.messageTypeId
        }
      });

      if(!messageTypeExists) {
        throw new GraphQLError(`Message type with id ${input.messageTypeId} doesn't exist`);
      }

      let recipientExists = await Util.exists({
        tableName: 'users',
        where: {
          id: input.recipientId
        }
      });

      if(!recipientExists) {
        throw new GraphQLError(`Recipient with user id ${input.recipientId} doesn't exist`);
      }

      let administrableId = await Util.createAdministrable({
        userId:                   userId,
        parentAdministrableId:    input.parentAdministrableId,
        nameTranslations:         input.name,
        requiredActionsOnParent:  ['createMessage']
      }, t);

      let nameTranslatableId = await Util.createTranslatable(input.name || [], t);

      await t('messages').insert({
        sender_user_id:     userId,
        recipient_user_id:  input.recipientId,
        message_type_id:    input.messageTypeId,
        content:            input.content,
        administrable_id:   administrableId
      });

      insertId = await Util.getInsertId(t);

    });
    return `${messagesTable}.id = ${insertId}`;
  },
  resolve: (parent, args, context, resolveInfo) => {
    return joinMonster(resolveInfo, {}, sql => {
      return db.call(sql);
    }, { dialect: "mysql", minify: "true" })
  }
}

export default CreateMessage;
