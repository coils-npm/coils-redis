let redis = require('../index')
const assert = require('assert')
let application = {}
redis.mounted(application)

describe("test base", function () {
	it("base, should success", async () => {
		await application._redis.set('hello', 'world')
		let value = await application._redis.get('hello')
		assert( value === 'world', 'set fail')
	})
})