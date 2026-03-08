const cacache = require('cacache')

console.log('oh hi...')

cacache.ls('/home/node/.npm').then(console.log)

