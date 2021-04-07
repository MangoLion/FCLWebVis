export const LOADED_SET = 'LOADED_SET'

/**
 * Once a file is successfully uploaded to the server, set to true to indicate that the server already has the fileContents of this file in memory so that in the future, will leave fileContent blank when sending the taskFields to the server
 * @param {string} fileName 
 */
export default function set_loaded(fileName) {
  return { type: LOADED_SET, fileName }
}