import rainbow from './rainbow'
import heatmap from './heatmap'

const COLOR_MAP_TYPES = {
  RAINBOW: 'RAINBOW',
  HEATMAP: 'HEATMAP'
}

const COLOR_MAP_FUNCS = {
  RAINBOW: rainbow,
  HEATMAP: heatmap
}

const getValueColorMap = (value, colorMap) => {
  const colorMapFunc = COLOR_MAP_FUNCS[colorMap.type]
  return colorMapFunc(
    colorMap,
    value
  )
}

const getPointsColorMap = (line, colorMap) => {
  const colorMapFunc = COLOR_MAP_FUNCS[colorMap.type]
  return line.point_data.map((mapValue) =>
    colorMapFunc(
      colorMap,
      mapValue
    )
  )
}

export {
  COLOR_MAP_TYPES,
  getPointsColorMap,
  getValueColorMap
}