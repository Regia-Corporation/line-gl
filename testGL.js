const fs = require('fs')
const { drawLine } = require('./lib')

const featureCollection = {
  type: 'FeatureCollection',
  features: []
}

const FACE = 4
const ZOOM = 13
const X = 227
const Y = 2116

let TRIANGLE = []

const width = 10

const EXTENT = 2048

const uFaceST = [4, 13, 0.0001, 0.0277, 0.0001, 0.2583]
const uAspect = [3360, 1774]
const uMatrix = [-5191.9810, 16031.5264, 0.7108, 0.7037, 0, 20065.0352, -0.6588, -0.6523, 12976.3750, 6414.3784, 0.2844, 0.2816, 0, 0, 2.0251, 3]
// const uInputs = [13.9000, 111.8069, 40.7139, 0, 0, 0, 0, 0, 0, 0]
// const uDevicePixelRatio = 2

const lineData = JSON.parse(fs.readFileSync('./linesGLtest.json'))

const geometry = []

lineData.features.forEach(feature => {
  const { coordinates } = feature.geometry
  coordinates.forEach(line => geometry.push(line))
})

// STEP 1: BUILD THE LINES
const aPrev = []
const aCurr = []
const aNext = []

const multiplier = 8192 / EXTENT

for (const lineString of geometry) {
  // build the vertex, normal, and index data
  // const { prev, curr, next, lengthSoFar } = drawLine(lineString, dashed, maxDistance)
  const { prev, curr, next } = drawLine(lineString)
  for (let i = 0, vc = curr.length; i < vc; i += 2) {
    aPrev.push(prev[i] * multiplier, prev[i + 1] * multiplier)
    aCurr.push(curr[i] * multiplier, curr[i + 1] * multiplier)
    aNext.push(next[i] * multiplier, next[i + 1] * multiplier)
    // vertices.push(
    //   prev[i] * multiplier, prev[i + 1] * multiplier,
    //   curr[i] * multiplier, curr[i + 1] * multiplier,
    //   next[i] * multiplier, next[i + 1] * multiplier
    // )
  }
}

const types = [1, 3, 4, 1, 4, 2, 0, 5, 6]
// const types = [1, 3, 4, 1, 4, 2]

// STEP 2: DRAW

for (let i = 0, ll = aCurr.length; i < ll; i += 2) {
  const aaPrev = [aPrev[i], aPrev[i + 1]]
  const aaCurr = [aCurr[i], aCurr[i + 1]]
  const aaNext = [aNext[i], aNext[i + 1]]

  // for each point set, we draw types
  for (let t = 0; t < types.length; t++) {
    const aType = types[t]

    // get the position in projected space
    let curr = multiplyVector(uMatrix, STtoXYZ([aaCurr[0] / 8192, aaCurr[1] / 8192]))
    let next = multiplyVector(uMatrix, STtoXYZ([aaNext[0] / 8192, aaNext[1] / 8192]))
    let prev = multiplyVector(uMatrix, STtoXYZ([aaPrev[0] / 8192, aaPrev[1] / 8192]))
    let zero = multiplyVector(uMatrix, [0, 0, 0, 1])
    // adjust by w & get the position in screen space
    curr = [curr[0] / curr[3], curr[1] / curr[3], curr[2] / curr[3]]
    next = [next[0] / next[3], next[1] / next[3], next[2] / next[3]]
    prev = [prev[0] / prev[3], prev[1] / prev[3], prev[2] / prev[3]]
    zero = [zero[0] / zero[3], zero[1] / zero[3], zero[2] / zero[3]]

    const prevScreen = [prev[0], prev[1]]
    const currScreen = [curr[0], curr[1]]
    const nextScreen = [next[0], next[1]]
    let screen = currScreen
    // grab the perpendicular vector
    let normal
    if (aType === 0) normal = [0, 0]
    else if (aType === 5) normal = perpNormal(currScreen, prevScreen)
    else normal = perpNormal(nextScreen, currScreen)

    let glPosition = [0, 0, 0, 0]

    if (curr[2] < zero[2] && next[2] < zero[2]) {
      // adjust normal if necessary
      if (
        aType === 1 || aType === 3 ||
        ((aType === 5 || aType === 6) && isCCW(prevScreen, currScreen, nextScreen))
      ) normal = [normal[0] * -1, normal[1] * -1]
      // adjust screen as necessary
      if (aType === 3 || aType === 4) screen = nextScreen
      // set position
      glPosition = [screen[0] + normal[0] * width / uAspect[0], screen[1] + normal[1] * width / uAspect[1], curr[2], 1]
    }

    // tell the fragment the normal vector
    // vNorm = currNormal
    // STORE
    storePosition(glPosition)
  }
}

fs.writeFileSync('./glTestOut.json', JSON.stringify(featureCollection, null, 2))

function storePosition (position) {
  TRIANGLE.push([position[0], position[1]])
  if (TRIANGLE.length >= 3) {
    const feature = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [[
          TRIANGLE[0],
          TRIANGLE[1],
          TRIANGLE[2],
          TRIANGLE[0]
        ]]
      }
    }
    featureCollection.features.push(feature)
    TRIANGLE = []
  }
}

function perpNormal (a, b) {
  const delta = [a[0] - b[0], a[1] - b[1]]
  const mag = Math.sqrt(delta[0] * delta[0] + delta[1] * delta[1])
  if (mag === 0) return [0, 0]
  else return [-delta[1] / mag, delta[0] / mag]
}

function isCCW (prev, curr, next) {
  const det = (curr[1] - prev[1]) * (next[0] - curr[0]) - (curr[0] - prev[0]) * (next[1] - curr[1])

  return det < 0
}

function STtoUV (s) {
  // compressed VTs are extended, so we must squeeze them back to [0,1]
  if (s >= 0.5) return (1 / 3) * (4 * s * s - 1)
  else return (1 / 3) * (1 - 4 * (1 - s) * (1 - s))
}

function STtoXYZ (st) { // x -> s, y -> t
  const face = uFaceST[0]
  // prep xyz
  let xyz = [0, 0, 0]
  // convert to uv
  const uv = {
    x: STtoUV(uFaceST[2] * st[0] + uFaceST[3]), // deltaS * sPos + sLow
    y: STtoUV(uFaceST[4] * st[1] + uFaceST[5]) // deltaT * tPos + tLow
  }
  // convert uv to xyz according to face
  if (face === 0) xyz = [uv.x, uv.y, 1]
  else if (face === 1) xyz = [1, uv.y, -uv.x]
  else if (face === 2) xyz = [-uv.y, 1, -uv.x]
  else if (face === 3) xyz = [-uv.y, -uv.x, -1]
  else if (face === 4) xyz = [-1, -uv.x, uv.y]
  else xyz = [uv.x, -1, uv.y]
  // normalize data
  xyz = normalizeVec3(xyz)
  // return
  return [xyz[0], xyz[1], xyz[2], 1]
}

function normalizeVec3 (xyz) {
  const res = [0, 0, 0]

  const x = xyz[0]
  const y = xyz[1]
  const z = xyz[2]
  let len = (x * x) + (y * y) + (z * z)

  if (len > 0) {
    len = 1 / Math.sqrt(len)
  }

  res[0] = xyz[0] * len
  res[1] = xyz[1] * len
  res[2] = xyz[2] * len

  return res
}

function multiplyVector (matrix, vector) {
  const out = []

  out.push(matrix[0] * vector[0] + matrix[4] * vector[1] + matrix[8] * vector[2] + matrix[12])
  out.push(matrix[1] * vector[0] + matrix[5] * vector[1] + matrix[9] * vector[2] + matrix[13])
  out.push(matrix[2] * vector[0] + matrix[6] * vector[1] + matrix[10] * vector[2] + matrix[14])
  out.push(matrix[3] * vector[0] + matrix[7] * vector[1] + matrix[11] * vector[2] + matrix[15])

  return out
}
