### Redis
[application._redis]

### install 
```
npm i coils-redis -S
```

### Usage

Coils application constructor
```
let CoilsRedis = require('coils-redis')
this.use(CoilsRedis, options)
```
- [options](https://github.com/NodeRedis/node_redis#options-object-properties)

default use db: `1`

