import Util from '../graphql/Util';

// Doesn't have to be optimized at all. It's a seed.
let insertViewType = async (knex, data) => {

  let ret = null;

  let parentAdministrableId = await Util.getAdministrableByNameChain(['Root', 'Public', 'View types'], knex);

  let administrable_id = await Util.createAdministrable({
    parentAdministrableId,
    nameTranslations: Util.inAllLanguages(data.component)
  }, knex);

  let insertData = {
    schema:     JSON.stringify(data.schema),
    schemaForm: JSON.stringify(data.schemaForm),
    component:  data.component,
    administrable_id
  };

  ret = await knex('view_types').insert(insertData);

  return ret;

}

let insertViewTypes = async (datas, knex) => {
  return await Promise.all(datas.map(e => insertViewType(knex, e)));
}

exports.seed = async function(knex, Promise) {
  return await insertViewTypes([
    /* Layouts */
    {
      name: [{lang: 'en', content: 'Overview'}],
      /* TODO: 2-3 menyer. ev. bildspel, footer-info? */
      schema: {},
      schemaForm: [],
      component: 'Overview',
    },
    {
      /* TODO: ?. Somehow make it possible to specify full-width jumbotrons via shortcode in content */
      name: [{lang: 'en', content: 'Showcase'}],
      schema: {},
      schemaForm: [],
      component: 'Showcase',
    },
    {
      name: [{lang: 'en', content: 'Documentation'}],
      schema: {},
      schemaForm: [],
      component: 'Documentation',
    },
    {
      name: [{lang: 'en', content: 'Forum'}],
      schema: {},
      schemaForm: [],
      component: 'Forum',
    },
    {
      name: [{lang: 'en', content: 'Blog'}],
      schema: {},
      schemaForm: [],
      component: 'Blog',
    },
    {
      name: [{lang: 'en', content: 'Admin'}],
      schema: {},
      schemaForm: [],
      component: 'Admin',
    },
    /* Types */
    {
      name: [{lang: 'en', content: 'Article'}],
      schema: {},
      schemaForm: [],
      component: 'Article',
    },
    {
      name: [{lang: 'en', content: 'Category'}],
      schema: {},
      schemaForm: [],
      component: 'Category',
    },
    {
      name: [{lang: 'en', content: 'Video'}],
      schema: {},
      schemaForm: [],
      component: 'Video',
    },
    {
      name: [{lang: 'en', content: 'Music'}],
      schema: {},
      schemaForm: [],
      component: 'Music',
    },
    {
      name: [{lang: 'en', content: 'FileList'}],
      schema: {},
      schemaForm: [],
      component: 'FileList',
    },
    {
      name: [{lang: 'en', content: 'File'}],
      schema: {},
      schemaForm: [],
      component: 'File',
    },
    {
      name: [{lang: 'en', content: 'User'}],
      schema: {},
      schemaForm: [],
      component: 'User',
    },
    {
      name: [{lang: 'en', content: 'Editor'}],
      schema: {},
      schemaForm: [],
      component: 'Editor',
    }
  ], knex);
};
