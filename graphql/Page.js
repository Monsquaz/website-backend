import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat
} from 'graphql';

import db from '../db';
import Translation from './Translation';
import Util from './Util';

import Category from './Category';
import Tag from './Tag';
import PagePath from './PagePath';

const Page = new GraphQLObjectType({
   description: 'A page',
   name: 'Page',
   sqlTable: 'pages',
   uniqueKey: 'id',
   fields: () => ({
     id: {
       type: GraphQLInt
     },
     // Comment off START
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
     canonical: {
       type: Page,
       sqlTable: 'page',
       sqlJoin: (thisTable, otherTable, args) =>
         `${thisTable}.canonical_page_id = ${otherTable}.id`
     },
     publishDate: {
       // TODO: Should only be visible to those who have "edit" on the page
       // How do we do it?
       type: GraphQLString,
       sqlColumn: 'publish_date'
     },
     unpublishDate: {
       // TODO: Should only be visible to those who have "edit" on the page
       // How do we do it?
       type: GraphQLString,
       sqlColumn: 'unpublish_date'
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
         if(args.lang) joins.push(db.knex.raw(` AND ${translationsTable}.lang = ?`, args.lang).toString());
         return joins.join(' AND ');
       }
     },
     menusItems: {
       type: GraphQLString // No, this should be a join
     },
     // Comment off END
     slug: Util.translationField('slug_translatable_id'),
     title: Util.translationField('title_translatable_id'),
     content: Util.translationField('content_translatable_id'),
     administrable: Util.administrableField('administrable_id'),
     actions: Util.actionsField('administrable_id')
   })
 });

export default Page;
