import Util from '../graphql/Util';
import db from '../db';

let knex = db.knex;


let getActionIdByName = async (name) => {
  let res = await knex('actions').where({name}).select('id');
  return res[0].id;
};

let getAdministrableIdByName = async (name) => {
  let res = await knex('administrables')
    .innerJoin('translations', 'administrables.name_translatable_id', 'translations.translatable_id')
    .where({
      'translations.content': name,
      'translations.lang': 'en'
    })
    .select('administrables.id');
  return res[0].id;
};

let addDefaultPermission = async (actionName, administrableName) => {
  await knex('users_actions_administrables').insert({
    user_id: 1,
    action_id: await getActionIdByName(actionName),
    administrable_id: await getAdministrableIdByName(administrableName)
  });
};

exports.seed = async function(knex, Promise) {
  /*
    TODO: Do not allow reading everything!
    There will be public pages as well as admin pages and pages that are locked
    for other reasons. Making a page visible for everyone will sometimes be done
    through setting its parent administrable to something visible, or by specifically
    assigning the guest user to see it. We will have to really think the structure through
  */
  await addDefaultPermission('read', 'Pages');
  await addDefaultPermission('read', 'Categories');
  await addDefaultPermission('read', 'Users');
  await addDefaultPermission('read', 'Usergroups');
  await addDefaultPermission('read', 'View types');
  await addDefaultPermission('read', 'Views');
  await addDefaultPermission('read', 'Eventlisteners');
  await addDefaultPermission('read', 'Menus');
  await addDefaultPermission('read', 'Message types');
  await addDefaultPermission('read', 'Messages');
  return await addDefaultPermission('read', 'Tags');
};
