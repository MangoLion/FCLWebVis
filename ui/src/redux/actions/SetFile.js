export const FILE_SET = 'FILE_SET'

/** 
 * set the current file to this file, triggered when the user selects a TreeWindow item (NOT its checkbox!)
 * @todo change the file from object to just a string
 * @param {object} file only has name attribute to indicate the name of the file to be selected
 */
export default function set_task(file) {
  return { type: FILE_SET, file }
}