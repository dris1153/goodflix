import { envConfig } from '@/core/configs/env.config'
import { IAxiosResponse } from '@/core/types/api.type'
import axios, { AxiosError, AxiosResponse } from 'axios'
// import { refreshTokenRequest } from './auths'

// const onRefreshToken = async () => {
//   const refreshToken = getCookie(COOKIES.REFRESH_TOKEN)
//   if (refreshToken) {
//     try {
//       // const data = await refreshTokenRequest(refreshToken)
//       // setCookie(COOKIES.TOKEN, data.accessToken)
//       // setCookie(COOKIES.REFRESH_TOKEN, data.refreshToken)
//       // return data.accessToken
//     } catch (e: unknown) {
//       console.log('Error refreshing token:', e)
//       return null
//     }
//   } else {
//     return null
//   }
// }
const createAxiosInstance = (baseURL: string) => {
    const instance = axios.create({ baseURL })

    const handleSuccess = (response: AxiosResponse) => {
        return response
    }

    const handleError = async (error: AxiosError) => {
        const originalError = error.response!.data as IAxiosResponse
        // const originalRequest = error.config!

        // if ((originalError as any).statusCode === 401) {
        //   const token = await onRefreshToken()
        //   if (token) {
        //     axios.defaults.headers.Authorization = `Bearer ${token}`
        //     return instance(originalRequest)
        //   }
        // }
        return Promise.reject(originalError || error)
    }

    instance.interceptors.request.use(
        async (config) => {
            // const token = getCookie(COOKIES.TOKEN)
            // if (token) config.headers.Authorization = `Bearer ${token}`
            return config
        },
        (error) => Promise.reject(error),
    )

    instance.interceptors.response.use(handleSuccess, handleError)

    return instance
}

export const request = createAxiosInstance(envConfig.API_URL)
