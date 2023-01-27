export const createErrorAnswer = (error: unknown) => ({
  ok: false,
  error: {
    type: (error instanceof Error && 'type' in error) ? error.type : 'UnknownError',
    message: error instanceof Error ? error.message : 'unknown error'
  }
});