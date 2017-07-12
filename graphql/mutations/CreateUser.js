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

const CreateUser = {
  type: User,
  args: {
    input: {
      type: new GraphQLInputObjectType({
        description: '',
        name: 'CreateUserInput',
        fields: () => ({
          name:                  {type: GraphQLString},
          email:                 {type: GraphQLString},
          firstname:             {type: GraphQLString},
          lastname:              {type: GraphQLString},
          password:              {type: GraphQLString},
          parentAdministrableId: {type: GraphQLInt}
        })
      })
    }
  },
  where: async (pagesTable, args, context) => {
    let insert_id;
    await db.knex.transaction(async (t) => {
      let input = args.input;
      if(!input) throw new GraphQLError('No input supplied');
      // Validera alla fält
      // Kolla så att inte email eller name är upptagna.

      // ------ Administrable-hantering ------
      // EVENTUELLT - Kräv parentAdministrableId, och kräv action "createUsers" på denna! Så att vi inte möjliggör för rörig struktur
      // Om användaren matat in en parentAdministrableId, kolla så att den finns.
      //   Kolla även att användaren har rätt att skapa sidor under denna administrable
      // Skapa administrable för den här sidan. Sätt namnet utifrån title.
      // Skapa administrables_administrables-självreferens.
      // Om parentAdministrableId angetts, lägg till noden även där i administrables_administrables

      // Skapa användaren - sätt is_verified till false och generera verification_code
      // Skapa login
      // Skicka email mer verification_code
    });
    return `${usersTable}.id = ${insert_id}`;
  },
  resolve: (parent, args, context, resolveInfo) => {
    return joinMonster(resolveInfo, {}, sql => {
      return db.call(sql);
    }, { dialect: "mysql", minify: "true" })
  }
}

export default CreateUser;
