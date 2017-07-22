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

      await Util.existanceAndActionChecks([
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

      if(input.tagIds) {
        await t('pages_tags').insert(
          input.tagIds.map(e => ({page_id: insertId, tag_id: e}))
        );
      }

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
