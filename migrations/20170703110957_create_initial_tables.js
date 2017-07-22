let createTables = function(knex, Promise){
  return knex.schema
    .createTable('administrables', function(table){
      table.increments();
      table.integer('name_translatable_id').unsigned().notNullable();
      table.timestamp('created').defaultTo(knex.fn.now());
      table.timestamp('changed').defaultTo(knex.fn.now());
      table.integer('created_by').unsigned();
      table.integer('changed_by').unsigned();
    })
    .createTable('administrables_administrables', function(table){
      table.increments();
      table.integer('ancestor').unsigned();
      table.integer('descendant').unsigned();
      table.integer('length').unsigned().notNullable();
    })
    .createTable('actions', function(table){
      table.increments();
      table.string('name').notNullable();
      table.integer('description_translatable_id').unsigned();
    })
    .createTable('users_actions_administrables', function(table){
      table.increments();
      table.integer('user_id').unsigned();
      table.integer('action_id').unsigned();
      table.integer('administrable_id').unsigned();
    })
    .createTable('usergroups_actions_administrables', function(table){
      table.increments();
      table.integer('usergroup_id').unsigned();
      table.integer('action_id').unsigned();
      table.integer('administrable_id').unsigned();
    })
    .createTable('usergroups', function(table){
      table.increments();
      table.string('name').notNullable();
    })
    .createTable('users', function(table){
      table.increments();
      table.string('name').notNullable();
    })
    .createTable('users_usergroups', function(table){
      table.increments();
      table.integer('user_id').unsigned();
      table.integer('usergroup_id').unsigned();
    })
    .createTable('logins', function(table){
      table.increments();
      table.integer('user_id').unsigned().unique();
      table.string('hash').notNullable();
    })
    .createTable('oauth_resources', function(table){
      table.increments();
      table.string('name').notNullable();
    })
    .createTable('oauth_resources_users', function(table){
      table.increments();
      table.integer('oauth_resource_id').unsigned();
      table.integer('user_id').unsigned();
      table.string('accessToken');
    })
    .createTable('memberships', function(table){
      table.increments();
    })
    .createTable('eventlisteners', function(table){
      table.increments();
      table.string('resource_type').notNullable();
      table.integer('resource_id').unsigned();
      table.string('resource_event_type').notNullable();
    })
    .createTable('message_types', function(table){
      table.increments();
      table.integer('name_translatable_id').unsigned();
    })
    .createTable('messages', function(table){
      table.increments();
      table.integer('message_type_id').unsigned();
      table.integer('parent').unsigned();
      table.integer('sender_user_id').unsigned();
      table.integer('recipient_user_id').unsigned();
      table.integer('administrable_id').unsigned();
      table.boolean('sent');
      table.timestamp('send_date');
      table.text('content');
    })
    .createTable('administrables_meta_datas', function(table){
      table.increments();
      table.integer('administrable_id').unsigned();
      table.string('key');
      table.string('value');
    })
    .createTable('page_types', function(table){
      table.increments();
      table.integer('name_translatable_id').unsigned();
    })
    .createTable('pages', function(table){
      table.increments();
      table.integer('category_id').unsigned();
      table.integer('slug_translatable_id').unsigned();
      table.integer('title_translatable_id').unsigned();
      table.integer('page_type_id').unsigned();
      table.integer('administrable_id').unsigned();
      table.timestamp('publish_date').notNullable();
      table.timestamp('unpublish_date').nullable();
      table.integer('canonical_page_id').unsigned();
    })
    .createTable('tags', function(table){
      table.increments();
      table.integer('name_translatable_id').unsigned();
    })
    .createTable('pages_tags', function(table){
      table.increments();
      table.integer('page_id').unsigned();
      table.integer('tag_id').unsigned();
    })
    .createTable('assets', function(table){
      table.increments();
    })
    .createTable('translatables', function(table){
      table.increments();
    })
    .createTable('translations', function(table){
      table.increments();
      table.integer('translatable_id').unsigned();
      table.string('lang');
      table.text('content');
    })
    .createTable('menu_types', function(table){
      table.increments();
      table.integer('name_translatable_id').unsigned();
    })
    .createTable('menus', function(table){
      table.increments();
      table.integer('menu_type').unsigned();
    })
    .createTable('menu_items', function(table){
      table.increments();
      table.integer('menu_id').unsigned();
      table.integer('index').unsigned();
      table.integer('page_id').unsigned();
      table.integer('parent').unsigned();
      table.integer('title_translatable_id').unsigned();
    })
    .createTable('categories', function(table){
      table.increments();
      table.integer('page_id').unsigned();
      table.integer('title_translatable_id').unsigned();
      table.integer('slug_translatable_id').unsigned();
      table.integer('parent').unsigned();
    })
};

let setupForeignKeys = function(knex, Promise){
  return knex.schema
    .table('administrables', function(table){
      table.foreign('name_translatable_id').references('translatables.id');
    })
    .table('administrables_administrables', function(table){
      table.foreign('ancestor').references('administrables.id');
      table.foreign('descendant').references('administrables.id');
    })
    .table('actions', function(table){
      table.foreign('description_translatable_id').references('translatables.id');
    })
    .table('users_actions_administrables', function(table){
      table.foreign('user_id').references('usergroups.id');
      table.foreign('action_id').references('actions.id');
      table.foreign('administrable_id').references('administrables.id');
    })
    .table('users_usergroups', function(table){
      table.foreign('user_id').references('users.id');
      table.foreign('usergroup_id').references('usergroups.id');
    })
    .table('logins', function(table){
      table.foreign('user_id').references('users.id');
    })
    .table('oauth_resources_users', function(table){
      table.foreign('oauth_resource_id').references('oauth_resources.id');
      table.foreign('user_id').references('users.id');
    })
    .table('message_types', function(table){
      table.foreign('name_translatable_id').references('translatables.id');
    })
    .table('messages', function(table){
      table.foreign('message_type_id').references('message_types.id');
      table.foreign('parent').references('messages.id');
      table.foreign('sender_user_id').references('users.id');
      table.foreign('recipient_user_id').references('users.id');
      table.foreign('administrable_id').references('administrables.id');
    })
    .table('administrables_meta_datas', function(table){
      table.foreign('administrable_id').references('administrables.id');
    })
    .table('page_types', function(table){
      table.foreign('name_translatable_id').references('translatables.id');
    })
    .table('pages', function(table){
      table.foreign('category_id').references('categories.id');
      table.foreign('slug_translatable_id').references('translatables.id');
      table.foreign('title_translatable_id').references('translatables.id');
      table.foreign('page_type_id').references('page_types.id');
      table.foreign('administrable_id').references('administrables.id');
    })
    .table('tags', function(table){
      table.foreign('name_translatable_id').references('translatables.id');
    })
    .table('pages_tags', function(table){
      table.foreign('page_id').references('pages.id');
      table.foreign('tag_id').references('tags.id');
    })
    .table('translations', function(table){
      table.foreign('translatable_id').references('translatables.id');
    })
    .table('menu_types', function(table){
      table.foreign('name_translatable_id').references('translatables.id');
    })
    .table('menu_items', function(table){
      table.foreign('menu_id').references('menus.id');
      table.foreign('page_id').references('pages.id');
      table.foreign('title_translatable_id').references('translatables.id');
    })
    .table('categories', function(table){
      table.foreign('page_id').references('pages.id');
      table.foreign('title_translatable_id').references('translatables.id');
      table.foreign('slug_translatable_id').references('translatables.id');
      table.foreign('parent').references('categories.id');
    })
};

let dropForeignKeys = function(knex, Promise){
  return knex.schema
    .table('administrables', function(table){
      table.dropForeign('name_translatable_id');
    })
    .table('administrables_administrables', function(table){
      table.dropForeign('ancestor');
      table.dropForeign('descendant');
    })
    .table('actions', function(table){
      table.dropForeign('description_translatable_id');
    })
    .table('users_actions_administrables', function(table){
      table.dropForeign('user_id');
      table.dropForeign('action_id');
      table.dropForeign('administrable_id');
    })
    .table('users_usergroups', function(table){
      table.dropForeign('user_id');
      table.dropForeign('usergroup_id');
    })
    .table('logins', function(table){
      table.dropForeign('user_id');
    })
    .table('oauth_resources_users', function(table){
      table.dropForeign('oauth_resource_id');
      table.dropForeign('user_id');
    })
    .table('message_types', function(table){
      table.dropForeign('name_translatable_id');
    })
    .table('messages', function(table){
      table.dropForeign('message_type_id');
      table.dropForeign('parent');
      table.dropForeign('sender_user_id');
      table.dropForeign('recipient_user_id');
      table.dropForeign('administrable_id');
    })
    .table('administrables_meta_datas', function(table){
      table.dropForeign('administrable_id');
    })
    .table('page_types', function(table){
      table.dropForeign('name_translatable_id');
    })
    .table('pages', function(table){
      table.dropForeign('category_id');
      table.dropForeign('slug_translatable_id');
      table.dropForeign('title_translatable_id');
      table.dropForeign('page_type_id');
      table.dropForeign('administrable_id');
    })
    .table('tags', function(table){
      table.dropForeign('name_translatable_id');
    })
    .table('pages_tags', function(table){
      table.dropForeign('page_id');
      table.dropForeign('tag_id');
    })
    .table('translations', function(table){
      table.dropForeign('translatable_id');
    })
    .table('menu_types', function(table){
      table.dropForeign('name_translatable_id');
    })
    .table('menu_items', function(table){
      table.dropForeign('menu_id');
      table.dropForeign('page_id');
      table.dropForeign('title_translatable_id');
    })
    .table('categories', function(table){
      table.dropForeign('page_id');
      table.dropForeign('title_translatable_id');
      table.dropForeign('slug_translatable_id');
      table.dropForeign('parent');
    })
};

let dropTables = function(knex, Promise){
  return knex.schema
    .dropTable('administrables')
    .dropTable('administrables_administrables')
    .dropTable('actions')
    .dropTable('users_actions_administrables')
    .dropTable('usergroups_actions_administrables')
    .dropTable('usergroups')
    .dropTable('users')
    .dropTable('users_usergroups')
    .dropTable('logins')
    .dropTable('oauth_resources')
    .dropTable('oauth_resources_users')
    .dropTable('memberships')
    .dropTable('eventlisteners')
    .dropTable('message_types')
    .dropTable('messages')
    .dropTable('administrables_meta_datas')
    .dropTable('page_types')
    .dropTable('pages')
    .dropTable('tags')
    .dropTable('pages_tags')
    .dropTable('assets')
    .dropTable('translatables')
    .dropTable('translations')
    .dropTable('menu_types')
    .dropTable('menus')
    .dropTable('menu_items')
    .dropTable('categories')
};

exports.up = function(knex, Promise) {
  return createTables(knex, Promise).then(function(){
    return setupForeignKeys(knex, Promise);
  });
};

exports.down = function(knex, Promise) {
  return dropForeignKeys(knex, Promise).then(function(){
    return dropTables(knex, Promise);
  });
};
