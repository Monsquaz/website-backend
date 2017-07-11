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

const PagePath = new GraphQLObjectType({
   description: 'A page path',
   name: 'PagePath',
   sqlTable: 'pages_paths',
   uniqueKey: 'id',
   fields: () => ({
     lang: {
       type: GraphQLString
     },
     path: {
       type: GraphQLString
     }
   })
 });

export default PagePath;
