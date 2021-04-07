export const TASK_ADD = 'TASK_ADD'

/**
 * called when the user click Add Task in the NewTaskDialogue
 * @param {object} task has attribute name (for the name of the result file of the task), taskType store the task's type, doRender = false
 */
export default function add_task(task) {
  return { type: TASK_ADD, task }
}