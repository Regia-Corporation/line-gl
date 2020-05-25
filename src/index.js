// @flow
export type Line = {
  prev: Array<number>,
  curr: Array<number>,
  next: Array<number>,
  lengthSoFar: Array<number>
}

type Point = [number, number]

function drawLine (points: Array<Point>, dashed?: boolean = false): Line {
  const ll = points.length
  // corner case: Theres less than 2 points in the array
  if (ll < 2) return { prev: [], curr: [], next: [], lengthSoFar: [] }

  const prev = [...points[0]]
  const curr = [...points[0]]
  const next = []
  const lengthSoFar = [0]
  let curLength = 0
  let prevPoint = points[0]

  for (let i = 1; i < ll; i++) {
    // get the next point
    const point = points[i]
    // move on if duplicate point
    if (prevPoint[0] === point[0] && prevPoint[1] === point[1]) continue
    // store the next pair
    next.push(...point)
    // store the point as the next "start"
    curr.push(...point)
    // store the previous point
    prev.push(...prevPoint)
    // build the lengthSoFar
    if (dashed) curLength += Math.sqrt(Math.pow(point[0] - prevPoint[0], 2) + Math.pow(point[1] - prevPoint[1], 2))
    lengthSoFar.push(curLength)
    // store the old point
    prevPoint = point
  }
  // here we actually just store 'next'
  next.push(...points[ll - 1])

  return { prev, curr, next, lengthSoFar }
}

exports.default = exports.drawLine = drawLine
