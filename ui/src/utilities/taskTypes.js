let taskTypes = {}

let registerTaskType = (task) => {
  task = {
    sendToServer:true,
    ...task
  }
  taskTypes[task.name] = task
}

let getTaskType = (name) => {
  return taskTypes[name]
}

let getTaskTypes = () => {
  return taskTypes
}

let applyTaskType = (file, strTaskType) => {
  file.taskType = strTaskType
  if (!file.taskFields)
    file.taskFields = {}
  file.taskFields = {
    ...file.taskFields,
    ...getTaskType(strTaskType).fields,
  }

  if (taskTypes[strTaskType].onSubmit)
    file.onSubmit = taskTypes[strTaskType].onSubmit

  console.log('APPLIED TASK TYPE')
  console.log(file)
  console.log(getTaskType(strTaskType))
}

export {
  registerTaskType,
  getTaskTypes,
  getTaskType,
  applyTaskType
}