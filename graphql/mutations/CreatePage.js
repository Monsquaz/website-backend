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
import Page from '../Page';
import joinMonster from 'join-monster';
import db from '../../db';

const CreatePage = {
  type: Page,
  args: {
    input: {
      type: new GraphQLInputObjectType({
        description: '',
        name: 'CreatePageInput',
        fields: () => ({
          categoryId:               {type: GraphQLInt},
          slug:                     {type: new GraphQLList(TranslationInput)},
          title:                    {type: new GraphQLList(TranslationInput)},
          publishDate:              {type: new GraphQLNonNull(GraphQLString)},
          unpublishDate:            {type: GraphQLString},
          canonicalPageId:          {type: GraphQLInt},
          content:                  {type: new GraphQLList(TranslationInput)},
          comments:                 {type: GraphQLBoolean},
          layoutViewId:             {type: new GraphQLNonNull(GraphQLInt)},
          typeViewId:               {type: new GraphQLNonNull(GraphQLInt)},
          parentAdministrableId:    {type: GraphQLInt},
          tags:                     {type: new GraphQLList(GraphQLString)}
        })
      })
    }
  },
  where: async (pagesTable, args, context) => {
    let insert_id;
    await db.knex.transaction(async (t) => {
      let input = args.input;
      if(!input) throw new GraphQLError('No input supplied');
      // Kolla om användaren har generell rätt att skapa sidor
      // Skapa upp translatables för slug och title.
      // Validera att slugens översättningar är unika i förhållande till andra sidor
      // Om användaren inte skapat någon slug, men väl en title, slugifiera titlen och använd som slug.
      // Om även title saknas, skapa något generiskt utifrån men unikt. t.ex. en tidsstämpel
      // Skapa translations och mappa till translatables.
      // Om användaren skickat in canonicalPageId, kolla så att den finns.
      //  Kolla även att användaren har rätt att editera canonicalPage-sidan
      // Om användaren matat in en layoutViewId, kolla så att den finns.
      // Om användaren matat in en typeViewId, kolla så att den finns.

      // ------ Administrable-hantering ------
      // EVENTUELLT - Kräv parentAdministrableId, och kräv action "createPages" på denna! Så att vi inte möjliggör för rörig struktur
      // Om användaren matat in en parentAdministrableId, kolla så att den finns.
      //   Kolla även att användaren har rätt att skapa sidor under denna administrable
      // Skapa administrable för den här sidan. Sätt namnet utifrån title.
      // Skapa administrables_administrables-självreferens.
      // Om parentAdministrableId angetts, lägg till noden även där i administrables_administrables

      // Skapa alla taggar som inte redan är skapade
      // Lägg till kopplade taggar
      // Skapa sidan! Sätt author till aktuell användare
      // Kolla vad id:t var och sätt i insert_id
    });
    return `${pagesTable}.id = ${insert_id}`;
  },
  resolve: (parent, args, context, resolveInfo) => {
    return joinMonster(resolveInfo, {}, sql => {
      return db.call(sql);
    }, { dialect: "mysql", minify: "true" })
  }
}

export default CreatePage;
