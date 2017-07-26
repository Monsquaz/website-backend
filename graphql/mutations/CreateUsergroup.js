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
import Usergroup from '../Usergroup';
import joinMonster from 'join-monster';
import db from '../../db';
import validator from 'validator';

const CreateView = {
  type: Usergroup,
  args: {
    input: {
      type: new GraphQLInputObjectType({
        description: '',
        name: 'CreateUsergroupInput',
        fields: () => ({
          name:                   {type: GraphQLString },
          parentAdministrableId:  {type: new GraphQLNonNull(GraphQLInt)}
        })
      })
    }
  },
  where: async (usergroupsTable, args, { userId }) => {
    let insertId;
    await db.knex.transaction(async (t) => {
      let input = args.input;
      if(!input) throw new GraphQLError('No input supplied');

      let administrableId = await Util.createAdministrable({
        userId:                   userId,
        parentAdministrableId:    input.parentAdministrableId,
        nameTranslations:         Util.inAllLanguages(input.name),
        requiredActionsOnParent:  ['createUsergroup']
      }, t);

      await t('usergroups').insert({
        name:             input.name,
        administrable_id: administrableId
      });

      insertId = await Util.getInsertId(t);

    });
    return `${usergroupsTable}.id = ${insertId}`;
  },
  resolve: (parent, args, context, resolveInfo) => {
    return joinMonster(resolveInfo, {}, sql => {
      return db.call(sql);
    }, { dialect: "mysql", minify: "true" })
  }
}

export default CreateView;
