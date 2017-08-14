import Util from '../graphql/Util';

// Doesn't have to be optimized at all. It's a seed.
let insertViewType = async (knex, data) => {

  let ret = null;

  await knex.transaction(async (t) => {

    let administrables = await t('administrables')
      .innerJoin('translations', 'administrables.name_translatable_id', 'translations.translatable_id')
      .where({
        'content': 'View types',
        'translations.lang': 'en'
      })
      .select('administrables.id');

    if(administrables.length == 0) {
      throw new Error(`Could not find View types administrable!`);
    }

    let parentAdministrableId = administrables[0].id;

    let administrable_id = await Util.createAdministrable({
      parentAdministrableId,
      nameTranslations: Util.inAllLanguages(data.component)
    }, t);

    let insertData = {
      schema:     JSON.stringify(data.schema),
      schemaForm: JSON.stringify(data.schemaForm),
      component:  data.component,
      administrable_id
    };

    ret = await t('view_types').insert(insertData);

  });

  return ret;

}

let insertViewTypes = async (datas, knex) => {
  return await knex.transaction(async (t) => {
    await Promise.all(datas.map(e => insertViewType(t, e)));
  });
}

exports.seed = async function(knex, Promise) {
  return await insertViewTypes([
    {
      name: [{lang: 'en', content: 'Overview'}],
      schema: {},
      schemaForm: [],
      component: 'Overview',
    },
    {
      name: [{lang: 'en', content: 'Admin'}],
      schema: {},
      schemaForm: [],
      component: 'Admin',
    }
  ], knex);
};
