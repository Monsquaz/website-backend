import path from 'path'

const dataFilePath = path.join(__dirname, '../data/demo-data.sl3')
const pgUrl = process.env.DATABASE_URL
const connection = pgUrl || { filename: dataFilePath }

console.log('connecting to ' + JSON.stringify(connection))
export default require('knex')({
  client: pgUrl ? 'pg' : 'sqlite3',
  connection,
  useNullAsDefault: true
})
