/**
 * GraphQL context is injected into every query and resolver function.
 * Here we add the reference to the (generated) Prisma client to it,
 * so that every mutation can do DB operations.
 * 
 * And the graphQL context contains the information wether the request 
 * is authenticated with a JWT, ie. if the current user is logged in.
 */

import { PrismaClient, LiquidoUser } from '@prisma/client'
import { YogaInitialContext } from 'graphql-yoga'
import auth from './auth'
import config from '../config'

console.log("Connecting to DB ... creating PrismaClient", config.liquido.dbUrl)
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.liquido.dbUrl,
    },
  },
})

//TODO: sanity check db connection

export interface ContextIF {
  prisma: PrismaClient,
	currentUser: null | LiquidoUser
}

// This is called for every GraphQl request
export async function createContext(
	initialContext: YogaInitialContext
): Promise<ContextIF> {
	console.log("createContext for GraphQL query:\n", initialContext?.params?.query)
	return {
		prisma: prisma,
		currentUser: await auth.authenticateUser(prisma, initialContext.request)
	}
}