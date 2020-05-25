const fs = require('fs')

const featureCollection = {
  type: 'FeatureCollection',
  features: []
}

// const featureCollectionInput = JSON.parse(fs.readFileSync('./featureCollections/holesTest.json', 'utf8'))
// const data = drawLine([[0, -1], [0, 0], [0, 1], [0, 2], [1, 3], [2, 4]], { join: 'round', cap: 'round' })
const data = drawLine([[0, 1], [3, 1], [1, 0], [3, 0], [4, -6]], { join: 'bevel', cap: 'butt', dashed: true })

console.time('line')
const { prev, curr, next, lineLength } = data
// featureCollectionInput.features[0].geometry.coordinates.forEach(poly => {
//   for (const line of poly) drawLine(line)
// })
console.timeEnd('line')

console.log('prev', prev)
console.log('curr', curr)
console.log('next', next)
console.log('lineLength', lineLength)
// console.log('vertices.length', vertices.length)
const width = 0.05

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

// for (let i = 0, il = indices.length; i < il; i += 3) {
//   const feature = {
//     type: 'Feature',
//     properties: {},
//     geometry: {
//       type: 'Polygon',
//       coordinates: [[
//         [vertices[indices[i] * 2] + width * normals[indices[i] * 2], vertices[indices[i] * 2 + 1] + width * normals[indices[i] * 2 + 1]],
//         [vertices[indices[i + 1] * 2] + width * normals[indices[i + 1] * 2], vertices[indices[i + 1] * 2 + 1] + width * normals[indices[i + 1] * 2 + 1]],
//         [vertices[indices[i + 2] * 2] + width * normals[indices[i + 2] * 2], vertices[indices[i + 2] * 2 + 1] + width * normals[indices[i + 2] * 2 + 1]],
//         [vertices[indices[i] * 2] + width * normals[indices[i] * 2], vertices[indices[i] * 2 + 1] + width * normals[indices[i] * 2 + 1]]
//       ]]
//     }
//   }
//
//   featureCollection.features.push(feature)
// }
//
// fs.writeFileSync('./out.json', JSON.stringify(featureCollection, null, 2))


// const quad1 = [[-1, -1], [1, -1], [1, 1]]
// const quad2 = [[-1, -1], [1, 1], [-1, 1]]

// BETTER
// const quad1 = [[-1, -1], [-1, -1], [1, 1]]
// const quad2 = [[-1, -1], [1, 1], [1, 1]]

// BEST
const quad1 = [-1, -1, 1] // [multiplier, curr], [multiplier, next], [multiplier, next]
const quad2 = [-1, 1, 1] // [multiplier, curr], [multiplier, next], [multiplier, curr]

for (let i = 0, pl = curr.length; i < pl; i += 2) {
  // grab the variables
  const currX = curr[i]
  const currY = curr[i + 1]
  const nextX = next[i]
  const nextY = next[i + 1]
  const prevX = prev[i]
  const prevY = prev[i + 1]

  // step 1: find the normal
  let dx = nextX - currX
  let dy = nextY - currY
  let mag = Math.sqrt(dx * dx + dy * dy)
  let currNormal = [-dy / mag, dx / mag]

  // step 2: draw the quad
  let feature = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [currX + width * currNormal[0] * -1, currY + width * currNormal[1] * -1],
        [nextX + width * currNormal[0] * -1, nextY + width * currNormal[1] * -1],
        [nextX + width * currNormal[0] * 1, nextY + width * currNormal[1] * 1],
        [currX + width * currNormal[0] * -1, currY + width * currNormal[1] * -1]
      ]]
    }
  }

  featureCollection.features.push(feature)

  feature = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [currX + width * currNormal[0] * -1, currY + width * currNormal[1] * -1],
        [nextX + width * currNormal[0] * 1, nextY + width * currNormal[1] * 1],
        [currX + width * currNormal[0] * 1, currY + width * currNormal[1] * 1],
        [currX + width * currNormal[0] * -1, currY + width * currNormal[1] * -1]
      ]]
    }
  }

  featureCollection.features.push(feature)

  // find current points prev normal
  dx = currX - prevX
  dy = currY - prevY
  mag = Math.sqrt(dx * dx + dy * dy)
  let prevNormal = [-dy / mag, dx / mag]

  if (isCCW([prevX, prevY], [currX, currY], [nextX, nextY])) {
    console.log('HERE')
    prevNormal = [-prevNormal[0], -prevNormal[1]]
    currNormal = [-currNormal[0], -currNormal[1]]
  }

  if (!(currX === prevX && currY === prevY)) {
    feature = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [currX, currY],
          [currX + width * currNormal[0] * 1, currY + width * currNormal[1] * 1],
          [currX + width * prevNormal[0] * 1, currY + width * prevNormal[1] * 1],
          [currX, currY]
        ]]
      }
    }

    featureCollection.features.push(feature)
  }
}

fs.writeFileSync('./out.json', JSON.stringify(featureCollection, null, 2))

function drawLine (line, opts) {
  const ll = line.length - 1
  if (line.length < 2) return { prev: [], curr: [], next: [], lineLength: [] }
  opts = { dashed: false, ...opts }
  const { dashed } = opts
  const prev = [...line[0]]
  const curr = [...line[0]]
  const next = []
  const lineLength = [0]
  let curLength = 0
  let prevPoint = line[0]

  for (let i = 1; i < ll; i++) {
    // get the next point
    const point = line[i]
    // move on if duplicate point
    if (prevPoint[0] === point[0] && prevPoint[1] === point[1]) continue
    // store the next pair
    next.push(...point)
    // store the point as the next "start"
    curr.push(...point)
    // store the previous point
    prev.push(...prevPoint)
    // build the lineLength
    if (dashed) curLength += Math.sqrt(Math.pow(point[0] - prevPoint[0], 2) + Math.pow(point[1] - prevPoint[1], 2))
    lineLength.push(curLength)
    // store the old point
    prevPoint = point
  }
  // here we actually just store 'next'
  next.push(...line[ll])

  // TODO: Store edge points

  return { prev, curr, next, lineLength }
}

function isCCW (p1, p2, p3) {
  const val = (p2[1] - p1[1]) * (p3[0] - p2[0]) - (p2[0] - p1[0]) * (p3[1] - p2[1])

  return val < 0
}
