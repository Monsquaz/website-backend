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

const DissociateUsergroupAction = {
  type: new GraphQLObjectType({
    name: "DissociateUsergroupActionResponse",
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
        name: 'DissociateUsergroupActionInput',
        fields: () => ({
          userId:            {type: new GraphQLNonNull(GraphQLInt)},
          actions:           {type: new GraphQLList(GraphQLString)},
          administrableIds:  {type: new GraphQLList(GraphQLInt)}
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

      let res = await t('actions').whereIn('name', input.actions).select(['id', 'name']);
      if(res.length < input.actions.length) {
        let missing = difference(input.actions, res.map(e => e.name));
        throw new GraphQLError(`The following actions don't exist: ${missing.join(', ')}`);
      }

      actionIds = res.map(e => e.id);

      await Util.existanceAndActionCheck(
        userId,
        {
          tableName:  'users',
          entityName: 'User',
          id:         input.userId,
          actions:    ['edit']
        }, t);

      await Util.existanceAndActionChecks(
        userId,
        input.administrableIds.map((aId) => ({
          tableName:      'administrables',
          entityName:     'Administrable',
          id:             aId,
          foreignKeyName: 'id',
          actions:        ['assignAction', ...input.actions]
        })), t);

      await t('usergroups_actions_administrables')
        .where({user_id: input.userId})
        .whereIn('action_id', actionIds)
        .whereIn('administrable_id', input.administrableIds)
        .delete();

      affectedRows = await Util.getRowCount(t);

    });

    return {affectedRows};

  }
}

export default DissociateUsergroupAction;
