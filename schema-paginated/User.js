import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt
} from 'graphql'

import {
  globalIdField,
  connectionArgs,
  forwardConnectionArgs,
  connectionDefinitions
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
    fullNameAnotherWay: {
      type: GraphQLString,
      sqlExpr: table => `${table}.first_name || ' ' || ${table}.last_name`
    },
    posts: {
      description: 'A list of Posts the user has written',
      // this is now a connection type
      type: PostConnection, 
      // these args navigate through the pages
      args: connectionArgs,
      sqlPaginate: true,
      // use "keyset" pagination, an implementation based on a unique sorting key
      sortKey: {
        order: 'desc',
        key: 'id'
      },
      sqlJoin: (userTable, postTable) => `${userTable}.id = ${postTable}.author_id`
    },
    comments: {
      description: 'Comments the user has written on people\'s posts',
      type: CommentConnection,
      // this implementation only allows "forward pagination"
      args: forwardConnectionArgs,
      sqlPaginate: true,
      // this time use "offset pagination", an implementation based on LIMIT/OFFSET
      orderBy: {
        id: 'desc'
      },
      // join is the same as before
      sqlJoin: (userTable, commentTable) => `${userTable}.id = ${commentTable}.author_id AND ${commentTable}.archived = FALSE`
    },
    following: {
      description: 'Users that this user is following',
      type: UserConnection,
      args: connectionArgs,
      sqlPaginate: true,
      // the unique sort key can be composite
      sortKey: {
        order: 'desc',
        key: [ 'created_at', 'followee_id' ]
      },
      // pagination also works with many-to-many
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

const { connectionType: UserConnection } = connectionDefinitions({ nodeType: User })

export default User 

