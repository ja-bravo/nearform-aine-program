export type ToErrorBodyOptions = {
  code?: string;
  details?: unknown;
};

export function toErrorBody(
  statusCode: number,
  message: string,
  requestId: string,
  options?: ToErrorBodyOptions
) {
  const internal = statusCode === 500;
  const code = options?.code ?? (internal ? "INTERNAL_ERROR" : "REQUEST_ERROR");
  return {
    error: {
      code,
      message: internal ? "An unexpected error occurred" : message,
      ...(options?.details !== undefined ? { details: options.details } : {}),
      requestId,
    },
  };
}
