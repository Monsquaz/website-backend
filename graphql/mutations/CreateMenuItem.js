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
import Menu from '../Menu';
import joinMonster from 'join-monster';
import db from '../../db';
import validator from 'validator';

const CreateMenuItem = {
  type: Menu,
  args: {
    input: {
      type: new GraphQLInputObjectType({
        description: '',
        name: 'CreateMenuItemInput',
        fields: () => ({
          menuId:  { type: new GraphQLNonNull(GraphQLInt) },
          index:   { type: GraphQLInt },
          page_id: { type: GraphQLInt },
          title:   {type: new GraphQLList(TranslationInput)}
        })
      })
    }
  },
  where: async (menuItemsTable, args, { userId }) => {
    let insertId;
    await db.knex.transaction(async (t) => {
      let input = args.input;
      if(!input) throw new GraphQLError('No input supplied');

      let titleTranslatableId = await Util.createTranslatable(input.title || [], t);

      await Util.existanceAndActionChecks(
        userId, [
          {
            tableName:  'menus',
            entityName: 'Menu',
            id:         input.menuId,
            actions:    ['edit']
          },
          {
            tableName:  'pages',
            entityName: 'Page',
            id:         input.pageId,
            actions:    ['read']
          },
      ], t);

      let index;
      if(input.index) {
        let orderings = await t('menu_items').where({menu_id: input.menuId}).select('id','index');
        let previous = null;
        let operations = [];
        let addition = 0;
        let max = 0;
        for(let ordering of orderings) {
          ordering.index += addition;
          if(previous && previous.index == ordering.index) {
            addition++;
            ordering.index++;
            operations.push(
              t('menu_items').update({index: ordering.index}).where({id: ordering.id})
            )
          }
          if(ordering.index > max) {
            max = ordering.index;
          }
          previous = ordering;
        }
        if(input.index > max) {
          index = max+1;
        }
        await Promise.all(operations);
      } else {
        let maxResult = await t('menu_items').where({menu_id: input.menuId}).max('index');
        console.warn('maxResult!', maxResult);
        index = maxResult+1; // TODO: Check structure! Might come as array
      }

      await t('menus_items').insert({
        title_translatable_id: titleTranslatableId,
        menu_id: input.menuId,
        index,
        page_id: input.pageId
      });

      insertId = await Util.getInsertId(t);

    });
    return `${menuItemsTable}.id = ${insertId}`;
  },
  resolve: (parent, args, context, resolveInfo) => {
    return joinMonster(resolveInfo, {}, sql => {
      return db.call(sql);
    }, { dialect: "mysql", minify: "true" })
  }
}

export default CreateMenuItem;
