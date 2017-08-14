import Util from '../graphql/Util';

exports.seed = async function(knex, Promise) {
  await knex('actions').insert([
    'read', 'edit', 'use', 'assignAction', 'delete', 'move'
  ].map((e) => ({ name: e })));
};
