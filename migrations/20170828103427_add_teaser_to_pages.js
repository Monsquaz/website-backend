
exports.up = async function(knex, Promise) {
  await knex.schema.table('pages', (table) => { table.integer('teaser_translatable_id').unsigned();       });
  await knex.schema.table('pages', (table) => { table.foreign('teaser_translatable_id').references('translatables.id'); });
  return;
};

exports.down = async function(knex, Promise) {
  await knex.schema.table('pages', (table) => { table.dropForeign('teaser_translatable_id'); });
  await knex.schema.table('pages', (table) => { table.dropColumn('teaser_translatable_id');  });
  return;
};
