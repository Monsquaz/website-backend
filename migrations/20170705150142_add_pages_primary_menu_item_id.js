
exports.up = function(knex, Promise) {
  return knex.schema
    .table('pages', function(table){
      table.integer('primary_menu_item_id').unsigned();
    }).then(() => {
      return knex.schema
        .table('pages', function(table){
          table.foreign('primary_menu_item_id').references('menu_items.id');
        });
    });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .table('pages', function(table){
      table.dropForeign('primary_menu_item_id');
    }).then(() => {
      return knex.schema
        .table('pages', function(table){
          table.dropColumn('primary_menu_item_id');
        })
    });
};
