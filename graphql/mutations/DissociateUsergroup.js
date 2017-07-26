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
import AclUser from '../AclUser';
import joinMonster from 'join-monster';
import db from '../../db';
import to from 'await-to-js';
import { difference } from 'lodash';

const DissociateUsergroup = {
  type: new GraphQLObjectType({
    name: "DissociateUsergroupResponse",
    fields: () => ({
      affectedRows: {
        type: new GraphQLNonNull(GraphQLInt)
      }
    })
  }),
  args: {
    input: {
      type: new GraphQLInputObjectType({
        description: '',
        name: 'DissociateUsergroupInput',
        fields: () => ({
          userId:            {type: new GraphQLNonNull(GraphQLInt)},
          usergroupIds:      {type: new GraphQLList(GraphQLInt)}
        })
      })
    }
  },
  resolve: async (parent, args, { userId }, resolveInfo) => {

    let input = args.input;
    if(!input) throw new GraphQLError('No input supplied');

    let actionIds = [];
    let affectedRows;

    await db.knex.transaction(async (t) => {

      let res = await t('usergroups').whereIn('id', input.usergroupIds).select(['id', 'name']);
      if(res.length < input.usergroupIds.length) {
        let missing = difference(input.usergroupIds, res.map(e => e.id));
        throw new GraphQLError(`The following usergroup ids don't exist: ${missing.join(', ')}`);
      }

      await Util.existanceAndActionCheck(
        userId,
        {
          tableName:  'users',
          entityName: 'User',
          id:         input.userId,
          actions:    ['edit']
        }, t);

      await t('users_usergroups')
        .where({user_id: input.userId})
        .whereIn('usergroup_id', input.usergroupIds)
        .delete();

      affectedRows = await Util.getRowCount(t);

    });

    return {affectedRows};

  }
}

export default DissociateUsergroup;
