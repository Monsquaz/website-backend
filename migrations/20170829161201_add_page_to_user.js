
exports.up = async function(knex, Promise) {
  await knex.schema.table('pages', (table) => { table.integer('page_id').unsigned(); });
  await knex.schema.table('pages', (table) => { table.foreign('page_id').references('pages.id'); });
  return;
};

exports.down = async function(knex, Promise) {
  await knex.schema.table('pages', (table) => { table.dropForeign('page_id'); });
  await knex.schema.table('pages', (table) => { table.dropColumn('page_id');  });
  return;
};
