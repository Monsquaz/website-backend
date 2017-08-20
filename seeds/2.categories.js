import Util from '../graphql/Util';

// Doesn't have to be optimized at all. It's a seed.
let insertCategory = async (knex, data) => {

  let categoryId = null;

  if(!('title' in data)) {
    throw new Error(`Title must be set`);
  }

  if(!('slug' in data)) {
    data.slug = data.title.map((e) => {
      return {...e, content: Util.slugify(e.content)};
    });
  }

  let parentAdministrableId = await Util.getAdministrableByNameChain(['Root', 'Public', 'Categories'], knex);

  let administrableId = await Util.createAdministrable({
    parentAdministrableId,
    nameTranslations: data.title
  }, knex);

  categoryId = await Util.createCategory({
    title: data.title,
    slug: data.slug,
    administrableId
  });

  return categoryId;
}

let insertCategories = async (datas, knex) => {
  return await Promise.all(datas.map(e => insertCategory(knex, e)));
}

exports.seed = async function(knex, Promise) {
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
  ], knex);
};
