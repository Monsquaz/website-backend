
let changeForeign = (knex, params) => {
  return knex.schema.table(params.tableName, (table) => {
    if(typeof(params.isNewForeign) == 'undefined' || !params.isNewForeign) {
      table.dropForeign(params.columnName);
    }
  }).then(() => {
    return knex.schema.table(params.tableName, (table) => {
      table.dropColumn(params.columnName);
    })
  }).then(() => {
    return knex.schema.table(params.tableName, (table) => {
      let c = table.integer(params.columnName);
      if(params.unsigned) c.unsigned();
      if(params.nullable) c.nullable();
      else c.notNullable();
    })
  }).then(() => {
    return knex.schema.table(params.tableName, (table) => {
      let f = table
      .foreign(params.columnName)
      .references(params.references);
      if('onUpdate' in params) f.onUpdate(params.onUpdate);
      if('onDelete' in params) f.onDelete(params.onDelete);
    })
  });
}

exports.up = function(knex, Promise) {
  return Promise.all([
    changeForeign(knex, {
      tableName: 'administrables_administrables',
      columnName: 'ancestor',
      unsigned: true,
      nullable: false,
      references: 'administrables.id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    }),
    changeForeign(knex, {
      tableName: 'administrables_administrables',
      columnName: 'descendant',
      unsigned: true,
      nullable: false,
      references: 'administrables.id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    }),
    changeForeign(knex, {
      tableName: 'administrables_meta_datas',
      columnName: 'administrable_id',
      unsigned: true,
      nullable: false,
      references: 'administrables.id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    }),
    changeForeign(knex, {
      tableName: 'categories',
      columnName: 'administrable_id',
      unsigned: true,
      nullable: false,
      references: 'administrables.id',
      onUpdate: 'cascade',
      onDelete: 'restrict'
    }),
    changeForeign(knex, {
      tableName: 'categories_categories',
      columnName: 'ancestor',
      unsigned: true,
      nullable: false,
      references: 'categories.id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    }),
    changeForeign(knex, {
      tableName: 'categories_categories',
      columnName: 'descendant',
      unsigned: true,
      nullable: false,
      references: 'categories.id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    }),
    changeForeign(knex, {
      tableName: 'eventlisteners',
      columnName: 'administrable_id',
      unsigned: true,
      nullable: false,
      references: 'administrables.id',
      onUpdate: 'cascade',
      onDelete: 'restrict'
    }),
    changeForeign(knex, {
      tableName: 'logins',
      columnName: 'user_id',
      unsigned: true,
      nullable: false,
      references: 'users.id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    }),
    changeForeign(knex, {
      tableName: 'menu_items',
      columnName: 'menu_id',
      unsigned: true,
      nullable: false,
      references: 'menus.id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    }),
    changeForeign(knex, {
      tableName: 'menu_items_menu_items',
      columnName: 'ancestor',
      unsigned: true,
      nullable: false,
      references: 'menu_items.id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    }),
    changeForeign(knex, {
      tableName: 'menu_items_menu_items',
      columnName: 'descendant',
      unsigned: true,
      nullable: false,
      references: 'menu_items.id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    }),
    changeForeign(knex, {
      tableName: 'menus',
      columnName: 'administrable_id',
      unsigned: true,
      nullable: false,
      references: 'administrables.id',
      onUpdate: 'cascade',
      onDelete: 'restrict'
    }),
    changeForeign(knex, {
      tableName: 'messages',
      columnName: 'message_type_id',
      unsigned: true,
      nullable: false,
      references: 'message_types.id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    }),
    changeForeign(knex, {
      tableName: 'messages',
      columnName: 'administrable_id',
      unsigned: true,
      nullable: false,
      references: 'administrables.id',
      onUpdate: 'cascade',
      onDelete: 'restrict'
    }),
    changeForeign(knex, {
      tableName: 'oauth_resources_users',
      columnName: 'oauth_resource_id',
      unsigned: true,
      nullable: false,
      references: 'oauth_resources.id',
      onUpdate: 'cascade',
      onDelete: 'restrict'
    }),
    changeForeign(knex, {
      tableName: 'oauth_resources_users',
      columnName: 'user_id',
      unsigned: true,
      nullable: false,
      references: 'users.id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    }),
    changeForeign(knex, {
      tableName: 'pages',
      columnName: 'administrable_id',
      unsigned: true,
      nullable: false,
      references: 'administrables.id',
      onUpdate: 'cascade',
      onDelete: 'restrict'
    }),
    changeForeign(knex, {
      tableName: 'pages_tags',
      columnName: 'page_id',
      unsigned: true,
      nullable: false,
      references: 'pages.id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    }),
    changeForeign(knex, {
      tableName: 'pages_tags',
      columnName: 'tag_id',
      unsigned: true,
      nullable: false,
      references: 'tags.id',
      onUpdate: 'cascade',
      onDelete: 'restrict'
    }),
    changeForeign(knex, {
      tableName: 'usergroups',
      columnName: 'administrable_id',
      unsigned: true,
      nullable: false,
      references: 'administrables.id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    }),
    changeForeign(knex, {
      tableName: 'users_actions_administrables',
      columnName: 'user_id',
      unsigned: true,
      nullable: false,
      references: 'users.id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    }),
    changeForeign(knex, {
      tableName: 'users_actions_administrables',
      columnName: 'action_id',
      unsigned: true,
      nullable: false,
      references: 'actions.id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    }),
    changeForeign(knex, {
      tableName: 'users_actions_administrables',
      columnName: 'administrable_id',
      unsigned: true,
      nullable: false,
      references: 'administrables.id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    }),
    changeForeign(knex, {
      isNewForeign: true,
      tableName: 'usergroups_actions_administrables',
      columnName: 'usergroup_id',
      unsigned: true,
      nullable: false,
      references: 'usergroups.id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    }),
    changeForeign(knex, {
      isNewForeign: true,
      tableName: 'usergroups_actions_administrables',
      columnName: 'action_id',
      unsigned: true,
      nullable: false,
      references: 'actions.id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    }),
    changeForeign(knex, {
      isNewForeign: true,
      tableName: 'usergroups_actions_administrables',
      columnName: 'administrable_id',
      unsigned: true,
      nullable: false,
      references: 'administrables.id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    }),
    changeForeign(knex, {
      tableName: 'users',
      columnName: 'administrable_id',
      unsigned: true,
      nullable: false,
      references: 'administrables.id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    }),
    changeForeign(knex, {
      tableName: 'users_usergroups',
      columnName: 'user_id',
      unsigned: true,
      nullable: false,
      references: 'users.id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    }),
    changeForeign(knex, {
      tableName: 'users_usergroups',
      columnName: 'usergroup_id',
      unsigned: true,
      nullable: false,
      references: 'usergroups.id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    }),
    changeForeign(knex, {
      tableName: 'views',
      columnName: 'view_type_id',
      unsigned: true,
      nullable: false,
      references: 'view_types.id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    }),
    changeForeign(knex, {
      tableName: 'views',
      columnName: 'administrable_id',
      unsigned: true,
      nullable: false,
      references: 'administrables.id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    changeForeign(knex, {
      tableName: 'administrables_administrables',
      columnName: 'ancestor',
      unsigned: true,
      references: 'administrables.id'
    }),
    changeForeign(knex, {
      tableName: 'administrables_administrables',
      columnName: 'descendant',
      unsigned: true,
      references: 'administrables.id'
    }),
    changeForeign(knex, {
      tableName: 'administrables_meta_datas',
      columnName: 'administrable_id',
      unsigned: true,
      references: 'administrables.id'
    }),
    changeForeign(knex, {
      tableName: 'categories',
      columnName: 'administrable_id',
      unsigned: true,
      references: 'administrables.id'
    }),
    changeForeign(knex, {
      tableName: 'categories_categories',
      columnName: 'ancestor',
      unsigned: true,
      references: 'categories.id'
    }),
    changeForeign(knex, {
      tableName: 'categories_categories',
      columnName: 'descendant',
      unsigned: true,
      references: 'categories.id'
    }),
    changeForeign(knex, {
      tableName: 'eventlisteners',
      columnName: 'administrable_id',
      unsigned: true,
      references: 'administrables.id'
    }),
    changeForeign(knex, {
      tableName: 'logins',
      columnName: 'user_id',
      unsigned: true,
      references: 'users.id'
    }),
    changeForeign(knex, {
      tableName: 'menu_items',
      columnName: 'menu_id',
      unsigned: true,
      references: 'menus.id'
    }),
    changeForeign(knex, {
      tableName: 'menu_items_menu_items',
      columnName: 'ancestor',
      unsigned: true,
      references: 'menu_items.id'
    }),
    changeForeign(knex, {
      tableName: 'menu_items_menu_items',
      columnName: 'descendant',
      unsigned: true,
      references: 'menu_items.id'
    }),
    changeForeign(knex, {
      tableName: 'menus',
      columnName: 'administrable_id',
      unsigned: true,
      references: 'administrables.id'
    }),
    changeForeign(knex, {
      tableName: 'messages',
      columnName: 'message_type_id',
      unsigned: true,
      references: 'message_types.id'
    }),
    changeForeign(knex, {
      tableName: 'messages',
      columnName: 'administrable_id',
      unsigned: true,
      references: 'administrables.id'
    }),
    changeForeign(knex, {
      tableName: 'oauth_resources_users',
      columnName: 'oauth_resource_id',
      unsigned: true,
      references: 'oauth_resources.id'
    }),
    changeForeign(knex, {
      tableName: 'oauth_resources_users',
      columnName: 'user_id',
      unsigned: true,
      references: 'users.id'
    }),
    changeForeign(knex, {
      tableName: 'pages',
      columnName: 'administrable_id',
      unsigned: true,
      references: 'administrables.id'
    }),
    changeForeign(knex, {
      tableName: 'pages_tags',
      columnName: 'page_id',
      unsigned: true,
      references: 'pages.id'
    }),
    changeForeign(knex, {
      tableName: 'pages_tags',
      columnName: 'tag_id',
      unsigned: true,
      references: 'tags.id'
    }),
    changeForeign(knex, {
      tableName: 'usergroups',
      columnName: 'administrable_id',
      unsigned: true,
      references: 'administrables.id'
    }),
    changeForeign(knex, {
      tableName: 'users_actions_administrables',
      columnName: 'user_id',
      unsigned: true,
      references: 'users.id'
    }),
    changeForeign(knex, {
      tableName: 'users_actions_administrables',
      columnName: 'action_id',
      unsigned: true,
      references: 'actions.id'
    }),
    changeForeign(knex, {
      tableName: 'users_actions_administrables',
      columnName: 'administrable_id',
      unsigned: true,
      references: 'administrables.id'
    }),
    knex.schema.table('usergroups_actions_administrables', (table) => {
      table.dropForeign('usergroup_id');
      table.dropForeign('action_id');
      table.dropForeign('administrable_id');
    }),
    changeForeign(knex, {
      tableName: 'users',
      columnName: 'administrable_id',
      unsigned: true,
      references: 'administrables.id'
    }),
    changeForeign(knex, {
      tableName: 'users_usergroups',
      columnName: 'user_id',
      unsigned: true,
      references: 'users.id'
    }),
    changeForeign(knex, {
      tableName: 'users_usergroups',
      columnName: 'usergroup_id',
      unsigned: true,
      references: 'usergroups.id'
    }),
    changeForeign(knex, {
      tableName: 'views',
      columnName: 'view_type_id',
      unsigned: true,
      references: 'view_types.id'
    }),
    changeForeign(knex, {
      tableName: 'views',
      columnName: 'administrable_id',
      unsigned: true,
      references: 'administrables.id'
    })
  ]);
};
