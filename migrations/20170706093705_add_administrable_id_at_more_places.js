
exports.up = function(knex, Promise) {
  return knex.schema.createTable('categories_categories', (table) => {
    table.increments();
    table.integer('ancestor').unsigned();
    table.integer('descendant').unsigned();
    table.integer('length').unsigned().notNullable();
  }).then(() => {
    return knex.schema
      .table('categories_categories', function(table){
        table.foreign('ancestor').references('categories.id');
        table.foreign('descendant').references('categories.id');
      });
  }).then(() => {
    return knex.schema
      .table('categories', (table) => {
        table.dropForeign('page_id');
        table.dropForeign('parent');
      });
  }).then(() => {
      return knex.schema
        .table('categories', (table) => {
          table.dropColumn('page_id');
          table.dropColumn('parent');
          table.integer('administrable_id').unsigned();
        });
    }).then(() => {
      return knex.schema
        .table('categories', (table) => {
          table.foreign('administrable_id').references('administrables.id');
        });
    }).then(() => {
      return knex.schema
        .table('menus', (table) => {
          table.integer('administrable_id').unsigned();
        });
    }).then(() => {
      return knex.schema
        .table('menus', (table) => {
          table.foreign('administrable_id').references('administrables.id');
        });
    }).then(() => {
      return knex.schema
        .table('users', (table) => {
          table.integer('administrable_id').unsigned();
        });
    }).then(() => {
      return knex.schema
        .table('users', (table) => {
          table.foreign('administrable_id').references('administrables.id');
        });
    }).then(() => {
      return knex.schema
        .table('usergroups', (table) => {
          table.integer('administrable_id').unsigned();
        });
    }).then(() => {
      return knex.schema
        .table('usergroups', (table) => {
          table.foreign('administrable_id').references('administrables.id');
        });
    }).then(() => {
      return knex.schema
        .table('eventlisteners', (table) => {
          table.integer('administrable_id').unsigned();
        });
    }).then(() => {
      return knex.schema
        .table('eventlisteners', (table) => {
          table.foreign('administrable_id').references('administrables.id');
        });
    }).then(() => {
      return knex.schema
        .createTable('menu_items_menu_items', function(table){
          table.integer('ancestor').unsigned();
          table.integer('descendant').unsigned();
          table.integer('length').unsigned().notNullable();
        });
    }).then(() => {
      return knex.schema
        .table('menu_items_menu_items', function(table){
          table.foreign('ancestor').references('menu_items.id');
          table.foreign('descendant').references('menu_items.id');
        });
    }).then(() => {
      return knex.schema
        .table('menu_items', (table) => {
          //table.dropForeign('parent');
        });
    }).then(() => {
        return knex.schema
          .table('menu_items', (table) => {
            table.dropColumn('parent');
          });
      })
};

exports.down = function(knex, Promise) {
  return knex.schema
    .table('eventlisteners', (table) => {
      table.dropForeign('administrable_id');
    }).then(() => {
      return knex.schema
        .table('eventlisteners', (table) => {
          table.dropColumn('administrable_id');
        });
    }).then(() => {
      return knex.schema
        .table('usergroups', (table) => {
          table.dropForeign('administrable_id');
        });
    }).then(() => {
      return knex.schema
        .table('usergroups', (table) => {
          table.dropColumn('administrable_id');
        });
    }).then(() => {
      return knex.schema
        .table('users', (table) => {
          table.dropForeign('administrable_id');
        });
    }).then(() => {
      return knex.schema
        .table('users', (table) => {
          table.dropColumn('administrable_id');
        });
    }).then(() => {
      return knex.schema
        .table('menus', (table) => {
          table.dropForeign('administrable_id');
        });
    }).then(() => {
      return knex.schema
        .table('menus', (table) => {
          table.dropColumn('administrable_id');
        });
    }).then(() => {
      return knex.schema
        .table('categories', (table) => {
          table.dropForeign('administrable_id');
        });
    }).then(() => {
      return knex.schema
        .table('categories', (table) => {
          table.dropColumn('administrable_id');
          table.integer('page_id').unsigned();
          table.integer('parent').unsigned();
        });
    }).then(() => {
      return knex.schema
        .table('categories', (table) => {
          table.foreign('page_id').references('pages.id');
          table.foreign('parent').references('categories.id');
        });
    }).then(() => {
      return knex.schema
        .table('categories_categories', function(table){
          table.dropForeign('ancestor');
          table.dropForeign('descendant');
        });
    }).then(() => {
      return knex.schema
        .dropTable('categories_categories');
    })
    .then(() => {
      return knex.schema
        .table('menu_items', (table) => {
          table.integer('parent').unsigned();
        });
    }).then(() => {
      return knex.schema
        .table('menu_items', (table) => {
          table.foreign('parent').references('menu_items.id');
        });
    }).then(() => {
      return knex.schema
        .table('menu_items_menu_items', function(table){
          table.dropForeign('ancestor');
          table.dropForeign('descendant');
        });
    }).then(() => {
      return knex.schema
        .dropTable('menu_items_menu_items');
    });
};
