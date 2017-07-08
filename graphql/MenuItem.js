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

const MenuItem = new GraphQLObjectType({
   description: 'A menu item',
   name: 'MenuItem',
   sqlTable: 'menu_items',
   uniqueKey: 'id',
   fields: () => ({
     id: {
       type: GraphQLInt
     },
     title: Util.translationField('title_translatable_id')
   })
 });

export default MenuItem;
