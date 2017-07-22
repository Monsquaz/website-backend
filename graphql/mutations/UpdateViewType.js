import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLError
} from 'graphql';


import Util from '../Util';
import TranslationInput from './TranslationInput';
import ViewType from '../ViewType';
import joinMonster from 'join-monster';
import db from '../../db';
import validator from 'validator';

const UpdateViewType = {
  type: ViewType,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    input: {
      type: new GraphQLInputObjectType({
        description: '',
        name: 'UpdateViewTypeInput',
        fields: () => ({
          schema: {type: GraphQLString},
          schemaForm: {type: GraphQLString},
          filename: {type: GraphQLString}
        })
      })
    }
  },
  where: async (viewTypeTable, args, context) => {
    await db.knex.transaction(async (t) => {
      let input = args.input;
      if(!input) throw new GraphQLError('No input supplied');
    });
    return `${viewTypeTable}.id = ${args.id}`;
  },
  resolve: (parent, args, context, resolveInfo) => {
    return joinMonster(resolveInfo, {}, sql => {
      return db.call(sql);
    }, { dialect: "mysql", minify: "true" })
  }
}

export default UpdateViewType;
