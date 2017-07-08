
exports.up = function(knex, Promise) {
  return knex.schema.table('administrables_administrables', (table) => {
    table.renameColumn('length', 'depth');
  })
  .then(() => {
    return knex.schema.table('categories_categories', (table) => {
      table.renameColumn('length', 'depth');
    })
  })
  .then(() => {
    return knex.schema.table('menu_items_menu_items', (table) => {
      table.renameColumn('length', 'depth');
    })
  })
  .then(() => {
    return knex.schema.table('messages_messages', (table) => {
      table.renameColumn('length', 'depth');
    })
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('administrables_administrables', (table) => {
    table.renameColumn('depth', 'length');
  })
  .then(() => {
    return knex.schema.table('categories_categories', (table) => {
      table.renameColumn('depth', 'length');
    })
  })
  .then(() => {
    return knex.schema.table('menu_items_menu_items', (table) => {
      table.renameColumn('depth', 'length');
    })
  })
  .then(() => {
    return knex.schema.table('messages_messages', (table) => {
      table.renameColumn('depth', 'length');
    })
  });
};
