const cacache = require('cacache')

cacache.ls('/home/node/.npm/_cacache').then((value) => {
  for (const [key, v] of Object.entries(value)) {
    cacache.get('/home/node/.npm/_cacache', key).then((obj) => {
      cacache.put('/app/drinksonyou', key, obj.data).then(integrity => {
        cacache.get.info('/app/drinksonyou', key).then((o) => {
          console.log(o)
        })
      })
    })
  }
}).then(doThis)

