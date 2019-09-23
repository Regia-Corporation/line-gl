# line-gl [![travis][travis-image]][travis-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url] [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

[travis-image]: https://travis-ci.org/regia-corporation/line-gl.svg?branch=master
[travis-url]: https://travis-ci.org/regia-corporation/line-gl
[npm-image]: https://img.shields.io/npm/v/line-gl.svg
[npm-url]: https://npmjs.org/package/line-gl
[downloads-image]: https://img.shields.io/npm/dm/line-gl.svg
[downloads-url]: https://www.npmjs.com/package/line-gl

## About

**Convert a line array to a triangle mesh. designed to be fast, efficient, and sphere capable.**

## Install

```sh
# Yarn
yarn add line-gl
# NPM
npm install --save line-gl
```

## How to Use

### Import

```js
// ES6
import drawLine from './line-gl'
// standard
const drawLine = require('./lib').default
```

### Use

```js
const { vertices, indices } = drawLine([[-1, 1], [-1, -1], [1, -1], [1, 1]], { width: 0.5, join: 'bevel', cap: 'butt' })
```


## API

### Function

drawLine (points: Array<Point>, attributes?: Attributes = {}): null | Line

# Types

type Cap = 'butt' | 'square' | 'round'

type Join = 'bevel' | 'miter' | 'round'

type Attributes = {
  cap?: Cap,
  join?: Join,
  width?: number,
  miterLimit?: number
}

type Vertices = Array<number>

type Indices = Array<number>

type Line = {
  vertices: Vertices,
  indices: Indices
}

type Point = [number, number]

---

## ISC License (ISC)

Copyright 2019 <Regia>
Copyright (c) 2004-2010 by Internet Systems Consortium, Inc. ("ISC")
Copyright (c) 1995-2003 by Internet Software Consortium

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
