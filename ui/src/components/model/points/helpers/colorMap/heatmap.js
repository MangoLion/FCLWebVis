import * as THREE from 'three'

/**
 * Heatmap color mapping 
 */
const heatmap = (colorMap, value) => {
  const t = (value - colorMap.min) / (colorMap.max - colorMap.min)
  var h = (1.0 - t) * 240
  var color = new THREE.Color('hsl('+h+', 100%, 50%)')
  
  return color
}

export default heatmap
