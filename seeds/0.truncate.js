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

  knex.transaction(async function(trx) {
    await knex.raw('SET FOREIGN_KEY_CHECKS=0').transacting(trx);
    for(let tableName of tableNames) {
      await knex(tableName).delete().transacting(trx);
    }
    await knex.raw('SET FOREIGN_KEY_CHECKS=1').transacting(trx);
    await trx.commit();
  });

  for(let tableName of tableNames) {
    await knex.raw(`ALTER TABLE ${tableName} AUTO_INCREMENT =1`);
  }
  return Promise.all([]);

};
