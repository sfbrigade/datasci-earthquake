const cacache = require('cacache')

function doThis() {
  console.log('all done...')

  cacache.ls('/app/drinksonyou').then(console.log)
}


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

