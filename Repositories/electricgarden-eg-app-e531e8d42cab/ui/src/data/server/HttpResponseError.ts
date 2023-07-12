type ValidationErrorsResponseBody = { validationErrors: string[] };

export class HttpResponseError extends Error {
    response: Response;

    constructor(response: Response, message?: string) {
        super(
            message ||
                'An error response has been returned from the remote server.',
        );
        Object.setPrototypeOf(this, HttpResponseError.prototype);
        this.name = 'HttpResponseError';
        this.response = response;
    }
}

export class HttpValidationResponseError extends HttpResponseError {
    private validationErrors: string[] | undefined;

    constructor(response: Response, message?: string) {
        super(response, message);
        Object.setPrototypeOf(this, HttpValidationResponseError.prototype);
        if (this.response.status !== 400) {
            throw new Error(`Not a validation error (400) response`);
        }
        this.name = 'HttpValidationResponseError';
        this.response = response;
    }

    getValidationErrors = async () => {
        if (!this.validationErrors) {
            const {
                validationErrors,
            } = (await this.response.json()) as ValidationErrorsResponseBody;
            this.validationErrors = validationErrors;
        }

        return this.validationErrors;
    };
}
