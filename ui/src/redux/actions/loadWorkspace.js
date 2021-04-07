export const WORKSPACE_LOAD = 'WORKSPACE_LOAD'

/**
 * called when the user click Add File in the NewFileDialogue
 * @param {object} file has attribute name, fileContent that stores the content of the file, fileType store the file's type, doRender = false
 */
export default function loadWorkspace(state) {
  return { type: WORKSPACE_LOAD, state }
}