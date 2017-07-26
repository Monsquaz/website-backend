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
import AdministrablesTree from './AdministrablesTree';

const Administrable = new GraphQLObjectType({
  description: 'An administrable',
  name: 'Administrable',
  sqlTable: 'administrables',
  uniqueKey: 'id',
  fields: () => ({
    id: {
      type: GraphQLInt
    },
    name:    Util.translationField('name_translatable_id'),
    _actions: Util.actionsField('id')
  })
});

export default Administrable;
