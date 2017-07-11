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

const Tag = new GraphQLObjectType({
   description: 'A tag',
   name: 'Tag',
   sqlTable: 'tags',
   uniqueKey: 'id',
   fields: () => ({
     id: {
       type: GraphQLInt
     },
     name: Util.translationField('name_translatable_id'),
     title: Util.translationField('title_translatable_id')
   })
 });

export default Tag;
