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
import Administrable from './Administrable';
import User from './User';
import Util from './Util';
import AdministrablesTree from './AdministrablesTree';
import Action from './Action';

export default new GraphQLObjectType({
  description: 'Global query object',
  name: 'Query',
  fields: () => ({
    actions: {
      type: new GraphQLList(Action),
      args: {
        id: {
          description: 'The action id',
          type: GraphQLInt
        },
        name: {
          description: 'The action name',
          type: GraphQLString
        },
      },
      where: async (actionsTable, args, context) => {
        let wheres = [];
        if(args.id)   wheres.push(db.knex.raw(`${actionsTable}.id = ?`, args.id));
        if(args.name) wheres.push(db.knex.raw(`${actionsTable}.name = ?`, args.name));
        return wheres.join(' AND ');
      },
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster(resolveInfo, {}, sql => {
          return db.call(sql);
        }, { dialect: "mysql", minify: "true" })
      }
    },
    menus: {
      type: new GraphQLList(Menu),
      args: {
        id: {
          description: 'The menu id',
          type: GraphQLInt
        },
        ...Util.actionArguments
      },
      where: (menusTable, args, context) => {
        let wheres = [];
        if(args.id) wheres.push(db.knex.raw(`${menusTable}.id = ?`, args.id));
        Util.handleActionArguments({
          args,
          required:   ['read'],
          wheres,
          user_id:    context.user_id,
          tableName:  menusTable,
          fieldName: 'administrable_id'
        });
        return wheres.join(' AND ');
      },
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster(resolveInfo, {}, sql => {
          return db.call(sql);
        }, { dialect: "mysql", minify: "true" })
      }
    },
    administrablesTree: {
      type: new GraphQLList(AdministrablesTree),
      args: {
        id: {
          description: 'The administrable tree id',
          type: GraphQLInt
        },
        ...Util.actionArguments
      },
      where: (treeTable, args, context) => {
        let wheres = [
          'depth = 1'
        ];
        if(args.id) wheres.push(db.knex.raw(`${treeTable}.id = ?`, args.id));
        Util.handleActionArguments({
          args,
          required:   ['read'],
          wheres,
          user_id:    context.user_id,
          tableName:  treeTable,
          fieldName: 'ancestor'
        });
        return wheres.join(' AND ');
      },
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster(resolveInfo, {}, sql => {
          return db.call(sql);
        }, { dialect: "mysql", minify: "true" })
      }
    },
    administrables: {
      type: new GraphQLList(Administrable),
      args: {
        id: {
          description: 'The administrable id',
          type: GraphQLInt
        },
        ...Util.actionArguments
      },
      where: (administrablesTable, args, context) => {
        let wheres = [];
        if(args.id) wheres.push(db.knex.raw(`${administrablesTable}.id = ?`, args.id));
        Util.handleActionArguments({
          args,
          required:   ['read'],
          wheres,
          user_id:    context.user_id,
          tableName:  administrablesTable,
          fieldName: 'id'
        });
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
        },
        ...Util.actionArguments
      },
      where: (usersTable, args, context) => {
        let wheres = [];
        if(args.id) wheres.push(db.knex.raw(`${usersTable}.id = ?`, args.id));
        Util.handleActionArguments({
          args,
          required:   ['read'],
          wheres,
          user_id:    context.user_id,
          tableName:  usersTable,
          fieldName: 'administrable_id'
        });
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
