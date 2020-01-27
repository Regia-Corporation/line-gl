// @flow
export type Cap = 'butt' | 'square' | 'round'

export type Join = 'bevel' | 'miter' | 'round'

export type Attributes = {
  cap?: Cap,
  join?: Join,
  miterLimit?: number
}

export type Vertices = Array<number>

export type Normals = Array<number>

export type Indices = Array<number>

export type Line = {
  vertices: Vertices,
  normals: Normals,
  indices: Indices
}

type Point = [number, number]

export default function drawLine (points: Array<Point>, attributes?: Attributes = {}, offset?: number = 0): null | Line {
  // trivial reject
  let pointsIndexSize = points.length - 1
  if (pointsIndexSize < 1) { return null }
  // prep values
  const cap: Cap = attributes.cap || 'butt'
  const join: Join = attributes.join || 'bevel'
  const miterLimit: number = (attributes.miterLimit && attributes.miterLimit < 15) ? attributes.miterLimit : 10
  const vertices: Vertices = []
  const normals: Normals = []
  const indices: Indices = []
  const closed = points[0][0] === points[pointsIndexSize][0] && points[0][1] === points[pointsIndexSize][1]
  // prep the initial inner and outer points/indexes and create caps if necessary
  let ccw: boolean, curNormal: Point, nextNormal: Point, currInnerIndex: number,
    currOuterIndex: number, nextInnerIndex: number, nextOuterIndex: number,
    prevNormal: Point, currIndex: number, prevIndex: number, nextIndex: number,
    capNormal: Point

  // step 1: Just do the individual lines:
  for (let i = 0; i < pointsIndexSize; i++) {
    curNormal = getVector(points[i], points[i + 1])
    nextNormal = getVector(points[i + 1], points[i])
    // save the points vertices
    currInnerIndex = saveVertexVectorPair(points[i], curNormal, true, vertices, normals)
    currOuterIndex = saveVertexVectorPair(points[i], curNormal, false, vertices, normals)
    nextInnerIndex = saveVertexVectorPair(points[i + 1], nextNormal, true, vertices, normals)
    nextOuterIndex = saveVertexVectorPair(points[i + 1], nextNormal, false, vertices, normals)
    // store points
    indices.push(
      currOuterIndex + offset, currInnerIndex + offset, nextOuterIndex + offset,
      nextOuterIndex + offset, nextInnerIndex + offset, currOuterIndex + offset
    )
  }

  // Step 2: Edges
  for (let i = 1; i < pointsIndexSize; i++) {
    const ccw = isCCW(points[i - 1], points[i], points[i + 1])
    prevNormal = getVector(points[i], points[i - 1])
    nextNormal = getVector(points[i + 1], points[i])
    if (!ccw) { // invert early for rounding
      prevNormal = [-prevNormal[0], -prevNormal[1]]
      nextNormal = [-nextNormal[0], -nextNormal[1]]
    }
    currIndex = saveVertexVectorPair(points[i], [0, 0], false, vertices, normals)
    prevIndex = saveVertexVectorPair(points[i], prevNormal, false, vertices, normals)
    nextIndex = saveVertexVectorPair(points[i], nextNormal, false, vertices, normals)
    if (join === 'round') {
      rounding(points[i], currIndex, prevIndex, nextIndex, prevNormal, nextNormal, vertices, normals, indices, offset)
    } else { // bevel
      // bevel is a guarentee
      if (ccw) indices.push(prevIndex + offset, nextIndex + offset, currIndex + offset)
      else indices.push(currIndex + offset, nextIndex + offset, prevIndex + offset)
      // TODO
      if (join === 'miter') {

      }
    }
  }

  // caps
  if (!closed && cap !== 'butt') {
    // first cap
    prevNormal = getVector(points[0], points[1])
    currIndex = saveVertexVectorPair(points[0], [0, 0], false, vertices, normals)
    prevIndex = saveVertexVectorPair(points[0], prevNormal, true, vertices, normals)
    nextIndex = saveVertexVectorPair(points[0], prevNormal, false, vertices, normals)
    capNormal = getVector(points[0], points[1], false)
    if (cap === 'square') {
      squareCap(capNormal, prevIndex, nextIndex, vertices, normals, indices, offset)
    } else if (cap === 'round') {
      rounding(points[0], currIndex, prevIndex, nextIndex, [-prevNormal[0], -prevNormal[1]], prevNormal, vertices, normals, indices, offset, capNormal)
    }
    // second cap
    prevNormal = getVector(points[pointsIndexSize], points[pointsIndexSize - 1])
    currIndex = saveVertexVectorPair(points[pointsIndexSize], [0, 0], false, vertices, normals)
    prevIndex = saveVertexVectorPair(points[pointsIndexSize], prevNormal, true, vertices, normals)
    nextIndex = saveVertexVectorPair(points[pointsIndexSize], prevNormal, false, vertices, normals)
    capNormal = getVector(points[pointsIndexSize], points[pointsIndexSize - 1], false)
    if (cap === 'square') {
      squareCap(capNormal, prevIndex, nextIndex, vertices, normals, indices, offset)
    } else if (cap === 'round') {
      rounding(points[pointsIndexSize], currIndex, prevIndex, nextIndex, [-prevNormal[0], -prevNormal[1]], prevNormal, vertices, normals, indices, offset, capNormal)
    }
  } else { // just a join

  }

  return { vertices, normals, indices }
}

function getVector (point: Point, nextPoint: Point, perpendicular: boolean = true): Point {
  let dx = point[0] - nextPoint[0]
  let dy = point[1] - nextPoint[1]
  const mag = Math.sqrt(dx * dx + dy * dy) // magnitude
  if (perpendicular) return [-dy / mag, dx / mag]
  else return [dx / mag, dy / mag]
}

function saveVertexVectorPair (point: Point, vector: Point, invert: boolean, vertices: Vertices, normals: Normals): number {
  vertices.push(...point)
  if (invert) normals.push(...vector)
  else normals.push(-vector[0], -vector[1])

  return vertices.length / 2 - 1 // return the index at the first value (x)
}

function isCCW (p1: Point, p2: Point, p3: Point): boolean {
  const val = (p2[1] - p1[1]) * (p3[0] - p2[0]) - (p2[0] - p1[0]) * (p3[1] - p2[1])

  if (val === 0) return true // colinear
  return (val > 0) ? false : true // clock or counterclock wise
}

function isSameNormal (previousNormal: Point, nextNormal: Point): boolean {
  if (previousNormal[0] + nextNormal[0] === 0 && previousNormal[1] + nextNormal[1] === 0) return true
  return false
}

function squareCap (vector: Point, innerIndex: number, outerIndex: number, vertices: Vertices, normals: Normals, indices: Indices, offset: number) {
  // create the next 2 points
  const currentPoint = [vertices[innerIndex * 2], vertices[innerIndex * 2 + 1]]
  // build new "normals"
  const newVectorInner = [-vector[0] + normals[innerIndex * 2], -vector[1] + normals[innerIndex * 2 + 1]]
  const newVectorOuter = [-vector[0] + normals[outerIndex * 2], -vector[1] + normals[outerIndex * 2 + 1]]
  // save the next two points
  const innerNextIndex = saveVertexVectorPair(currentPoint, newVectorInner, false, vertices, normals)
  const outerNextIndex = saveVertexVectorPair(currentPoint, newVectorOuter, false, vertices, normals)
  // push the two triangles into the indices
  indices.push(
    outerIndex + offset, innerNextIndex + offset, innerIndex + offset,
    innerIndex + offset, innerNextIndex + offset, outerNextIndex + offset
  )
}

function rounding (centerPoint: Point, centerPointIndex: number, innerIndex: number,
  outerIndex: number, innerNormal: Point, outerNormal: Point, vertices: Vertices,
  normals: Normals, indices: Indices, offset: number, capNormal: Point) {
  // get the angles of the two starting positions
  let startAngle = Math.atan2(innerNormal[1], innerNormal[0])
  let endAngle = Math.atan2(outerNormal[1], outerNormal[0])
  if (startAngle === endAngle) return
  // this means it's an end cap and we need to figure out if we need to swap start and end angles
  let angleDiff = endAngle - startAngle
  // join is ALWAYS an acute angle, so if we don't see that, we are building on the wrong side
  // EPSILON is 0.0001, this is to ensure lossy numbers don't screw up the rounding
  if (angleDiff > Math.PI + 0.0001) angleDiff -= Math.PI * 2
  else if (angleDiff < -Math.PI - 0.0001) angleDiff += Math.PI * 2
  // if an end cap, let's make sure the rounding is on the right side
  if (capNormal && isBetween(startAngle, endAngle, Math.atan2(capNormal[1], capNormal[0]))) angleDiff = -angleDiff
  // create the segment size
  const segmentCount = Math.abs(angleDiff) * 5 >> 0
  // now we have our increment size
  const angleIncrement = angleDiff / segmentCount
  // move down one after creating angleIncrement to ensure we don't reinput outterIndex
  let nextIndex: number, nextVector: Point
  for (let i = 1; i < segmentCount; i++) {
    // create the next point in the triangle, the first will always have been created
    nextVector = [Math.cos(startAngle + angleIncrement * i), Math.sin(startAngle + angleIncrement * i)]
    nextIndex = saveVertexVectorPair(centerPoint, nextVector, false, vertices, normals)
    if (angleIncrement > 0) indices.push(innerIndex + offset, nextIndex + offset, centerPointIndex + offset)
    else indices.push(nextIndex + offset, innerIndex + offset, centerPointIndex + offset)
    // update innerIndex as we revolve
    innerIndex = nextIndex
  }
  // create the last triangle
  if (nextIndex) {
    if (angleIncrement > 0) indices.push(centerPointIndex + offset, nextIndex + offset, outerIndex + offset)
    else indices.push(centerPointIndex + offset, outerIndex + offset, nextIndex + offset)
  }
}

function isBetween (a: number, b: number, num: number): boolean {
  const min = Math.min(a, b)
  const max = Math.max(a, b)

  return num > min && num < max
}
