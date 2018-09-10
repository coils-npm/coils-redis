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

describe("test setnx", function () {
	it("setnx, should success", async () => {
		await application._redis.del('setnx')
		let value = await application._redis.setnx('setnx', 'world')
		assert( value === 1, 'set fail')
		value = await application._redis.setnx('setnx', 'world')
		assert( value === 0, 'set fail')
	})
})

describe("test withLock", function () {
	it("lockWithKey, should success", async () => {
		let i = 0
		await application._redis.lockWithKey('auto-key-test', async () => {
			i++
			console.log(1)
			await application._redis.set('hello', 'world')
			i++
			console.log(2)
			let value = await application._redis.get('hello')
			i++
			console.log(3)
		})
		i++
		console.log(4, i)
		assert( i === 4, 'lockWithKey fail')
	})
})