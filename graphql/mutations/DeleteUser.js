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

const DeleteUser = {
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
      // Kontrollera att vi har "delete"-rättighet på användaren
      // Ta bort användaren
      // Ta bort administrable:n
      // Ta bort administralbe_administrables
    });
    return status;
  }
}

export default DeleteUser;
