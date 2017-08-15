import Util from '../graphql/Util';

import db from '../db';

let knex = db.knex;

let createAdministrable = async (parentId, name) => {
  return await Util.createAdministrable({
    parentAdministrableId: parentId,
    nameTranslations: [{lang: 'en', content: name}]
  });
}

exports.seed = async function(knex, Promise) {
    let rootId      = await createAdministrable(null, 'Root');

    let publicId    = await createAdministrable(rootId, 'Public');
    let protectedId = await createAdministrable(rootId, 'Protected');
    let adminId     = await createAdministrable(rootId, 'Admin');

    let publicPagesId         = await createAdministrable(publicId, 'Pages');
    let publicCategoriesId    = await createAdministrable(publicId, 'Categories');
    let publicViewsId         = await createAdministrable(publicId, 'Views');
    let publicViewTypesId     = await createAdministrable(publicId, 'View types');
    let publicMenusId         = await createAdministrable(publicId, 'Menus');
    let publicTagsId          = await createAdministrable(publicId, 'Tags');
    let publicUsersId         = await createAdministrable(publicId, 'Users');
    let publicUsersgroupsId   = await createAdministrable(publicId, 'Usergroups');
    let publicMessageTypesId  = await createAdministrable(publicId, 'Message types');

    let protectedPagesId          = await createAdministrable(protectedId, 'Pages');
    let protectedCategoriesId     = await createAdministrable(protectedId, 'Categories');
    let protectedViewsId          = await createAdministrable(protectedId, 'Views');
    let protectedMenusId          = await createAdministrable(protectedId, 'Menus');
    let protectedTagsId           = await createAdministrable(protectedId, 'Tags');
    let protectedEventlistenersId = await createAdministrable(protectedId, 'Eventlisteners');
    let protectedMessagesId       = await createAdministrable(protectedId, 'Messages');

    let adminPagesId      = await createAdministrable(adminId, 'Pages');
    let adminCategoriesId = await createAdministrable(adminId, 'Categories');
    let adminViewsId      = await createAdministrable(adminId, 'Views');
    let adminMenusId      = await createAdministrable(adminId, 'Menus');
    let adminTagsId       = await createAdministrable(adminId, 'Tags');
};
