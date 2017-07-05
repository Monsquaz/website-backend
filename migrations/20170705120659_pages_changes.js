
exports.up = function(knex, Promise) {
  return knex.schema
    .table('page_types', function(table){
      table.renameColumn('name_translatable_id', 'title_translatable_id');
      table.string('view', 50);
      table.text('schema');
      table.text('schemaForm');
    }).then(() => {
      return knex.schema
        .table('page_types', function(table){
          table.unique('view');
        });
    }).then(() => {
      return knex.schema
        .table('pages', function(table){
          table.text('meta_data');
          table.integer('content_translatable_id').unsigned();
        });
    }).then(() => {
      return knex.schema
        .table('pages', function(table){
          table.foreign('content_translatable_id').references('translatables.id');
        });
    });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .table('pages', function(table){
      table.dropForeign('content_translatable_id');
    }).then(() => {
      return knex.schema
        .table('pages', function(table){
          table.dropColumn('content_translatable_id');
          table.dropColumn('meta_data');
        });
    }).then(() => {
      return knex.schema
        .table('page_types', function(table){
          table.dropUnique('view');
        });
    }).then(() => {
      return knex.schema
        .table('page_types', function(table){
          table.dropColumn('schemaForm');
          table.dropColumn('schema');
          table.dropColumn('view');
          table.renameColumn('title_translatable_id', 'name_translatable_id');
        })
    });
};
