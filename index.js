const redis = require('redis');
const {promisify} = require('util')

module.exports = {
	mounted (application, options) {
		const client = redis.createClient(options)
		client.on('connect', () => { console.log('redis connected') })
		let clientEx = Object.assign(client, {
			async lockWithKey (key, cb, {currentTry = 1, maxTry = 3, tryInterval = 1000, expire = 5000} = options = {}) {
				if (await this['setnx'](key, 'auto-lock')) {
					await this['expire'](key, expire / 1000)
					let result = null
					try {
						result = await cb()
					} catch (err) {
						throw (err)
					} finally {
						await this['del'](key)
					}
					return Promise.resolve(result)
				} else {
					return new Promise((resolve, reject) => {
						setTimeout(() => {
							if (currentTry++ > maxTry) {
								return reject(new Error('Too busy get Lock, Try Later Please!'))
							}
							return resolve(this.lockWithKey(key,cb, Object.assign(options, {currentTry})))
						}, tryInterval)
					})
				}
			}
		})
		const clientProxy = new Proxy(clientEx, {
			get (target, prop) {
				if(target[prop]) {
					if (['lockWithKey'].indexOf(prop) !== -1) {
						return target[prop]
					} else {
						return promisify(target[prop]).bind(target);
					}
				} else {
					throw new Error(`redis proxy can not find the method ${prop}`)
				}
			}
		})
		Object.defineProperties(application, {
			'_redis': { "get": () => {
				return clientProxy
			}}
		})
	}
}