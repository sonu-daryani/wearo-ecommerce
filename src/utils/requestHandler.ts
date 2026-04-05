'use client'
import axios, { AxiosResponse } from 'axios'

type AsyncHandlerOptions<T> = {
    asyncFunction: () => Promise<T>
    onSuccess?: (data: T) => void
    onError?: (error: string) => void
    setLoading: (loading: boolean) => void
}

const requestHandler = async (
    api: () => Promise<AxiosResponse<any, any>>,
    onSuccess: (data: any) => void,
    onError: (errorMessage: string) => void,
    setLoading: ((loading: boolean) => void) | null
) => {
    setLoading?.(true)
    try {
        const response = await api()
        const { data } = response

        if (data) {
            onSuccess(data)
            return data.data;
        }
    } catch (error: any) {
        console.log('Error in requestHandler:', error)
        const errorMessage = error?.response?.data?.message || error?.response?.data?.error || 'Something went wrong'
        onError(errorMessage)
    } finally {
        // Hide loading state if setLoading function is provided
        setLoading?.(false)
    }
}

export { requestHandler }
