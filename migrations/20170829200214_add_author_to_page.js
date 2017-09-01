exports.up = async (knex, Promise) => {
  await knex.schema.table('pages', (table) => { table.integer('user_id').unsigned(); });
  await knex.schema.table('pages', (table) => { table.foreign('user_id').references('users.id'); });
  return;
};

exports.down = async (knex, Promise) => {
  await knex.schema.table('pages', (table) => { table.dropForeign('user_id'); });
  await knex.schema.table('pages', (table) => { table.dropColumn('user_id'); });
  return;
};
