export class ApiError extends Error {
  readonly code?: string;
  readonly requestId?: string;
  readonly status?: number;

  constructor(
    message: string,
    options?: { code?: string; requestId?: string; status?: number }
  ) {
    super(message);
    this.name = "ApiError";
    this.code = options?.code;
    this.requestId = options?.requestId;
    this.status = options?.status;
  }
}
