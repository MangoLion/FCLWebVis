import arrayToNChunks from './arrayToNChunks'

/* const recursiveFunc = (lines, index = 0) => {
  if(index === lines.length)
    return true
  else if(lines[index].length !== 0 &&
          lines[index].length % 3 === 0) {
    const posLineCoords = arrayToNChunks(lines[index])
    const allCoordResults = posLineCoords.map(posCoord =>
      posCoord.every(
        posCoordVal => !isNaN(posCoordVal)))
    
    return allCoordResults.every(coordResult => coordResult)
      ? eachLineHasValidCoords(lines, index + 1)
      : false
  }

  return false
} */

const iterativeFunc = (lines) => {
  for (const line in lines) {
    if(line.length !== 0 && line.length % 3 === 0) {
      const posLineCoords = arrayToNChunks(line)
      const allCoordResults = posLineCoords.map(posCoord =>
        posCoord.every(
          posCoordVal => !isNaN(posCoordVal)))
      
      if(!allCoordResults.every(coordResult => coordResult))
        return false
    }
  }
  return true
}

// Check if there are 3 number values for each 3D coordinate
const eachLineHasValidCoords = (CoordsForEachLine) => iterativeFunc(CoordsForEachLine)

export default eachLineHasValidCoords
