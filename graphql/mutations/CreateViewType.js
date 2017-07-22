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
  where: async (viewTypeTable, args, context) => {
    let insertId;
    await db.knex.transaction(async (t) => {
      let input = args.input;
      if(!input) throw new GraphQLError('No input supplied');

      // TODO: Validations?
      console.warn('BEFORE CREATE ADMINISTRABLE');
      let administrableId = await Util.createAdministrable({
        userId:                   context.user_id,
        parentAdministrableId:    input.parentAdministrableId,
        nameTranslations:         Util.inAllLanguages(input.filename),
        requiredActionsOnParent:  ['createViewType']
      }, t);
      console.warn('BEFORE INSERT VIEW TYPES');
      await t('view_types').insert({
        schema:           input.schema,
        schemaForm:       input.schemaForm,
        filename:         input.filename,
        administrable_id: administrableId
      });

      insertId = await Util.getInsertId(t);
      console.warn('AT END OF TRANSACTION');
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
