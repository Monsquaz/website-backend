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
import View from '../View';
import joinMonster from 'join-monster';
import db from '../../db';
import validator from 'validator';

const CreateView = {
  type: View,
  args: {
    input: {
      type: new GraphQLInputObjectType({
        description: '',
        name: 'CreateViewInput',
        fields: () => ({
          viewTypeId:             {type: new GraphQLNonNull(GraphQLInt)},
          data:                   {type: new GraphQLNonNull(GraphQLString)},
          name:                   {type: new GraphQLList(TranslationInput)},
          parentAdministrableId:  {type: new GraphQLNonNull(GraphQLInt)}
        })
      })
    }
  },
  where: async (viewTable, args, context) => {
    let insertId;
    await db.knex.transaction(async (t) => {
      let input = args.input;
      if(!input) throw new GraphQLError('No input supplied');

      let nameTranslatableId = await Util.createTranslatable(input.name || [], t);

      Util.existanceAndActionCheck({
        tableName:  'view_types',
        entityName: 'View type',
        id:         input.viewTypeId,
        actions:    ['use']
      }, t);

      // TODO: Validate data against view types schema

      let administrableId = await Util.createAdministrable({
        userId:                   context.userId,
        parentAdministrableId:    input.parentAdministrableId,
        nameTranslations:         input.name || [],
        requiredActionsOnParent:  ['createView']
      }, t);

      await t('views').insert({
        view_type_id:         input.viewTypeId,
        data:                 input.data,
        name_translatable_id: nameTranslatableId,
        administrable_id:     administrableId
      });

      insertId = await Util.getInsertId(t);

    });
    return `${viewTable}.id = ${insertId}`;
  },
  resolve: (parent, args, context, resolveInfo) => {
    return joinMonster(resolveInfo, {}, sql => {
      return db.call(sql);
    }, { dialect: "mysql", minify: "true" })
  }
}

export default CreateView;
