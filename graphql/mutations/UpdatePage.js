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

const UpdatePage = {
  type: Page,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    input: {
      type: new GraphQLInputObjectType({
        description: '',
        name: 'UpdatePageInput',
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
          parentAdministrableId:    {type: GraphQLInt},
          tagIds:                   {type: new GraphQLList(GraphQLInt)}
        })
      })
    }
  },
  where: async (pagesTable, args, context) => {
    await db.knex.transaction(async (t) => {
      let input = args.input;
      if(!input) throw new GraphQLError('No input supplied');

      if(args.publishDate && !!Date.parse(args.publishDate)) {
        throw new GraphQLError(`Not a valid publishDate: ${args.publishDate}`);
      }

      if(args.unpublishDate && !!Date.parse(args.publishDate)) {
        throw new GraphQLError(`Not a valid unpublishDate: ${args.unpublishDate}`);
      }

      let page = await db.knex('pages').where({id: args.id}).select('*')[0];
      if(!page) {
        throw new GraphQLError(`Page does not exist.`);
      }

      // TODO: If slug was changed for a language - how could we handle redirects?
      if(args.slug) {
        for(translation of args.slug) {
          if(!Util.isValidSlug(translation)) {
            throw new GraphQLError(`'${translation}' is not a valid slug.`);
          }
        }
        let conflictingSlugTranslations = await db.knex('pages')
          .innerJoin('translations', 'pages.translatable_id', 'translations.translatable_id')
          .whereNot({'translations.translatable_id': page.slug_translatable_id})
          .whereIn('translations.content',  args.slug.map(e => e.content))
          .select('translation.content');
        if(conflictingSlugTranslations) {
          throw new GraphQLError(
            `The following slug(s) already exist:
               ${conflictingSlugTranslations.map(e => e.content).join(', ')}`
          );
        }
        Util.updateTranslatable(page.slug_translatable_id, args.slug);
      }

      if(args.title) {
        Util.updateTranslatable(page.title_translatable_id, args.title);
      }

      if(args.content) {
        Util.updateTranslatable(page.content_translatable_id, args.content);
      }

      await Util.updateAdministrable({
        userId:                   context.user_id,
        parentAdministrableId:    args.parentAdministrableId,
        nameTranslations:         titleTranslations,
        requiredActions:          ['move'],
        requiredActionsOnParent:  ['createPage']
      });

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

      await Util.updateAdministrable({
        id:                     args.id,
        userId:                 context.user_id,
        parentAdministrableId:  args.parentAdministrableId,
        nameTranslations:       titleTranslations
      });

      await db.knex('pages_tags').where({page_id: args.id}).delete();
      await db.knex('pages_tags').insert(
        args.tagIds.map(e => ({page_id: args.id, tag_id: e}))
      );

      if(args.categoryId) {
        page.category_id = args.categoryId;
      }

      if(args.publishDate) {
        page.publish_date = (new Date(Date.parse(args.publishDate))).toISOString().split('T')[0];
      }

      if(args.unpublishDate) {
        page.unpublish_date = (new Date(Date.parse(args.unpublishDate))).toISOString().split('T')[0];
      }

      if(args.canonicalPageId) {
        page.canonical_page_id = args.canonicalPageId;
      }

      if(args.comments) {
        page.comments = args.comments;
      }

      if(args.layoutViewId) {
        page.layout_view_id = args.layoutViewId;
      }

      if(args.typeViewId) {
        page.type_view_id = args.typeViewId;
      }

      await db.knex('pages').update(page).where({id: args.id});

    });
    return db.knex.raw(`${pagesTable}.id = ?`, [args.id]).toString();
  },
  resolve: (parent, args, context, resolveInfo) => {
    return joinMonster(resolveInfo, {}, sql => {
      return db.call(sql);
    }, { dialect: "mysql", minify: "true" })
  }
}

export default UpdatePage;
