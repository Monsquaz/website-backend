import path from 'path'
import Koa from 'koa'
import koaRouter from 'koa-router'
import graphqlHTTP from 'koa-graphql'
// module we created that lets you serve a custom build of GraphiQL
import graphiql from 'koa-custom-graphiql'
import koaStatic from 'koa-static'
import koaConvert from 'koa-convert'
import koaCors from 'koa-cors'

import schemaBasic from './schema-basic/index'
import schemaRelay from './schema-paginated/index'

const app = new Koa()
const router = koaRouter()

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

router.post('/graphql', koaConvert(graphqlHTTP({
  schema: schemaBasic,
  formatError: e => {
    console.error(e)
    return e
  }
})))

router.post('/graphql-relay', koaConvert(graphqlHTTP({
  schema: schemaRelay,
  formatError: e => {
    console.error(e)
    return e
  }
})))

router.redirect('/', '/graphql')

app.use(router.routes())
app.use(router.allowedMethods())
// serve the custom build of GraphiQL
app.use(koaConvert(koaStatic(path.join(__dirname, 'node_modules/graphsiql'))))

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`server listening at http://localhost:${port}/graphql && http://localhost:${port}/graphql-relay`))

