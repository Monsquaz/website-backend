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
import View from '../View';
import joinMonster from 'join-monster';
import db from '../../db';
import validator from 'validator';

const UpdateView = {
  type: View,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    input: {
      type: new GraphQLInputObjectType({
        description: '',
        name: 'UpdateViewInput',
        fields: () => ({
          viewTypeId: {type: new GraphQLNonNull(GraphQLInt)},
          data: {type: GraphQLString},
          name: {type: new GraphQLList(TranslationInput)}
        })
      })
    }
  },
  where: async (viewTable, args, context) => {
    await db.knex.transaction(async (t) => {
      let input = args.input;
      if(!input) throw new GraphQLError('No input supplied');
    });
    return `${viewTable}.id = ${args.id}`;
  },
  resolve: (parent, args, context, resolveInfo) => {
    return joinMonster(resolveInfo, {}, sql => {
      return db.call(sql);
    }, { dialect: "mysql", minify: "true" })
  }
}

export default UpdateView;
