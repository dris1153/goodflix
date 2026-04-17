export interface IAxiosResponse<T = unknown> {
    success: boolean
    data: T
}
