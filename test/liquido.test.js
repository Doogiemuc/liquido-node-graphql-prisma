const api = require('./liquido-graphql-client-for-test')

test('create new team', async () => {
	let now = Date.now()
	let teamName = "TestTeam"+now
	let admin = {
		name: "TestAdmin " + now,
		email: "TestAdmin"+now+"@liquido.vote",
		mobilephone: "+49 555 " + now
	}
	let res = await api.createNewTeam(teamName, admin)
	expect(res.status).toEqual(200)
})