
exports.up = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.string('email').notNullable();
    table.string('firstname').notNullable();
    table.string('lastname').notNullable();
    table.string('verification_code').notNullable().unique();
    table.boolean('is_verified').notNullable();
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('is_verified');
    table.dropColumn('verification_code');
    table.dropColumn('lastname');
    table.dropColumn('firstname');
    table.dropColumn('email');
  })
};
