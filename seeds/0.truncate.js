import Util from '../graphql/Util';

exports.seed = async function(knex, Promise) {
  let tableNames = [
    'actions',
    'pages_tags',
    'pages',
    'categories_categories',
    'categories',
    'views',
    'view_types',
    'administrables',
    'administrables_administrables',
    'administrables_meta_datas',
    'assets',
    'eventlisteners',
    'logins',
    'memberships',
    'menu_items',
    'menu_items_menu_items',
    'menus',
    'message_types',
    'messages',
    'oauth_resources',
    'oauth_resources_users',
    'translations',
    'translatables',
    'usergroups',
    'usergroups_actions_administrables',
    'users',
    'users_actions_administrables',
    'users_usergroups'
  ];

  await knex.raw('SET foreign_key_checks = 0;');
  for(let tableName of tableNames) {
    await knex(tableName).delete();
    await knex.raw(`ALTER TABLE ${tableName} AUTO_INCREMENT = 1`);
  }
  return knex.raw('SET foreign_key_checks = 1;');

};
