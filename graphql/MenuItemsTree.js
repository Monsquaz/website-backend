import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat
} from 'graphql';

import db from '../db';
import MenuItem from './MenuItem';

const MenuItemsTree = new GraphQLObjectType({
   description: 'A menu item',
   name: 'MenuItemsTree',
   sqlTable: 'menu_items_menu_items',
   uniqueKey: 'id',
   fields: () => ({
     id: {
       type: GraphQLInt
     },
     menu_id: {
       type: GraphQLInt
     },
     ancestor: {
       type: MenuItem,
       sqlTable: 'menu_items',
       sqlJoin: (thisTable, menuItemsTable, args) =>
         `${thisTable}.ancestor = ${menuItemsTable}.id`
     },
     descendant: {
       type: MenuItem,
       sqlTable: 'menu_items',
       sqlJoin: (thisTable, menuItemsTable, args) =>
         `${thisTable}.descendant = ${menuItemsTable}.id`
     }
   })
 });

export default MenuItemsTree;
