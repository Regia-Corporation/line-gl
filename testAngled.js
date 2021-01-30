const fs = require('fs')
const { drawLine } = require('./lib')

const featureCollection = {
  type: 'FeatureCollection',
  features: []
}

// const featureCollectionInput = JSON.parse(fs.readFileSync('./featureCollections/holesTest.json', 'utf8'))
// const data = drawLine([[0, -1], [0, 0], [0, 1], [0, 2], [1, 3], [2, 4]], false, 0.5)
// const data = drawLine([[-2, 0], [-1, 1], [0, 0], [1, 1], [2, 0]])
// const data = drawLine([[-2, 0], [-3, 3], [-4, 7], [-5, 10], [-6, 7]])
// const data = drawLine([[0, 0], [-1, 0]], false)
// const data = drawLine([[0, 0], [1, 0]], false)
// const data = drawLine([[0, 0], [0, -1]], false)
// const data = drawLine([[0, 0], [0, 1]], false)
// const data = drawLine([[0, 0], [1, 1], [2, 2]], false)
// const data = drawLine([[0, 0], [-1, -1], [-2, -2]], false)
// const data = drawLine([[0, 0], [-1, 1]], false)
// const data = drawLine([[0, 0], [1, -1]], false)
// const data = drawLine([[0, 1], [3, 1], [1, 0], [3, 0], [4, -6]], true)

// const data = drawLine([[0, 0], [-1, 1], [-1.5, 2], [-2, 3], [-1.5, 4]], false)
// const arr = [[0, 0], [0, -1], [-0.5, -2], [-1.5, -3], [-3, -4], [-5, -4]]
// const arr = [[0, 0], [-1, 1], [0, 2], [1, 1], [0, 0]]

const arr = [
  [
    0.8037109375,
    0.2333984375
  ],
  [
    0.8232421875,
    0.240234375
  ],
  [
    0.833984375,
    0.2421875
  ],
  [
    0.8427734375,
    0.2431640625
  ],
  [
    0.8515625,
    0.2412109375
  ],
  [
    0.861328125,
    0.236328125
  ],
  [
    0.8671875,
    0.23046875
  ],
  [
    0.87109375,
    0.2216796875
  ],
  [
    0.873046875,
    0.2109375
  ],
  [
    0.8720703125,
    0.2021484375
  ],
  [
    0.869140625,
    0.1923828125
  ],
  [
    0.861328125,
    0.177734375
  ],
  [
    0.837890625,
    0.1435546875
  ],
  [
    0.833984375,
    0.1396484375
  ],
  [
    0.828125,
    0.130859375
  ],
  [
    0.8154296875,
    0.111328125
  ],
  [
    0.7978515625,
    0.091796875
  ],
  [
    0.7841796875,
    0.076171875
  ],
  [
    0.7705078125,
    0.064453125
  ],
  [
    0.755859375,
    0.060546875
  ],
  [
    0.7392578125,
    0.0625
  ],
  [
    0.728515625,
    0.0693359375
  ],
  [
    0.72265625,
    0.080078125
  ],
  [
    0.72265625,
    0.095703125
  ],
  [
    0.73046875,
    0.12109375
  ],
  [
    0.748046875,
    0.1689453125
  ],
  [
    0.767578125,
    0.21484375
  ]
]

const data = drawLine(arr)

// console.time('line')
const { prev, curr, next, lengthSoFar } = data
// featureCollectionInput.features[0].geometry.coordinates.forEach(poly => {
//   for (const line of poly) drawLine(line)
// })
// console.timeEnd('line')

console.log('prev', prev)
console.log('curr', curr)
console.log('next', next)
console.log('lengthSoFar', lengthSoFar)
// console.log('vertices.length', vertices.length)
const width = 0.01

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
  let currNormal = mag ? [-dy / mag, dx / mag] : [0, 0]

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
  let prevNormal = mag ? [-dy / mag, dx / mag] : [0, 0]

  if (isCCW([prevX, prevY], [currX, currY], [nextX, nextY])) {
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

// function drawLine (line, opts) {
//   const ll = line.length - 1
//   if (line.length < 2) return { prev: [], curr: [], next: [], lengthSoFar: [] }
//   opts = { dashed: false, ...opts }
//   const { dashed } = opts
//   const prev = [...line[0]]
//   const curr = [...line[0]]
//   const next = []
//   const lengthSoFar = [0]
//   let curLength = 0
//   let prevPoint = line[0]
//
//   for (let i = 1; i < ll; i++) {
//     // get the next point
//     const point = line[i]
//     // move on if duplicate point
//     if (prevPoint[0] === point[0] && prevPoint[1] === point[1]) continue
//     // store the next pair
//     next.push(...point)
//     // store the point as the next "start"
//     curr.push(...point)
//     // store the previous point
//     prev.push(...prevPoint)
//     // build the lengthSoFar
//     if (dashed) curLength += Math.sqrt(Math.pow(point[0] - prevPoint[0], 2) + Math.pow(point[1] - prevPoint[1], 2))
//     lengthSoFar.push(curLength)
//     // store the old point
//     prevPoint = point
//   }
//   // here we actually just store 'next'
//   next.push(...line[ll])
//
//   // TODO: Store edge points
//
//   return { prev, curr, next, lengthSoFar }
// }
//
function isCCW (p1, p2, p3) {
  const val = (p2[1] - p1[1]) * (p3[0] - p2[0]) - (p2[0] - p1[0]) * (p3[1] - p2[1])

  return val < 0
}
