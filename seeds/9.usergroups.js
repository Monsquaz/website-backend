import Util from '../graphql/Util';
import db from '../db';

let knex = db.knex;

let getActionIdByName = async (name) => {
  let res = await knex('actions').where({name}).select('id');
  return res[0].id;
};

let getUsergroupIdByName = async (name) => {
  let res = await knex('usergroups').where({name}).select('id');
  return res[0].id;
};

let addPermission = async (usergroupName, actionName, administrableNameChain) => {
  await knex('usergroups_actions_administrables').insert({
    usergroup_id: await getUsergroupIdByName(usergroupName),
    action_id: await getActionIdByName(actionName),
    administrable_id: await Util.getAdministrableByNameChain(administrableNameChain, knex)
  });
};

exports.seed = async function(knex, Promise) {
  let usergroupId = await Util.getAdministrableByNameChain(['Root', 'Public', 'Usergroups'], knex);
  await knex('usergroups').insert(['Superadmin', 'Admin', 'Member'].map((e) => ({
    name: e, administrable_id: usergroupId
  })));
  let actionNames = await knex('actions').select('name');
  await Promise.all(actionNames.map((e) => {
    return addPermission('Superadmin', e.name, ['Root'])
  }))
  await Promise.all(['edit','createPage','move'].map((actionName) => {
    return addPermission('Admin', actionName, ['Root', 'Public', 'Pages'])
  }))
  await Promise.all(['edit','createPage','move'].map((actionName) => {
    return addPermission('Admin', actionName, ['Root', 'Protected', 'Pages'])
  }))
  await Promise.all(['edit','createCategory','move'].map((actionName) => {
    return addPermission('Admin', actionName, ['Root', 'Public', 'Categories'])
  }))
  await Promise.all(['edit','createCategory','move'].map((actionName) => {
    return addPermission('Admin', actionName, ['Root', 'Protected', 'Categories'])
  }))
  await Promise.all(['edit','createView','move'].map((actionName) => {
    return addPermission('Admin', actionName, ['Root', 'Public', 'Views'])
  }))
  await Promise.all(['edit','createView','move'].map((actionName) => {
    return addPermission('Admin', actionName, ['Root', 'Protected', 'Views'])
  }))
};
