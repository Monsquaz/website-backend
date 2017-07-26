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
import AclUsergroup from '../AclUsergroup';
import joinMonster from 'join-monster';
import db from '../../db';
import to from 'await-to-js';
import { difference } from 'lodash';

const AssignUsergroupAction = {
  type: new GraphQLList(AclUsergroup),
  args: {
    input: {
      type: new GraphQLInputObjectType({
        description: '',
        name: 'AssignUsergroupActionInput',
        fields: () => ({
          usergroupId:            {type: new GraphQLNonNull(GraphQLInt)},
          actions:           {type: new GraphQLList(GraphQLString)},
          administrableIds:  {type: new GraphQLList(GraphQLInt)}
        })
      })
    }
  },
  where: async (aclUserTable, args, { userId }) => {

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
        userId,
        {
          tableName:  'usergroups',
          entityName: 'Usergroup',
          id:         input.usergroupId,
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

      let inserts = [];

      await Promise.all(input.administrableIds.map(
        async (aId) => {
          await Promise.all(actionIds.map(
            async (actionId) => {
              let assignment = {
                usergroup_id: input.usergroupId,
                action_id: actionId,
                administrable_id: aId
              };
              let [err, exists] = await to(Util.exists({
                tableName: 'usergroups_actions_administrables',
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
        await t('usergroups_actions_administrables').insert(inserts);
      }

    });
    return `
      ${aclUsergroupTable}.user_id = ${input.userId}
        AND ${aclUsergroupTable}.action_id IN (${actionIds.join(',')})
        AND ${aclUsergroupTable}.administrable_id IN (${input.administrableIds.join(',')})`;
  },
  resolve: (parent, args, context, resolveInfo) => {
    return joinMonster(resolveInfo, {}, sql => {
      return db.call(sql);
    }, { dialect: "mysql", minify: "true" })
  }
}

export default AssignUsergroupAction;
