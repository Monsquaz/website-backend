
exports.up = function(knex, Promise) {
    return knex.schema.table('messages', (table) => {
        table.dropForeign('parent');
      })
      .then(() => {
        return knex.schema.table('messages', (table) => {
            table.dropColumn('parent');
        })
      })
      .then(() => {
        return knex.schema.createTable('messages_messages', function(table) {
          table.increments();
          table.integer('ancestor').unsigned();
          table.integer('descendant').unsigned();
          table.integer('length').unsigned().notNullable();
        })
      })
      .then(() => {
        return knex.schema.table('messages_messages', (table) => {
          table.foreign('ancestor').references('messages.id').onUpdate('cascade').onDelete('cascade');
          table.foreign('descendant').references('messages.id').onUpdate('cascade').onDelete('cascade');
        })
      });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('messages_messages', function(table) {
      table.dropForeign('ancestor');
      table.dropForeign('descendant');
    }).then(() => {
      return knex.schema.dropTable('messages_messages');
    }).then(() => {
      return knex.schema.table('messages', (table) => {
        table.integer('parent').unsigned();
      });
    }).then(() => {
      return knex.schema.table('messages', (table) => {
        table.foreign('parent').references('messages.id');
      });
    });
};
