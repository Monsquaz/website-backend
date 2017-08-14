import Util from '../graphql/Util';

// Doesn't have to be optimized at all. It's a seed.
let insertCategory = async (knex, data) => {

  let ret = null;

  await knex.transaction(async (t) => {

    if(!('title' in data)) {
      throw new Error(`Title must be set`);
    }

    if(!('slug' in data)) {
      data.slug = data.title.map((e) => {
        return {...e, content: Util.slugify(e.content)};
      });
    }

    let administrables = await t('administrables')
      .innerJoin('translations', 'administrables.name_translatable_id', 'translations.translatable_id')
      .where({
        'content': 'Categories',
        'translations.lang': 'en'
      })
      .select('administrables.id');

      if(administrables.length == 0) {
        throw new Error(`Could not find Categories administrable!`);
      }

    let parentAdministrableId = administrables[0].id;

    let administrable_id = await Util.createAdministrable({
      parentAdministrableId,
      nameTranslations: data.title
    }, t);

    let insertData = {
      title_translatable_id: await Util.createTranslatable(data.title, t),
      slug_translatable_id:  await Util.createTranslatable(data.slug, t),
      administrable_id
    };

    ret = await t('categories').insert(insertData);

  });

  return ret;

}

let insertCategories = async (datas, knex) => {
  return await knex.transaction(async (t) => {
    await Promise.all(datas.map(e => insertCategory(t, e)));
  });
}

exports.seed = async function(knex, Promise) {
  return await knex.transaction(async (t) => {
    return await insertCategories([
      // Main
      {
        title: [
          {lang: 'en', content: 'Main'}
        ],
        slug: [
          {lang: 'en', content: 'main'}
        ],
      },
      // Admin
      {
        title: [
          {lang: 'en', content: 'Administration'}
        ],
        slug: [
          {lang: 'en', content: 'admin'}
        ],
      }
    ], t);
  });
};
