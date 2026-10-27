/** Failed API call. `status` is 0 when the server could not be reached at all. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** Reads the ProblemDetails `title` the API sends with every error, when present. */
  static async fromResponse(response: Response): Promise<ApiError> {
    let title: string | undefined;
    try {
      const body = (await response.json()) as { title?: unknown };
      if (typeof body.title === 'string') {
        title = body.title;
      }
    } catch {
      // Empty or non-JSON body: fall back to the status code.
    }
    return new ApiError(response.status, title ?? `Error ${response.status}`);
  }
}
