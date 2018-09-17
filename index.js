const redis = require('redis');
const {promisify} = require('util')

module.exports = {
	mounted (application, options = {}) {
		if (!options.db) { options.db = 1 }
		const client = redis.createClient(options)
		client.on('connect', () => { console.log('redis connected') })
		let clientEx = Object.assign(client, {
			// expire (second)
			async lockWithKey (key, cb, { expire = 5 }) {
				if (await this['setnx'](key, 'auto-lock')) {
					await this['expire'](key, expire)
					let result = null
					try {
						result = await cb()
					} catch (err) {
						throw (err)
					} finally {
						await this['del'](key)
					}
					return true
				}
				return false
			}
		})
		// proxy
		const clientProxy = new Proxy(clientEx, {
			get (target, prop) {
				if(target[prop]) {
					if (['lockWithKey'].indexOf(prop) !== -1) {
						return target[prop]
					} else {
						return promisify(target[prop]).bind(target);
					}
				}
				return target[prop]
			}
		})
		Object.defineProperties(application, {
			'_redis': { "get": () => {
				return clientProxy
			}}
		})
	}
}