import Util from '../graphql/Util';

// Doesn't have to be optimized at all. It's a seed.
let insertView = async (knex, data) => {

  let ret = null;

  await knex.transaction(async (t) => {

    let administrables = await t('administrables')
      .innerJoin('translations', 'administrables.name_translatable_id', 'translations.translatable_id')
      .where({
        'content': 'Views',
        'translations.lang': 'en'
      })
      .select('administrables.id');

    if(administrables.length == 0) {
      throw new Error(`Could not find Views administrable!`);
    }

    let parentAdministrableId = administrables[0].id;

    let administrable_id = await Util.createAdministrable({
      parentAdministrableId,
      nameTranslations: data.title
    }, t);

    let view_types = await t('view_types')
      .innerJoin('translations', 'view_types.name_translatable_id', 'translations.translatable_id')
      .where({
        'content': data.viewType,
        'translations.lang': 'en'
      })
      .select('view_types.id');
    if(view_types.length == 0) {
      throw new Error(`Could not find view type ${data.viewType}`);
    }
    view_type_id = view_types[0].id;

    console.warn('data.name', data.name);

    let insertData = {
      data: JSON.stringify(data.data),
      name_translatable_id: await Util.createTranslatable(data.name, t),
      view_type_id,
      administrable_id
    };

    ret = await t('views').insert(insertData);

  });

  return ret;

}

let insertViews = async (datas, knex) => {
  return await knex.transaction(async (t) => {
    await Promise.all(datas.map(e => insertView(t, e)));
  });
}

exports.seed = async function(knex, Promise) {
  return await insertViews([
    {
      name: [{lang: 'en', content: 'Start'}],
      data: {},
      viewType: 'Overview',
    },
    {
      name: [{lang: 'en', content: 'AdminStart'}],
      data: {},
      viewType: 'Admin',
    }
  ], knex);
};
