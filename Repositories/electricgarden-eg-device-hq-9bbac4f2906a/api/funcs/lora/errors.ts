export class InvalidRequestError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidRequestError.prototype);
    this.name = "InvalidRequestError";
  }
}

export class InvalidPayloadError extends InvalidRequestError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidPayloadError.prototype);
    this.name = "InvalidPayloadError";
  }
}
