import { createSchema, createYoga, createGraphQLError } from 'graphql-yoga'
import { GraphQLError } from 'graphql'
import { createServer } from 'http'
import { typeDefs } from './graphql/liquido_graphql_schema'
import { ContextIF, createContext } from './graphql/graphql_context'
import { Prisma } from '@prisma/client'
import auth from './graphql/auth'

import type { Team } from '@prisma/client'

const resolvers = {
  Query: {
		team: async (
      parent: unknown,
      args: { id: string },
			context: ContextIF
    ) => {
      return context.prisma.team.findUnique({
        where: { id: args.id },
      })
    },

		login: async(
			parent: unknown,
			args: { email: string, password: string },
			context: ContextIF
		) => {
			return auth.login(args.email, args.password)
		}
  },
 
	Team: {
		// select all members (and admins) of a team
		members: async (
			parent: Team,
			args: any,
			context: ContextIF
		) => {
			console.log("Fetching members and admins of team")
			let result = await context.prisma.teamMembers.findMany({
				where: { teamId: parent.id },
				include: {
					user: true
				}	
			})
			return result
		},

		//TODO: query for admins => only reeturn admins
	},

  Mutation: {
		createNewTeam: async (
      parent: unknown,
      args: { teamName: string, admin: Prisma.LiquidoUserCreateInput },
			context: ContextIF
    ) => {
			// Check that no user with same email exists.
			const existingUsers = await context.prisma.liquidoUser.findMany({ where: { 
				OR: [
					{ email: args.admin.email },
					{ mobilephone: args.admin.mobilephone }
				]
			}})

			/* this would be the syntax with the MongoDB nodeJS driver natively  => not simpler. Prism is fine.
			const mongoFindResult = await mongoUserCollection.find({
				$or: [
					{ email: args.admin.email },
					{ mobilephone: args.admin.mobilephone }
				],
				// could at options with sorting, projections here ...
			})
			*/
			
			if (existingUsers.length > 0) throw createGraphQLError(`A user with that email or mobilephone already exists.`, {
				extensions: {
					liquidoError: 'USER_ALREADY_EXISTS',
					liquidoErrorCode: 412
				}
			})

			// Check input parameters
			if (!args.admin.email) createGraphQLError("Need email!")
			args.admin.email = args.admin.email.toLocaleLowerCase()  // emails are caseINsensitive!

			// Create new user
			args.admin.lastLogin = new Date()
			let admin = await context.prisma.liquidoUser.create({
				data: args.admin
			})
			console.log("Create new admin for new team: ", JSON.stringify(admin))
			
			// Create the new team and connect to new admin
			// https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#connect-an-existing-record
      const newTeam = await context.prisma.team.create({
				data: {
					teamName: args.teamName,
					inviteCode: createDigits(6),
					members: {
						create: {
							user: {
								connect: { id: admin.id }
							}
						}
					}
				},
				// Include deeply neested relation to connected "admin" in returned value
				// https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#include-deeply-nested-relations
				// https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#nested-reads=
				include: {
					members: {
						include: {
							user: true
						}
					}
				}
			})

			// Create Json Web Token to authenticate future request of client app
			const jwt = auth.createJWT(admin)

			// Return team, user and jwt to GraphQL client
			console.log("Created new team", JSON.stringify(newTeam, null, 2))
      return {
				team: newTeam,
				user: admin,
				jwt:  jwt
			}
    },

  },
 
}

//let dummyId = () => "ID_" + Math.random().toString(16).slice(2)

const SAFE_CHARS = "abcdefghkmnprstuvwxyzABCDEFGHKLMNPRSTUVWXYZ23456789"  // no i,j,l,1, o and 0 because they look so similar in many fonts
function easyID(len: number): string {
	let pos = 0;
	let res = ""
	for (let i = 0; i < len; i++) {
		pos = Math.floor(Math.random()*SAFE_CHARS.length)
		res += SAFE_CHARS[pos]
	}
	return res
}

function createDigits(len: number): string {
	return Math.floor(Math.pow(10, len-1) + Math.random() *   Math.pow(10, len)) + ""
}

const yoga = createYoga({
  //graphqlEndpoint: '/',
  schema: createSchema({
		typeDefs: typeDefs,
		resolvers: resolvers,
	}),
	context: createContext
})

const server = createServer(yoga)

const PORT = 4000
server.listen(PORT, () => {
  console.log(`\
 🚀 Liquido Server ready at: http://127.0.0.1:${PORT}
  `)
})
