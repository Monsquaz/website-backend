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
     }
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
     publishDate: {
       // TODO: Should only be visible to those who have "edit" on the page
       // How do we do it?
       type: GraphQLString
       sqlColumn: 'publish_date'
     }
     unpublishDate: {
       // TODO: Should only be visible to those who have "edit" on the page
       // How do we do it?
       sqlColumn: 'unpublish_date'
     }
     path: {
       type: PagePath
       // 1. Avgör vilken page som skall användas. Om det finns en canonical, använd den.
       // 2. Är sidan färsk? Använd page-slug rakt av om sådan finns
       // 3. Är sidan inte färsk? Använd category-slug + page-slug om sådant finns, annars page-slug
       sqlExpr: table => `IF(condition,alt1,alt2)`
     }
     menusItems: {}
     // Comment off END
     slug: title: Util.translationField('slug_translatable_id'),
     title: Util.translationField('title_translatable_id'),
     content: Util.translationField('content_translatable_id'),
     administrable: Util.administrableField('administrable_id'),
     actions: Util.actionsField('administrable_id')
   })
 });

export default Page;
