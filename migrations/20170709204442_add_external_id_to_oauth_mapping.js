
exports.up = function(knex, Promise) {
  return knex.schema.table('oauth_resources_users', (table) => {
    table.string('external_id');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('oauth_resources_users', (table) => {
    table.dropColumn('external_id');
  });
};
