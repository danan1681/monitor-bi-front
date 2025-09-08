export interface IRespuestaHttp<T> {
    success: boolean;
    code: number;
    message: string;
    data: T;
}