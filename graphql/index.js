import { GraphQLSchema } from 'graphql';

import QueryRoot from './QueryRoot';
import Mutation from './Mutation';

const schema = new GraphQLSchema({
  description: 'Monsquaz Web Schema',
  query: QueryRoot,
  mutation: Mutation
});

export default schema