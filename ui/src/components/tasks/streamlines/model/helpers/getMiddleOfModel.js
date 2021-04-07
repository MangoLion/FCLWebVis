import getCoordAverages from './getCoordAverages'

const getMiddleOfModel = (lines) => {
  const X = lines.map((line) => line.map((coord) => coord[0])).flat(),
    Y = lines.map((line) => line.map((coord) => coord[1])).flat(),
    Z = lines.map((line) => line.map((coord) => coord[2])).flat()

  return [
    (Math.min(...X) + Math.max(...X)) / 2,
    (Math.min(...Y) + Math.max(...Y)) / 2,
    (Math.min(...Z) + Math.max(...Z)) / 2,
  ]
}

export default getMiddleOfModel