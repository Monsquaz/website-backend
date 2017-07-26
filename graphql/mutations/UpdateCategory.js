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
import Category from '../Category';
import joinMonster from 'join-monster';
import db from '../../db';
import validator from 'validator';

const UpdateCategory = {
  type: Category,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    input: {
      type: new GraphQLInputObjectType({
        description: '',
        name: 'UpdateCategoryInput',
        fields: () => ({
          title:                  {type: new GraphQLList(TranslationInput)},
          slug:                   {type: new GraphQLList(TranslationInput)},
          parentAdministrableId:  {type: new GraphQLNonNull(GraphQLInt)}
        })
      })
    }
  },
  where: async (categoriesTable, args, context) => {
    await db.knex.transaction(async (t) => {
      let input = args.input;
      if(!input) throw new GraphQLError('No input supplied');
      // TODO
    });
    return `${categoriesTable}.id = ${args.id}`;
  },
  resolve: (parent, args, context, resolveInfo) => {
    return joinMonster(resolveInfo, {}, sql => {
      return db.call(sql);
    }, { dialect: "mysql", minify: "true" })
  }
}

export default UpdateCategory;
