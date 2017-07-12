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


const UpdatePage = {
  type: Page,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    input: {
      type: new GraphQLInputObjectType({
        description: '',
        name: 'UpdatePageInput',
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
      // Kolla om användaren har rätt att editera sidan
      // Skapa upp translatables för slug och title OM detta inte finns sedan tidigare.
      // Validera att slugens översättningar är unika i förhållande till andra sidor
      // FUNDERING: Om slug ändras, hur sparar vi undan den gamla slugen så att vi kan redirecta?
      // Om användaren inte skapat någon slug (varken nu eller tidigare), men väl en title, slugifiera titlen och använd som slug.
      // Om även title saknas, skapa något generiskt utifrån men unikt. t.ex. en tidsstämpel
      // Skapa/uppdatera translations och mappa till translatables.
      // Om användaren skickat in canonicalPageId, kolla så att den finns.
      //  Kolla även att användaren har rätt att editera canonicalPage-sidan
      // Om användaren matat in en layoutViewId, kolla så att den finns.
      // Om användaren matat in en typeViewId, kolla så att den finns.
      // Om användaren matat in en NY parentAdministrableId, kolla så att den finns.
      //   Kolla även att användaren har rätt att skapa sidor under denna administrable
      //   Om parentAdministrableId ändrats,
      //     kräv att användaren har "move" på den befintliga administrable:n
      //     ta bort befintliga kopplingar och lägg till noden även där i administrables_administrables
      // Skapa alla taggar som inte redan är skapade
      // Lägg till kopplade taggar som inte redan är kopplade
      // Uppdatera sidan!
    });
    return db.knex.raw(`${pagesTable}.id = ?`, [args.id]).toString();
  },
  resolve: (parent, args, context, resolveInfo) => {
    return joinMonster(resolveInfo, {}, sql => {
      return db.call(sql);
    }, { dialect: "mysql", minify: "true" })
  }
}

export default UpdatePage;
