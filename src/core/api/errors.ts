import type { AxiosError } from "axios";
import type { ApiError } from "./types.ts";

export function parseApiError(error: unknown): ApiError {
  const axiosError = error as AxiosError<{ message?: string }>;

  if (axiosError.response) {
    return {
      message: axiosError.response.data?.message || axiosError.message,
      status: axiosError.response.status,
    };
  }

  if (axiosError.request) {
    return {
      message: "Network error. Please check your connection.",
      status: 0,
    };
  }

  return {
    message: "An unexpected error occurred.",
    status: 500,
  };
}
