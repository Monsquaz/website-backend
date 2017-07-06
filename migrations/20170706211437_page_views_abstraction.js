
exports.up = function(knex, Promise) {
  return knex.schema.table('page_types', (table) => {
    // Incorrectly names, yes. Column was renamed but not foreign key.
    table.dropForeign('name_translatable_id');
  }).then(() => {
    return knex.schema.table('pages', (table) => {
      table.dropForeign('page_type_id');
      table.dropForeign('layout_id');
      table.integer('layout_view_id').unsigned().notNullable();
      table.integer('type_view_id').unsigned().notNullable();
    });
  }).then(() => {
    return knex.schema.table('pages', (table) => {
      table.dropColumn('page_type_id');
      table.dropColumn('layout_id');
    });
  }).then(() => {
    return knex.schema.dropTable('page_types');
  }).then(() => {
    return knex.schema.table('layouts', (table) => {
      table.dropForeign('title_translatable_id');
    });
  }).then(() => {
    return knex.schema.dropTable('layouts');
  }).then(() => {
    return knex.schema.createTable('view_types', (table) => {
      table.increments();
      table.text('schema').notNullable();
      table.text('schemaForm').notNullable();
      table.string('filename');
    });
  }).then(() => {
    return knex.schema.createTable('views', (table) => {
      table.increments();
      table.integer('view_type_id').unsigned().notNullable();
      table.text('data');
      table.integer('name_translatable_id').unsigned().notNullable();
    });
  }).then(() => {
    return knex.schema.table('views', (table) => {
      table.foreign('view_type_id').references('views.id');
      table.foreign('name_translatable_id').references('translatables.id');
    });
  }).then(() => {
    return knex.schema.table('pages', (table) => {
      table.foreign('layout_view_id').references('views.id');
      table.foreign('type_view_id').references('views.id');
    });
  });

};

exports.down = function(knex, Promise) {
  return knex.schema.table('pages', (table) => {
    table.dropForeign('layout_view_id');
    table.dropForeign('type_view_id');
  }).then(() => {
    return knex.schema.table('views', (table) => {
      table.dropForeign('view_type_id');
      table.dropForeign('name_translatable_id');
    });
  }).then(() => {
    return knex.schema.dropTable('views').dropTable('view_types');
  }).then(() => {
    return knex.schema.createTable('layouts', (table) => {
      table.increments();
      table.integer('title_translatable_id').unsigned().notNullable();
      table.string('view', 50);
    });
  }).then(() => {
    return knex.schema
      .table('layouts', (table) => {
        table.foreign('title_translatable_id').references('translatables.id');
      });
  }).then(() => {
    return knex.schema.createTable('page_types', (table) => {
      table.increments();
      table.integer('name_translatable_id').unsigned();
      table.string('view', 50);
      table.text('schema');
      table.text('schemaForm');
    });
  }).then(() => {
    return knex.schema.table('page_types', (table) => {
      table.foreign('name_translatable_id').references('translatables.id');
      table.unique('view');
    });
  }).then(() => {
    return knex.schema.table('page_types', (table) => {
      // Incorrectly names, yes. Column was renamed but not foreign key.
      table.renameColumn('name_translatable_id', 'title_translatable_id');
    });
  }).then(() => {
    return knex.schema.table('pages', (table) => {
      table.integer('page_type_id').unsigned();
      table.integer('layout_id').unsigned().notNullable();
    });
  }).then(() => {
    return knex.schema.table('pages', (table) => {
      table.foreign('page_type_id').references('page_types.id');
      table.foreign('layout_id').references('layouts.id');
    })
  });
};
