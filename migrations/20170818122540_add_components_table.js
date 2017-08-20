
exports.up = async function(knex, Promise) {
  await knex.schema.createTable('components', function(table) {
    table.increments();
    table.string('name').notNullable();
    table.integer('title_translatable_id').unsigned().notNullable();
    table.integer('description_translatable_id').unsigned().notNullable();
    table.string('schema').notNullable();
    table.string('schemaForm').notNullable();
    table.integer('administrable_id').unsigned().notNullable();
  });
  return knex.schema.table('components', (table) => {
    table.foreign('administrable_id').references('administrables.id');
    table.foreign('title_translatable_id').references('translatables.id');
    table.foreign('description_translatable_id').references('translatables.id');
  });
};

exports.down = async function(knex, Promise) {
  await knex.schema.table('components', (table) => {
    table.dropForeign('description_translatable_id');
    table.dropForeign('title_translatable_id');
    table.dropForeign('administrable_id');
  })
  return knex.schema.dropTable('components');
};
