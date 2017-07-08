
exports.up = function(knex, Promise) {
  return knex.schema.table('menu_items_menu_items', (table) => {
    table.integer('menu_id').unsigned().nullable();
  }).then(() => {
    return knex.schema.table('menu_items_menu_items', (table) => {
      table.foreign('menu_id').references('menus.id').onUpdate('cascade').onDelete('cascade');
    })
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('menu_items_menu_items', (table) => {
    table.dropForeign('menu_id');
  }).then(() => {
    return knex.schema.table('menu_items_menu_items', (table) => {
      table.dropColumn('menu_id');
    })
  });
};
