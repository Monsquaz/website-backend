import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString
} from 'graphql'

import {
  globalIdField,
  connectionDefinitions,
  forwardConnectionArgs
} from 'graphql-relay'

import User from './User'
import { CommentConnection, SimpleComment } from './Comment'
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
      args: forwardConnectionArgs,
      sqlPaginate: true,
      orderBy: {
        id: 'desc'
      },
      sqlJoin: (postTable, commentTable) => `${postTable}.id = ${commentTable}.post_id AND ${commentTable}.archived = FALSE`
    },
    commentsWithoutJoin: {
      type: new GraphQLList(SimpleComment),
      sqlExpr: table => `(SELECT json_agg(comments) FROM comments WHERE comments.post_id = ${table}.id AND comments.archived = FALSE)`
    },
    createdAt: {
      type: GraphQLString,
      sqlColumn: 'created_at'
    }
  })
})

// create the connection type from the post
const { connectionType: PostConnection } = connectionDefinitions({ nodeType: Post })
export { PostConnection }

