import { useState, useEffect } from 'react'

const useViewportDimensions = () => {
  const [width, setWidth] = useState(window.innerWidth)
  const [height, setHeight] = useState(window.innerHeight)
  let resizeId
  useEffect(() => {
    window.addEventListener('resize', () => {
      // console.log(window.innerWidth, window.innerHeight)
      clearTimeout(resizeId)
      resizeId = setTimeout(() => {
        setWidth(window.innerWidth)
        setHeight(window.innerHeight)
      }, 500)
    })

    return () => window.removeEventListener('resize', () => {})
  }, [])

  return {
    width,
    height,
  }
}

export default useViewportDimensions
