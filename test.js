const fs = require('fs')
const drawLine = require('./lib').default

const featureCollection = {
  type: 'FeatureCollection',
  features: []
}

const featureCollectionInput = JSON.parse(fs.readFileSync('./featureCollections/holesTest.json', 'utf8'))
// australia.features = [australia.features[29]]
// console.log('australia', australia)

// console.time('total')
// australia.features.forEach((feature, i) => {
//   const data = drawLine(feature.geometry.coordinates[0], { width: 0.5, join: 'round', cap: 'round' })
//   const { vertices, indices } = data
// })
// console.timeEnd('total')

// const data = drawLine([[-1, 1], [-1, -1], [1, -1], [1, 1]], { width: 0.5, join: 'bevel', cap: 'square' })
// const data = drawLine([[-1, 0], [0, 0], [1, 0], [2, 0]], { width: 0.5, join: 'bevel', cap: 'butt' })
// const data = drawLine([[0, -1], [0, 0], [0, 1], [0, 2], [1, 3], [2, 4]], { width: 0.5, join: 'bevel' })
// const data = drawLine([[1, -1], [1, 1], [-1, 1], [-1, -1]], { width: 0.5, join: 'bevel', cap: 'square' })

// const data = drawLine([[0, 1], [3, 1], [1, 0], [3, 0], [4, -6]], { width: 0.5, join: 'bevel', cap: 'square' })
// const data = drawLine([[-2, 0], [-1, 1], [0, 0], [1, 1], [2, 0]], { width: 0.5, join: 'bevel', cap: 'butt' })
// const data = drawLine([[-2, 0], [-1, 1], [0, 0]], { width: 0.5, join: 'bevel', cap: 'butt' })

// const data = drawLine([[-1, 0], [-0.9, 0]], { width: 0.5, join: 'bevel', cap: 'square' })




// const data = drawLine([[0, 1], [-1, 1], [-1, -1], [1, -1], [1, 1], [0, 1]], { width: 0.5, join: 'bevel', cap: 'butt' })
// const data = drawLine([[-1, 0], [0, 0], [1, 0], [2, 0]], { width: 0.5, join: 'round', cap: 'round' })
// const data = drawLine([[0, -1], [0, 0], [0, 1], [0, 2], [1, 3], [2, 4]], { width: 0.5, join: 'round', cap: 'round' })
// const data = drawLine([[1, -1], [1, 1], [-1, 1], [-1, -1]], { width: 0.5, join: 'round', cap: 'round' })
const data = drawLine([[0, 1], [3, 1], [1, 0], [3, 0], [4, -6]], { join: 'round', cap: 'round' })
// const data = drawLine([[-2, 0], [-1, 1], [0, 0], [1, 1], [2, 0]], { width: 0.5, join: 'round', cap: 'round' })
// const data = drawLine([[-2, 0], [-1, 1], [0, 0]], { width: 0.5, join: 'round', cap: 'round' })


// const data = drawLine([[0, 0], [-1, 0]], { width: 0.5, join: 'round', cap: 'round' })
// const data = drawLine([[0, 0], [1, 0]], { width: 0.5, join: 'round', cap: 'round' })
// const data = drawLine([[0, 0], [0, -1]], { width: 0.5, join: 'round', cap: 'round' })
// const data = drawLine([[0, 0], [0, 1]], { width: 0.5, join: 'round', cap: 'round' })
// const data = drawLine([[0, 0], [1, 1]], { width: 0.5, join: 'round', cap: 'round' })
// const data = drawLine([[0, 0], [-1, -1]], { width: 0.5, join: 'round', cap: 'round' })
// const data = drawLine([[0, 0], [-1, 1]], { width: 0.5, join: 'round', cap: 'round' })
// const data = drawLine([[0, 0], [1, -1]], { width: 0.5, join: 'round', cap: 'round' })
// const { vertices, indices } = data


console.time('line')
// const data = drawLine(featureCollectionInput.features[0].geometry.coordinates[0], { width: 0.01, join: 'bevel', cap: 'butt' })
const { vertices, normals, indices } = data
console.timeEnd('line')

// console.log('vertices', vertices)
// console.log('normals', normals)
// console.log('indices', indices)
const width = 0.5

// console.log(data)

// for (let i = 0, il = indices.length; i < il; i += 3) {
//   const feature = {
//     type: 'Feature',
//     properties: {},
//     geometry: {
//       type: 'Polygon',
//       coordinates: [[
//         [vertices[indices[i] * 2], vertices[indices[i] * 2 + 1]],
//         [vertices[indices[i + 1] * 2], vertices[indices[i + 1] * 2 + 1]],
//         [vertices[indices[i + 2] * 2], vertices[indices[i + 2] * 2 + 1]],
//         [vertices[indices[i] * 2], vertices[indices[i] * 2 + 1]]
//       ]]
//     }
//   }
//
//   featureCollection.features.push(feature)
// }

for (let i = 0, il = indices.length; i < il; i += 3) {
  const feature = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [vertices[indices[i] * 2] + width * normals[indices[i] * 2], vertices[indices[i] * 2 + 1] + width * normals[indices[i] * 2 + 1]],
        [vertices[indices[i + 1] * 2] + width * normals[indices[i + 1] * 2], vertices[indices[i + 1] * 2 + 1] + width * normals[indices[i + 1] * 2 + 1]],
        [vertices[indices[i + 2] * 2] + width * normals[indices[i + 2] * 2], vertices[indices[i + 2] * 2 + 1] + width * normals[indices[i + 2] * 2 + 1]],
        [vertices[indices[i] * 2] + width * normals[indices[i] * 2], vertices[indices[i] * 2 + 1] + width * normals[indices[i] * 2 + 1]]
      ]]
    }
  }

  featureCollection.features.push(feature)
}

fs.writeFileSync('./out.json', JSON.stringify(featureCollection, null, 2))
