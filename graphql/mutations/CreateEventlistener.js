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
import Eventlistener from '../Eventlistener';
import joinMonster from 'join-monster';
import db from '../../db';
import validator from 'validator';

const CreateEventlistener = {
  type: Eventlistener,
  args: {
    input: {
      type: new GraphQLInputObjectType({
        description: '',
        name: 'CreateEventlistenerInput',
        fields: () => ({
          resourceType:           { type: new GraphQLNonNull(GraphQLString)},
          resourceId:             { type: GraphQLInt },
          resourceEventType:      { type: new GraphQLNonNull(GraphQLString) },
          parentAdministrableId:  { type: new GraphQLNonNull(GraphQLInt) }
        })
      })
    }
  },
  where: async (eventlistenersTable, args, { userId }) => {
    let insertId;
    await db.knex.transaction(async (t) => {
      let input = args.input;
      if(!input) throw new GraphQLError('No input supplied');

      let administrableId = await Util.createAdministrable({
        userId:                   userId,
        parentAdministrableId:    input.parentAdministrableId,
        nameTranslations:         [],
        requiredActionsOnParent:  ['createEventlistener']
      }, t);

      await t('eventlisteners').insert({
        resource_type:       input.resourceType,
        resource_id:         input.resourceId,
        resource_event_type: input.resourceEventType,
        administrable_id:    administrableId
      });

      insertId = await Util.getInsertId(t);

      let administrables = await t('administrables')
        .where({id: administrableId})
        .select('name_translatable_id');

      let administrable = administrables[0];
      await Util.updateTranslatable(
        administrable.namet_translatable_id,
        Util.inAllLanguages(`Eventlistener #${insertId}`),
        t
      );

    });
    return `${eventlistenersTable}.id = ${insertId}`;
  },
  resolve: (parent, args, context, resolveInfo) => {
    return joinMonster(resolveInfo, {}, sql => {
      return db.call(sql);
    }, { dialect: "mysql", minify: "true" })
  }
}

export default CreateEventlistener;
