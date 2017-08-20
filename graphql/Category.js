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
import Page from './Page';

const Category = new GraphQLObjectType({
   description: 'A category',
   name: 'Category',
   sqlTable: 'categories',
   uniqueKey: 'id',
   fields: () => ({
     id: {
       type: GraphQLInt
     },
     slug: Util.translationField('slug_translatable_id'),
     title: Util.translationField('title_translatable_id'),
     administrable: Util.administrableField('administrable_id'),
     _actions: Util.actionsField('administrable_id'),
     page: {
       type: Page,
       sqlTable: 'pages',
       sqlJoin: (categoriesTable, pagesTable, args) =>
         `${categoriesTable}.page_id = ${pagesTable}.id`
     }
   })
 });

export default Category;
