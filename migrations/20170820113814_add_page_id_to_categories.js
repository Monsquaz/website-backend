exports.up = async (knex, Promise) => {
  await knex.schema.table('categories', (table) => { table.integer('page_id').unsigned(); });
  await knex.schema.table('categories', (table) => { table.foreign('page_id').references('pages.id'); });
  return;
};

exports.down = async (knex, Promise) => {
  await knex.schema.table('categories', (table) => { table.dropForeign('page_id'); });
  await knex.schema.table('categories', (table) => { table.dropColumn('page_id'); });
  return;
};
