import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLError
} from 'graphql';


import Util from '../Util';
import TranslationInput from './TranslationInput';
import Eventlistener from '../Eventlistener';
import joinMonster from 'join-monster';
import db from '../../db';
import validator from 'validator';

const UpdateEventListener = {
  type: Eventlistener,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    input: {
      type: new GraphQLInputObjectType({
        description: '',
        name: 'UpdateEventlistenerInput',
        fields: () => ({
          resourceType:           { type: new GraphQLNonNull(GraphQLString)},
          resourceId:             { type: GraphQLInt },
          resourceEventType:      { type: new GraphQLNonNull(GraphQLString) },
          parentAdministrableId:  { type: new GraphQLNonNull(GraphQLInt) }
        })
      })
    }
  },
  where: async (viewTable, args, context) => {
    await db.knex.transaction(async (t) => {
      let input = args.input;
      if(!input) throw new GraphQLError('No input supplied');
      // TODO
    });
    return `${viewTable}.id = ${args.id}`;
  },
  resolve: (parent, args, context, resolveInfo) => {
    return joinMonster(resolveInfo, {}, sql => {
      return db.call(sql);
    }, { dialect: "mysql", minify: "true" })
  }
}

export default UpdateEventListener;
