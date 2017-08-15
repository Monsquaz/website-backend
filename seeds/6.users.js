import Util from '../graphql/Util';

// Doesn't have to be optimized at all. It's a seed.
let insertUser = async (knex, data) => {

  let ret = null;

  let parentAdministrableId = await Util.getAdministrableByNameChain(['Root', 'Public', 'Users'], knex);

  let administrable_id = await Util.createAdministrable({
    parentAdministrableId,
    nameTranslations: Util.inAllLanguages(data.name)
  }, knex);

  let insertData = {
    id: data.id,
    name: data.name,
    administrable_id,
    email: data.email,
    firstname: data.firstname,
    lastname: data.lastname,
    is_verified: data.is_verified,
    verification_code: data.verification_code
  };

  ret = await knex('users').insert(insertData);

  return ret;

}

let insertUsers = async (datas, knex) => {
  return await Promise.all(datas.map(e => insertUser(knex, e)));
}

exports.seed = async function(knex, Promise) {
  return await insertUsers([
    {
      id: 0,
      name: 'Guest',
      email: 'info@monsquaz.org',
      firstname: 'Guest',
      lastname: 'Guest',
      is_verified: true,
      verification_code: 'kuk'
    }
  ], knex);
};
