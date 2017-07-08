import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat
} from 'graphql';

import db from '../db';
import Translation from './Translation';

const MenuItem = new GraphQLObjectType({
   description: 'A menu item',
   name: 'MenuItem',
   sqlTable: 'menu_items',
   uniqueKey: 'id',
   fields: () => ({
     id: {
       type: GraphQLInt
     },
     title: {
       type: new GraphQLList(Translation),
       args: {
        lang: {
          type: GraphQLString
        }
       },
       junction: {
         sqlTable: 'translatables',
         sqlJoins: [
           (menuItemsTable, translatablesTable, args) => `${menuItemsTable}.title_translatable_id = ${translatablesTable}.id`,
           (translatablesTable, translationsTable, args) => {
             let joinStr = `${translatablesTable}.id = ${translationsTable}.translatable_id`;
             if(args.lang) joinStr += db.knex.raw(` AND ${translationsTable}.lang = ?`, args.lang).toString();
             return joinStr;
           }
         ]
       }
     },
     children: {
       type: new GraphQLList(MenuItem),
       junction: {
         sqlTable: 'menu_items_menu_items',
         sqlJoins: [
           (menuItemsTable, menuItemsHierarchyTable, args) => `${menuItemsTable}.id = ${menuItemsHierarchyTable}.ancestor AND ${menuItemsHierarchyTable}.depth > 0`,
           (menuItemsHierarchyTable, menuItemsTable, args) => `${menuItemsHierarchyTable}.descendant = ${menuItemsTable}.id`
         ]
       }
     }
   })
 });

export default MenuItem;
