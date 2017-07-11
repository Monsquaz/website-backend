
exports.up = function(knex, Promise) {
  return knex.schema.raw(`CREATE VIEW pages_paths AS
    SELECT IF(
      NOW() < DATE_ADD(p.publish_date, INTERVAL 30 DAY),
      CONCAT(
        '/',
        IF(pt.content, pt.content, p.id)
      ),
      CONCAT(
        '/',
        IF(ct.content, ct.content, c.id),
        '/',
        IF(pt.content, pt.content, p.id)
      )
    ) AS path, pt.lang FROM pages AS p
    LEFT JOIN translations AS pt ON pt.translatable_id = p.slug_translatable_id
    LEFT JOIN categories AS c ON c.id = p.category_id
    LEFT JOIN translations AS ct ON ct.translatable_id = c.slug_translatable_id AND pt.lang = ct.lang
  `);
};

exports.down = function(knex, Promise) {
  return knex.schema.raw('DROP VIEW pages_paths');
};
