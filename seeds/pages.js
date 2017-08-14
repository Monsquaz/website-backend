import Util from '../graphql/Util';

// Doesn't have to be optimized at all. It's a seed.
let insertPage = async (knex, data) => {

  let category_id = null;

  if(data.category) {
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
  if(data.layout) {
    let views = await knex('views')
      .innerJoin('translations', 'views.name_translatable_id', 'translations.translatable_id')
      .where({
        'content': data.layout,
        'translations.lang': 'en'
      })
      .select('views.id');
    if(views.length == 0) {
      throw new Error(`Could not find category ${data.layout}`);
    }
    layout_view_id = views[0].id;
  }

  let type_view_id = null;
  if(data.type) {
    let views = await knex('views')
      .innerJoin('translations', 'views.name_translatable_id', 'translations.translatable_id')
      .where({
        'content': data.type,
        'translations.lang': 'en'
      })
      .select('views.id');
    if(views.length == 0) {
      throw new Error(`Could not find category ${data.type}`);
    }
    type_view_id = views[0].id;
  }

  let administrables = await knex('administrables')
    .innerJoin('translations', 'administrables.name_translatable_id', 'translations.translatable_id')
    .where({
      'content': 'Pages',
      'translations.lang': 'en'
    })
    .select('administrables.id');

  let administrable_id = administrables[0].id;

  let insertData = {
    category_id,
    slug_translatable_id:  await Util.createTranslatable(data.slug, knex),
    title_translatable_id: await Util.createTranslatable(data.title, knex),
    comments: !!data.comments,
    layout_view_id,
    type_view_id,
    content_translatable: await Util.createTranslatable(data.content, knex),
    administrable_id
  };

  return await knex(pages).insert(insertData);

}

let insertPages = async (knex, datas) => {
  return await Promise.all(datas.map(e => insertPage(knex, e)));
}

exports.seed = async function(knex, Promise) {

  return await insertPages(knex, [
    // START PAGE
    {
      category: 'Main',
      slug: '',
      title: [
        {
          lang: 'en',
          content: 'Start'
        }
      ],
      comments: false,
      layout: 'Overview',
      type: 'Page',
      content: [
        {
          lang: 'en',
          content: 'Start'
        }
      ]
    },
    // ABOUT PAGE: layout: article
    // IRC PAGE
    // Login
    // Register
    // Profile show
    // Edit profile
    // Admin dashboard
    // Create page
    // Update page
    // Manage administrables
    // ...
  ]);

};

/*
actions
categories
categories_categories
menu_items
menu_items_menu_items
menus
message_types
oauth_resources
pages
tags
translatables
usergroups
users
view_types
views
*/
