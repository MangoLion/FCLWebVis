import eachLineHasValidCoords from './eachLineHasValidCoords'
import arrayToNChunks from './arrayToNChunks'

const getLineCoordsFromText = (text) => new Promise((resolve) => {
  /// Convert string of coordinates in array of line coordinates ///
  const fileLines = text.split(/\r?\n/)

  /// Convert each line into a array of floats ///
  const posCoordsForLines = fileLines
    .map(row =>             // convert each line into array of floats
      row.replace(',', '')  // remove EOL comma of n - 1 rows (where n is 2 or more)
        .trim()               // remove excess spaces at the beginning/end of the line
        .split(/\s+/)         // create string array by splitting at 1 or more spaces
        .map(Number)          // convert string array to float array
    )

  if(eachLineHasValidCoords(posCoordsForLines)) {
    const coordsForLines = posCoordsForLines.map(lineCoords => {
      const numLineCoords = lineCoords.length / 3
      return arrayToNChunks(lineCoords, numLineCoords)
    })

    return resolve(coordsForLines) 
  }

  return resolve(null)
})

export default getLineCoordsFromText
