import Util from '../graphql/Util';
import db from '../db';

let knex = db.knex;

let createMenuItem = async (parentMenuItemId, data) => {
  let insertData = {
    index: data.index,
    page_id: data.page_id,
    menu_id: data.menu_id,
    title_translatable_id: await Util.createTranslatable(
      Util.inAllLanguages(data.title),
       knex
     )
  };

  let res = await knex('menu_items').insert(insertData);
  let menuItemId = res[0];

  if(parentMenuItemId) {
    await knex.raw(`
      INSERT INTO menu_items_menu_items (menu_id, depth, ancestor, descendant)
        SELECT ?, depth+1, ancestor, ? FROM menu_items_menu_items
        WHERE descendant = ?
        UNION ALL SELECT ?, 0, ?, ?
    `, [
      data.menu_id,
      menuItemId,
      parentMenuItemId,
      data.menu_id,
      menuItemId,
      menuItemId
    ]);
  } else {
    await knex.raw(`
      INSERT INTO menu_items_menu_items (menu_id, depth, ancestor, descendant)
      VALUES (?, 0, ?, ?)
    `, [data.menu_id, menuItemId, menuItemId]);
  }

  await createMenuItems(data.menu_id, menuItemId, data.items);

}

let getPageIdFromSlug = async (slug) => {
  let pages = await knex('pages')
    .innerJoin('translations', 'pages.slug_translatable_id', 'translations.translatable_id')
    .where({
      'translations.content': slug,
      'translations.lang':    'en'
    })
    .select('pages.id');
  if(pages.length == 0) {
    throw new Error(`Could not find page with slug ${slug}`);
  }

  return pages[0].id;
};

let createMenuItems = async (menuId, parentMenuItemId, items) => {
  let i = 0;
  for(let item of items) {
    let data = {
      index: i++,
      page_id: await getPageIdFromSlug(item.page),
      menu_id: menuId,
      title: item.title,
      items: item.items
    };
    await createMenuItem(parentMenuItemId, data);
  }
};

let createMenu = async (data) => {

  let administrable_id = await Util.createAdministrable({
    parentAdministrableId: data.parentAdministrableId,
    nameTranslations: Util.inAllLanguages(data.name)
  }, knex);

  let name_translatable_id = await Util.createTranslatable(
    Util.inAllLanguages(data.name),
    knex
  );

  let insertData = {
    administrable_id,
    name_translatable_id
  };

  let res = await knex('menus').insert(insertData);

  let menuId = res[0];

  await createMenuItems(menuId, null, data.items);
};

exports.seed = async function(knex, Promise) {
  let menuId = await Util.getAdministrableByNameChain(['Root', 'Public', 'Menus'], knex);
  await createMenu({
    'parentAdministrableId': menuId,
    'name': 'PublicTopMain',
    'items': [
      {
        'title': 'About',
        'page': 'about', 
        'items': [
          {
            'title': 'FAQ',
            'page': 'faq',
            'items': []
          },
          {
            'title': 'Community',
            'page': 'community',
            'items': []
          }
        ]
      }
    ]
  });
};
