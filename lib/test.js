const path = require('path')


const fruits = 'test1.teset2.test3'
const splitOnes = fruits.split('.')
const pathes = []
const joinedPath = []
for (var i = 0; i < splitOnes.length; i++) {
  pathes.push(splitOnes[i])
  joinedPath.push(pathes.join(path.sep))
}

console.log(joinedPath.reverse())