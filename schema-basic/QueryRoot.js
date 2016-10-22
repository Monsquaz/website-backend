import path from 'path'
import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt
} from 'graphql'

// connect to our database file
const dataFilePath = path.join(__dirname, '../data/demo-data.sl3')
const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: dataFilePath
  },
  useNullAsDefault: true
})

import joinMonster from 'join-monster'
import User from './User'

export default new GraphQLObjectType({
  description: 'global query object',
  name: 'Query',
  fields: () => ({
    version: {
      type: GraphQLString,
      resolve: () => joinMonster.version
    },
    users: {
      type: new GraphQLList(User),
      resolve: (parent, args, context, resolveInfo) => {
        // joinMonster with handle batching all the data fetching for the users and it's children. Determines everything it needs to from the "resolveInfo", which includes the parsed GraphQL query AST and your schema definition
        return joinMonster(resolveInfo, context, sql => {
          // place the SQL query in the response headers for GraphsiQL. ONLY for debugging. Don't do this in production
          if (context) {
            context.set('X-SQL-Preview', sql.replace(/\n/g, '%0A'))
          }
          return knex.raw(sql)
        })
      }
    },
    user: {
      type: User,
      args: {
        id: {
          description: 'The users ID number',
          type: GraphQLInt
        }
      },
      // this functino generates the WHERE condition
      where: (usersTable, args, context) => { // eslint-disable-line no-unused-vars
        if (args.id) return `${usersTable}.id = ${args.id}`
      },
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster(resolveInfo, context, sql => {
          if (context) {
            context.set('X-SQL-Preview', sql.replace(/\n/g, '%0A'))
          }
          return knex.raw(sql)
        })
      }
    }
  })
})
