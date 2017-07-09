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
import Util from './Util';

export default new GraphQLObjectType({
   description: 'A menu',
   name: 'Menu',
   sqlTable: 'menus',
   uniqueKey: 'id',
   fields: () => ({
     id: {
       type: GraphQLInt
     },
     name: Util.translationField('name_translatable_id'),
     items: {
       type: new GraphQLList(MenuItem),
       sqlTable: 'menu_items',
       sqlJoin: (menusTable, menuItemsTable, args) => `${menusTable}.id = ${menuItemsTable}.menu_id`
     },
     itemTree: Util.treeField('menu_items_menu_items', MenuItemsTree, 'menu_id'),
     actions:  Util.actionsField('administrable_id')
   })
 });
