
exports.up = async function(knex, Promise) {
  await knex.schema.createTable('page_images', function(table) {
    table.increments();
    table.integer('page_id').unsigned().notNullable();
    table.text('url').notNullable();
  })
  return knex.schema.table('page_images', (table) => {
    table.foreign('page_id').references('pages.id').onUpdate('cascade').onDelete('cascade');
  })
};

exports.down = async function(knex, Promise) {
  await knex.schema.table('page_images', (table) => {
    table.dropForeign('page_id');
  })
  return await knex.schema.dropTable('page_images');
};
