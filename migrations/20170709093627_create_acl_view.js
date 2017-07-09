
exports.up = function(knex, Promise) {
  return knex.schema.raw(`CREATE VIEW acl AS
    SELECT DISTINCT a.id AS action_id, a.name AS action_name, aa.descendant AS administrable_id, u.id AS user_id FROM administrables_administrables AS aa
    LEFT JOIN users_actions_administrables AS uaa ON uaa.administrable_id=aa.ancestor
    LEFT JOIN users AS u ON uaa.user_id = u.id
    LEFT JOIN users_usergroups AS uu ON uu.user_id=u.id
    LEFT JOIN usergroups_actions_administrables AS ugaa ON ugaa.administrable_id=aa.ancestor AND ugaa.usergroup_id=uu.usergroup_id
    JOIN actions AS a ON (a.id=uaa.action_id OR a.id=ugaa.action_id)`);
};

exports.down = function(knex, Promise) {
  return knex.schema.raw('DROP VIEW acl');
};
