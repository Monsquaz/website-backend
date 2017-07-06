
exports.up = function(knex, Promise) {
  return knex.schema.table('pages', (table) => {
    table.boolean('comments');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('pages', (table) => {
    table.dropColumn('comments');
  })
};
