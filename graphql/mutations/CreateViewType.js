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
import ViewType from '../ViewType';
import joinMonster from 'join-monster';
import db from '../../db';
import validator from 'validator';

const CreateViewType = {
  type: ViewType,
  args: {
    input: {
      type: new GraphQLInputObjectType({
        description: '',
        name: 'CreateViewTypeInput',
        fields: () => ({
          schema:                 {type: new GraphQLNonNull(GraphQLString)},
          schemaForm:             {type: new GraphQLNonNull(GraphQLString)},
          filename:               {type: new GraphQLNonNull(GraphQLString)},
          parentAdministrableId:  {type: new GraphQLNonNull(GraphQLInt)}
        })
      })
    }
  },
  where: async (viewTypeTable, args, { userId }) => {
    let insertId;
    await db.knex.transaction(async (t) => {
      let input = args.input;
      if(!input) throw new GraphQLError('No input supplied');

      // TODO: Validations?
      let administrableId = await Util.createAdministrable({
        userId:                   userId,
        parentAdministrableId:    input.parentAdministrableId,
        nameTranslations:         Util.inAllLanguages(input.filename),
        requiredActionsOnParent:  ['createViewType']
      }, t);

      await t('view_types').insert({
        schema:           input.schema,
        schemaForm:       input.schemaForm,
        filename:         input.filename,
        administrable_id: administrableId
      });

      insertId = await Util.getInsertId(t);
    });
    return `${viewTypeTable}.id = ${insertId}`;
  },
  resolve: (parent, args, context, resolveInfo) => {
    return joinMonster(resolveInfo, {}, sql => {
      return db.call(sql);
    }, { dialect: "mysql", minify: "true" })
  }
}

export default CreateViewType;
