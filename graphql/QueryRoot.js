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
import Eventlistener from './Eventlistener';
import MessageType from './MessageType';
import Message from './Message';
import MenuItemsTree from './MenuItemsTree';

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
        if('id' in args)   wheres.push(db.knex.raw(`${actionsTable}.id = ?`, args.id));
        if('name' in args) wheres.push(db.knex.raw(`${actionsTable}.name = ?`, args.name));
        return wheres.join(' AND ');
      },
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster(resolveInfo, context, sql => {
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
        if('id' in args) wheres.push(db.knex.raw(`${menusTable}.id = ?`, args.id));
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
        return joinMonster(resolveInfo, context, sql => {
          return db.call(sql);
        }, { dialect: "mysql", minify: "true" })
      }
    },
    menuItemsTree: {
      type: new GraphQLList(MenuItemsTree),
      args: {
        menuId: {
          description: 'The menu id',
          type: new GraphQLNonNull(GraphQLInt)
        },
        rootId: {
          type: GraphQLInt
        },
        maxDepth: {
          type: GraphQLInt
        }
      },
      where: async (treeTable, args, { userId }) => {
        let wheres = [
          'depth = 1'
        ];
        if('id' in args) wheres.push(db.knex.raw(`${treeTable}.id = ?`, args.menuId));

        let userIdChecks = ['acl.user_id = 1']; // Guest
        if(userId) userIdChecks.push(db.knex.raw(`acl.user_id = ?`, userId).toString());

        let res = await db.knex.raw(
          `SELECT COUNT(*) AS result
           FROM acl
           JOIN menus ON menus.administrable_id = acl.administrable_id
           WHERE acl.action_name='read' AND (${userIdChecks.join(' OR ')}) AND menus.id=?`, [args.menuId]);

        let canReadMenu = res[0][0].result;
        if(!canReadMenu) {
          throw new GraphQLError(`Not allowed to read menu with id ${args.menuId}`);
        }

        if('depth' in args && !('rootId' in args)) {
          throw new GraphQLError('depth argument requires rootId argument');
        }

        if('rootId' in args) {
          wheres.push(db.knex.raw(
            `${treeTable}.ancestor IN (SELECT descendant FROM administrables_administrables WHERE ancestor = ?)`, [args.rootId]).toString());
          if('maxDepth' in args) {
            wheres.push(db.knex.raw(
              `${treeTable}.descendant NOT IN (SELECT descendant FROM administrables_administrables WHERE depth > ?)`, [args.maxDepth]).toString());
          }
        }

        return wheres.join(' AND ');
      },
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster(resolveInfo, context, sql => {
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
        rootId: {
          type: GraphQLInt
        },
        ancestorId: {
          type: GraphQLInt
        },
        descendantId: {
          type: GraphQLInt
        },
        depth: {
          type: GraphQLInt
        },
        maxDepth: {
          type: GraphQLInt
        },
        ...Util.actionArguments
      },
      where: (treeTable, args, { userId }) => {
        let wheres = [
          `${treeTable}.depth = 1`
        ];

        if('id' in args) wheres.push(db.knex.raw(`${treeTable}.id = ?`, args.id));

        if('depth' in args && !('rootId' in args)) {
          throw new GraphQLError('depth argument requires rootId argument');
        }

        if('ancestorId' in args) {
          wheres.push(db.knex.raw(
            `${treeTable}.ancestor = ?`, [args.ancestorId]).toString());
        }

        if('descendantId' in args) {
          wheres.push(db.knex.raw(
            `${treeTable}.descendant = ?`, [args.descendantId]).toString());
        }

        if('rootId' in args) {
          wheres.push(db.knex.raw(
            `${treeTable}.ancestor IN (SELECT descendant FROM administrables_administrables WHERE ancestor = ?)`, [args.rootId]).toString());
        }

        if('maxDepth' in args) {
          wheres.push(db.knex.raw(
            `${treeTable}.descendant NOT IN (SELECT descendant FROM administrables_administrables WHERE depth > ?)`, [args.maxDepth]).toString());
        }

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
        return joinMonster(resolveInfo, context, sql => {
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
        console.warn('USERID!', userId);
        let wheres = [];
        if('id' in args) wheres.push(db.knex.raw(`${administrablesTable}.id = ?`, args.id));
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
        return joinMonster(resolveInfo, context, sql => {
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
        if('id' in args) wheres.push(db.knex.raw(`${usersTable}.id = ?`, args.id));
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
        if('id' in args) wheres.push(db.knex.raw(`${usergroupsTable}.id = ?`, args.id));
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
        if('id' in args) wheres.push(db.knex.raw(`${tagsTable}.id = ?`, args.id));
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
    eventlisteners: {
      type: new GraphQLList(Eventlistener),
      args: {
        id: {
          description: 'The eventlistener id',
          type: GraphQLInt
        },
        ...Util.actionArguments
      },
      where: (eventlistenersTable, args, { userId, askedFor }) => {
        let wheres = [];
        if('id' in args) wheres.push(db.knex.raw(`${eventlistenersTable}.id = ?`, args.id));
        Util.handleActionArguments({
          args,
          required:   ['read'],
          wheres,
          user_id:    userId,
          tableName:  eventlistenersTable,
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
    messageTypes: {
      type: new GraphQLList(MessageType),
      args: {
        id: {
          description: 'The message type id',
          type: GraphQLInt
        },
        ...Util.actionArguments
      },
      where: (messageTypesTable, args, { userId, askedFor }) => {
        let wheres = [];
        if('id' in args) wheres.push(db.knex.raw(`${messageTypesTable}.id = ?`, args.id));
        Util.handleActionArguments({
          args,
          required:   ['read'],
          wheres,
          user_id:    userId,
          tableName:  messageTypesTable,
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
    messages: {
      type: new GraphQLList(Message),
      args: {
        id: {
          description: 'The message id',
          type: GraphQLInt
        },
        senderId: {
          description: 'User id of the sender',
          type: GraphQLInt
        },
        recipientId: {
          description: 'User id of the recipient',
          type: GraphQLInt
        },
        ...Util.actionArguments
      },
      where: (messagesTable, args, { userId, askedFor }) => {
        let wheres = [];
        if('id' in args) wheres.push(db.knex.raw(`${messagesTable}.id = ?`, args.id));
        Util.handleActionArguments({
          args,
          required:   ['read'],
          wheres,
          user_id:    userId,
          tableName:  messagesTable,
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
        if('id' in args) wheres.push(db.knex.raw(`${categoriesTable}.id = ?`, args.id));
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

        if('path' in args) {
          if(Object.keys(args).length > 1) {
            throw new GraphQLError(`Filter on path can't be combined with other filters.`);
          }
          let parts = args.path.split('/').slice(1);

          switch(parts.length) {
            case 1:
            console.warn('parts0', parts[0]);
              if(Util.isInt(parts[0])) {
                args.id = parts[0];
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

        if('id' in args) {
          wheres.push(db.knex.raw(`${pagesTable}.id = ?`, args.id).toString());
        }

        if('categoryId' in args) {
          wheres.push(db.knex.raw(`${pagesTable}.category_id = ?`, args.categoryId).toString());
        }

        if('slug' in args) {
          wheres.push(db.knex.raw(`
            ? IN (SELECT content
            FROM translations
            WHERE translatable_id = ${pagesTable}.slug_translatable_id)`,
            args.slug).toString());
        }

        if('categorySlug' in args) {
          wheres.push(db.knex.raw(`
            ${pagesTable}.category_id IN (SELECT c.id FROM categories AS c
              JOIN translations AS t ON t.translatable_id = c.translatable_id
              WHERE t.content = ?)`, args.categorySlug).toString());
        }

        if('tag' in args) {
          wheres.push(db.knex.raw(`
            ${pagesTable}.id IN (SELECT page_id FROM pages_tags AS pt
              JOIN translations AS t ON t.translatable_id = pt.translatable_id
              WHERE t.content = ?)`,
            args.tag).toString());
        }

        // We can fetch page if it's published or we have "edit" on it.
        wheres.push(db.knex.raw(
          `(${pagesTable}.publish_date < ? AND (${pagesTable}.unpublish_date IS NULL OR ${pagesTable}.unpublish_date > ?)
           OR ${Util.requireAction(userId, pagesTable, 'administrable_id', 'edit')})`,
          [db.knex.fn.now(), db.knex.fn.now()]
        ).toString());

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
        return joinMonster(resolveInfo, context, sql => {
          return db.call(sql);
        }, { dialect: "mysql", minify: "true" })
      }
    }
  })
});
