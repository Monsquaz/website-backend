import path from 'path';
import Koa from 'koa';
import KoaRouter from 'koa-router';
import graphqlHTTP from 'koa-graphql';
// module we created that lets you serve a custom build of GraphiQL
import graphiql from 'koa-custom-graphiql';
import koaStatic from 'koa-static';
import koaConvert from 'koa-convert';
import koaCors from 'kcors';
import db from './db';
import schema from './graphql/index';
import jwt from 'jsonwebtoken';
import {jwtSecret} from './config';

const app = new Koa
const router = new KoaRouter

app.use(koaConvert(koaCors()))

router.get('/graphql', graphiql(() => ({
  css: '/graphiql.css',
  js: '/graphiql.js'
})))

router.get('/graphql-relay', graphiql({
  url: '/graphql-relay',
  css: '/graphiql.css',
  js: '/graphiql.js'
}))


router.post('/graphql', koaConvert(graphqlHTTP( (request) => {
  let context = {};
  if('x-auth-token' in request.header) {
    let token = request.header['x-auth-token'];
    try {
      var decoded = jwt.verify(token, jwtSecret);
      context = decoded;
    } catch(err) {
      console.warn('Invalid token');
    }
  }
  return {
    schema: schema,
    context,
    formatError: e => {
      console.error(e)
      return e
    }
  };
})))
/*
router.post('/graphql-relay', koaConvert(graphqlHTTP({
  schema: schemaRelay,
  formatError: e => {
    console.error(e)
    return e
  }
})))
*/

router.redirect('/', '/graphql')

app.use(router.routes())
app.use(router.allowedMethods())
// serve the custom build of GraphiQL
app.use(koaStatic(path.join(__dirname, 'node_modules/graphsiql')))

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`server listening at http://monsquaz.org:${port}/graphql && http://monsquaz.org:${port}/graphql-relay`))
