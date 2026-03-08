const cacache = require('cacache')

function replacer(key, value) {
  console.log(key)
}

cacache.ls('/home/node/.npm/_cacache').then((value) => {
  JSON.stringify(value, replacer)
})

