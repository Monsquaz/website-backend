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
import Util from './Util';

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
        let wheres = [];
        if(args.id) wheres.push(`${menusTable}.id = ${args.id}`);
        wheres.push(Util.requireAction(
          context.user_id, menusTable, 'administrable_id', 'read'
        ));
        return wheres.join(' AND ');
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
        wheres.push(Util.requireAllActions(
          context.user_id, usersTable, 'administrable_id', ['read']
        ))
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
