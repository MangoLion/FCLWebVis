const getCoordAverages = (lines) => {
  const X = lines.map((line) => line.map((coord) => coord[0])).flat(),
    Y = lines.map((line) => line.map((coord) => coord[1])).flat(),
    Z = lines.map((line) => line.map((coord) => coord[2])).flat()

  const avgX = X.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / X.length,
    avgY = Y.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / Y.length,
    avgZ = Z.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / Z.length

  return [ avgX, avgY, avgZ ]
}

export default getCoordAverages