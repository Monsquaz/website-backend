import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean
} from 'graphql';

import db from '../db';
import Translation from './Translation';
import Util from './Util';
import Category from './Category';
import Tag from './Tag';
import PagePath from './PagePath';
import MenuItem from './MenuItem';
import View from './View';
import User from './User';
import PageImage from './PageImage';
import CategoriesTree from './CategoriesTree';

/*
  TODO: author should have a type like:
  {...User, fields: () => ({..._omit(User.fields(), ['userCombinedActions','userExplicitActions'])}) }
*/

const Page = new GraphQLObjectType({
   description: 'A page',
   name: 'Page',
   sqlTable: 'pages',
   uniqueKey: 'id',
   fields: () => ({
     id: {
       type: GraphQLInt
     },
     category: {
       type: Category,
       sqlTable: 'categories',
       sqlJoin: (pagesTable, categoriesTable, args) =>
         `${pagesTable}.category_id = ${categoriesTable}.id`
     },
     tags: {
       type: new GraphQLList(Tag),
       junction: {
         sqlTable: 'pages_tags',
         sqlJoins: [
           (pagesTable, junctionTable, args) => `${pagesTable}.id = ${junctionTable}.page_id`,
           (junctionTable, tagsTable, args)  => `${junctionTable}.tag_id = ${tagsTable}.id`
         ]
       }
     },
     categoriesBreadcrumbs: {
       type: new GraphQLList(CategoriesTree),
       sqlTable: 'categories_categories',
       sqlJoin: (pagesTable, categoriesTreeTable, args) =>
         `${pagesTable}.category_id = ${categoriesTreeTable}.descendant`
     },
     canonical: {
       type: Page,
       sqlTable: 'pages',
       sqlJoin: (thisTable, otherTable, args) =>
         `${thisTable}.canonical_page_id = ${otherTable}.id`
     },
     author: {
       type: User,
       sqlTable: 'users',
       sqlJoin: (thisTable, otherTable, args) =>
         `${thisTable}.user_id = ${otherTable}.id`
     },
     publishDate: {
       // TODO: Should be hidden unless user has "edit" on the page.
       type: GraphQLString,
       sqlColumn: 'publish_date'
     },
     unpublishDate: {
       // TODO: Should be hidden unless user has "edit" on the page.
       type: GraphQLString,
       sqlColumn: 'unpublish_date'
     },
     images: {
       type: new GraphQLList(PageImage),
       sqlTable: 'page_images',
       args: {},
       sqlJoin: (thisTable, otherTable, args) => {
         return `${thisTable}.id = ${otherTable}.page_id`;
       }
     },
     relatedByCategory: {
       type: new GraphQLList(Page),
       sqlTable: 'pages',
       args: {},
       sqlJoin: (thisTable, otherTable, args) => {
         return `${thisTable}.category_id = ${otherTable}.category_id
                 AND ${otherTable}.id != ${thisTable}.id`;
       }
     },
     paths: {
       type: new GraphQLList(PagePath),
       sqlTable: 'pages_paths',
       args: {
         lang: {
           type: GraphQLString
         }
       },
       sqlJoin: (pagesTable, pathsTable, args) => {
         let joins = [`${pagesTable}.id = ${pathsTable}.page_id`];
         if(args.lang) {
           joins.push(db.knex.raw(` AND ${translationsTable}.lang = ?`, args.lang).toString());
         }
         return joins.join(' AND ');
       }
     },
     menuItems: {
       type: new GraphQLList(MenuItem),
       sqlTable: 'page',
       sqlJoin: (thisTable, otherTable, args) =>
         `${thisTable}.id = ${otherTable}.page_id`
     },
     comments: {
       type: GraphQLBoolean
     },
     layoutView: {
       type: View,
       sqlTable: 'views',
       sqlJoin: (thisTable, otherTable, args) =>
         `${thisTable}.layout_view_id = ${otherTable}.id`
     },
     typeView: {
       type: View,
       sqlTable: 'views',
       sqlJoin: (thisTable, otherTable, args) =>
         `${thisTable}.type_view_id = ${otherTable}.id`
     },
     slug:          Util.translationField('slug_translatable_id'),
     title:         Util.translationField('title_translatable_id'),
     content:       Util.translationField('content_translatable_id'),
     teaser:        Util.translationField('teaser_translatable_id'),
     administrable: Util.administrableField('administrable_id'),
     _actions:      Util.actionsField('administrable_id')
   })
 });

export default Page;
