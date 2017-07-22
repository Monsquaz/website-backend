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
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  where: async (usersTable, args, context) => {
    let userId;
    await db.knex.transaction(async (t) => {

      let users = await t('users')
        .where({verification_code: args.verificationCode})
        .select('id', 'is_verified');

      if(users.length == 0) {
        throw new GraphQLError('Invalid verification code');
      }

      let user = users[0];

      if(user.is_verified) {
        throw new GraphQLError('User is already verified');
      }

      await t('users')
        .where({id: user.id})
        .update({is_verified: true})

      userId = user.id;

    });
    return `${usersTable}.id = ${userId}`;
  },
  resolve: (parent, args, context, resolveInfo) => {
    return joinMonster(resolveInfo, {}, sql => {
      return db.call(sql);
    }, { dialect: "mysql", minify: "true" })
  }
}

export default VerifyUser;
