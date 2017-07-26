
exports.up = async (knex, Promise) => {
  await knex.schema.table('oauth_resources', (table) => {
    table.string('client_id');
    table.string('client_secret');
    table.string('callback_url');
  });
  return;
};

exports.down = async (knex, Promise) => {
  await knex.schema.table('oauth_resources', (table) => {
    table.dropColumn('callback_url');
    table.dropColumn('client_secret');
    table.dropColumn('client_id');
  });
  return;
};
