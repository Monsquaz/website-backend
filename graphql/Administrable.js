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
import AdminManifest from './AdminManifest';

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
    _actions: Util.actionsField('id'),
    manifest: {
      type: AdminManifest,
      sqlTable: 'admin_manifests',
      sqlJoin: (administrablesTable, manifestsTable, args) =>
        `${administrablesTable}.id = ${manifestsTable}.administrable_id`
    }
  })
});

export default Administrable;
