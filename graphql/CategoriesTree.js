import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat
} from 'graphql';

import db from '../db';
import Util from './Util';
import Category from './Category';

const CategoriesTree = new GraphQLObjectType({
   description: 'A category mapping',
   name: 'CategoriesTree',
   sqlTable: 'categories_categories',
   uniqueKey: 'id',
   fields: () => ({
     id: {
       type: GraphQLInt
     },
     depth: {
       type: GraphQLInt
     },
     ancestor: {
       type: Category,
       sqlTable: 'categories',
       sqlJoin: (thisTable, categoriesTable, args) =>
         `${thisTable}.ancestor = ${categoriesTable}.id`
     },
     descendant: {
       type: Category,
       sqlTable: 'categories',
       sqlJoin: (thisTable, categoriesTable, args) =>
         `${thisTable}.descendant = ${categoriesTable}.id`
     }
   })
 });

export default CategoriesTree ;
