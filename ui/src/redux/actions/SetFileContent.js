export const FILE_SET_CONTENT = 'FILE_SET_CONTENT'

/**
 * called to set the content of the currently selected file when the server returns the task result.
 * @todo change file to content (string), since right now file object only has one attribute (content) anyway
 * @param {object} file has only the content attribute (no name because its always for the currently selected file)
 */
export default function set_file_content(file) {
  return { type: FILE_SET_CONTENT, file }
}