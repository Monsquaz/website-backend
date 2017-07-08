import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat
} from 'graphql';

import db from '../db';

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
       type: GraphQLInt
     },
     descendant: {
       type: GraphQLInt
     }
   })
 });

export default MenuItemsTree;
