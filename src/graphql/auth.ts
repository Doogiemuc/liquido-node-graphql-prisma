/**
 * Authenticate users via JsonWebTokens (JWT)
 */

// adapted from https://the-guild.dev/graphql/yoga-server/tutorial/advanced/01-authentication

import { Prisma, PrismaClient } from '@prisma/client'
import { JwtPayload, verify } from 'jsonwebtoken'
import jsonwebtoken from 'jsonwebtoken'
import config from '../config'

/** Login with email and password */
export default {
	
	createJWT: async function createJWT(admin : Prisma.LiquidoUserCreateInput): Promise<String> {
		return jsonwebtoken.sign({
			name: admin.name,
			email: admin.email,
			mobilephone: admin.mobilephone,
			//TODO: add team.id ?
		},
		config.liquido.jwtSecret,
		{ 
			expiresIn: Math.floor(Date.now() / 1000) + (60 * 60),
			audience: "liquido-users",
			issuer: "LIQUIDO",
			subject: admin.email
		})
	},

	login: async function login(emai: string, password: string) {
		console.log("Login "+emai)

	},

	authenticateUser: async function authenticateUser(
		prisma: PrismaClient,
		request: Request
	) {
		const header = request.headers.get('authorization')
		if (header !== null) {
			const token = header.split(' ')[1]  // "Bearer eyA35fdD..."
			const tokenPayload = verify(token, config.liquido.jwt.secret) as JwtPayload
			const userId = tokenPayload.userId
			return await prisma.liquidoUser.findUnique({ where: { id: userId } })
		}
		return null  // not logged in
	}
}