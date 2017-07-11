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
import Menu from './Menu';

const MenuItem = new GraphQLObjectType({
   description: 'A menu item',
   name: 'MenuItem',
   sqlTable: 'menu_items',
   uniqueKey: 'id',
   fields: () => ({
     id: {
       type: GraphQLInt
     },
     menu: {
       type: Menu,
       sqlTable: 'menus',
       sqlJoin: (thisTable, otherTable, args) =>
         `${thisTable}.menu_id = ${otherTable}.id`
     },
     title: Util.translationField('title_translatable_id')
   })
 });

export default MenuItem;
