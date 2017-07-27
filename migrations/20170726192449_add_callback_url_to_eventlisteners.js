
exports.up = async (knex, Promise) => {
  await knex.schema.table('eventlisteners', (table) => {
    table.string('callback_url');
  });
  return;
};

exports.down = async (knex, Promise) => {
  await knex.schema.table('oauth_resources', (table) => {
    table.dropColumn('callback_url');
  });
  return;
};
