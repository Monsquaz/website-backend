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
import assignUserAction from './mutations/AssignUserAction';
import dissociateUserAction from './mutations/DissociateUserAction';
import assignUsergroup from './mutations/AssignUsergroup';
import dissociateUsergroup from './mutations/DissociateUsergroup';
import dissociateUsergroupAction from './mutations/DissociateUsergroupAction';
import assignUsergroupAction from './mutations/AssignUsergroupAction';
import createMenu from './mutations/CreateMenu';
import updateMenu from './mutations/UpdateMenu';
import deleteMenu from './mutations/DeleteMenu';
import createMenuItem from './mutations/CreateMenuItem';
import updateMenuItem from './mutations/UpdateMenuItem';
import deleteMenuItem from './mutations/DeleteMenuItem';
import createUsergroup from './mutations/CreateUsergroup';
import updateUsergroup from './mutations/UpdateUsergroup';
import deleteUsergroup from './mutations/DeleteUsergroup';
import createCategory from './mutations/CreateCategory';
import updateCategory from './mutations/UpdateCategory';
import deleteCategory from './mutations/DeleteCategory';
import forgotPassword from './mutations/ForgotPassword';
import createEventlistener from './mutations/CreateEventlistener';
import updateEventlistener from './mutations/UpdateEventlistener';
import deleteEventlistener from './mutations/DeleteEventlistener';
import createMessageType from './mutations/CreateMessageType';
import updateMessageType from './mutations/UpdateMessageType';
import deleteMessageType from './mutations/DeleteMessageType';
import createMessage from './mutations/CreateMessage';
import updateMessage from './mutations/UpdateMessage';
import deleteMessage from './mutations/DeleteMessage';

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
    deleteView,
    assignUserAction,
    dissociateUserAction,
    assignUsergroup,
    dissociateUsergroup,
    dissociateUsergroupAction,
    assignUsergroupAction,
    createMenu,
    updateMenu,
    deleteMenu,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    createUsergroup,
    updateUsergroup,
    deleteUsergroup,
    createCategory,
    updateCategory,
    deleteCategory,
    forgotPassword,
    createEventlistener,
    updateEventlistener,
    deleteEventlistener,
    createMessageType,
    updateMessageType,
    deleteMessageType,
    createMessage,
    updateMessage,
    deleteMessage

    /*
    updateTag
    oauthLogin
    */
  })
});
