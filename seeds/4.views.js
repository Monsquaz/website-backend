import Util from '../graphql/Util';

// Doesn't have to be optimized at all. It's a seed.
let insertView = async (knex, data) => {

  let ret = null;

  let parentAdministrableId = await Util.getAdministrableByNameChain(['Root', 'Public', 'Views'], knex);

  let administrable_id = await Util.createAdministrable({
    parentAdministrableId,
    nameTranslations: data.name
  }, knex);

  let view_types = await knex('view_types')
    .innerJoin('administrables', 'view_types.administrable_id', 'administrables.id')
    .innerJoin('translations', 'administrables.name_translatable_id', 'translations.translatable_id')
    .where({
      'translations.content': data.viewType,
      'translations.lang': 'en'
    })
    .select('view_types.id');
  if(view_types.length == 0) {
    throw new Error(`Could not find view type ${data.viewType}`);
  }
  let view_type_id = view_types[0].id;

  let insertData = {
    data: JSON.stringify(data.data),
    name_translatable_id: await Util.createTranslatable(data.name, knex),
    view_type_id,
    administrable_id
  };

  ret = await knex('views').insert(insertData);

  return ret;

}

let insertViews = async (datas, knex) => {
  return await Promise.all(datas.map(e => insertView(knex, e)));
}

exports.seed = async function(knex, Promise) {
  return await insertViews([
    /* Layouts */
    {
      name: [{lang: 'en', content: 'Start'}],
      data: {},
      viewType: 'Overview',
    },
    {
      name: [{lang: 'en', content: 'Main'}],
      data: {},
      viewType: 'Overview',
    },
    {
      name: [{lang: 'en', content: 'SingleUserAction'}],
      data: {},
      viewType: 'Overview',
    },
    {
      name: [{lang: 'en', content: 'AdminMain'}],
      data: {},
      viewType: 'Admin',
    },
    /* Types*/
    {
      name: [{lang: 'en', content: 'ArticleMain'}],
      data: {},
      viewType: 'Article',
    },
    {
      name: [{lang: 'en', content: 'LoginMain'}],
      data: {},
      viewType: 'UserLogin',
    },
    {
      name: [{lang: 'en', content: 'RegisterMain'}],
      data: {},
      viewType: 'UserRegistration',
    },
    {
      name: [{lang: 'en', content: 'UserProfileMain'}],
      data: {},
      viewType: 'UserProfile',
    }
  ], knex);
};
