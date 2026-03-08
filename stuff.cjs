const cacache = require('cacache')

function replacer(key, value) {
  console.log(key)
}

cacache.ls('/home/node/.npm/_cacache').then((value) => {
  // JSON.stringify(value, replacer)
  console.log(typeof value)
  /**
  for (const [key, v] of Object.entries(value)) {
    console.log(`my key: ${key}`)
    console.log(Object.entries(v))
    
    for (const [morekey, morev] of Object.entries(v)) {
      console.log(`- more key: ${morekey}`)
    }
    console.log('----------------')
  }
  **/
  //console.log(Object.entries(value))
  const haha = 'make-fetch-happen:request-cache:https://registry.npmjs.org/memorystream/-/memorystream-0.3.1.tgz'
  cacache.get('/home/node/.npm/_cacache', haha).then(console.log)
  //Object.keys(value).forEach((item, index) => {
    //cacache.put('/home/node/mystuff', item)
  //})
})

