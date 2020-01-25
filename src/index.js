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
  const indices: Indices = []
  const closed = points[0][0] === points[pointsIndexSize][0] && points[0][1] === points[pointsIndexSize][1]
  // prep the initial inner and outer points/indexes and create caps if necessary
  let previousOuter: Point, previousInner: Point, previousNormal: Point,
    nextNormal: Point, previousOuterIndex: number, previousInnerIndex: number,
    currentInnerIndex: number, currentOuter: Point, currentPointIndex: number, currentOuterIndex: number,
    nextOuter: Point, nextOuterIndex: number, newPrevious: Point, nextInnerIndex: Point
  if (!closed) {
    // find our perpendicular normals (turns out to be flat for ends)
    previousNormal = getPerpendicularVector(points[0], points[1], points[2])
    // save the points vertices
    previousInnerIndex = saveVertexVectorPair(points[0], previousNormal, true, vertices)
    previousOuterIndex = saveVertexVectorPair(points[0], previousNormal, false, vertices)
    // create the first cap
    const capNormal = getVector(points[0], points[1])
    if (cap === 'square') {
      squareCap(capNormal, previousInnerIndex, previousOuterIndex, vertices, indices, offset)
    } else if (cap === 'round') {
      rounding(points[0], previousInnerIndex, previousOuterIndex, [-previousNormal[0], -previousNormal[1]], previousNormal, vertices, indices, offset, capNormal)
    }
  } else { // add an extra point so that the loop does the first join for us (at the end). Start at the beginning angle
    // create normals
    previousNormal = getPerpendicularVector(points[pointsIndexSize - 1], points[0], points[1])
    nextNormal = getPerpendicularVector(points[0], points[1], points[2])
    // save the points vertices
    previousInnerIndex = saveVertexVectorPair(points[0], nextNormal, true, vertices)
    previousOuterIndex = saveVertexVectorPair(points[0], nextNormal, false, vertices)
    // update previous normal
    previousNormal = nextNormal
    // update points for loop to add last join
    points.push(points[1])
    pointsIndexSize++
  }
  // now iterate through all the points until last, creating triangles as we go
  for (let i = 1; i < pointsIndexSize; i++) {
    // find the perpendicular lines
    newPrevious = getPerpendicularVector(points[i - 1], points[i], points[i + 1])
    // corner case where previousNormal needs to be flipped due to zig-zag
    if (newPrevious[0] !== previousNormal[0] || newPrevious[1] !== previousNormal[1]) {
      previousNormal = newPrevious
      const temp = previousInnerIndex
      previousInnerIndex = previousOuterIndex
      previousOuterIndex = temp
    }
    // find the next normal
    nextNormal = getPerpendicularVector(points[i + 1], points[i], points[i - 1])
    // create the currentOuter point and index (same no matter what)
    currentOuterIndex = saveVertexVectorPair(points[i], previousNormal, false, vertices)
    // save current index
    currentInnerIndex = saveVertexVectorPair(points[i], previousNormal, true, vertices)
    // save the indices
    indices.push(
      previousOuterIndex + offset, currentInnerIndex + offset, previousInnerIndex + offset,
      currentOuterIndex + offset, currentInnerIndex + offset, previousOuterIndex + offset
    )
    // create and store next inner and outer as well as middle point for join
    nextOuterIndex = saveVertexVectorPair(points[i], nextNormal, false, vertices)
    nextInnerIndex = saveVertexVectorPair(points[i], nextNormal, true, vertices)
    // edge case: if a straight line, don't create a join, update values and move on
    if (!isSameNormal(previousNormal, nextNormal)) {
      // create middle point
      if (join === 'round') {
        rounding(points[i], currentInnerIndex, nextInnerIndex, [-previousNormal[0], -previousNormal[1]], [-nextNormal[0], -nextNormal[1]], vertices, indices, offset)
      } else {
        currentPointIndex = saveVertexVectorPair(points[i], [0, 0], false, vertices)
        indices.push(currentInnerIndex + offset, nextInnerIndex + offset, currentPointIndex + offset)
        if (join === 'miter') {
          // TODO
        }
      }
    }
    // update the "previous" values to the next ones as we move forward
    previousInnerIndex = nextInnerIndex
    previousOuterIndex = nextOuterIndex
    // move previousNormal to nextNormal
    previousNormal = nextNormal
  }

  // lastly save the last middle and the end cap if a non closed loop
  // if the line is not closed, we finished the middle with a flat end
  if (!closed) {
    // compute the last normal
    nextNormal = getPerpendicularVector(points[pointsIndexSize], points[pointsIndexSize - 1], points[pointsIndexSize - 2])
    // store them and retrieve indexes
    currentInnerIndex = saveVertexVectorPair(points[pointsIndexSize], nextNormal, true, vertices)
    currentOuterIndex = saveVertexVectorPair(points[pointsIndexSize], nextNormal, false, vertices)
    // edge case: straight line
    if (previousNormal[0] === -nextNormal[0] && previousNormal[1] === -nextNormal[1]) {
      indices.push(
        previousOuterIndex + offset, currentOuterIndex + offset, previousInnerIndex + offset,
        currentInnerIndex + offset, currentOuterIndex + offset, previousOuterIndex + offset
      )
    } else {
      indices.push(
        previousOuterIndex + offset, currentInnerIndex + offset, previousInnerIndex + offset,
        currentOuterIndex + offset, currentInnerIndex + offset, previousOuterIndex + offset
      )
    }
    if (cap === 'square') {
      // TODO: vector between previous point and currrent
      const capNormal = getVector(points[pointsIndexSize], points[pointsIndexSize - 1])
      squareCap(capNormal, currentInnerIndex, currentOuterIndex, vertices, indices, offset)
    } else if (cap === 'round') {
      const capNormal = getVector(points[pointsIndexSize], points[pointsIndexSize - 1])
      rounding(points[pointsIndexSize], currentOuterIndex, currentInnerIndex, nextNormal, [-nextNormal[0], -nextNormal[1]], vertices, indices, offset, capNormal)
    }
  }

  return { vertices, indices }
}

function getVector (point: Point, nextPoint: Point): Point {
  let dx = nextPoint[0] - point[0]
  let dy = nextPoint[1] - point[1]
  const mag = Math.sqrt(dx * dx + dy * dy) // magnitude
  return [dx / mag, dy / mag]
}

function getPerpendicularVector (point: Point, nextPoint: Point, anchor?: Point): Point {
  let dx = point[0] - nextPoint[0]
  let dy = point[1] - nextPoint[1]
  const mag = Math.sqrt(dx * dx + dy * dy) // magnitude

  if (anchor) {
    if (isLeft(point, anchor, nextPoint)) { // if left rotate vector 90 deg clockwise
      dx = -dx
    } else { // rotate vector 90 deg counter-clockwise
      dy = -dy
    }
  } else { dy = -dy }

  return [dy / mag, dx / mag]
}

function isLeft (a: Point, b: Point, c: Point): boolean { // check point c against line a to b
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]) > 0
}

function saveVertexVectorPair (point: Point, vector: Point, invert: boolean, vertices: Vertices): number {
  vertices.push(point[0], point[1])
  if (invert) vertices.push(vector[0], vector[1])
  else vertices.push(-vector[0], -vector[1])

  return vertices.length / 4 - 1 // return the index at the first value (x)
}

function isSameNormal (previousNormal: Point, nextNormal: Point): boolean {
  if (previousNormal[0] + nextNormal[0] === 0 && previousNormal[1] + nextNormal[1] === 0) return true
  return false
}

function lineIntersect (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {
  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1)
  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom

  return [x1 + ua * (x2 - x1), y1 + ua * (y2 - y1)]
}

function squareCap (vector: Point, innerIndex: number, outerIndex: number, vertices: Vertices, indices: Indices, offset: number) {
  // create the next 2 points
  const currentPoint = [vertices[innerIndex * 4], vertices[innerIndex * 4 + 1]]
  // build new "normals"
  const newVectorInner = [vector[0] + vertices[innerIndex * 4 + 2], vector[1] + vertices[innerIndex * 4 + 3]]
  const newVectorOuter = [vector[0] + vertices[outerIndex * 4 + 2], vector[1] + vertices[outerIndex * 4 + 3]]
  // save the next two points
  const innerNextIndex = saveVertexVectorPair(currentPoint, newVectorInner, false, vertices)
  const outerNextIndex = saveVertexVectorPair(currentPoint, newVectorOuter, false, vertices)
  // push the two triangles into the indices
  indices.push(
    innerIndex + offset, innerNextIndex + offset, outerIndex + offset,
    innerIndex + offset, innerNextIndex + offset, outerNextIndex + offset
  )
}

function rounding (centerPoint: Point, innerIndex: number, outerIndex: number, innerNormal: Point,
  outerNormal: Point, vertices: Vertices, indices: Indices, offset: number, capNormal: Point) {
  // store the center point
  const centerPointIndex = saveVertexVectorPair(centerPoint, [0, 0], false, vertices)
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
    nextIndex = saveVertexVectorPair(centerPoint, nextVector, false, vertices)
    indices.push(innerIndex + offset, nextIndex + offset, centerPointIndex + offset)
    // update innerIndex as we revolve
    innerIndex = nextIndex
  }
  // create the last triangle
  if (nextIndex) indices.push(centerPointIndex + offset, nextIndex + offset, outerIndex + offset)
}

function isBetween (a: number, b: number, num: number): boolean {
  const min = Math.min(a, b)
  const max = Math.max(a, b)

  return num > min && num < max
}
