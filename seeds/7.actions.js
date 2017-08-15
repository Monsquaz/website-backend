import Util from '../graphql/Util';

exports.seed = async function(knex, Promise) {
  await knex('actions').insert([
    'read',
    'edit',
    'use',
    'assignAction',
    'delete',
    'move',
    'createCategory',
    'createPage',
    'createView',
    'createViewType',
    'createUser',
    'createUsergroup',
    'createEventlistener',
    'createMenu',
    'createMessage',
    'createMessageType'
  ].map((e) => ({ name: e })));
};
