const cacache = require('cacache')

cacache.ls('/home/node/.npm/_cacache').then((value) => {

  for (const [key, v] of Object.entries(value)) {
    //console.log(`my key rules: ${key}`)

    cacache.get('/home/node/.npm/_cacache', key).then((obj) => {
      cacache.put('/app/drinksonyou', key, obj.data)
      /** 
      Object.keys(obj).forEach((theKey, index) => {
        console.log(theKey)
      })
      **/
      //console.log(obj.data instanceof Buffer)
    })
  }

  //console.log(Object.entries(value))
  //const haha = 'make-fetch-happen:request-cache:https://registry.npmjs.org/memorystream/-/memorystream-0.3.1.tgz'
  //cacache.get('/home/node/.npm/_cacache', haha).then(console.log)
  //Object.keys(value).forEach((item, index) => {
    //cacache.put('/home/node/mystuff', item)
  //})
})

console.log('lets see whats inside.....')
cacache.ls('/app/drinksonyou/tmp').then(console.log)

const haha = 'make-fetch-happen:request-cache:https://registry.npmjs.org/memorystream/-/memorystream-0.3.1.tgz'
cacache.get('/app/drinksonyou', haha).then((obj) => {
  console.log('go here...')
  console.log(obj.data instanceof Buffer)
})
