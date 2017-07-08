import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat
} from 'graphql';

import db from '../db';
import Translation from './Translation';
import MenuItem from './MenuItem';
import MenuItemsTree from './MenuItemsTree';

export default new GraphQLObjectType({
   description: 'A menu',
   name: 'Menu',
   sqlTable: 'menus',
   uniqueKey: 'id',
   fields: () => ({
     id: {
       type: GraphQLInt
     },
     name: {
       type: new GraphQLList(Translation),
       args: {
        lang: {
          type: GraphQLString
        }
       },
       junction: {
         sqlTable: 'translatables',
         sqlJoins: [
           (menusTable, translatablesTable, args) => `${menusTable}.name_translatable_id = ${translatablesTable}.id`,
           (translatablesTable, translationsTable, args) => {
             let joinStr = `${translatablesTable}.id = ${translationsTable}.translatable_id`;
             if(args.lang) joinStr += db.knex.raw(` AND ${translationsTable}.lang = ?`, args.lang).toString();
             return joinStr;
           },
         ]
       }
     },
     items: {
       type: new GraphQLList(MenuItem),
       sqlTable: 'menu_items',
       sqlJoin: (menusTable, menuItemsTable, args) => `${menusTable}.id = ${menuItemsTable}.menu_id`
     },
     itemTree: {
       type: new GraphQLList(MenuItemsTree),
       args: {
        root: {
          type: GraphQLInt
        }, 
        depth: {
          type: GraphQLInt
        }
       },
       sqlTable: 'menu_items_menu_items',
       sqlJoin: (menusTable, menuItemsTreeTable, args) => {
         let joinStr = `${menusTable}.id = ${menuItemsTreeTable}.menu_id AND ${menuItemsTreeTable}.depth > 0`;
         if(args.root) {
           joinStr += ` AND (${menuItemsTreeTable}.ancestor = ${args.root} OR ${menuItemsTreeTable}.ancestor IN (SELECT descendant FROM menu_items_menu_items WHERE ancestor = ${args.root})`
           if(args.depth) {
             joinStr += ` AND depth <= ${args.depth}`;
           }
           joinStr += ')';
         } else if(args.depth) {
           throw new Error('Depth without root');
         }
         return joinStr;
       }
     }
   })
 });
