const fs = require('fs')
const drawLine = require('./lib').default

const featureCollection = {
  type: 'FeatureCollection',
  features: []
}

// const australia = JSON.parse(fs.readFileSync('./featureCollections/australiaBetter.json', 'utf8'))
// australia.features = [australia.features[29]]
//
// console.time('total')
// australia.features.forEach((feature, i) => {
//   const data = drawLine(feature.geometry.coordinates[0], { width: 0.5, join: 'round', cap: 'round' })
//   const { vertices, indices } = data
// })
// console.timeEnd('total')

// const data = drawLine([[-1, 1], [-1, -1], [1, -1], [1, 1]], { width: 0.5, join: 'bevel', cap: 'butt' })
// const data = drawLine([[-1, 0], [0, 0], [1, 0], [2, 0]], { width: 0.5, join: 'bevel', cap: 'butt' })
// const data = drawLine([[0, -1], [0, 0], [0, 1], [0, 2], [1, 3], [2, 4]], { width: 0.5, join: 'bevel' })
// const data = drawLine([[1, -1], [1, 1], [-1, 1], [-1, -1]], { width: 0.5, join: 'bevel', cap: 'butt' })

// const data = drawLine([[0, 1], [3, 1], [1, 0], [3, 0], [4, -6]], { width: 0.5, join: 'bevel', cap: 'butt' })
// const data = drawLine([[-2, 0], [-1, 1], [0, 0], [1, 1], [2, 0]], { width: 0.5, join: 'bevel', cap: 'butt' })
// const data = drawLine([[-2, 0], [-1, 1], [0, 0]], { width: 0.5, join: 'bevel', cap: 'butt' })

// const data = drawLine([[-1, 0], [-0.9, 0]], { width: 0.5, join: 'bevel', cap: 'butt' })




const data = drawLine([[-1, 1], [-1, -1], [1, -1], [1, 1], [-1, 1]], { width: 0.5, join: 'round', cap: 'round' })
// const data = drawLine([[-1, 0], [0, 0], [1, 0], [2, 0]], { width: 0.5, join: 'round', cap: 'round' })
// SQUARE END CAP FAILING
// const data = drawLine([[0, -1], [0, 0], [0, 1], [0, 2], [1, 3], [2, 4]], { width: 0.5, join: 'round', cap: 'round' })
// const data = drawLine([[1, -1], [1, 1], [-1, 1], [-1, -1]], { width: 0.5, join: 'round', cap: 'round' })
// ROUND END CAP FAILING
// const data = drawLine([[0, 1], [3, 1], [1, 0], [3, 0], [4, -6]], { width: 0.5, join: 'round', cap: 'round' })
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
const { vertices, indices } = data


// console.time('line')
// const data = drawLine(australia.features[0].geometry.coordinates[0], { width: 0.1, join: 'bevel', cap: 'butt' })
// const { vertices, indices } = data
// console.timeEnd('line')

// console.log(data)

for (let i = 0, il = indices.length; i < il; i += 3) {
  if (!vertices[indices[i] * 2]) continue
  if (!vertices[indices[i] * 2 + 1]) continue
  if (!vertices[indices[i + 1] * 2]) continue
  if (!vertices[indices[i + 1] * 2 + 1]) continue
  if (!vertices[indices[i + 2] * 2]) continue
  if (!vertices[indices[i + 2] * 2 + 1]) continue
  const feature = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [vertices[indices[i] * 2], vertices[indices[i] * 2 + 1]],
        [vertices[indices[i + 1] * 2], vertices[indices[i + 1] * 2 + 1]],
        [vertices[indices[i + 2] * 2], vertices[indices[i + 2] * 2 + 1]],
        [vertices[indices[i] * 2], vertices[indices[i] * 2 + 1]]
      ]]
    }
  }

  featureCollection.features.push(feature)
}

fs.writeFileSync('./out.json', JSON.stringify(featureCollection, null, 2))
