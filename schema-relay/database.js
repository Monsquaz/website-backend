import path from 'path'

const dataFilePath = path.join(__dirname, '../data/demo-data.sl3')
export default require('knex')({
  client: 'sqlite3',
  connection: {
    filename: dataFilePath
  },
  useNullAsDefault: true
})
