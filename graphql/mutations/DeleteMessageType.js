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
import joinMonster from 'join-monster';
import db from '../../db';

const DeleteMessageType = {
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
      // TODO
    });
    return status;
  }
}

export default DeleteMessageType;
