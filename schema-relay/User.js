import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt
} from 'graphql'

import {
  globalIdField,
  connectionArgs,
  connectionFromArray
} from 'graphql-relay'

import { PostConnection } from './Post'
import { CommentConnection } from './Comment'
import { nodeInterface } from './Node'


const User = new GraphQLObjectType({
  description: 'a stem contract account',
  name: 'User',
  sqlTable: 'accounts',
  uniqueKey: 'id',
  // This implements the node interface
  interfaces: [ nodeInterface ],
  fields: () => ({
    id: {
      description: 'The global ID for the Relay spec',
      // all the resolver for the globalId needs is the id property
      ...globalIdField(),
      sqlDeps: [ 'id' ]
    },
    email: {
      type: GraphQLString,
      sqlColumn: 'email_address'
    },
    fullName: {
      description: 'A user\'s first and last name',
      type: GraphQLString,
      sqlDeps: [ 'first_name', 'last_name' ],
      resolve: user => `${user.first_name} ${user.last_name}`
    },
    comments: {
      description: 'Comments the user has written on people\'s posts',
      // this is now a connection type
      type: CommentConnection,
      args: connectionArgs,
      // comments comes in as an array, lets turn that into a connection
      resolve: (user, args) => {
        return connectionFromArray(user.comments, args)
      },
      // join is the same as before
      sqlJoin: (userTable, commentTable) => `${userTable}.id = ${commentTable}.author_id`
    },
    posts: {
      description: 'A list of Posts the user has written',
      // a Post connection as well
      type: PostConnection, 
      args: connectionArgs,
      resolve: (user, args) => {
        return connectionFromArray(user.posts, args)
      },
      sqlJoin: (userTable, postTable) => `${userTable}.id = ${postTable}.author_id`
    },
    following: {
      description: 'Users that this user is following',
      type: new GraphQLList(User),
      joinTable: 'relationships',
      sqlJoins: [
        (followerTable, relationTable) => `${followerTable}.id = ${relationTable}.follower_id`,
        (relationTable, followeeTable) => `${relationTable}.followee_id = ${followeeTable}.id`
      ]
    },
    favNums: {
      type: new GraphQLList(GraphQLInt),
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
