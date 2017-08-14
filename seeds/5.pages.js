import Util from '../graphql/Util';

// Doesn't have to be optimized at all. It's a seed.
let insertPage = async (knex, data) => {

  let ret = null;

  await knex.transaction(async (t) => {

    let category_id = null;

    if('category' in data) {
      let categories = await t('categories')
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
      let views = await t('views')
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
      let views = await t('views')
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

    let administrables = await t('administrables')
      .innerJoin('translations', 'administrables.name_translatable_id', 'translations.translatable_id')
      .where({
        'content': 'Pages',
        'translations.lang': 'en'
      })
      .select('administrables.id');

    if(administrables.length == 0) {
      throw new Error(`Could not find Pages administrable!`);
    }

    let parentAdministrableId = administrables[0].id;

    let administrable_id = await Util.createAdministrable({
      parentAdministrableId,
      nameTranslations: data.title
    }, t);

    if(!('slug' in data)) {
      data.slug = data.title.map((e) => {
        return {...e, content: Util.slugify(e.content)};
      });
    }

    let insertData = {
      category_id,
      slug_translatable_id:  await Util.createTranslatable(data.slug, t),
      title_translatable_id: await Util.createTranslatable(data.title, t),
      comments: !!data.comments,
      layout_view_id,
      type_view_id,
      content_translatable_id: await Util.createTranslatable(data.content, t),
      administrable_id
    };

    ret = await t('pages').insert(insertData);

  });

  return ret;

}

let insertPages = async (knex, datas) => {
  return await knex.transaction(async (t) => {
    await Promise.all(datas.map(e => insertPage(t, e)));
  });
}

exports.seed = async function(knex, Promise) {
  return await insertPages(knex, [
    // START PAGE
    {
      category: 'Main',
      title: [
        {
          lang: 'en',
          content: 'Start'
        }
      ],
      comments: false,
      layout: 'Start',
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
