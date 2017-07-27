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

const CreateMessageType = {
  type: MessageType,
  args: {
    input: {
      type: new GraphQLInputObjectType({
        description: '',
        name: 'CreateMessageTypeInput',
        fields: () => ({
          name:                   { type: new GraphQLList(TranslationInput) },
          parentAdministrableId:  { type: new GraphQLNonNull(GraphQLInt) }
        })
      })
    }
  },
  where: async (messageTypesTable, args, { userId }) => {
    let insertId;
    await db.knex.transaction(async (t) => {
      let input = args.input;
      if(!input) throw new GraphQLError('No input supplied');

      let administrableId = await Util.createAdministrable({
        userId:                   userId,
        parentAdministrableId:    input.parentAdministrableId,
        nameTranslations:         input.name,
        requiredActionsOnParent:  ['createMessageType']
      }, t);

      let nameTranslatableId = await Util.createTranslatable(input.name || [], t);

      await t('message_types').insert({
        name_translatable_id: nameTranslatableId,
        administrable_id:     administrableId
      });

      insertId = await Util.getInsertId(t);

    });
    return `${messageTypesTable}.id = ${insertId}`;
  },
  resolve: (parent, args, context, resolveInfo) => {
    return joinMonster(resolveInfo, {}, sql => {
      return db.call(sql);
    }, { dialect: "mysql", minify: "true" })
  }
}

export default CreateMessageType;
