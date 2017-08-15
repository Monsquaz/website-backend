import Util from '../graphql/Util';
import db from '../db';

let knex = db.knex;

let getActionIdByName = async (name) => {
  let res = await knex('actions').where({name}).select('id');
  return res[0].id;
};

let addDefaultPermission = async (actionName, administrableNameChain) => {
  await knex('users_actions_administrables').insert({
    user_id: 1,
    action_id: await getActionIdByName(actionName),
    administrable_id: await Util.getAdministrableByNameChain(administrableNameChain, knex)
  });
};

exports.seed = async function(knex, Promise) {
  await addDefaultPermission('read', ['Root', 'Public', 'Pages']);
  await addDefaultPermission('read', ['Root', 'Public', 'Categories']);
  await addDefaultPermission('read', ['Root', 'Public', 'Users']);
  await addDefaultPermission('read', ['Root', 'Public', 'Usergroups']);
  await addDefaultPermission('read', ['Root', 'Public', 'View types']);
  await addDefaultPermission('read', ['Root', 'Public', 'Views']);
  await addDefaultPermission('read', ['Root', 'Public', 'Menus']);
  await addDefaultPermission('read', ['Root', 'Public', 'Message types']);
  await addDefaultPermission('read', ['Root', 'Public', 'Tags']);
};
