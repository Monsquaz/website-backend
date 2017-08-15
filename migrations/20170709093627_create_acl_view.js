
exports.up = function(knex, Promise) {
  return knex.schema.raw(`CREATE VIEW acl AS
    SELECT DISTINCT a.id AS action_id, a.name AS action_name, aa.descendant AS administrable_id, COALESCE(uaa.user_id, uu.user_id) AS user_id
    FROM administrables_administrables AS aa
    LEFT JOIN users_actions_administrables AS uaa ON uaa.administrable_id=aa.ancestor
    LEFT JOIN usergroups_actions_administrables AS ugaa ON ugaa.administrable_id=aa.ancestor
    LEFT JOIN users_usergroups AS uu ON uu.usergroup_id = ugaa.usergroup_id
    JOIN actions AS a ON (a.id=uaa.action_id OR a.id=ugaa.action_id)
    WHERE (uaa.user_id IS NOT NULL OR uu.user_id IS NOT NULL)`);
};

exports.down = function(knex, Promise) {
  return knex.schema.raw('DROP VIEW acl');
};
