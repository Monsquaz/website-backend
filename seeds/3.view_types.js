import Util from '../graphql/Util';

// Doesn't have to be optimized at all. It's a seed.
let insertViewType = async (knex, data) => {

  let ret = null;

  let parentAdministrableId = await Util.getAdministrableByNameChain(['Root', 'Public', 'View types'], knex);

  let administrable_id = await Util.createAdministrable({
    parentAdministrableId,
    nameTranslations: data.name
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
      component: 'overview-layout',
    },
    {
      /* TODO: ?. Somehow make it possible to specify full-width jumbotrons via shortcode in content */
      name: [{lang: 'en', content: 'Showcase'}],
      schema: {},
      schemaForm: [],
      component: 'showcase-layout',
    },
    {
      name: [{lang: 'en', content: 'Documentation'}],
      schema: {},
      schemaForm: [],
      component: 'documentation-layout',
    },
    {
      name: [{lang: 'en', content: 'Forum'}],
      schema: {},
      schemaForm: [],
      component: 'forum-layout',
    },
    {
      name: [{lang: 'en', content: 'Blog'}],
      schema: {},
      schemaForm: [],
      component: 'blog-layout',
    },
    {
      name: [{lang: 'en', content: 'Admin'}],
      schema: {},
      schemaForm: [],
      component: 'admin-layout',
    },
    /* Types */
    {
      name: [{lang: 'en', content: 'Article'}],
      schema: {},
      schemaForm: [],
      component: 'article-type',
    },
    {
      name: [{lang: 'en', content: 'Category'}],
      schema: {},
      schemaForm: [],
      component: 'category-type',
    },
    {
      name: [{lang: 'en', content: 'Video'}],
      schema: {},
      schemaForm: [],
      component: 'video-type',
    },
    {
      name: [{lang: 'en', content: 'Music'}],
      schema: {},
      schemaForm: [],
      component: 'music-type',
    },
    {
      name: [{lang: 'en', content: 'FileList'}],
      schema: {},
      schemaForm: [],
      component: 'file-list-type',
    },
    {
      name: [{lang: 'en', content: 'File'}],
      schema: {},
      schemaForm: [],
      component: 'file-type',
    },
    {
      name: [{lang: 'en', content: 'User'}],
      schema: {},
      schemaForm: [],
      component: 'user-type',
    },
    {
      name: [{lang: 'en', content: 'Editor'}],
      schema: {},
      schemaForm: [],
      component: 'editor-type',
    },
    {
      name: [{lang: 'en', content: 'UserRegistration'}],
      schema: {},
      schemaForm: [],
      component: 'user-registration',
    },
    {
      name: [{lang: 'en', content: 'UserLogin'}],
      schema: {},
      schemaForm: [],
      component: 'user-login',
    },
    {
      name: [{lang: 'en', content: 'UserProfile'}],
      schema: {},
      schemaForm: [],
      component: 'user-profile',
    }
  ], knex);
};
