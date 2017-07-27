exports.up = async (knex, Promise) => {
  return await knex.schema.table('view_types', (table) => { table.renameColumn('filename', 'component'); });
};

exports.down = async (knex, Promise) => {
  return await knex.schema.table('view_types', (table) => { table.renameColumn('component', 'filename'); });
};
