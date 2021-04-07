export const SET_TREE = 'SET_TREE'

/**
 * called when the user click Add File in the NewFileDialogue
 * @param {object} file has attribute name, fileContent that stores the content of the file, fileType store the file's type, doRender = false
 */
export default function set_tree(openItems) {
  return { type: SET_TREE, openItems }
}