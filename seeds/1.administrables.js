import Util from '../graphql/Util';

let insertAdministrables = async (datas, knex) => {
  return await Promise.all(datas.map(e => Util.createAdministrable(e, knex)));
}

exports.seed = async function(knex, Promise) {
    await insertAdministrables([
      {parentAdministrableId: null, nameTranslations: [{lang: 'en', content: 'Pages'}]},
      {parentAdministrableId: null, nameTranslations: [{lang: 'en', content: 'Categories'}]},
      {parentAdministrableId: null, nameTranslations: [{lang: 'en', content: 'Users'}]},
      {parentAdministrableId: null, nameTranslations: [{lang: 'en', content: 'Usergroups'}]},
      {parentAdministrableId: null, nameTranslations: [{lang: 'en', content: 'View types'}]},
      {parentAdministrableId: null, nameTranslations: [{lang: 'en', content: 'Views'}]},
      {parentAdministrableId: null, nameTranslations: [{lang: 'en', content: 'Eventlisteners'}]},
      {parentAdministrableId: null, nameTranslations: [{lang: 'en', content: 'Menus'}]},
      {parentAdministrableId: null, nameTranslations: [{lang: 'en', content: 'Message types'}]},
      {parentAdministrableId: null, nameTranslations: [{lang: 'en', content: 'Messages'}]},
      {parentAdministrableId: null, nameTranslations: [{lang: 'en', content: 'Tags'}]},
    ], knex);
};
