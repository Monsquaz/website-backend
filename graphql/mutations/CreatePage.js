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
          tagIds:                  {type: new GraphQLList(GraphQLInt)}
        })
      })
    }
  },
  where: async (pagesTable, args, context) => {
    let insertId;
    await db.knex.transaction(async (t) => {
      let input = args.input;
      if(!input) throw new GraphQLError('No input supplied');
      let titleTranslatableId = await Util.createTranslatable(args.title);
      if(args.title && !args.slug) {
        args.slug = args.title.map(e => ({
          lang: e.lang,
          content: Util.slugify(e.content)
        }));
      }
      if(args.slug) {
        for(translation of args.slug) {
          if(!Util.isValidSlug(translation)) {
            throw new GraphQLError(`'${translation}' is not a valid slug.`);
          }
        }
        let conflictingSlugTranslations = await db.knex('pages')
          .innerJoin('translations', 'pages.translatable_id', 'translations.translatable_id')
          .whereIn('translations.content',  args.slug.map(e => e.content))
          .select('translation.content');
        if(conflictingSlugTranslations) {
          throw new GraphQLError(
            `The following slug(s) already exist:
               ${conflictingSlugTranslations.map(e => e.content).join(', ')}`
          );
        }
      }

      let slugTranslatableId      = await Util.createTranslatable(args.slug);
      let contentTranslatableId   = await Util.createTranslatable(args.content);

      if(args.canonicalPageId) {
        let canonicalPage = await db.knex('pages')
          .where({id: args.canonicalPageId})
          .select('*');
        if(!canonicalPage) {
          throw new GraphQLError(`Canonical page ${args.canonicalPageId} doesn't exist.`);
        }
        let canEditCanonicalPage = await Util.hasActionOnAdministrable(
          context.user_id,
          canonicalPage.administrable_id,
          'edit'
        );
        if(!canEditCanonicalPage) {
          throw new GraphQLError(`Not authorized to edit canonical page.`);
        }
      }

      if(args.categoryId) {
        let categoryExists = await db.knex('categories')
          .where({id: args.categoryId})
          .count('*');
        if(!categoryExists) {
          throw new GraphQLError(`Category ${args.categoryId} doesn't exist.`);
        }
      }

      let layoutViewExists = await db.knex('layout_views')
        .where({id: args.layoutViewId})
        .count('*');

      if(!layoutViewExists) {
        throw new GraphQLError(`Layout view ${args.layoutViewId} doesn't exist.`);
      }

      let typeViewExists = await db.knex('layout_views')
        .where({id: args.typeViewId})
        .count('*');

      if(!typeViewExists) {
        throw new GraphQLError(`Type view ${args.typeViewId} doesn't exist.`);
      }

      let administrableId = await Util.createAdministrable({
        userId:                   context.user_id,
        parentAdministrableId:    args.parentAdministrableId,
        nameTranslations:         titleTranslations,
        requiredActionsOnParent:  ['createPage']
      });

      await db.knex('pages').insert({
        categoryId:               args.categoryId,
        slug_translatable_id:     slugTranslatableId,
        title_translatable_id:    titleTranslatableId,
        publish_date:             args.publishDate,
        unpublish_date:           args.unpublishDate,
        canonical_page_id:        args.canonicalPageId,
        content_translatable_id:  contentTranslatableId,
        comments:                 args.comments,
        layout_view_id:           args.layoutViewId,
        type_view_id:             args.typeViewId,
        administrable_id:         administrableId
      });

      insertId = await db.knex.raw('SELECT LAST_INSERT_ID()')[0];

      await db.knex('pages_tags').insert(
        args.tagIds.map(e => ({page_id: insertId, tag_id: e}))
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
