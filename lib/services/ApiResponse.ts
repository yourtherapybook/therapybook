export type ApiResponse<T = undefined> =
    | { success: true; data: T }
    | { success: false; error: { code: string; message: string; details?: any } };

// Helper functions for unified responses
export function successResponse<T>(data: T): ApiResponse<T> {
    return { success: true, data };
}

export function errorResponse(code: string, message: string, details?: any): ApiResponse<any> {
    return { success: false, error: { code, message, details } };
}
