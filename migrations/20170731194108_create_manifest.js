
exports.up = function(knex, Promise) {
  return knex.schema.raw(`CREATE VIEW admin_manifests AS
    SELECT id, administrable_id, 'Category' as type FROM categories
    UNION ALL
    SELECT id, administrable_id, 'Eventlistener' as type FROM eventlisteners
    UNION ALL
    SELECT id, administrable_id, 'Menu' as type FROM menus
    UNION ALL
    SELECT id, administrable_id, 'MessageType' as type FROM message_types
    UNION ALL
    SELECT id, administrable_id, 'Message' as type FROM messages
    UNION ALL
    SELECT id, administrable_id, 'Page' as type FROM pages
    UNION ALL
    SELECT id, administrable_id, 'Usergroup' as type FROM usergroups
    UNION ALL
    SELECT id, administrable_id, 'User' as type FROM users
    UNION ALL
    SELECT id, administrable_id, 'ViewType' as type FROM view_types
    UNION ALL
    SELECT id, administrable_id, 'View' as type FROM views
    `);
};

exports.down = function(knex, Promise) {
  return knex.schema.raw('DROP VIEW admin_manifests');
};
