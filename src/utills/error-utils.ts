
import { ResponseType } from '../api/todolists-api'
import {setStatusEror, setStatusLoading} from "../app/app-reduser";
import {ActionsTypeTask} from "../features/TodolistsList/tasks-reducer";
import {ActionsTypTodo} from "../features/TodolistsList/todolists-reducer";
import {Dispatch} from "redux";

// generic function
// export const handleServerAppError = <T>(data: ResponseType<T>, dispatch: ErrorUtilsDispatchType) => {
//     if (data.messages.length) {
//         dispatch(setAppErrorAC(data.messages[0]))
//     } else {
//         dispatch(setAppErrorAC('Some error occurred'))
//     }
//     dispatch(setAppStatusAC('failed'))
// }

export const handleServerNetworkError = (error: { message: string }, dispatch: Dispatch<ErrorUtilsDispatchType>) => {
    dispatch(setStatusEror(error.message))
    dispatch(setStatusLoading('failed'))
}

type ErrorUtilsDispatchType = ActionsTypeTask|ActionsTypTodo


