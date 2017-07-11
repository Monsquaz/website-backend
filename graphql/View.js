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
import ViewType from './ViewType';

const View = new GraphQLObjectType({
   description: 'A view',
   name: 'View',
   sqlTable: 'views',
   uniqueKey: 'id',
   fields: () => ({
     id: {
       type: GraphQLInt
     },
     type: {
       type: ViewType,
       sqlTable: 'view_types',
       sqlJoin: (thisTable, otherTable, args) =>
         `${thisTable}.view_type_id = ${otherTable}.id`
     },
     data: {
       type: GraphQLString
     },
     name: Util.translationField('name_translatable_id')
   })
 });

export default View;
