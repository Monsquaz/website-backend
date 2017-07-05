
exports.up = function(knex, Promise) {
  return knex.schema
    .createTable('layouts', (table) => {
      table.increments();
      table.integer('title_translatable_id').unsigned().notNullable();
      table.string('view', 50);
    }).then(() => {
      return knex.schema
        .table('layouts', (table) => {
          table.foreign('title_translatable_id').references('translatables.id');
        })
    }).then(() => {
      return knex.schema
        .table('pages', (table) => {
          table.integer('layout_id').unsigned().notNullable();
        })
    }).then(() => {
      return knex.schema
        .table('pages', (table) => {
          table.foreign('layout_id').references('layouts.id');
        })
    });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .table('pages', (table) => {
      table.dropForeign('layout_id');
    }).then(() => {
      return knex.schema
        .table('pages', (table) => {
          table.dropColumn('layout_id');
        })
    }).then(() => {
      return knex.schema
        .table('layouts', (table) => {
          table.dropForeign('title_translatable_id');
        });
    }).then(() => {
      return knex.schema
        .dropTable('layouts');
    });
};
