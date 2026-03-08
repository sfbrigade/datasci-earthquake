const cacache = require('cacache')
let theKeyMaster = ""

cacache.ls('/home/node/.npm/_cacache').then((value) => {

  for (const [key, v] of Object.entries(value)) {
    console.log(`my key rules: ${key}`)

    cacache.get('/home/node/.npm/_cacache', key).then((obj) => {
      cacache.put('/app/drinksonyou', key, obj.data).then(integrity => {
        console.log('integrity hash is ', integrity)
      })
      /** 
      Object.keys(obj).forEach((theKey, index) => {
        console.log(theKey)
      })
      **/
      //console.log(obj.data instanceof Buffer)
    })
    theKeyMaster = key
  }

  //console.log(Object.entries(value))
  //const haha = 'make-fetch-happen:request-cache:https://registry.npmjs.org/memorystream/-/memorystream-0.3.1.tgz'
  //cacache.get('/home/node/.npm/_cacache', haha).then(console.log)
  //Object.keys(value).forEach((item, index) => {
    //cacache.put('/home/node/mystuff', item)
  //})
})

console.log('lets see whats inside.....')
cacache.ls('/app/drinksonyou').then(console.log)
console.log(`the key master = ${theKeyMaster}`)

cacache.get.info('/app/drinksonyou', theKeyMaster).then(console.log)
const haha = 'make-fetch-happen:request-cache:https://registry.npmjs.org/memorystream/-/memorystream-0.3.1.tgz'
const oh = 'make-fetch-happen:request-cache:https://registry.npmjs.org/nice-try/-/nice-try-1.0.5.tgz'
cacache.get('/app/drinksonyou', haha).then((obj) => {
  console.log('go here...')
  console.log(obj.data instanceof Buffer)
})
