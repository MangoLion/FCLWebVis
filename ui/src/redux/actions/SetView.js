export const VIEW_SET = 'VIEW_SET'

/**
 * called when the user click Add Task in the NewTaskDialogue
 * @param {object} task has attribute name (for the name of the result file of the task), taskType store the task's type, doRender = false
 */
export default function set_view(viewType) {
  return { type: VIEW_SET, viewType }
}