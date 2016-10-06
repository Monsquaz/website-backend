import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt
} from 'graphql'

import User from './User'
import Comment from './Comment'

export default new GraphQLObjectType({
  description: 'A post from a user',
  name: 'Post',
  // another table in SQL to map to 
  sqlTable: 'posts',
  uniqueKey: 'id',
  fields: () => ({
    id: {
      // SQL column assumed to be "id"
      type: GraphQLInt
    },
    body: {
      description: 'The content of the post',
      // assumed to be "body"
      type: GraphQLString
    },
    author: {
      description: 'The user that created the post',
      // a back reference to its User
      type: User,
      // how to join these tables
      sqlJoin: (postTable, userTable) => `${postTable}.author_id = ${userTable}.id`
    },
    comments: {
      description: 'The comments on this post',
      type: new GraphQLList(Comment),
      sqlJoin: (postTable, commentTable) => `${postTable}.id = ${commentTable}.post_id`
    }
  })
})
