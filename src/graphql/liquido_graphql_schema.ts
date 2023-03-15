export const typeDefs = `

"A liquido UserModel. A UserModel can be in one or more teams."
type UserModel {
	id: String!
	name: String!
	email: String! 
	mobilephone: String!
	lastLogin: Date
	website: String
	picture: String 
	createdAt: Date 
	updatedAt: Date 
}

"One Team with admins, members and polls"
type Team  {
	id: String!
	teamName: String!
	inviteCode: String 
	members: [TeamMember]! 
	polls: [Poll]
	createdAt: Date 
	updatedAt: Date 
}

type TeamMember {
	joinedAt: Date
	role: RoleEnum!
	user: UserModel
}

enum RoleEnum {
	MEMBER
	ADMIN
}

"A Poll in a team"
type Poll {
	id: String
	title: String! 
	numCompetingProposals: Int!
	proposals: [Law]
	status: PollStatus!
	numBallots: Long
	votingEndAt: LocalDateTime 
	votingStartAt: LocalDateTime 
	winner: Law
	createdAt: Date 
	updatedAt: Date 
}

"An idea, that becomes a proposal and then may be voted to become a law."
type Law {
	id: String!
	title: String! 
	description: String! 
	icon: String 
	"ELABORATION, VOTING, LAW, LOST, RETENTION, RETRACTED"
	status: LawStatus!
	"Is a proposal created by the currently logged in UserModel?"
	isCreatedByCurrentUserModel: Boolean
	"Is a proposal already liked by the currently logged in UserModel?"
	isLikedByCurrentUser: Boolean
	numComments: Int
	numSupporters: Int
	poll: Poll
	reachedQuorumAt: LocalDateTime 
	supporters: [UserModel] 
	createdBy: UserModel
	createdAt: Date 
	updatedAt: Date 
}

"Lifecycle of a proposal"
enum LawStatus {
	PROPOSAL
	ELABORATION
	VOTING
	LAW
	LOST
	RETENTION
	RETRACTED
}

"Lifecycle of a poll"
enum PollStatus {
	ELABORATION
	FINISHED
	VOTING
}

"GraphQL input parameter when a new UserModel is created (no ID field)"
input UserModelInput {
	email: String! 
	mobilephone: String!
	name: String! 
	picture: String 
	website: String 
}

"Response for createNewTeam, joinTeam and after login"
type TeamDataResponse {
	jwt: String
	team: Team
	user: UserModel
}


"GraphQL Query root - fetch a value "
type Query {

  "Request a one time password (OTP) for login"
	login(email: String!, password: String!): TeamDataResponse

	"Get one team by its ID"
	team(id: String!): Team

	"Get one poll by its ID"
	poll(id: String!): Poll

}

"GraphQL mutations - create and update"
type Mutation {
	"Create a new team"
	createNewTeam(admin: UserModelInput!, teamName: String!): TeamDataResponse
}









"Scalar representing an instant in time"
scalar Date
"Scalar representing a local date-time"
scalar LocalDateTime
"Long type"
scalar Long

#"Built-in scalar for map-like structures"
#scalar LsonScalar

`