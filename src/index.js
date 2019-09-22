// @flow
type Cap = 'butt' | 'square' | 'round'

type Join = 'bevel' | 'miter' | 'round'

export type Attributes = {
  cap?: Cap,
  join?: Join,
  width?: number,
  miterLimit?: number
}

export type Vertices = Array<number>

export type Indices = Array<number>

export type Line = {
  vertices: Vertices,
  indices: Indices
}

type Point = [number, number]

export default function drawLine (points: Array<Point>, attributes?: Attributes = {}): null | Line {
  // trivial reject
  let pointsIndexSize = points.length - 1
  if (pointsIndexSize < 1) { return null }
  // prep values
  const cap: Cap = attributes.cap || 'butt'
  const join: Join = attributes.join || 'bevel'
  const width: number = (attributes.width || 1) / 2
  const miterLimit: number = (attributes.miterLimit && attributes.miterLimit < 15) ? attributes.miterLimit : 10
  const vertices: Vertices = []
  const indices: Indices = []
  const closed = (points[0][0] === points[pointsIndexSize][0] && points[0][1] === points[pointsIndexSize][1]) ? true : false
  // prep the initial inner and outer points/indexes and create caps if necessary
  let previousOuter: Point, previousInner: Point, previousNormal: Point,
    nextNormal: Point, previousOuterIndex: number, previousInnerIndex: number
  let currentInner: null | Point, currentInnerIndex: number, currentOuter: Point,
    currentPointIndex: number, currentOuterIndex: number,
    nextOuter: Point, nextOuterIndex: number, newPrevious: Point
  let innerJoin: boolean = true
  if (!closed) {
    // find our perpendicular vectors (turns out to be flat for ends)
    previousNormal = getPerpendicularVector(points[0], points[1], points[2])
    // create the previousOuter and previousOuter points
    previousInner = [points[0][0] - previousNormal[0] * width, points[0][1] - previousNormal[1] * width]
    previousOuter = [points[0][0] + previousNormal[0] * width, points[0][1] + previousNormal[1] * width]
    // save the points vertices
    previousInnerIndex = saveVertices(previousInner, vertices)
    previousOuterIndex = saveVertices(previousOuter, vertices)
    // create the first cap
    if (cap === 'square') {
      const capNormal = getPerpendicularVector(points[0], previousOuter)
      squareCap(capNormal, previousInnerIndex, previousOuterIndex, width, vertices, indices)
    } else if (cap === 'round') {
      // // find our perpendicular vectors (turns out to be flat for ends)
      // NOTE: this is a bit of a hack, but it's computationally cheap so...
      const dx = points[1][0] - points[0][0]
      const dy = points[1][1] - points[0][1]
      const pos = (dy > 0 && dx < 0) ? false : (dx > 0 || dy > 0) ? true : false
      rounding(points[0], previousInnerIndex, previousOuterIndex, previousInner, previousOuter, width, vertices, indices, pos)
    }
  } else { // add an extra point so that the loop does the first join for us (at the end). Start at the beginning angle
    // create normals
    previousNormal = getPerpendicularVector(points[pointsIndexSize - 1], points[0], points[1])
    nextNormal = getPerpendicularVector(points[0], points[1], points[2])
    // find inner if it exists
    currentInner = getMiddleInnerPoint(points[0], points[pointsIndexSize - 1], previousNormal, nextNormal, width)
    currentOuter = [points[0][0] + nextNormal[0] * width, points[0][1] + nextNormal[1] * width]
    if (currentInner) {
      previousInnerIndex = saveVertices(currentInner, vertices)
      previousOuterIndex = saveVertices(currentOuter, vertices)
    } else { // angle too sharp for currentInner
      // create the previousOuter and previousOuter points
      previousInner = [points[0][0] - nextNormal[0] * width, points[0][1] - nextNormal[1] * width]
      previousOuter = [points[0][0] + nextNormal[0] * width, points[0][1] + nextNormal[1] * width]
      // save the points vertices
      previousInnerIndex = saveVertices(previousInner, vertices)
      previousOuterIndex = saveVertices(previousOuter, vertices)
    }
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
    nextNormal = getPerpendicularVector(points[i + 1], points[i], points[i - 1])
    // find the currentInner normal
    currentInner = getMiddleInnerPoint(points[i], points[i - 1], previousNormal, nextNormal, width)
    // create the currentOuter point and index (same no matter what)
    currentOuter = [points[i][0] + previousNormal[0] * width, points[i][1] + previousNormal[1] * width]
    currentOuterIndex = saveVertices(currentOuter, vertices)
    if (currentInner) {
      // save current index
      currentInnerIndex = saveVertices(currentInner, vertices)
      // save the indices
      indices.push(
        previousOuterIndex, currentInnerIndex, previousInnerIndex,
        currentOuterIndex, currentInnerIndex, previousOuterIndex
      )
    } else { // the two points left and right are very close to eachother so the join looks different
      innerJoin = false
      // create currentInner and currentOuter according to previousNormals
      currentInner = [points[i][0] - previousNormal[0] * width, points[i][1] - previousNormal[1] * width]
      // save current index
      currentInnerIndex = saveVertices(currentInner, vertices)
      // save the indices
      indices.push(
        previousOuterIndex, currentInnerIndex, previousInnerIndex,
        currentOuterIndex, currentInnerIndex, previousOuterIndex
      )
    }
    // create the join
    // create the nextOuter point and index
    nextOuter = [points[i][0] + nextNormal[0] * width, points[i][1] + nextNormal[1] * width]
    // edge case: straight line, don't create a join, update values and move on
    if (nextOuter[0] === currentInner[0] && nextOuter[1] === currentInner[1]) {
      previousInner = currentInner
      previousInnerIndex = currentInnerIndex
      previousOuterIndex = currentOuterIndex
      continue
    }
    nextOuterIndex = saveVertices(nextOuter, vertices)
    if (join === 'round') {
      // save the middlePoint and get the index
      currentPointIndex = saveVertices(points[i], vertices)
      // create the two inner join triangles
      if (innerJoin) {
        indices.push(
          currentInnerIndex, currentOuterIndex, currentPointIndex,
          currentInnerIndex, currentPointIndex, nextOuterIndex
        )
      }
      rounding(points[i], currentOuterIndex, nextOuterIndex, currentOuter, nextOuter, width, vertices, indices)
    } else {
      if (!innerJoin) currentInnerIndex = saveVertices(points[i], vertices)
      indices.push(currentInnerIndex, currentOuterIndex, nextOuterIndex)
      if (join === 'miter') {
        // TODO
      }
    }
    // update values to reflect new position
    if (!innerJoin) {
      // lastly recompute currentInner to currentOuter
      currentInner = [points[i][0] - nextNormal[0] * width, points[i][1] - nextNormal[1] * width]
      currentInnerIndex = saveVertices(currentInner, vertices)
      // reset innerJoin
      innerJoin = true
    }
    // update the "previous" values to the current ones as we move forward
    previousInner = currentInner
    previousInnerIndex = currentInnerIndex
    previousOuterIndex = nextOuterIndex
    // move previousNormal to nextNormal
    previousNormal = nextNormal
  }

  // lastly save the last middle and the end cap if a non closed loop
  // if the line is not closed, we finished the middle with a flat end
  if (!closed) {
    // compute the last normal
    nextNormal = getPerpendicularVector(points[pointsIndexSize], points[pointsIndexSize - 1], points[pointsIndexSize - 2])
    // get the current inner and outer from the normal
    currentInner = [points[pointsIndexSize][0] - nextNormal[0] * width, points[pointsIndexSize][1] - nextNormal[1] * width]
    currentOuter = [points[pointsIndexSize][0] + nextNormal[0] * width, points[pointsIndexSize][1] + nextNormal[1] * width]
    // store them and retrieve indexes
    currentInnerIndex = saveVertices(currentInner, vertices)
    currentOuterIndex = saveVertices(currentOuter, vertices)
    // edge case: straight line
    if (previousNormal[0] === -nextNormal[0] && previousNormal[1] === -nextNormal[1]) {
      indices.push(
        previousOuterIndex, currentOuterIndex, previousInnerIndex,
        currentInnerIndex, currentOuterIndex, previousOuterIndex
      )
    } else {
      indices.push(
        previousOuterIndex, currentInnerIndex, previousInnerIndex,
        currentOuterIndex, currentInnerIndex, previousOuterIndex
      )
    }
    if (cap === 'square') {
      const capNormal = getPerpendicularVector(points[pointsIndexSize], currentInner)
      squareCap(capNormal, currentInnerIndex, currentOuterIndex, width, vertices, indices)
    } else if (cap === 'round') {
      const dx = points[pointsIndexSize - 1][0] - points[pointsIndexSize][0]
      const dy = points[pointsIndexSize - 1][1] - points[pointsIndexSize][1]
      const pos = (dx > 0 && dy <= 0) ? true : (dx >= 0 && dy > 0) ? true : false
      rounding(points[pointsIndexSize], currentOuterIndex, currentInnerIndex, currentOuter, currentInner, width, vertices, indices, pos)
    }
  }

  return { vertices, indices }
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

function saveVertices (point: Point, vertices: Vertices): number {
  vertices.push(point[0], point[1])

  return vertices.length / 2 - 1 // return the index at the first value (x)
}

function getMiddleInnerPoint (currentPoint: Point, previousPoint: Point, previousNormal: Point, nextNormal: Point, width: number): null | Point {
  // find the vector in the middle of the two normals (add them together) and reverse it to create new normal
  const normal = [-(previousNormal[0] + nextNormal[0]), -(previousNormal[1] + nextNormal[1])]
  if (normal[0] === 0 && normal[1] === 0) { // if a line, just use the previous outer normal reversing the direction
    return [currentPoint[0] - previousNormal[0] * width, currentPoint[1] - previousNormal[1] * width]
  }
  // otherwise we have to find the intersect of the normal unit vector with the
  // previousInner paired with vector from previous to current
  const previousInner = [previousPoint[0] - previousNormal[0] * width, previousPoint[1] - previousNormal[1] * width]
  const currentPreviousNormal = [currentPoint[0] - previousNormal[0] * width, currentPoint[1] - previousNormal[1] * width]
  const intersect = lineIntersect(
    previousInner[0], previousInner[1], // line1 Point1
    currentPreviousNormal[0], currentPreviousNormal[1], // line1 Point2
    currentPoint[0], currentPoint[1], // line2 point1
    currentPoint[0] + normal[0], currentPoint[1] + normal[1] // line2 point2
  )
  // if the intersect point is further away from the currentPointNormal than the currentPreviousNormal
  if (Math.abs(intersect[0] - currentPreviousNormal[0]) > Math.abs(previousInner[0] - currentPreviousNormal[0]) ||
  Math.abs(intersect[1] - currentPreviousNormal[1]) > Math.abs(previousInner[1] - currentPreviousNormal[1])) {
    return null
  }

  // taking that new vector, multiply  (create unit vector) and multiply by width and add to point
  return intersect
}

function lineIntersect (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {
  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1)
  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom

  return [x1 + ua * (x2 - x1), y1 + ua * (y2 - y1)]
}

function squareCap (vector: Point, innerIndex: number, outerIndex: number, width: number, vertices: Vertices, indices: Indices) {
  // create the next 2 points
  const innerNext = [vertices[innerIndex * 2] + vector[0] * width, vertices[innerIndex * 2 + 1] + vector[1] * width]
  const outerNext = [vertices[outerIndex * 2] + vector[0] * width, vertices[outerIndex * 2 + 1] + vector[1] * width]
  // save the next two points
  const innerNextIndex = saveVertices(innerNext, vertices)
  const outerNextIndex = saveVertices(outerNext, vertices)
  // push the two triangles into the indices
  indices.push(
    innerIndex, innerNextIndex, outerIndex,
    outerIndex, innerNextIndex, outerNextIndex
  )
}

function rounding (centerPoint: Point, innerIndex: number, outerIndex: number, inner: Point, outer: Point, width: number, vertices: Vertices, indices: Indices, posDirection?: boolean = false) {
  // get total angle between two indices
  const centerPointIndex = saveVertices(centerPoint, vertices)
  let startAngle = Math.atan2(inner[1] - centerPoint[1], inner[0] - centerPoint[0])
  let endAngle = Math.atan2(outer[1] - centerPoint[1], outer[0] - centerPoint[0])
  if (startAngle === endAngle) return
  let angleDiff = endAngle - startAngle
  // join is ALWAYS an acute angle, so if we don't see that, we are building on the wrong side
  // EPSILON is 0.0001, this is to ensure lossy numbers don't screw up the rounding
  if (angleDiff > Math.PI + 0.0001) angleDiff -= Math.PI * 2
  else if (angleDiff < -Math.PI - 0.0001) angleDiff += Math.PI * 2
  // however, if its and endcap, just swap if posDirection says so
  else if (posDirection) angleDiff = -angleDiff
  // create the segment size
  const segmentCount = ((width > 1) ? width : 1) * Math.abs(angleDiff) * 6 >> 0
  // now we have our increment size
  const angleIncrement = angleDiff / segmentCount
  // move down one after creating angleIncrement to ensure we don't reinput outterIndex
  let nextIndex
  for (let i = 1; i < segmentCount; i++) {
    // create the next point in the triangle, the first will always have been created
    nextIndex = saveVertices([
      centerPoint[0] + width * Math.cos(startAngle + angleIncrement * i),
      centerPoint[1] + width * Math.sin(startAngle + angleIncrement * i)
    ], vertices)
    indices.push(innerIndex, nextIndex, centerPointIndex)
    // update innerIndex as we revolve
    innerIndex = nextIndex
  }
  // create the last triangle
  if (nextIndex) indices.push(centerPointIndex, nextIndex, outerIndex)
}
