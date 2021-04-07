export const FILE_REMOVE = 'FILE_REMOVE'

/**
 * called when the user click Add File in the NewFileDialogue
 * @param {object} file has attribute name, fileContent that stores the content of the file, fileType store the file's type, doRender = false
 */
export default function remove_file() {
  return { type: FILE_REMOVE }
}