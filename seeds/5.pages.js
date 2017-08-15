import Util from '../graphql/Util';

// Doesn't have to be optimized at all. It's a seed.
let insertPage = async (knex, data) => {

  let ret = null;

  let category_id = null;

  if('category' in data) {
    let categories = await knex('categories')
      .innerJoin('translations', 'categories.title_translatable_id', 'translations.translatable_id')
      .where({
        'content': data.category,
        'translations.lang': 'en'
      })
      .select('categories.id');
    if(categories.length == 0) {
      throw new Error(`Could not find category ${data.category}`);
    }
    category_id = categories[0].id;
  }

  let layout_view_id = null;
  if('layout' in data) {
    let views = await knex('views')
      .innerJoin('translations', 'views.name_translatable_id', 'translations.translatable_id')
      .where({
        'content': data.layout,
        'translations.lang': 'en'
      })
      .select('views.id');
    if(views.length == 0) {
      throw new Error(`Could not find layout view ${data.layout}`);
    }
    layout_view_id = views[0].id;
  }

  let type_view_id = null;
  if('type' in data) {
    let views = await knex('views')
      .innerJoin('translations', 'views.name_translatable_id', 'translations.translatable_id')
      .where({
        'content': data.type,
        'translations.lang': 'en'
      })
      .select('views.id');
    if(views.length == 0) {
      throw new Error(`Could not find type view ${data.type}`);
    }
    type_view_id = views[0].id;
  }

  let parentAdministrableId = await Util.getAdministrableByNameChain(['Root', 'Public', 'Pages'], knex);

  let administrable_id = await Util.createAdministrable({
    parentAdministrableId,
    nameTranslations: data.title
  }, knex);

  if(!('slug' in data)) {
    data.slug = data.title.map((e) => {
      return {...e, content: Util.slugify(e.content)};
    });
  }

  let insertData = {
    category_id,
    slug_translatable_id:  await Util.createTranslatable(data.slug, knex),
    title_translatable_id: await Util.createTranslatable(data.title, knex),
    comments: !!data.comments,
    layout_view_id,
    type_view_id,
    content_translatable_id: await Util.createTranslatable(data.content, knex),
    administrable_id
  };

  ret = await knex('pages').insert(insertData);

  return ret;

}

let insertPages = async (knex, datas) => {
  return await Promise.all(datas.map(e => insertPage(knex, e)));
}

exports.seed = async function(knex, Promise) {
  return await insertPages(knex, [
    {
      category: 'Main',
      title: [{lang: 'en', content: 'Start'}],
      comments: false,
      layout: 'Start',
      type: 'Page',
      content: [{lang: 'en', content: 'Start'}]
    }
  ]);

};
