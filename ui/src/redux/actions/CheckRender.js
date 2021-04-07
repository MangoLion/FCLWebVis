export const RENDER_CHECK = 'RENDER_CHECK'

/**
 * called when the user clicks on the checkbox in the TreeWindow items. Will toggle the doRender Attribute of the file
 * @param {string} fileName name of the file that the checkbox belongs to
 */
export default function check_render(fileName) {
  return { type: RENDER_CHECK, fileName }
}