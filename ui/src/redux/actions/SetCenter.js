export const CENTER_SET = 'CENTER_SET'

/**
 * called when the user click Add File in the NewFileDialogue
 * @param {array} center [x,y,z]
 */
export default function set_center(center) {
  return { type: CENTER_SET, center }
}