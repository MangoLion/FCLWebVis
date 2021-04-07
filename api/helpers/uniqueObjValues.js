const uniqueObjValues = (obj) => {
  const constantValues = Object.values(obj)
  const setOfConstantValues = Array.from(new Set(constantValues))
  if(constantValues.length !== setOfConstantValues.length) {
    console.log('ERROR: repeat event')
    return false
  }
  return true
}

module.exports = uniqueObjValues
