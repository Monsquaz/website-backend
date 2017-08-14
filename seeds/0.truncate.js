import Util from '../graphql/Util';

exports.seed = async function(knex, Promise) {
  await knex.raw('SET foreign_key_checks = 0;');
  await knex('actions').delete();
  await knex('categories_categories').delete();
  await knex('categories').delete();
  await knex('administrables').delete();
  await knex('administrables_administrables').delete();
  await knex('administrables_meta_datas').delete();
  await knex('assets').delete();


  await knex('eventlisteners').delete();
  await knex('logins').delete();
  await knex('memberships').delete();
  await knex('menu_items').delete();
  await knex('menu_items_menu_items').delete();
  await knex('menus').delete();
  await knex('message_types').delete();
  await knex('messages').delete();
  await knex('oauth_resources').delete();
  await knex('oauth_resources_users').delete();
  await knex('pages').delete();
  await knex('pages_tags').delete();
  await knex('translations').delete();
  await knex('translatables').delete();
  await knex('usergroups').delete();
  await knex('usergroups_actions_administrables').delete();
  await knex('users').delete();
  await knex('users_actions_administrables').delete();
  await knex('users_usergroups').delete();
  await knex('view_types').delete();
  await knex('views').delete();
  return knex.raw('SET foreign_key_checks = 1;');
};
