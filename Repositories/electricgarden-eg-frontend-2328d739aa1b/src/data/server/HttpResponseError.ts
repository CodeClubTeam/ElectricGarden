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
