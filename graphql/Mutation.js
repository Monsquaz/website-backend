import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt
} from 'graphql';

import joinMonster from 'join-monster';
import db from '../db';
import User from './User';
import Util from './Util';

import login from './mutations/Login'

export default new GraphQLObjectType({
  description: 'Global query object',
  name: 'Mutation',
  fields: () => ({
    login
    /*
    oauthLogin
    loginRefresh
    userCreate
    userUpdate
    userDelete
    pageCreate
    pageUpdate
    pageDelete
    administrableUpdate
    administrableSetParent
    administrableDelete
    actionsUserAssign
    actionsUserDissociate
    usergroupAssign
    usergroupDissociate
    actionsUsergroupAssign
    actionsUsergroupDissociate
    eventlistenerCreate
    eventlistenerUpdate
    eventlistenerDelete
    messageTypeCreate
    messageTypeUpdate
    messageTypeDelete
    messageCreate
    messageUpdate
    messageDelete
    viewTypeCreate
    viewTypeUpdate
    viewTypeDelete
    viewCreate
    viewUpdate
    viewDelete
    pageCreate
    pageUpdate
    pageDelete
    tagCreate
    tagUpdate
    tagDelete
    tagsPagesAssign
    tagsPagesDissociate
    translationCreate
    translationUpdate
    translationDelete
    menuCreate
    menuUpdate
    menuDelete
    menuItemCreate
    menuItemUpdate
    menuItemDelete
    categoryCreate
    categoryUpdate
    categoryDelete
    categorySetParent
    */
  })
});
