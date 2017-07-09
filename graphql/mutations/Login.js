import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt
} from 'graphql';

// TODO: Should not import or use User. This is a placeholder.

import User from '../User';
import Util from '../Util';

const login = {
  type: new GraphQLList(User),
  args: {
    id: {
      description: 'The user id',
      type: GraphQLInt
    },
    ...Util.actionArguments
  },
  resolve: (parent, args, context, resolveInfo) => {
    return joinMonster(resolveInfo, {}, sql => {
      return db.call(sql);
    }, { dialect: "mysql", minify: "true" })
  }
}

export default login;
