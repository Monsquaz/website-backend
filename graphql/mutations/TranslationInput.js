import {
  GraphQLString,
  GraphQLInputObjectType
} from 'graphql';

const TranslationInput = new GraphQLInputObjectType({
   description: 'A translation input',
   name: 'TranslationInput',
   fields: () => ({
     lang: {
       type: GraphQLString
     },
     content: {
       type: GraphQLString
     }
   })
 });

export default TranslationInput;
