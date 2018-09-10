const redis = require('redis');
const {promisify} = require('util')

module.exports = {
	mounted (application, options) {
		const client = redis.createClient(options)
		client.on('connect', () => { console.log('redis connected') })
		const clientProxy = new Proxy(client, {
			get (target, prop) {
				if(target[prop]) {
					return promisify(target[prop]).bind(target);
				} else {
					throw new Error(`redis proxy can not find the method ${prop}`)
				}
			}
		})
		Object.defineProperties(application, {
			'_redis': { "get": () => { return clientProxy } }
		})
	}
}