type Query = Record<string, string | number | boolean | undefined>;

export const buildUrl = (path: string, query?: Query) => {
  const uri = `${process.env.REACT_APP_API_BASE_URL}/${path}`;
  if (!query) {
    return uri;
  }
  const pairs = Object.entries(query)
    .filter(([, value]) => value !== undefined)
    .map(([name, value]) => `${name}=${encodeURIComponent(value ?? "")}`);
  if (pairs.length === 0) {
    return uri;
  }
  return `${uri}?${pairs.join("&")}`;
};

export const getJson = async <TResult>(path: string, query?: Query) => {
  const response = await fetch(buildUrl(path, query), { mode: "cors" });
  if (!response.ok) {
    throw new HttpResponseError(response);
  }
  return response.json() as Promise<TResult>;
};

export const putJson = async <Body extends {}>(path: string, body: Body) => {
  const response = await fetch(buildUrl(path), {
    method: "PUT",
    body: JSON.stringify(body),
    headers: new Headers({
      "Content-Type": "application/json",
    }),
    mode: "cors",
  });
  if (!response.ok) {
    const message = await response.text();
    throw new HttpResponseError(response, message);
  }
};

export class HttpResponseError extends Error {
  response: Response;

  constructor(response: Response, message?: string) {
    super(
      message || "An error response has been returned from the remote server.",
    );
    Object.setPrototypeOf(this, HttpResponseError.prototype);
    this.name = "HttpResponseError";
    this.response = response;
  }
}
