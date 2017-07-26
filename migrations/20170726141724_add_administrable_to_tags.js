
exports.up = async (knex, Promise) => {
  await knex.schema.table('tags', (table) => { table.integer('administrable_id').unsigned(); });
  await knex.schema.table('tags', (table) => { table.foreign('administrable_id').references('administrables.id'); });
  return;
};

exports.down = async (knex, Promise) => {
  await knex.schema.table('tags', (table) => { table.dropForeign('administrable_id'); });
  await knex.schema.table('tags', (table) => { table.dropColumn('administrable_id'); });
  return;
};
