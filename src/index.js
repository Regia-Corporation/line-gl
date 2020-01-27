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
    prevNormal: Point, currIndex: number, prevIndex: number,
    nextIndex: number

  // step 1: Just do the individual lines:
  for (let i = 0; i < pointsIndexSize; i++) {
    curNormal = getPerpendicularVector(points[i], points[i + 1])
    nextNormal = getPerpendicularVector(points[i + 1], points[i])
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
    prevNormal = getPerpendicularVector(points[i], points[i - 1])
    nextNormal = getPerpendicularVector(points[i + 1], points[i])
    currIndex = saveVertexVectorPair(points[i], [0, 0], true, vertices, normals)
    prevIndex = saveVertexVectorPair(points[i], prevNormal, !ccw, vertices, normals)
    nextIndex = saveVertexVectorPair(points[i], nextNormal, !ccw, vertices, normals)
    if (ccw) indices.push(prevIndex, nextIndex, currIndex)
    else indices.push(currIndex, nextIndex, prevIndex)
  }


  // if (!closed) {
  //   // find our perpendicular normals (turns out to be flat for ends)
  //   previousNormal = getPerpendicularVector(points[0], points[1], points[2])
  //   // save the points vertices
  //   previousInnerIndex = saveVertexVectorPair(points[0], previousNormal, true, vertices, normals)
  //   previousOuterIndex = saveVertexVectorPair(points[0], previousNormal, false, vertices, normals)
  //   // create the first cap
  //   const capNormal = getVector(points[0], points[1])
  //   if (cap === 'square') {
  //     squareCap(capNormal, previousInnerIndex, previousOuterIndex, vertices, normals, indices, offset)
  //   } else if (cap === 'round') {
  //     rounding(points[0], previousInnerIndex, previousOuterIndex, [-previousNormal[0], -previousNormal[1]], previousNormal, vertices, normals, indices, offset, capNormal)
  //   }
  // } else { // add an extra point so that the loop does the first join for us (at the end). Start at the beginning angle
  //   // create normals
  //   previousNormal = getPerpendicularVector(points[pointsIndexSize - 1], points[0], points[1])
  //   nextNormal = getPerpendicularVector(points[0], points[1], points[2])
  //   // save the points vertices
  //   previousInnerIndex = saveVertexVectorPair(points[0], nextNormal, true, vertices, normals)
  //   previousOuterIndex = saveVertexVectorPair(points[0], nextNormal, false, vertices, normals)
  //   // update previous normal
  //   previousNormal = nextNormal
  //   // update points for loop to add last join
  //   points.push(points[1])
  //   pointsIndexSize++
  // }
  // // now iterate through all the points until last, creating triangles as we go
  // for (let i = 1; i < pointsIndexSize; i++) {
  //   // find the perpendicular lines
  //   newPrevious = getPerpendicularVector(points[i - 1], points[i], points[i + 1])
  //   // corner case where previousNormal needs to be flipped due to zig-zag
  //   if (newPrevious[0] !== previousNormal[0] || newPrevious[1] !== previousNormal[1]) {
  //     previousNormal = newPrevious
  //     const temp = previousInnerIndex
  //     previousInnerIndex = previousOuterIndex
  //     previousOuterIndex = temp
  //   }
  //   // find the next normal
  //   nextNormal = getPerpendicularVector(points[i + 1], points[i], points[i - 1])
  //   ccw = isCCW(points[i], previousNormal, nextNormal)
  //   // create the currentOuter point and index (same no matter what)
  //   currentOuterIndex = saveVertexVectorPair(points[i], previousNormal, false, vertices, normals)
  //   // save current index
  //   currentInnerIndex = saveVertexVectorPair(points[i], previousNormal, true, vertices, normals)
  //   // save the indices
  //   if (!ccw) {
  //     indices.push(
  //       previousOuterIndex + offset, currentInnerIndex + offset, previousInnerIndex + offset,
  //       currentOuterIndex + offset, currentInnerIndex + offset, previousOuterIndex + offset
  //     )
  //   } else {
  //     indices.push(
  //       previousInnerIndex + offset, currentInnerIndex + offset, previousOuterIndex + offset,
  //       previousOuterIndex + offset, currentInnerIndex + offset, currentOuterIndex + offset
  //     )
  //   }
  //   // create and store next inner and outer as well as middle point for join
  //   nextOuterIndex = saveVertexVectorPair(points[i], nextNormal, false, vertices, normals)
  //   nextInnerIndex = saveVertexVectorPair(points[i], nextNormal, true, vertices, normals)
  //   // edge case: if a straight line, don't create a join, update values and move on
  //   if (!isSameNormal(previousNormal, nextNormal)) {
  //     // create middle point
  //     if (join === 'round') {
  //       rounding(points[i], currentInnerIndex, nextInnerIndex, [-previousNormal[0], -previousNormal[1]], [-nextNormal[0], -nextNormal[1]], vertices, normals, indices, offset)
  //     } else {
  //       currentPointIndex = saveVertexVectorPair(points[i], [0, 0], false, vertices, normals)
  //       if (!ccw) {
  //         indices.push(currentPointIndex + offset, nextInnerIndex + offset, currentInnerIndex + offset)
  //       } else { indices.push(currentInnerIndex + offset, nextInnerIndex + offset, currentPointIndex + offset)  }
  //       if (join === 'miter') {
  //         // TODO
  //       }
  //     }
  //   }
  //   // update the "previous" values to the next ones as we move forward
  //   previousInnerIndex = nextInnerIndex
  //   previousOuterIndex = nextOuterIndex
  //   // move previousNormal to nextNormal
  //   previousNormal = nextNormal
  // }
  //
  // // lastly save the last middle and the end cap if a non closed loop
  // // if the line is not closed, we finished the middle with a flat end
  // if (!closed) {
  //   // compute the last normal
  //   nextNormal = getPerpendicularVector(points[pointsIndexSize], points[pointsIndexSize - 1], points[pointsIndexSize - 2])
  //   // store them and retrieve indexes
  //   currentInnerIndex = saveVertexVectorPair(points[pointsIndexSize], nextNormal, true, vertices, normals)
  //   currentOuterIndex = saveVertexVectorPair(points[pointsIndexSize], nextNormal, false, vertices, normals)
  //   // edge case: straight line
  //   ccw = isCCW(points[pointsIndexSize], previousNormal, nextNormal)
  //   if (previousNormal[0] === -nextNormal[0] && previousNormal[1] === -nextNormal[1]) {
  //     if (ccw) {
  //       indices.push(
  //         previousInnerIndex + offset, currentOuterIndex + offset, previousOuterIndex + offset,
  //         previousOuterIndex + offset, currentOuterIndex + offset, currentInnerIndex + offset
  //       )
  //     } else {
  //       indices.push(
  //         previousOuterIndex + offset, currentOuterIndex + offset, previousInnerIndex + offset,
  //         currentInnerIndex + offset, currentOuterIndex + offset, previousOuterIndex + offset
  //       )
  //     }
  //   } else {
  //     if (ccw) {
  //       indices.push(
  //         previousOuterIndex + offset, currentInnerIndex + offset, previousInnerIndex + offset,
  //         currentOuterIndex + offset, currentInnerIndex + offset, previousOuterIndex + offset
  //       )
  //     } else {
  //       indices.push(
  //         previousInnerIndex + offset, currentInnerIndex + offset, previousOuterIndex + offset,
  //         previousOuterIndex + offset, currentInnerIndex + offset, currentOuterIndex + offset
  //       )
  //     }
  //   }
  //   if (cap === 'square') {
  //     // TODO: vector between previous point and currrent
  //     const capNormal = getVector(points[pointsIndexSize], points[pointsIndexSize - 1])
  //     squareCap(capNormal, currentInnerIndex, currentOuterIndex, vertices, normals, indices, offset)
  //   } else if (cap === 'round') {
  //     const capNormal = getVector(points[pointsIndexSize], points[pointsIndexSize - 1])
  //     rounding(points[pointsIndexSize], currentOuterIndex, currentInnerIndex, nextNormal, [-nextNormal[0], -nextNormal[1]], vertices, normals, indices, offset, capNormal)
  //   }
  // }

  return { vertices, normals, indices }
}

function getPerpendicularVector (point: Point, nextPoint: Point): Point {
  let dx = point[0] - nextPoint[0]
  let dy = point[1] - nextPoint[1]
  const mag = Math.sqrt(dx * dx + dy * dy) // magnitude

  return [-dy / mag, dx / mag]
}

function getVector (point: Point, nextPoint: Point): Point {
  let dx = nextPoint[0] - point[0]
  let dy = nextPoint[1] - point[1]
  const mag = Math.sqrt(dx * dx + dy * dy) // magnitude
  return [dx / mag, dy / mag]
}

function isLeft (a: Point, b: Point, c: Point): boolean { // check point c against line a to b
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]) > 0
}

function saveVertexVectorPair (point: Point, vector: Point, invert: boolean, vertices: Vertices, normals: Normals): number {
  vertices.push(point[0], point[1])
  if (invert) normals.push(vector[0], vector[1])
  else normals.push(-vector[0], -vector[1])

  return vertices.length / 2 - 1 // return the index at the first value (x)
}

function isSameNormal (previousNormal: Point, nextNormal: Point): boolean {
  if (previousNormal[0] + nextNormal[0] === 0 && previousNormal[1] + nextNormal[1] === 0) return true
  return false
}

function squareCap (vector: Point, innerIndex: number, outerIndex: number, vertices: Vertices, normals: Normals, indices: Indices, offset: number) {
  // create the next 2 points
  const currentPoint = [vertices[innerIndex * 2], vertices[innerIndex * 2 + 1]]
  // build new "normals"
  const newVectorInner = [vector[0] + normals[innerIndex * 2], vector[1] + normals[innerIndex * 2 + 1]]
  const newVectorOuter = [vector[0] + normals[outerIndex * 2], vector[1] + normals[outerIndex * 2 + 1]]
  const ccw = isCCW(currentPoint, newVectorInner, newVectorOuter)
  // save the next two points
  const innerNextIndex = saveVertexVectorPair(currentPoint, newVectorInner, false, vertices, normals)
  const outerNextIndex = saveVertexVectorPair(currentPoint, newVectorOuter, false, vertices, normals)
  // push the two triangles into the indices
  if (ccw) {
    indices.push(
      // innerIndex + offset, innerNextIndex + offset, outerIndex + offset,
      innerIndex + offset, innerNextIndex + offset, outerNextIndex + offset
    )
  } else {
    indices.push(
      // outerIndex + offset, innerNextIndex + offset, innerIndex + offset,
      outerNextIndex + offset, innerNextIndex + offset, innerIndex + offset
    )
  }
}

function rounding (centerPoint: Point, innerIndex: number, outerIndex: number, innerNormal: Point,
  outerNormal: Point, vertices: Vertices, normals: Normals, indices: Indices, offset: number, capNormal: Point) {
  // store the center point
  const centerPointIndex = saveVertexVectorPair(centerPoint, [0, 0], false, vertices, normals)
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
  if (capNormal && !isBetween(startAngle, endAngle, Math.atan2(capNormal[1], capNormal[0]))) angleDiff = -angleDiff
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

function isCCW (p1: Point, p2: Point, p3: Point): boolean {
  const val = (p2[1] - p1[1]) * (p3[0] - p2[0]) - (p2[0] - p1[0]) * (p3[1] - p2[1])

  if (val === 0) return true // colinear
  return (val > 0) ? false : true // clock or counterclock wise
}

function isBetween (a: number, b: number, num: number): boolean {
  const min = Math.min(a, b)
  const max = Math.max(a, b)

  return num > min && num < max
}
