export const FILE_ADD = 'FILE_ADD'

/**
 * called when the user click Add File in the NewFileDialogue
 * @param {object} file has attribute name, fileContent that stores the content of the file, fileType store the file's type, doRender = false
 */
export default function add_file(file) {
  return { type: FILE_ADD, file }
}