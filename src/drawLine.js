// @flow
const EPSILON = 0.0001

type Attributes = {
  cap?: 'butt' | 'square' | 'round',
  join?: 'bevel' | 'miter' | 'round',
  width?: number,
  miterLimit?: number
}

export default function getStrokeGeometry (points: Array<number>, attributes?: Attributes = {}) {
  // trivial reject
  if (points.length < 2) { return }

  const cap = attributes.cap || 'butt'
  let join = attributes.join || 'bevel'
  const lineWidth = (attributes.width || 1) / 2
  const miterLimit = attributes.miterLimit || 10
  const vertices = []
  const middlePoints = [] // middle points per each line segment.
  let closed = false

  if (points.length === 2) {
    join = 'bevel'
    createTriangles(points[0], Point.Middle(points[0], points[1]), points[1], vertices, lineWidth, join, miterLimit)
  } else {
    // if a closed loop, we find the middle point of the first one
    if (points[0] === points[points.length - 1] || (points[0].x === points[points.length - 1].x && points[0].y === points[points.length - 1].y )) {
      let p0 = points.shift()

      p0 = Point.Middle(p0, points[0])
      points.unshift(p0)
      points.push(p0)
      closed = true
    }

    let i, pl
    for (i = 0, pl = points.length - 1; i < pl; i++) {
      if (i === 0) {
        middlePoints.push(points[0])
      } else if (i === points.length - 2) {
        middlePoints.push(points[points.length - 1])
      } else {
        middlePoints.push(Point.Middle(points[i], points[i + 1]))
      }
    }

    for (i = 1, pl = middlePoints.length; i < pl; i++) {
      createTriangles(middlePoints[i - 1], points[i], middlePoints[i], vertices, lineWidth, join, miterLimit)
    }
  }

  if (!closed) {
    if (cap === 'round') {
      const p00 = vertices[0]
      const p01 = vertices[1]
      const p02 = points[1]
      const p10 = vertices[vertices.length - 1]
      const p11 = vertices[vertices.length - 3]
      const p12 = points[points.length - 2]

      createRoundCap(points[0], p00, p01, p02, vertices)
      createRoundCap(points[points.length - 1], p10, p11, p12, vertices)
    } else if (cap === 'square') {
      const p00 = vertices[vertices.length - 1]
      const p01 = vertices[vertices.length - 3]

      createSquareCap(vertices[0], vertices[1], Point.Sub(points[0], points[1]).normalize().scalarMult(Point.Sub(points[0], vertices[0]).length()), vertices)
      createSquareCap(p00, p01, Point.Sub(points[points.length - 1], points[points.length - 2]).normalize().scalarMult(Point.Sub(p01, points[points.length - 1]).length()), vertices)
    }
  }

  return vertices
}

function createTriangles(p0, p1, p2, verts, width, join, miterLimit) {
  let t0 = Point.Sub(p1, p0)
  let t2 = Point.Sub(p2, p1)

  t0.perpendicular()
  t2.perpendicular()

  // triangle composed by the 3 points if clockwise or couterclockwise.
  // if counterclockwise, we must invert the line threshold points, otherwise the intersection point
  // could be erroneous and lead to odd results.
  if (signedArea(p0, p1, p2) > 0) {
    t0.invert()
    t2.invert()
  }

  t0.normalize()
  t2.normalize()
  t0.scalarMult(width)
  t2.scalarMult(width)

  let pintersect = lineIntersection(Point.Add(t0, p0), Point.Add(t0, p1), Point.Add(t2, p2), Point.Add(t2, p1))

  let anchor: Point
  let anchorLength = Number.MAX_VALUE
  if (pintersect) {
    anchor = Point.Sub(pintersect, p1)
    anchorLength = anchor.length()
  }
  let dd = (anchorLength / width) | 0
  let p0p1 = Point.Sub(p0, p1)
  let p0p1Length = p0p1.length()
  let p1p2 = Point.Sub(p1, p2)
  let p1p2Length = p1p2.length()

  /**
   * the cross point exceeds any of the segments dimension.
   * do not use cross point as reference.
   */
  if (anchorLength > p0p1Length || anchorLength > p1p2Length) {
    verts.push(Point.Add(p0, t0))
    verts.push(Point.Sub(p0, t0))
    verts.push(Point.Add(p1, t0))

    verts.push(Point.Sub(p0, t0))
    verts.push(Point.Add(p1, t0))
    verts.push(Point.Sub(p1, t0))

    if ( join === "round" ) {
      createRoundCap(p1, Point.Add(p1,t0), Point.Add(p1,t2), p2, verts)
    } else if ( join==="bevel" || (join==="miter" && dd>=miterLimit) ) {
      verts.push( p1 )
      verts.push( Point.Add(p1,t0) )
      verts.push( Point.Add(p1,t2) )
    } else if (join === 'miter' && dd<miterLimit && pintersect) {
      verts.push( Point.Add(p1,t0) )
      verts.push( p1 )
      verts.push( pintersect )

      verts.push( Point.Add(p1,t2) )
      verts.push( p1 )
      verts.push( pintersect )
    }

    verts.push(Point.Add(p2, t2))
    verts.push(Point.Sub(p1, t2))
    verts.push(Point.Add(p1, t2))

    verts.push(Point.Add(p2, t2))
    verts.push(Point.Sub(p1, t2))
    verts.push(Point.Sub(p2, t2))
  } else {
    verts.push(Point.Add(p0, t0))
    verts.push(Point.Sub(p0, t0))
    verts.push(Point.Sub(p1, anchor))

    verts.push(Point.Add(p0, t0))
    verts.push(Point.Sub(p1, anchor))
    verts.push(Point.Add(p1, t0))

    if (join === "round") {
        let _p0 = Point.Add(p1, t0)
        let _p1 = Point.Add(p1, t2)
        let _p2 = Point.Sub(p1, anchor)

        let center = p1

        verts.push(_p0)
        verts.push(center)
        verts.push(_p2)

        createRoundCap(center, _p0, _p1, _p2, verts)

        verts.push(center)
        verts.push(_p1)
        verts.push(_p2)
    } else {
      if (join === 'bevel' || (join === 'miter' && dd >= miterLimit)) {
        verts.push(Point.Add(p1, t0))
        verts.push(Point.Add(p1, t2))
        verts.push(Point.Sub(p1, anchor))
      }

      if (join === 'miter' && dd < miterLimit) {
        verts.push(pintersect)
        verts.push(Point.Add(p1, t0))
        verts.push(Point.Add(p1, t2))
      }
    }

    verts.push(Point.Add(p2, t2))
    verts.push(Point.Sub(p1, anchor))
    verts.push(Point.Add(p1, t2))

    verts.push(Point.Add(p2, t2))
    verts.push(Point.Sub(p1, anchor))
    verts.push(Point.Sub(p2, t2))
  }
}

function createRoundCap(center: Point, _p0: Point, _p1: Point, nextPointInLine: Point, verts: Array<any>) {
  const radius = Point.Sub(center, _p0).length();

  let angle0 = Math.atan2((_p1.y - center.y), (_p1.x - center.x))
  let angle1 = Math.atan2((_p0.y - center.y), (_p0.x - center.x))

  const orgAngle0 = angle0

  if (angle1 > angle0 && angle1 - angle0 >= Math.PI - EPSILON) {
    angle1 = angle1 - 2 * Math.PI
  } else if (angle0 - angle1 >= Math.PI - EPSILON) {
    angle0 -= 2 * Math.PI
  }

  let angleDiff = angle1 - angle0

  if (Math.abs(angleDiff) >= Math.PI - EPSILON && Math.abs(angleDiff) <= Math.PI + EPSILON) {
    const r1 = Point.Sub(center, nextPointInLine)
    if ((r1.x === 0 && r1.y > 0) || r1.x >= -EPSILON) { angleDiff = -angleDiff }
  }

  let nsegments = (Math.abs(angleDiff * radius) / 7) >> 0
  nsegments++

  const angleInc = angleDiff / nsegments

  for (var i = 0; i < nsegments; i++) {
    verts.push(new Point(center.x, center.y))
    verts.push(new Point(center.x + radius * Math.cos(orgAngle0 + angleInc * i), center.y + radius * Math.sin(orgAngle0 + angleInc * i)))
    verts.push(new Point(center.x + radius * Math.cos(orgAngle0 + angleInc * (1 + i)), center.y + radius * Math.sin(orgAngle0 + angleInc * (1 + i))))
  }
}

function createSquareCap(p0: Point, p1: Point, dir: Point, verts: Array<any>) {
  verts.push(p0)
  verts.push(Point.Add(p0, dir))
  verts.push(Point.Add(p1, dir))

  verts.push(p1)
  verts.push(Point.Add(p1, dir))
  verts.push(p0)
}

function signedArea(p0: Point, p1: Point, p2: Point) {
  return (p1.x - p0.x) * (p2.y - p0.y) - (p2.x - p0.x) * (p1.y - p0.y)
}

function lineIntersection(p0: Point, p1: Point, p2: Point, p3: Point) {
  const a0 = p1.y - p0.y
  const a1 = p3.y - p2.y
  const b0 = p0.x - p1.x
  const b1 = p2.x - p3.x

  const det = a0 * b1 - a1 * b0
  if (det > -EPSILON && det < EPSILON) {
    return null
  } else {
    const c0 = a0 * p0.x + b0 * p0.y
    const c1 = a1 * p2.x + b1 * p2.y
    const x = (b1 * c0 - b0 * c1) / det
    const y = (a0 * c1 - a1 * c0) / det

    return new Point(x, y)
  }
}

class Point {
  x: number

  y: number

  Angle: Function

  Add: Function

  Sub: Function

  Middle: Function

  constructor (x, y) {
    this.x = x
    this.y = y
  }

  scalarMult (f) {
    this.x *= f
    this.y *= f

    return this
  }

  perpendicular () {
    const x = this.x
    this.x = -this.y
    this.y = x

    return this
  }

  invert () {
    this.x = -this.x
    this.y = -this.y

    return this
  }

  length () {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  normalize () {
    const mod = this.length()

    this.x /= mod
    this.y /= mod

    return this
  }

  angle () {
    return this.y / this.x
  }

  static Angle (p0: Point, p1: Point): number {
    return Math.atan2(p1.x - p0.x, p1.y - p0.y)
  }

  static Add (p0: Point, p1: Point): Point {
    return new Point(p0.x + p1.x, p0.y + p1.y)
  }

  static Sub (p0: Point, p1: Point): Point {
    return new Point(p0.x - p1.x, p0.y - p1.y)
  }

  static Middle (p0: Point, p1: Point): Point {
    return Point.Add(p0, p1).scalarMult(0.5)
  }
}
