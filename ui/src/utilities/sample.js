let samples = {}

let setSamples = function(samples_) {
  samples = samples_
}

let getSampleType = function(name) {
  for (var type in samples) {
    for (var i = 0; i < samples[type].length; i ++)
      if (samples[type][i] == name)
        return type
  }
  return ''
}

export {
  samples,
  setSamples,
  getSampleType
}