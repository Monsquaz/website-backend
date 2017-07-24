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
import User from '../User';
import joinMonster from 'join-monster';
import db from '../../db';

const DeletePage = {
  type: GraphQLBoolean,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLInt)
    }
  },
  resolve: async (parent, args, context, resolveInfo) => {
    let status;
    await db.knex.transaction(async (t) => {
      if(!args.id) throw new GraphQLError('No input supplied');

      let administrableId = await db.knex('pages')
        .where({id: args.id})
        .select('administrable_id');

      await db.knex('pages_tags')
        .where({page_id: args.id})
        .delete();

      await db.knex('pages')
        .where({id: args.id})
        .delete();

      await Util.deleteAdministrable({
        id:     administrableId,
        userId: context.userId
      });

    });
    return status;
  }
}

export default DeletePage;
