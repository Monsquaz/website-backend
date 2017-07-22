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
import Page from '../Page';
import joinMonster from 'join-monster';
import db from '../../db';
import validator from 'validator';
import moment from 'moment';

const CreatePage = {
  type: Page,
  args: {
    input: {
      type: new GraphQLInputObjectType({
        description: '',
        name: 'CreatePageInput',
        fields: () => ({
          categoryId:               {type: GraphQLInt},
          slug:                     {type: new GraphQLList(TranslationInput)},
          title:                    {type: new GraphQLList(TranslationInput)},
          publishDate:              {type: new GraphQLNonNull(GraphQLString)},
          unpublishDate:            {type: GraphQLString},
          canonicalPageId:          {type: GraphQLInt},
          content:                  {type: new GraphQLList(TranslationInput)},
          comments:                 {type: GraphQLBoolean},
          layoutViewId:             {type: new GraphQLNonNull(GraphQLInt)},
          typeViewId:               {type: new GraphQLNonNull(GraphQLInt)},
          parentAdministrableId:    {type: new GraphQLNonNull(GraphQLInt)},
          tagIds:                   {type: new GraphQLList(GraphQLInt)}
        })
      })
    }
  },
  where: async (pagesTable, args, context) => {
    let insertId;
    await db.knex.transaction(async (t) => {
      let input = args.input;
      if(!input) throw new GraphQLError('No input supplied');

      // TODO: Check that publishDate has not yet occured
      let titleTranslatableId = await Util.createTranslatable(input.title || [], t);

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

      let slugTranslatableId      = await Util.createTranslatable(input.slug || [], t);
      let contentTranslatableId   = await Util.createTranslatable(input.content || [], t);

      if(input.canonicalPageId) {
        let canonicalPage = await t('pages')
          .where({id: input.canonicalPageId})
          .select('*');
        if(!canonicalPage) {
          throw new GraphQLError(`Canonical page ${input.canonicalPageId} doesn't exist.`);
        }
        let canEditCanonicalPage = await Util.hasActionOnAdministrable(
          context.user_id,
          canonicalPage.administrable_id,
          'edit',
          t
        );
        if(!canEditCanonicalPage) {
          throw new GraphQLError(`Not authorized to edit canonical page.`);
        }
      }

      if(input.categoryId) {
        let categoryExists = await t('categories')
          .where({id: input.categoryId})
          .count('*');
        if(!categoryExists) {
          throw new GraphQLError(`Category ${input.categoryId} doesn't exist.`);
        }
      }

      let layoutViewExists = await t('views')
        .where({id: input.layoutViewId})
        .count('*');

      if(!layoutViewExists) {
        throw new GraphQLError(`Layout view ${input.layoutViewId} doesn't exist.`);
      }

      let typeViewExists = await t('views')
        .where({id: input.typeViewId})
        .count('*');

      if(!typeViewExists) {
        throw new GraphQLError(`Type view ${input.typeViewId} doesn't exist.`);
      }

      let administrableId = await Util.createAdministrable({
        userId:                   context.user_id,
        parentAdministrableId:    input.parentAdministrableId,
        nameTranslations:         input.title || [],
        requiredActionsOnParent:  ['createPage']
      }, t);

      await t('pages').insert({
        category_id:              input.categoryId,
        slug_translatable_id:     slugTranslatableId,
        title_translatable_id:    titleTranslatableId,
        publish_date:             input.publishDate,
        unpublish_date:           input.unpublishDate,
        canonical_page_id:        input.canonicalPageId,
        content_translatable_id:  contentTranslatableId,
        comments:                 input.comments,
        layout_view_id:           input.layoutViewId,
        type_view_id:             input.typeViewId,
        administrable_id:         administrableId
      });

      insertId = await Util.getInsertId(t);

      await t('pages_tags').insert(
        input.tagIds.map(e => ({page_id: insertId, tag_id: e}))
      );

    });
    return `${pagesTable}.id = ${insertId}`;
  },
  resolve: (parent, args, context, resolveInfo) => {
    return joinMonster(resolveInfo, {}, sql => {
      return db.call(sql);
    }, { dialect: "mysql", minify: "true" })
  }
}

export default CreatePage;
