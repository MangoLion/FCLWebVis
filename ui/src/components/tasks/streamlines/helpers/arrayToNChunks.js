const arrayToNChunks = (array, chunks) => {
  let result = []

  for (let i = chunks; i > 0; i--)
    result.push(array.splice(0, Math.ceil(array.length / i)))

  return result
}

export default arrayToNChunks
