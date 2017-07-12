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

const VerifyUser = {
  type: User,
  args: {
    verificationCode: {
      type: GraphQLString
    }
  },
  where: async (pagesTable, args, context) => {
    let user_id;
    await db.knex.transaction(async (t) => {
      let input = args.input;
      if(!input) throw new GraphQLError('No input supplied');
      // Kolla om det finns en user med den verifieringskoden.
      // Om det inte finns en user => kasta ogiltig verifieringskoden
      // Om användaren redan är verifierad => kasta användare redan verifierad
      // Sätt användaren som verifierad och sätt user_id till användarid:t
    });
    return `${usersTable}.id = ${insert_id}`;
  },
  resolve: (parent, args, context, resolveInfo) => {
    return joinMonster(resolveInfo, {}, sql => {
      return db.call(sql);
    }, { dialect: "mysql", minify: "true" })
  }
}

export default VerifyUser;
