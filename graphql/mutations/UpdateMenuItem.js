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
import Menu from '../Menu';
import joinMonster from 'join-monster';
import db from '../../db';
import validator from 'validator';

const UpdateMenuItem = {
  type: Menu,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    input: {
      type: new GraphQLInputObjectType({
        description: '',
        name: 'UpdateMenuItemInput',
        fields: () => ({
          menuId: { type: GraphQLInt },
          index:  { type: GraphQLInt },
          pageId: { type: GraphQLInt },
          title:  { type: new GraphQLList(TranslationInput) }
        })
      })
    }
  },
  where: async (menuItemsTable, args, context) => {
    await db.knex.transaction(async (t) => {
      let input = args.input;
      if(!input) throw new GraphQLError('No input supplied');
      // TODO
    });
    return `${menuItemsTable}.id = ${args.id}`;
  },
  resolve: (parent, args, context, resolveInfo) => {
    return joinMonster(resolveInfo, {}, sql => {
      return db.call(sql);
    }, { dialect: "mysql", minify: "true" })
  }
}

export default UpdateMenuItem;
