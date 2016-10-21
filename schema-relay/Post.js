import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt
} from 'graphql'

import {
  globalIdField,
  connectionDefinitions,
  connectionArgs,
  connectionFromArray
} from 'graphql-relay'

import User from './User'
import { CommentConnection } from './Comment'
import { nodeInterface } from './Node'


export const Post = new GraphQLObjectType({
  description: 'A post from a user',
  name: 'Post',
  sqlTable: 'posts',
  uniqueKey: 'id',
  // also implements the node interface
  interfaces: [ nodeInterface ],
  fields: () => ({
    id: {
      ...globalIdField(),
      sqlDeps: [ 'id' ]
    },
    clearId: {
      type: GraphQLInt,
      sqlColumn: 'id'
    },
    body: {
      description: 'The content of the post',
      type: GraphQLString
    },
    author: {
      description: 'The user that created the post',
      type: User,
      sqlJoin: (postTable, userTable) => `${postTable}.author_id = ${userTable}.id`
    },
    comments: {
      description: 'The comments on this post',
      // a nested connection
      type: CommentConnection,
      args: connectionArgs,
      sqlPaginate: true,
      orderBy: {
        id: 'desc'
      },
      sqlJoin: (postTable, commentTable) => `${postTable}.id = ${commentTable}.post_id`
    }
  })
})

// create the connection type from the post
const { connectionType: PostConnection } = connectionDefinitions({ nodeType: Post })
export { PostConnection }

