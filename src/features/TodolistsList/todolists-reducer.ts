import {todolistsAPI, TodolistType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {
    RequestStatus,
    RequestStatusType,
    SetErorType,
    SetLoadingType,
    setStatusEror,
    setStatusLoading
} from "../../app/app-reduser";
import {ThunkAction} from "redux-thunk";
import {AppRootStateType} from "../../app/store";

const initialState: Array<TodolistDomainType> = []

export const todolistsReducer = (state: Array<TodolistDomainType> = initialState, action: ActionsTypTodo): Array<TodolistDomainType> => {
    switch (action.type) {
        case 'CHANGE-STATUS':{
            return state.map(el => el.id===action.Todoid?{...el,entityStatus:action.status}:el)
        }
        case 'REMOVE-TODOLIST':
            return state.filter(tl => tl.id !== action.id)
        case 'ADD-TODOLIST':
            return [{...action.todolist, filter: 'all',entityStatus:'idle'}, ...state]
        case 'CHANGE-TODOLIST-TITLE':
            return state.map(tl => tl.id === action.id ? {...tl, title: action.title} : tl)
        case 'CHANGE-TODOLIST-FILTER':
            return state.map(tl => tl.id === action.id ? {...tl, filter: action.filter} : tl)
        case 'SET-TODOLISTS':
            return action.todolists.map(tl => ({...tl, filter: 'all',entityStatus:'idle'}))
        default:
            return state
    }
}

// actions
export const removeTodolistAC = (id: string) => ({type: 'REMOVE-TODOLIST', id} as const)
export const addTodolistAC = (todolist: TodolistType) => ({type: 'ADD-TODOLIST', todolist} as const)
export const changeTodolistTitleAC = (id: string, title: string) => ({
    type: 'CHANGE-TODOLIST-TITLE',
    id,
    title
} as const)

export const changeEntytiStatusAC = (Todoid: string, status:RequestStatusType) => ({
    type: 'CHANGE-STATUS',
    Todoid,
    status
} as const)
export const changeTodolistFilterAC = (id: string, filter: FilterValuesType) => ({
    type: 'CHANGE-TODOLIST-FILTER',
    id,
    filter
} as const)
export const setTodolistsAC = (todolists: Array<TodolistType>) => ({type: 'SET-TODOLISTS', todolists} as const)

// thunks
export const fetchTodolistsTC = () => {
    return (dispatch: Dispatch<ActionsTypTodo>) => {
        dispatch(setStatusLoading(RequestStatus.LOADING))
        todolistsAPI.getTodolists()
            .then((res) => {
                dispatch(setTodolistsAC(res.data))
                dispatch(setStatusLoading('succeeded'))

            })
    }
}
export const removeTodolistTC = (todolistId: string) => {
    return (dispatch: Dispatch<ActionsTypTodo>) => {
        dispatch(setStatusLoading(RequestStatus.LOADING))
        dispatch(changeEntytiStatusAC(todolistId,RequestStatus.LOADING))
        todolistsAPI.deleteTodolist(todolistId)
            .then((res) => {
                dispatch(removeTodolistAC(todolistId))
                dispatch(setStatusLoading('succeeded'))
            })
            .catch(()=>{
                dispatch(changeEntytiStatusAC(todolistId,'idle'))
            })
    }
}
export const addTodolistTC = (title: string):ThunkAction<void, AppRootStateType, unknown, ActionsTypTodo> => {
    return (dispatch) => {
        dispatch(setStatusLoading(RequestStatus.LOADING))
        todolistsAPI.createTodolist(title)
            .then((res) => {
                // dispatch(addTodolistAC(res.data.data.item))
                dispatch(setStatusLoading('succeeded'))
                dispatch(fetchTodolistsTC())
            })
    }
}







export const changeTodolistTitleTC = (id: string, title: string) => {
    return (dispatch: Dispatch<ActionsTypTodo>) => {
        todolistsAPI.updateTodolist(id, title)
            .then((res) => {
                dispatch(changeTodolistTitleAC(id, title))
            })
    }
}

// types
export type AddTodolistActionType = ReturnType<typeof addTodolistAC>;
export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>;
export type SetTodolistsActionType = ReturnType<typeof setTodolistsAC>;

export type ActionsTypTodo =
    | RemoveTodolistActionType
    | AddTodolistActionType
    | ReturnType<typeof changeTodolistTitleAC>
    | ReturnType<typeof changeTodolistFilterAC>
    | ReturnType<typeof changeEntytiStatusAC>
    | SetTodolistsActionType|SetLoadingType|SetErorType

export type FilterValuesType = 'all' | 'active' | 'completed';

export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}
