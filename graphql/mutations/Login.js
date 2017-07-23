import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLError
} from 'graphql';

import Util from '../Util';
import passwordHash from 'password-hash';
import db from '../../db';
import jwt from 'jsonwebtoken';
import {jwtSecret} from '../../config'

const login = {
  type: new GraphQLObjectType({
    name: "Login",
    fields: () => ({
      token: {type: GraphQLString}
    })
  }),
  args: {
    username: {
      description: 'Username',
      type: new GraphQLNonNull(GraphQLString)
    },
    password: {
      description: 'Password',
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  resolve: async (parent, args, context, resolveInfo) => {
    let res = await db.knex('users')
      .innerJoin('logins', 'logins.user_id', '=', 'users.id')
      .where({name: args.username})
      .select('*')
      .limit(1);
    if(res.length == 0) {
      throw new GraphQLError(`User ${args.username} doesn't exist`);
    }
    let user = res[0];
    let passwordCorrect = passwordHash.verify(args.password, user.hash);
    if(!passwordCorrect) {
      throw new GraphQLError(`Incorrect password`);
    }
    return {
      token: jwt.sign({
        userId: user.user_id,
        exp: Math.floor(Date.now() / 1000) + (60 * 60)
      }, jwtSecret)
    };
  }
}

export default login;
