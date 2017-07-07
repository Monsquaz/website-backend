import knex from 'knex';
import {environment} from './config';
import knexConfig from './knexfile';

let db = knex(knexConfig[environment]);

export default {
  call: (sql) => {
    console.log(sql);
    return new Promise((resolve, reject) => {
      db.raw(sql).then((r) => {
        resolve(r[0]);
      });
    });
  },
  knex: db
}
