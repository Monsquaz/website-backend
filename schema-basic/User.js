import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt
} from 'graphql'

import {
  globalIdField
} from 'graphql-relay'

import Comment from './Comment'
import Post from './Post'

const User = new GraphQLObjectType({
  description: 'a stem contract account',
  name: 'User',
  // tell join monster the name of the table
  sqlTable: 'accounts',
  // one of the columns must be unique for deduplication purposes
  uniqueKey: 'id',
  fields: () => ({
    id: {
      // no `sqlColumn` and no `resolve`. assumed that the column name is the same as the field name: id
      type: GraphQLInt
    },
    email: {
      type: GraphQLString,
      // specify the SQL column
      sqlColumn: 'email_address'
    },
    idEncoded: {
      description: 'The ID base-64 encoded',
      type: GraphQLString,
      sqlColumn: 'id',
      // specifies SQL column and applies a custom resolver
      resolve: user => toBase64(user.idEncoded)
    },
    globalId: {
      description: 'The global ID for the Relay spec',
      ...globalIdField('User', user => user.globalId),
      sqlColumn: 'id'
    },
    fullName: {
      description: 'A user\'s first and last name',
      type: GraphQLString,
      // depends on multiple SQL columns
      sqlDeps: [ 'first_name', 'last_name' ],
      resolve: user => `${user.first_name} ${user.last_name}`
    },
    comments: {
      description: 'Comments the user has written on people\'s posts',
      // has another GraphQLObjectType as a field
      type: new GraphQLList(Comment),
      // this function tells join monster how to join these tables
      sqlJoin: (userTable, commentTable) => `${userTable}.id = ${commentTable}.author_id`
    },
    posts: {
      description: 'A list of Posts the user has written',
      type: new GraphQLList(Post),
      sqlJoin: (userTable, postTable) => `${userTable}.id = ${postTable}.author_id`
    },
    following: {
      description: 'Users that this user is following',
      type: new GraphQLList(User),
      // many-to-many is supported too, via an intermediate join table
      joinTable: 'relationships',
      sqlJoins: [
        (followerTable, relationTable) => `${followerTable}.id = ${relationTable}.follower_id`,
        (relationTable, followeeTable) => `${relationTable}.followee_id = ${followeeTable}.id`
      ]
    },
    favNums: {
      type: new GraphQLList(GraphQLInt),
      // you can still have resolvers that get data from other sources. simply omit the `sqlColumn` and define a resolver
      resolve: () => [1, 2, 3]
    },
    numLegs: {
      description: 'How many legs this user has',
      type: GraphQLInt,
      sqlColumn: 'num_legs'
    }
  })
})

export default User 

function toBase64(clear) {
  return Buffer.from(String(clear)).toString('base64')
}
