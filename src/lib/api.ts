import { pb } from "./pocketbase";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  // For paginated results
  totalItems?: number;
  totalPages?: number;
  page?: number;
  perPage?: number;
}

/**
 * Wraps a promise in a standard response structure with error handling.
 */
export async function handleApiCall<T>(
  promise: Promise<T>
): Promise<ApiResponse<T>> {
  try {
    const data = await promise;
    return { success: true, data };
  } catch (error: any) {
    console.error("PocketBase API Error:", error);
    
    let errorMessage = "An unexpected error occurred.";
    if (error.data && typeof error.data === "object") {
      // PocketBase validation errors (e.g. error.data.data.email.message)
      const dataErrors = error.data.data;
      if (dataErrors && Object.keys(dataErrors).length > 0) {
        const firstKey = Object.keys(dataErrors)[0];
        errorMessage = `${firstKey}: ${dataErrors[firstKey].message}`;
      } else {
        errorMessage = error.data.message || error.message || errorMessage;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Standard fetch options for frontend calls
 */
export async function clientFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await res.json();
    if (res.ok) {
      return data;
    } else {
      return {
        success: false,
        error: data.error || `HTTP error! status: ${res.status}`,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Network request failed.",
    };
  }
}
