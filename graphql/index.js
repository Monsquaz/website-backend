import { GraphQLSchema } from 'graphql';

import QueryRoot from './QueryRoot';

const schema = new GraphQLSchema({
  description: 'Monsquaz Web Schema',
  query: QueryRoot
});

export default schema