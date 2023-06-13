import {
    ActionsTypTodo,
    AddTodolistActionType, fetchTodolistsTC,
    FilterValuesType,
    RemoveTodolistActionType,
    SetTodolistsActionType
} from './todolists-reducer'
import {
    TaskPriorities,
    TaskStatuses,
    TaskType,
    todolistsAPI,
    TodolistType,
    UpdateTaskModelType
} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {AppRootStateType} from '../../app/store'
import {
    RequestStatus,
    RequestStatusType,
    SetErorType,
    SetLoadingType,
    setStatusEror,
    setStatusLoading
} from "../../app/app-reduser";
import {handleServerNetworkError} from "../../utills/error-utils";
import {AxiosError} from "axios";
import {ThunkAction} from "redux-thunk";

const initialState: TasksStateType = {}

export const tasksReducer = (state: TasksStateType = initialState, action: ActionsTypeTask): TasksStateType => {
    switch (action.type) {
        case 'REMOVE-TASK':
            return {...state, [action.todolistId]: state[action.todolistId].filter(t => t.id !== action.taskId)}
        case 'ADD-TASK':
            const newTask = {...action.task, entityStatus:RequestStatus.SUCCEEDED}
            return {...state, [action.task.todoListId]: [newTask, ...state[action.task.todoListId]]}

        case 'UPDATE-TASK':
            return {
                ...state,
                [action.todolistId]: state[action.todolistId]
                    .map(t => t.id === action.taskId ? {...t, ...action.model} : t)
            }
        case 'ADD-TODOLIST':
            return {...state, [action.todolist.id]: []}
        case 'REMOVE-TODOLIST':
            const copyState = {...state}
            delete copyState[action.id]
            return copyState
        case 'SET-TODOLISTS': {
            const copyState = {...state}
            action.todolists.forEach(tl => {
                copyState[tl.id] = []
            })
            return copyState
        }
        case 'SET-TASKS':

            return {...state, [action.todolistId]: action.tasks.map(el=>({...el,entityStatus:RequestStatus.SUCCEEDED}))}

        case 'SET-TASKS-REQUEST':{

            const updateTasksStatus = state[action.todolistId].map(el=>el.id===action.taskId?({...el,entityStatus:RequestStatus.LOADING}):el)

            return {...state, [action.todolistId]: updateTasksStatus}
        }

        default:
            return state
    }
}

// actions
export const removeTaskAC = (taskId: string, todolistId: string) =>
    ({type: 'REMOVE-TASK', taskId, todolistId} as const)
export const addTaskAC = (task: TaskDomainType) =>
    ({type: 'ADD-TASK', task} as const)

export const updateTaskAC = (taskId: string, model: UpdateDomainTaskModelType, todolistId: string) =>
    ({type: 'UPDATE-TASK', model, todolistId, taskId} as const)
export const setTasksAC = (tasks: Array<TaskDomainType>, todolistId: string) =>
    ({type: 'SET-TASKS', tasks, todolistId} as const)

export const setTasksRequestStatusAC = (todolistId: string, taskId: string) =>
    ({type: 'SET-TASKS-REQUEST', todolistId, taskId} as const)


export const fetchTasksTC = (todolistId: string) => (dispatch: Dispatch<ActionsTypeTask>) => {

    dispatch(setStatusLoading(RequestStatus.LOADING))

    todolistsAPI.getTasks(todolistId)
        .then((res) => {
            const tasks = res.data.items
            const action = setTasksAC(tasks, todolistId)
            dispatch(action)
            dispatch(setStatusLoading('succeeded'))
        })
}
export const removeTaskTC = (taskId: string, todolistId: string) => (dispatch: Dispatch<ActionsTypeTask>) => {
    dispatch(setTasksRequestStatusAC(todolistId,taskId))
    todolistsAPI.deleteTask(todolistId, taskId)
        .then(res => {
            const action = removeTaskAC(taskId, todolistId)
            dispatch(action)
        })
}
export const addTaskTC = (title: string, todolistId: string):ThunkAction<void, AppRootStateType, unknown, ActionsTypeTask> => (dispatch)  => {
    dispatch(setStatusLoading(RequestStatus.LOADING))
    todolistsAPI.createTask(todolistId, title)

        .then(res => {

            if (res.data.resultCode===ResultCode.SUCCESS){

            const task = res.data.data.item

                const action = addTaskAC(task)

                dispatch(action)
                dispatch(fetchTasksTC(todolistId))

                dispatch(setStatusLoading('succeeded'))

            }
            else {
                if (res.data.messages.length){
                    dispatch(setStatusEror(res.data.messages[0]))
                }
                else {
                    dispatch(setStatusEror('Some Error'))
                }
            }

        })
        .catch((e)=> {
            handleServerNetworkError(e.message,dispatch)
        })


}
export const updateTaskTC = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
    (dispatch: Dispatch<ActionsTypeTask>, getState: () => AppRootStateType) => {
        const state = getState()
        const task = state.tasks[todolistId].find(t => t.id === taskId)
        if (!task) {
            //throw new Error("task not found in the state");
            console.warn('task not found in the state')
            return
        }

        const apiModel: UpdateTaskModelType = {
            deadline: task.deadline,
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            title: task.title,
            status: task.status,
            ...domainModel
        }

        todolistsAPI.updateTask(todolistId, taskId, apiModel)
            .then(res => {
                const action = updateTaskAC(taskId, domainModel, todolistId)
                dispatch(action)
            })
    }


    enum ResultCode{

        SUCCESS,
        ERROR = 1

    }
// types
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}
export type TasksStateType = {
    [key: string]: Array<TaskDomainType>
}

export type TaskDomainType = TaskType & {
    entityStatus: RequestStatus
}

export type ActionsTypeTask =
    | ReturnType<typeof removeTaskAC>
    | ReturnType<typeof addTaskAC>
    | ReturnType<typeof updateTaskAC>
    | AddTodolistActionType
    | RemoveTodolistActionType
    | SetTodolistsActionType
    | ReturnType<typeof setTasksAC>|SetLoadingType|SetErorType
    |ReturnType<typeof setTasksRequestStatusAC>
