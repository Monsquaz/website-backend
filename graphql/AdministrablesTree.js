import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat
} from 'graphql';

import db from '../db';
import Util from './Util';

const AdministrablesTree = new GraphQLObjectType({
   description: 'An administrable mapping',
   name: 'AdministrablesTree',
   sqlTable: 'administrables_administrables',
   uniqueKey: 'id',
   fields: () => ({
     id: {
       type: GraphQLInt
     },
     ancestor: Util.administrableField('ancestor'),
     descendant: Util.administrableField('descendant')
   })
 });

export default AdministrablesTree ;
