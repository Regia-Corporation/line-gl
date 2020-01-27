const fs = require('fs')
const drawLine = require('./lib').default

const featureCollection = {
  type: 'FeatureCollection',
  features: []
}

console.time('line')

// const featureCollectionInput = JSON.parse(fs.readFileSync('./featureCollections/australiaBetter.json', 'utf8'))
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
// TO FIX: SQAURE CAPS
// const data = drawLine([[1, -1], [1, 1], [-1, 1], [-1, -1]], { width: 0.5, join: 'bevel', cap: 'square' })

// const data = drawLine([[0, 1], [3, 1], [1, 0], [3, 0], [4, -6]], { width: 0.5, join: 'bevel', cap: 'square' })
// const data = drawLine([[-2, 0], [-1, 1], [0, 0], [1, 1], [2, 0]], { width: 0.5, join: 'bevel', cap: 'butt' })
// const data = drawLine([[-2, 0], [-1, 1], [0, 0]], { width: 0.5, join: 'bevel', cap: 'butt' })

// const data = drawLine([[-1, 0], [-0.9, 0]], { width: 0.5, join: 'bevel', cap: 'square' })




// const data = drawLine([[0, 1], [-1, 1], [-1, -1], [1, -1], [1, 1], [0, 1]], { width: 0.5, join: 'bevel', cap: 'butt' })
// const data = drawLine([[-1, 0], [0, 0], [1, 0], [2, 0]], { width: 0.5, join: 'round', cap: 'round' })
// const data = drawLine([[0, -1], [0, 0], [0, 1], [0, 2], [1, 3], [2, 4]], { width: 0.5, join: 'round', cap: 'round' })
// const data = drawLine([[1, -1], [1, 1], [-1, 1], [-1, -1]], { width: 0.5, join: 'round', cap: 'round' })
// TO FIX:
// const data = drawLine([[1, -1], [1, 1], [-1, 1], [-1, -1]], { width: 0.5, join: 'bevel', cap: 'butt' })
const data = drawLine([[0, 1], [3, 1], [1, 0], [3, 0], [4, -6]], { join: 'round', cap: 'square' })
// const data = drawLine([[-2, 0], [-1, 1], [0, 0], [1, 1], [2, 0]], { width: 0.5, join: 'round', cap: 'round' })
// const data = drawLine([[-2, 0], [-1, 1], [0, 0]], { width: 0.5, join: 'round', cap: 'round' })


// const data = drawLine([[0, 0], [-1, 0]], { width: 0.5, join: 'round', cap: 'square' })
// const data = drawLine([[0, 0], [1, 0]], { width: 0.5, join: 'round', cap: 'square' })
// const data = drawLine([[0, 0], [0, -1]], { width: 0.5, join: 'round', cap: 'square' })
// const data = drawLine([[0, 0], [0, 1]], { width: 0.5, join: 'round', cap: 'square' })
// const data = drawLine([[0, 0], [1, 1]], { width: 0.5, join: 'round', cap: 'square' })
// const data = drawLine([[0, 0], [-1, -1]], { width: 0.5, join: 'round', cap: 'square' })
// const data = drawLine([[0, 0], [-1, 1]], { width: 0.5, join: 'round', cap: 'square' })
// const data = drawLine([[0, 0], [1, -1]], { width: 0.5, join: 'round', cap: 'square' })
// const { vertices, indices } = data


// const data = drawLine(featureCollectionInput.features[0].geometry.coordinates[0], { join: 'bevel', cap: 'butt' })
const { vertices, normals, indices } = data
// console.log('vertices', vertices)
// console.log('normals', normals)
// console.log('indices', indices)
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

  const orient = orientation(feature)
  feature.properties.orient = orient
  if (orient === 1) console.log('CW')
  // else console.log('OK')

  featureCollection.features.push(feature)
}

function orientation (feature) {
  const [p1, p2, p3] = feature.geometry.coordinates[0]
  const val = (p2[1] - p1[1]) * (p3[0] - p2[0]) - (p2[0] - p1[0]) * (p3[1] - p2[1])

  if (val === 0) return 0 // colinear
  return (val > 0) ? 1 : 2 // clock or counterclock wise
}

fs.writeFileSync('./out.json', JSON.stringify(featureCollection, null, 2))
