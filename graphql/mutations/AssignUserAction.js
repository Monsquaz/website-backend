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

const AssignUserAction = {
  type: new GraphQLList(AclUser),
  args: {
    input: {
      type: new GraphQLInputObjectType({
        description: '',
        name: 'AssignUserActionInput',
        fields: () => ({
          userId:            {type: new GraphQLNonNull(GraphQLInt)},
          actions:           {type: new GraphQLList(GraphQLString)},
          administrableIds:  {type: new GraphQLList(GraphQLInt)}
        })
      })
    }
  },
  where: async (aclUserTable, args, context) => {

    let input = args.input;
    if(!input) throw new GraphQLError('No input supplied');

    let actionIds = [];

    await db.knex.transaction(async (t) => {

      let res = await t('actions').whereIn('name', input.actions).select(['id', 'name']);
      if(res.length < input.actions.length) {
        let missing = difference(input.actions, res.map(e => e.name));
        throw new GraphQLError(`The following actions don't exist: ${missing.join(', ')}`);
      }

      actionIds = res.map(e => e.id);

      await Util.existanceAndActionCheck(
        context.userId,
        {
          tableName:  'users',
          entityName: 'User',
          id:         input.userId,
          actions:    ['edit']
        }, t);

      await Util.existanceAndActionChecks(
        context.userId,
        input.administrableIds.map((aId) => ({
          tableName:      'administrables',
          entityName:     'Administrable',
          id:             aId,
          foreignKeyName: 'id',
          actions:        ['assignAction', ...input.actions]
        })), t);

      let inserts = [];

      await Promise.all(input.administrableIds.map(
        async (aId) => {
          await Promise.all(actionIds.map(
            async (actionId) => {
              let assignment = {
                user_id: input.userId,
                action_id: actionId,
                administrable_id: aId
              };
              let [err, exists] = await to(Util.exists({
                tableName: 'users_actions_administrables',
                where: assignment
              }, t));
              if(err) {
                throw new GraphQLError('Error fetching User ACL data.');
              }
              if(!exists) {
                inserts.push(assignment);
              }
            }
          ));
        }
      ));

      if(inserts.length > 0) {
        await t('users_actions_administrables').insert(inserts);
      }

    });
    return `
      ${aclUserTable}.user_id = ${input.userId}
        AND ${aclUserTable}.action_id IN (${actionIds.join(',')})
        AND ${aclUserTable}.administrable_id IN (${input.administrableIds.join(',')})`;
  },
  resolve: (parent, args, context, resolveInfo) => {
    return joinMonster(resolveInfo, {}, sql => {
      return db.call(sql);
    }, { dialect: "mysql", minify: "true" })
  }
}

export default AssignUserAction;
