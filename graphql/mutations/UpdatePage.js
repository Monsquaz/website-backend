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

      if(input.publishDate && !!Date.parse(input.publishDate)) {
        throw new GraphQLError(`Not a valid publishDate: ${input.publishDate}`);
      }

      // TODO: Check that publishDate has not yet occured!
      // TODO: Check that unpublishDate has not yet occurred!

      if(input.unpublishDate && !!Date.parse(input.publishDate)) {
        throw new GraphQLError(`Not a valid unpublishDate: ${input.unpublishDate}`);
      }

      let page = await t('pages').where({id: args.id}).select('*')[0];
      if(!page) {
        throw new GraphQLError(`Page does not exist.`);
      }

      // TODO: If slug was changed for a language - how could we handle redirects?
      if(input.slug) {
        for(translation of input.slug) {
          if(!Util.isValidSlug(translation)) {
            throw new GraphQLError(`'${translation}' is not a valid slug.`);
          }
        }
        let conflictingSlugTranslations = await t('pages')
          .innerJoin('translations', 'pages.translatable_id', 'translations.translatable_id')
          .whereNot({'translations.translatable_id': input.slug_translatable_id})
          .whereIn('translations.content',  input.slug.map(e => e.content))
          .select('translation.content');
        if(conflictingSlugTranslations) {
          throw new GraphQLError(
            `The following slug(s) already exist:
               ${conflictingSlugTranslations.map(e => e.content).join(', ')}`
          );
        }
        Util.updateTranslatable(page.slug_translatable_id, input.slug, t);
      }

      if(args.title) {
        Util.updateTranslatable(page.title_translatable_id, input.title, t);
      }

      if(args.content) {
        Util.updateTranslatable(page.content_translatable_id, input.content, t);
      }

      await Util.updateAdministrable({
        userId:                   context.userId,
        parentAdministrableId:    input.parentAdministrableId,
        nameTranslations:         titleTranslations,
        requiredActions:          ['move'],
        requiredActionsOnParent:  ['createPage']
      }, t);

      await Util.existanceAndActionChecks(context.userId, [
        {
          tableName:  'pages',
          entityName: 'Canonical page',
          id:         input.canonicalPageId,
          actions:    ['edit']
        },
        {
          tableName:  'categories',
          entityName: 'Category',
          id:         input.categoryId,
          actions:    ['use']
        },
        {
          tableName:  'views',
          entityName: 'Layout view',
          id:         input.layoutViewId,
          actions:    ['use']
        },
        {
          tableName:  'views',
          entityName: 'Type view',
          id:         input.typeViewId,
          actions:    ['use']
        }
      ], t);

      await Util.updateAdministrable({
        id:                     args.id,
        userId:                 context.userId,
        parentAdministrableId:  input.parentAdministrableId,
        nameTranslations:       titleTranslations
      }, t);

      await t('pages_tags').where({page_id: args.id}).delete();
      await t('pages_tags').insert(
        input.tagIds.map(e => ({page_id: args.id, tag_id: e}))
      );

      if(input.categoryId) {
        page.category_id = input.categoryId;
      }

      if(input.publishDate) {
        page.publish_date = (new Date(Date.parse(input.publishDate))).toISOString().split('T')[0];
      }

      if(args.unpublishDate) {
        page.unpublish_date = (new Date(Date.parse(input.unpublishDate))).toISOString().split('T')[0];
      }

      if(input.canonicalPageId) {
        page.canonical_page_id = input.canonicalPageId;
      }

      if(input.comments) {
        page.comments = input.comments;
      }

      if(input.layoutViewId) {
        page.layout_view_id = input.layoutViewId;
      }

      if(input.typeViewId) {
        page.type_view_id = input.typeViewId;
      }

      await t('pages').update(page).where({id: args.id});

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
