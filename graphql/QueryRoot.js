import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt
} from 'graphql';

import joinMonster from 'join-monster';
import db from '../db';
import Menu from './Menu';
import User from './User';

export default new GraphQLObjectType({
  description: 'Global query object',
  name: 'Query',
  fields: () => ({
    menus: {
      type: new GraphQLList(Menu),
      args: {
        id: {
          description: 'The menu id',
          type: GraphQLInt
        }
      },
      where: (menusTable, args, context) => {
        if(args.id) return `${menusTable}.id = ${args.id}`;
      },
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster(resolveInfo, {}, sql => {
          return db.call(sql);
        }, { dialect: "mysql", minify: "true" })
      }
    },
    users: {
      type: new GraphQLList(User),
      args: {
        id: {
          description: 'The user id',
          type: GraphQLInt
        }
      },
      where: (usersTable, args, context) => {
        let wheres = [];
        if(args.id) wheres.push(`${usersTable}.id = ${args.id}`);
        return wheres.join(' AND ');
      },
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster(resolveInfo, {}, sql => {
          return db.call(sql);
        }, { dialect: "mysql", minify: "true" })
      }
    }
  })
});
