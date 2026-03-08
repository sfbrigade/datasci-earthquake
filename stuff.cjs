const cacache = require('cacache')

cacache.ls('/home/node/.npm/_cacache').then((value) => {
  console.log('town funk...')
  console.log(typeof value)
})

