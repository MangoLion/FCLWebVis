const var_list = {}
export function addFileName(v) {
  if (!var_list[v.name])
    var_list[v.name] = []

  let found = false
  var_list[v.name].forEach(name => {
    if (name == v.fileName)
      found = true
  })

  if (!found)
    var_list[v.name].push(v.fileName)
}

export function getFileNames(name) {
  if (!var_list[name])
    return []

  return var_list[name]
}