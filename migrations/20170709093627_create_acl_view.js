
exports.up = function(knex, Promise) {
  return knex.schema.raw(`CREATE VIEW acl AS
    (SELECT a.id AS action_id, a.name AS action_name, aa.descendant AS administrable_id, uaa.user_id AS user_id
    FROM administrables_administrables AS aa
    JOIN users_actions_administrables AS uaa ON uaa.administrable_id=aa.ancestor
    JOIN actions AS a ON a.id=uaa.action_id)
    UNION
    (SELECT a.id AS action_id, a.name AS action_name, aa.descendant AS administrable_id, uu.user_id AS user_id
    FROM administrables_administrables AS aa
    JOIN usergroups_actions_administrables AS ugaa ON ugaa.administrable_id=aa.ancestor
    JOIN users_usergroups AS uu ON uu.usergroup_id = ugaa.usergroup_id
    JOIN actions AS a ON a.id=ugaa.action_id)`);
};

exports.down = function(knex, Promise) {
  return knex.schema.raw('DROP VIEW acl');
};
