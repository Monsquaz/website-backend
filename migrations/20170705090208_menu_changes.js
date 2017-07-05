
exports.up = function(knex, Promise) {
  return knex.schema
    .table('menu_types', function(table){
      table.dropForeign('name_translatable_id');
    })
    .dropTable('menu_types')
    .table('menus', function(table) {
      table.dropColumn('menu_type');
      table.integer('name_translatable_id').unsigned();
    }).then(function(){
      return knex.schema.table('menus', function(table) {
        table.foreign('name_translatable_id').references('translatables.id');
      });
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('menus', function(table){
    table.dropForeign('name_translatable_id');
  }).then(function(){
    return knex.schema
      .table('menus', function(table){
        table.dropColumn('name_translatable_id');
        table.integer('menu_type').unsigned();
      })
      .createTable('menu_types', function(table){
        table.increments();
        table.integer('name_translatable_id').unsigned();
      });
  }).then(function(){
    return knex.schema
      .table('menu_types', function(table){
      table.foreign('name_translatable_id').references('translatables.id');
    });
  });
};
