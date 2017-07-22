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

import crypto from 'crypto';
import base64url from 'base64url';
import passwordHash from 'password-hash';
import validator from 'validator';
import strength from 'strength';
import nodemailer from 'nodemailer';

let getGeneratedVerificationCode = (size) => {
  return base64url(crypto.randomBytes(size));
};

let formatName = (name) => {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

const CreateUser = {
  type: User,
  args: {
    input: {
      type: new GraphQLInputObjectType({
        description: '',
        name: 'CreateUserInput',
        fields: () => ({
          name:                  {type: new GraphQLNonNull(GraphQLString)},
          email:                 {type: new GraphQLNonNull(GraphQLString)},
          firstname:             {type: new GraphQLNonNull(GraphQLString)},
          lastname:              {type: new GraphQLNonNull(GraphQLString)},
          password:              {type: new GraphQLNonNull(GraphQLString)},
          parentAdministrableId: {type: GraphQLInt}
        })
      })
    }
  },
  where: async (usersTable, args, context) => {
    let insertId;
    await db.knex.transaction(async (t) => {
      let input = args.input;
      if(!input) throw new GraphQLError('No input supplied');

      if(!validator.isLength(input.name, {min: 2, max: 40})) {
        throw new GraphQLError(`Name must be between 2 and 40 characters.`);
      }

      if(!validator.isAlphanumeric(input.name)) {
        throw new GraphQLError(`Name must only use alphanumeric characters.`);
      }

      if(!validator.isEmail(input.email)) {
        throw new GraphQLError(`Not a valid email.`);
      }

      if(!validator.isAlpha(input.firstname)) {
        throw new GraphQLError(`First name can only have alphabetic characters.`);
      }

      if(!validator.isLength(input.firstname, {min: 2, max: 50})) {
        throw new GraphQLError(`First name must be between 2 and 50 characters.`);
      }

      if(!validator.isAlpha(input.lastname)) {
        throw new GraphQLError(`Last name can only have alphabetic characters.`);
      }

      if(!validator.isLength(input.lastname, {min: 2, max: 50})) {
        throw new GraphQLError(`Last name must be between 2 and 50 characters.`);
      }

      let passwordStrength = strength(input.password);
      if(passwordStrength < 2) {
        throw new GraphQLError(`Password is too weak (${passwordStrength} < 2).`);
      }

      let emailCheck = await t('users').where({email: input.email}).count('*');
      for(let prop in emailCheck[0]) {
        if(emailCheck[0][prop] > 0) {
          throw new GraphQLError(`There is already a user registered with that email.`);
        }
        break;
      }

      let nameCheck  = await t('users').where({name: input.name}).count('*');
      for(let prop in nameCheck[0]) {
        if(nameCheck[0][prop] > 0) {
          throw new GraphQLError(`There is already a user registered with that name.`);
        }
        break;
      }

      let administrableId = await Util.createAdministrable({
        userId:                   context.user_id,
        parentAdministrableId:    input.parentAdministrableId,
        nameTranslations:         Util.inAllLanguages(input.name),
        requiredActionsOnParent:  ['createUser']
      }, t);

      await t('users').insert({
        name:               input.name,
        administrable_id:   administrableId,
        email:              input.email,
        firstname:          formatName(input.firstname),
        lastname:           formatName(input.lastname),
        verification_code:  getGeneratedVerificationCode(48),
        is_verified:        false
      });

      insertId = await Util.getInsertId(t);

      await t('logins').insert({
        user_id: insertId,
        hash:    passwordHash.generate(input.password)
      });

      // TODO: Skicka email med verification_code
    });
    return `${usersTable}.id = ${insertId}`;
  },
  resolve: (parent, args, context, resolveInfo) => {
    return joinMonster(resolveInfo, {}, sql => {
      return db.call(sql);
    }, { dialect: "mysql", minify: "true" })
  }
}

export default CreateUser;
