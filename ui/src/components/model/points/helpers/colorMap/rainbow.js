import * as THREE from 'three'

/**
 * Convert HSV to RGB color 
 */
const hsvRgb = (hsv) => {
  var h, s, v          // hue, sat, value
  var i, f, p, q, t    // interim values

  // guarantee valid input:

  h = hsv[0] / 60.
  while (h >= 6.) h -= 6.
  while (h < 0.) h += 6.

  s = hsv[1]
  if (s < 0.)
    s = 0.
  if (s > 1.)
    s = 1.

  v = hsv[2]
  if (v < 0.)
    v = 0.
  if (v > 1.)
    v = 1.

  if (s === 0.0) // if sat== 0, then is a gray
    return [v, v, v]

  // get an rgb from the hue itself:

  i = Math.floor(h)
  f = h - i
  p = v * (1. - s)
  q = v * (1. - s * f)
  t = v * (1. - s * (1. - f))

  const value = Math.floor(i)
  if(value === 0)
    return [v, t, p]
  else if(value === 1)
    return [q, v, p]
  else if(value === 2)
    return [p, v, t]
  else if(value === 3)
    return [p, q, v]
  else if(value === 4)
    return [t, p, v]
  else if(value === 5)
    return [v, p, q]
  else
    return [0, 0, 0]
}

/**
 * Rainbow color mapping 
 */
const rainbow = (colorMap, value) => {
  //Compute rgb color values and return as an array
  const t = (value - colorMap.min) / (colorMap.max - colorMap.min)
  const hsv = [
    255 * (1-t),
    1.0,
    1.0,
  ]
  return new THREE.Color(...hsvRgb(hsv))
}

export default rainbow
