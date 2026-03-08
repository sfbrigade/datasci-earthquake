const cacache = require('cacache')

console.log('oh hi...')

cacache.ls('/home/node/.npm/_cacache').then(console.log)

