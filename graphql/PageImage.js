import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat
} from 'graphql';

import db from '../db';
import Util from './Util';

export default new GraphQLObjectType({
   description: 'A page image',
   name: 'PageImage',
   sqlTable: 'page_images',
   uniqueKey: 'id',
   fields: () => ({
     id: {
       type: GraphQLInt
     },
     url: {
       type: GraphQLString
     }
   })
 });
