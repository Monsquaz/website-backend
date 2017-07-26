import {
  GraphQLObjectType,
  GraphQLError,
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
import Usergroup from './Usergroup';
import Util from './Util';
import AdministrablesTree from './AdministrablesTree';
import Action from './Action';
import Page from './Page';
import Tag from './Tag';
import Category from './Category';

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
      where: (actionsTable, args, context) => {
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
      where: (menusTable, args, { userId }) => {
        let wheres = [];
        if(args.id) wheres.push(db.knex.raw(`${menusTable}.id = ?`, args.id));
        Util.handleActionArguments({
          args,
          required:   ['read'],
          wheres,
          user_id:    userId,
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
      where: (treeTable, args, { userId }) => {
        let wheres = [
          'depth = 1'
        ];
        if(args.id) wheres.push(db.knex.raw(`${treeTable}.id = ?`, args.id));
        Util.handleActionArguments({
          args,
          required:   ['read'],
          wheres,
          user_id:    userId,
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
      where: (administrablesTable, args, { userId }) => {
        let wheres = [];
        if(args.id) wheres.push(db.knex.raw(`${administrablesTable}.id = ?`, args.id));
        Util.handleActionArguments({
          args,
          required:   ['read'],
          wheres,
          user_id:    userId,
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
      where: (usersTable, args, { userId, askedFor }) => {
        let wheres = [];
        if(args.id) wheres.push(db.knex.raw(`${usersTable}.id = ?`, args.id));
        Util.handleActionArguments({
          args,
          required:   ['read'],
          wheres,
          user_id:    userId,
          tableName:  usersTable,
          fieldName: 'administrable_id'
        });
        return wheres.join(' AND ');
      },
      resolve: async (parent, args, context, resolveInfo) => {
        let askedFor = Util.askedFor(resolveInfo);
        let data = await joinMonster(resolveInfo, { ...context, askedFor }, sql => {
          return db.call(sql);
        }, { dialect: "mysql", minify: "true" });
        console.warn('data!', data);
        return data;
      }
    },
    usergroups: {
      type: new GraphQLList(Usergroup),
      args: {
        id: {
          description: 'The usergroup id',
          type: GraphQLInt
        },
        ...Util.actionArguments
      },
      where: (usergroupsTable, args, { userId, askedFor }) => {
        let wheres = [];
        if(args.id) wheres.push(db.knex.raw(`${usergroupsTable}.id = ?`, args.id));
        Util.handleActionArguments({
          args,
          required:   ['read'],
          wheres,
          user_id:    userId,
          tableName:  usergroupsTable,
          fieldName: 'administrable_id'
        });
        return wheres.join(' AND ');
      },
      resolve: async (parent, args, context, resolveInfo) => {
        let askedFor = Util.askedFor(resolveInfo);
        let data = await joinMonster(resolveInfo, { ...context, askedFor }, sql => {
          return db.call(sql);
        }, { dialect: "mysql", minify: "true" });
        return data;
      }
    },
    tags: {
      type: new GraphQLList(Tag),
      args: {
        id: {
          description: 'The tag id',
          type: GraphQLInt
        },
        ...Util.actionArguments
      },
      where: (tagsTable, args, { userId, askedFor }) => {
        let wheres = [];
        if(args.id) wheres.push(db.knex.raw(`${tagsTable}.id = ?`, args.id));
        Util.handleActionArguments({
          args,
          required:   ['read'],
          wheres,
          user_id:    userId,
          tableName:  tagsTable,
          fieldName: 'administrable_id'
        });
        return wheres.join(' AND ');
      },
      resolve: async (parent, args, context, resolveInfo) => {
        let askedFor = Util.askedFor(resolveInfo);
        let data = await joinMonster(resolveInfo, { ...context, askedFor }, sql => {
          return db.call(sql);
        }, { dialect: "mysql", minify: "true" });
        return data;
      }
    },
    categories: {
      type: new GraphQLList(Category),
      args: {
        id: {
          description: 'The category id',
          type: GraphQLInt
        },
        ...Util.actionArguments
      },
      where: (categoriesTable, args, { userId, askedFor }) => {
        let wheres = [];
        if(args.id) wheres.push(db.knex.raw(`${categoriesTable}.id = ?`, args.id));
        Util.handleActionArguments({
          args,
          required:   ['read'],
          wheres,
          user_id:    userId,
          tableName:  categoriesTable,
          fieldName: 'administrable_id'
        });
        return wheres.join(' AND ');
      },
      resolve: async (parent, args, context, resolveInfo) => {
        let askedFor = Util.askedFor(resolveInfo);
        let data = await joinMonster(resolveInfo, { ...context, askedFor }, sql => {
          return db.call(sql);
        }, { dialect: "mysql", minify: "true" });
        return data;
      }
    },
    pages: {
      type: new GraphQLList(Page),
      args: {
        id: {
          description: 'The page id',
          type: GraphQLInt
        },
        categoryId: {
          description: 'The category id',
          type: GraphQLInt
        },
        slug: {
          description: 'The page slug',
          type: GraphQLString
        },
        categorySlug: {
          description: 'The category slug',
          type: GraphQLString
        },
        path: {
          description: 'The url path',
          type: GraphQLString
        },
        tag: {
          type: GraphQLInt
        },
        ...Util.actionArguments
      },
      where: (pagesTable, args, { userId }) => {

        let wheres = [];

        if(args.path) {
          if(Object.keys(args).length > 1) {
            throw new GraphQLError(`Filter on path can't be combined with other filters.`);
          }
          let parts = args.path.split('/').slice(1);
          switch(parts.length) {
            case 1:
              if(Util.isInt(parts[0])) {
                args.id = arts[0];
              } else {
                args.slug = parts[0];
              }
              break;
            case 2:
              if(parts[0] == 'tags') {
                if(args.tag && args.tag != parts[1]) {
                  throw new GraphQLError(`Can't filter on both tags: ${args.tag} and ${parts[1]}`);
                }
                args.tag = parts[1];
              } else {
                args.categorySlug = parts[0];
                args.slug = parts[1];
              }
              break;
            default:
              wheres.push('false');
          }
        }

        if(args.id) {
          wheres.push(db.knex.raw(`${pagesTable}.id = ?`, args.id));
        }

        if(args.categoryId) {
          wheres.push(db.knex.raw(`${pagesTable}.category_id = ?`, args.categoryId));
        }

        if(args.slug) {
          wheres.push(db.knex.raw(`
            ? IN (SELECT content
            FROM translations
            WHERE translatable_id = ${pagesTable}.slug_translatable_id)`,
            args.slug));
        }

        if(args.categorySlug) {
          wheres.push(db.knex.raw(`
            ${pagesTable}.category_id IN (SELECT c.id FROM categories AS c
              JOIN translations AS t ON t.translatable_id = c.translatable_id
              WHERE t.content = ?)`, args.categorySlug));
        }

        if(args.tag) {
          wheres.push(db.knex.raw(`
            ${pagesTable}.id IN (SELECT page_id FROM pages_tags AS pt
              JOIN translations AS t ON t.translatable_id = pt.translatable_id
              WHERE t.content = ?)`,
            args.tag));
        }

        // We can fetch page if it's published or we have "edit" on it.
        wheres.push(db.knex.raw(
          `${pagesTable}.publish_date < ? AND (${pagesTable}.unpublish_date = 0 OR ${pagesTable}.unpublish_date > ?)
           OR ${Util.requireAction(userId, pagesTable, 'administrable_id', 'edit')}`,
          [db.knex.fn.now(), db.knex.fn.now()]
        ));

        Util.handleActionArguments({
          args,
          required:   ['read'],
          wheres,
          user_id:    userId,
          tableName:  pagesTable,
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
