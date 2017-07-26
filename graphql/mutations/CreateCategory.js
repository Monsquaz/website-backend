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

const CreateCategory = {
  type: Category,
  args: {
    input: {
      type: new GraphQLInputObjectType({
        description: '',
        name: 'CreateCategoryInput',
        fields: () => ({
          title:                  {type: new GraphQLList(TranslationInput)},
          slug:                   {type: new GraphQLList(TranslationInput)},
          parentAdministrableId:  {type: new GraphQLNonNull(GraphQLInt)}
        })
      })
    }
  },
  where: async (categoriesTable, args, { userId }) => {
    let insertId;
    await db.knex.transaction(async (t) => {
      let input = args.input;
      if(!input) throw new GraphQLError('No input supplied');

      if(input.title && !input.slug) {
        input.slug = input.title.map(e => ({
          lang: e.lang,
          content: Util.slugify(e.content)
        }));
      }
      if(input.slug) {
        for(translation of input.slug) {
          if(!Util.isValidSlug(translation)) {
            throw new GraphQLError(`'${translation}' is not a valid slug.`);
          }
        }
        let conflictingSlugTranslations = await t('pages')
          .innerJoin('translations', 'pages.translatable_id', 'translations.translatable_id')
          .whereIn('translations.content',  input.slug.map(e => e.content))
          .select('translation.content');
        if(conflictingSlugTranslations) {
          throw new GraphQLError(
            `The following slug(s) already exist:
               ${conflictingSlugTranslations.map(e => e.content).join(', ')}`
          );
        }
      }

      let titleTranslatableId = await Util.createTranslatable(input.title || [], t);
      let slugTranslatableId  = await Util.createTranslatable(input.slug || [], t);

      let administrableId = await Util.createAdministrable({
        userId:                   userId,
        parentAdministrableId:    input.parentAdministrableId,
        nameTranslations:         Util.inAllLanguages(input.name),
        requiredActionsOnParent:  ['createCategory']
      }, t);

      await t('category').insert({
        title_translatable_id:  titleTranslatableId,
        slug_translatable_id:   slugTranslatableId,
        administrable_id:       administrableId
      });

      insertId = await Util.getInsertId(t);

    });
    return `${categoriesTable}.id = ${insertId}`;
  },
  resolve: (parent, args, context, resolveInfo) => {
    return joinMonster(resolveInfo, {}, sql => {
      return db.call(sql);
    }, { dialect: "mysql", minify: "true" })
  }
}

export default CreateCategory;
