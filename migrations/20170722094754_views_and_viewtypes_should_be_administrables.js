
exports.up = async (knex, Promise) => {
  await knex.schema.table('view_types', (table) => { table.integer('administrable_id').unsigned();                      });
  await knex.schema.table('view_types', (table) => { table.foreign('administrable_id').references('administrables.id'); });
  return;
};

exports.down = async (knex, Promise) => {
  await knex.schema.table('view_types', (table) => { table.dropForeign('administrable_id'); });
  await knex.schema.table('view_types', (table) => { table.dropColumn('administrable_id');  });
  return;
};
