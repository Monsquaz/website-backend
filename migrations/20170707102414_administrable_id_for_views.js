
exports.up = function(knex, Promise) {
  return knex.schema.table('views', (table) => {
    table.integer('administrable_id').unsigned();
  }).then(() => {
    return knex.schema.table('views', (table) => {
      table.foreign('administrable_id').references('administrables.id');
    })
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('views', (table) => {
    table.dropForeign('administrable_id');
  }).then(() => {
    return knex.schema.table('views', (table) => {
      table.dropColumn('administrable_id');
    });
  });
};
