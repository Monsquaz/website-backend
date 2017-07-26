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
import User from '../User';
import joinMonster from 'join-monster';
import db from '../../db';
import to from 'await-to-js';
import { difference } from 'lodash';

const AssignUsergroup = {
  type: new GraphQLList(User),
  args: {
    input: {
      type: new GraphQLInputObjectType({
        description: '',
        name: 'AssignUsergroupInput',
        fields: () => ({
          userId:            {type: new GraphQLNonNull(GraphQLInt)},
          usergroupIds:      {type: new GraphQLList(GraphQLInt)}
        })
      })
    }
  },
  where: async (usersTable, args, { userId }) => {

    let input = args.input;
    if(!input) throw new GraphQLError('No input supplied');

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

      await Util.existanceAndActionChecks(
        userId,
        input.usergroupIds.map((ugId) => ({
          tableName:      'usergroups',
          entityName:     'Usergroup',
          id:             ugId,
          foreignKeyName: 'administrable_id',
          actions:        ['use']
        })), t);

      let inserts = [];

      await Promise.all(input.usergroupIds.map(
        async (usergroupId) => {
          let assignment = {
            user_id: input.userId,
            usergroup_id: usergroupId
          };
          let [err, exists] = await to(Util.exists({
            tableName: 'users_usergroups',
            where: assignment
          }, t));
          if(err) {
            throw new GraphQLError('Error fetching usergroup data.');
          }
          if(!exists) {
            inserts.push(assignment);
          }
        }
      ));

      if(inserts.length > 0) {
        await t('users_usergroups').insert(inserts);
      }

    });
    return `${usersTable}.id = ${input.userId}`;
  },
  resolve: (parent, args, context, resolveInfo) => {
    return joinMonster(resolveInfo, {}, sql => {
      return db.call(sql);
    }, { dialect: "mysql", minify: "true" })
  }
}

export default AssignUsergroup;
