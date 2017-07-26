import {
  GraphQLObjectType,
  GraphQLBoolean,
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

let  updateQueryStringParameter = (uri, key, value) => {
  var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
  var separator = uri.indexOf('?') !== -1 ? "&" : "?";
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + "=" + value + '$2');
  }
  else {
    return uri + separator + key + "=" + value;
  }
}

const login = {
  type: new GraphQLObjectType({
    name: "ForgotPassword",
    fields: () => ({
      success: {type: GraphQLBoolean}
    })
  }),
  args: {
    username: {
      description: 'Username',
      type: GraphQLString
    },
    email: {
      description: 'Email',
      type: GraphQLString
    },
    url: {
      description: "Url to link to, with query parameter for token",
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  resolve: async (parent, args, context, resolveInfo) => {
    if(args.username && args.email) {
      throw new GraphQLError(`Can't use both username and password`);
    }
    if(!args.username && !args.email) {
      throw new GraphQLError(`Either username or email required`);
    }
    let where;
    if(args.username) where = {name: args.username};
    if(args.email) where = {email: args.email};
    let res = await db.knex('users')
      .where(where)
      .select('id', 'email')
      .limit(1);
    if(res.length == 0) {
      throw new GraphQLError(`User not found`);
    }
    let { id, email } = res[0];

    let token = jwt.sign({
      userId: id,
      email,
      canChangePassword: true
    });

    let link = updateQueryStringParameter(args.url, 'token', token);
    console.warn('link', link);

    // TODO: Email link.

    return {
      success: true
    };
  }
}

export default login;
