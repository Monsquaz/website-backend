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

const UpdateUser = {
  type: User,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    input: {
      type: new GraphQLInputObjectType({
        description: '',
        name: 'UpdateUserInput',
        fields: () => ({
          email:      {type: GraphQLString},
          firstname:  {type: GraphQLString},
          lastname:   {type: GraphQLString},
          password:   {type: GraphQLString}
        })
      })
    }
  },
  where: async (pagesTable, args, context) => {
    await db.knex.transaction(async (t) => {
      let input = args.input;
      if(!input) throw new GraphQLError('No input supplied');
      // Kontrollera att vi har "edit"-rättighet på användaren
      // Validera alla fält
      // Kolla så att inte email upptagen.
      // Uppdatera användaren
      // Uppdatera login
    });
    return `${usersTable}.id = ${args.id}`;
  },
  resolve: (parent, args, context, resolveInfo) => {
    return joinMonster(resolveInfo, {}, sql => {
      return db.call(sql);
    }, { dialect: "mysql", minify: "true" })
  }
}

export default UpdateUser;
