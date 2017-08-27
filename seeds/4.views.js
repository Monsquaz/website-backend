import Util from '../graphql/Util';

// Doesn't have to be optimized at all. It's a seed.
let insertView = async (knex, data) => {

  let ret = null;

  let parentAdministrableId = await Util.getAdministrableByNameChain(['Root', 'Public', 'Views'], knex);

  let administrable_id = await Util.createAdministrable({
    parentAdministrableId,
    nameTranslations: data.name
  }, knex);

  let view_types = await knex('view_types')
    .innerJoin('administrables', 'view_types.administrable_id', 'administrables.id')
    .innerJoin('translations', 'administrables.name_translatable_id', 'translations.translatable_id')
    .where({
      'translations.content': data.viewType,
      'translations.lang': 'en'
    })
    .select('view_types.id');
  if(view_types.length == 0) {
    throw new Error(`Could not find view type ${data.viewType}`);
  }
  let view_type_id = view_types[0].id;

  let insertData = {
    data: JSON.stringify(data.data),
    name_translatable_id: await Util.createTranslatable(data.name, knex),
    view_type_id,
    administrable_id
  };

  ret = await knex('views').insert(insertData);

  return ret;

}

let insertViews = async (datas, knex) => {
  return await Promise.all(datas.map(e => insertView(knex, e)));
}

exports.seed = async function(knex, Promise) {
  return await insertViews([
    /* Layouts */
    {
      name: [{lang: 'en', content: 'Start'}],
      data: {
        horizontalMenu: {
          id: 1 // TODO: Set this later.
        },
        leftComponents: [
          {
            type: 'vertical-menu',
            data: { id: 1 }
          },
          {
            type: 'newsletter-subscribe',
            data: {}
          }
        ],
        centerComponents: [
          {
            type: 'blurbs',
            data: {
              blurbs: [
                {
                  'en': {
                    icon: 'eye',
                    title: 'The animation',
                    content: 'In case you came for the animation that started it all.',
                    pageId: 3
                  }
                },
                {
                  'en': {
                    icon: 'heart-o',
                    title: 'Great community',
                    content: `We're seriously nice people. Get to know us.`,
                    pageId: 3
                  }
                },
                {
                  'en': {
                    icon: 'music',
                    title: 'Musical masterpieces',
                    content: `We've produced marvelous pieces throughout the years.`,
                    pageId: 3
                  }
                },
                {
                  'en': {
                    icon: 'spinner',
                    title: 'Projects',
                    content: `Find out all that's going on.`,
                    pageId: 3
                  }
                }
              ]
            }
          }
        ],
        rightComponents: [
          {
            type: 'irc-stream',
            data: {}
          },
          {
            type: 'forum-activity',
            data: {}
          }
        ]
      },
      viewType: 'Overview',
    },
    {
      name: [{lang: 'en', content: 'Main'}],
      data: {
        horizontalMenu: {
          id: 1 // TODO: Set this later.
        },
        leftComponents: [],
        centerComponents: [
          {
            type: 'blurbs',
            data: {
              blurbs: [

              ]
            }
          }
        ],
        rightComponents: []
      },
      viewType: 'Overview',
    },
    {
      name: [{lang: 'en', content: 'SingleUserAction'}],
      data: {
        horizontalMenu: {
          id: 1 // TODO: Set this later.
        },
        leftComponents: [],
        centerComponents: [],
        rightComponents: []
      },
      viewType: 'Overview',
    },
    {
      name: [{lang: 'en', content: 'AdminLayoutMain'}],
      data: {
        horizontalMenu: {
          id: 1 // TODO: Set this later.
        },
        leftComponents: [],
        centerComponents: [],
        rightComponents: []
      },
      viewType: 'AdminLayout',
    },
    /* Types*/
    {
      name: [{lang: 'en', content: 'ArticleMain'}],
      data: {},
      viewType: 'Article',
    },
    {
      name: [{lang: 'en', content: 'LoginMain'}],
      data: {},
      viewType: 'UserLogin',
    },
    {
      name: [{lang: 'en', content: 'RegisterMain'}],
      data: {},
      viewType: 'UserRegistration',
    },
    {
      name: [{lang: 'en', content: 'UserProfileMain'}],
      data: {},
      viewType: 'UserProfile',
    },
    {
      name: [{lang: 'en', content: 'AdminTypeMain'}],
      data: {},
      viewType: 'AdminType',
    },
    {
      name: [{lang: 'en', content: 'FAQMain'}],
      data: {
        questions: [
          {
            q: "Are you anus?",
            a: "Yes, and I need more Monsquaz!"
          },
          {
            q: "Are you anus?",
            a: "Yes, and I need more Monsquaz!"
          },
          {
            q: "Are you anus?",
            a: "Yes, and I need more Monsquaz!"
          },
          {
            q: "Are you anus?",
            a: "Yes, and I need more Monsquaz!"
          },
          {
            q: "Are you anus?",
            a: "Yes, and I need more Monsquaz!"
          },
          {
            q: "Are you anus?",
            a: "Yes, and I need more Monsquaz!"
          }
        ]
      },
      viewType: 'FAQ',
    }
  ], knex);
};
