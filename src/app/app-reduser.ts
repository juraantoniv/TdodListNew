//app-reducer.tsx


import {Dispatch} from "redux";
import {todolistsAPI} from "../api/todolists-api";
import {setTasksAC} from "../features/TodolistsList/tasks-reducer";

export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'
export enum RequestStatus  {
    IDLE ='idle',
    LOADING ='loading',
    SUCCEEDED ='succeeded'
}
const initialState = {
    status: 'loading' as RequestStatusType,
    error:null as null |string
}

type InitialStateType = typeof initialState

export const appReducer = (state: InitialStateType = initialState, action: ActionsType): InitialStateType => {
    switch (action.type) {
        case 'APP/SET-STATUS':
            return {...state, status: action.status}
        case 'APP/SET-ERROR':{

            return {...state, error: action.error}
        }
        default:
            return state
    }
}


export const setStatusLoading = (status: RequestStatusType) =>({
    type:'APP/SET-STATUS',status
} as const)


export type SetLoadingType = ReturnType<typeof setStatusLoading>


type ActionsType = SetLoadingType|SetErorType

export const setStatusEror = (error: string|null) =>({
    type:'APP/SET-ERROR',error
} as const)


export type SetErorType = ReturnType<typeof setStatusEror>



