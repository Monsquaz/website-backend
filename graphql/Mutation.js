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

import login from './mutations/Login';
import createPage from './mutations/CreatePage';
import updatePage from './mutations/UpdatePage';
import createUser from './mutations/CreateUser';
import updateUser from './mutations/UpdateUser';
import verifyUser from './mutations/VerifyUser';
import deleteUser from './mutations/DeleteUser';
import deletePage from './mutations/DeletePage';
import createViewType from './mutations/CreateViewType';
import updateViewType from './mutations/UpdateViewType';
import deleteViewType from './mutations/DeleteViewType';
import createView from './mutations/CreateView';
import updateView from './mutations/UpdateView';
import deleteView from './mutations/DeleteView';

export default new GraphQLObjectType({
  description: 'Global query object',
  name: 'Mutation',
  fields: () => ({
    login,
    createPage,
    updatePage,
    createUser,
    updateUser,
    verifyUser,
    deleteUser,
    deletePage,
    createViewType,
    updateViewType,
    deleteViewType,
    createView,
    updateView,
    deleteView
    /*

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
    forgotPassword
    createUsergroup
    updateUsergroup
    deleteUsergroup
    oauthLogin
    updateAdministrable
    deleteAdministrable
    assignUserAction
    dissociateUserAction
    assignUsergroup
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
    updateTag
    translationCreate
    translationUpdate
    translationDelete
    */
  })
});
