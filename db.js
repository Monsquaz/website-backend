import knex from 'knex'
import {environment} from './config'
import knexConfig from './knexfile'
export default knex(knexConfig[environment])