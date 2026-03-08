const cacache = require('cacache')

console.log('see what happens....')
cacache.ls('/app/drinksonyou').then(console.log)

