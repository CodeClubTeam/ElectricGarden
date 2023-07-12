export type CreateHttpOptions = {
  baseUri?: string;
};

export class HttpResponseError extends Error {
  response: Response;

  constructor(response: Response, message?: string) {
    super(
      message || 'An error response has been returned from the remote server.',
    );
    Object.setPrototypeOf(this, HttpResponseError.prototype);
    this.name = 'HttpResponseError';
    this.response = response;
  }
}

export const createHttp = ({
  baseUri = process.env.REACT_APP_SHOP_API_BASE_URL,
}: CreateHttpOptions = {}) => {
  const buildApiUrl = (path: string) => `${baseUri}${path}`;

  const checkResponse = (response: Response) => {
    if (response.ok) {
      return response;
    } else {
      throw new HttpResponseError(response);
    }
  };

  const get = async (url: string) => {
    const response = await fetch(buildApiUrl(url), {
      method: 'GET',
    }).then(checkResponse);
    return response;
  };

  const getJson = async <TResponse>(url: string) => {
    const response = await get(url);
    const json = await response.json();
    return json as TResponse;
  };

  const post = async (url: string, body: any) => {
    const response = await fetch(buildApiUrl(url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    checkResponse(response);
    return response;
  };

  const put = async (url: string, body: any) => {
    const response = await fetch(buildApiUrl(url), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    checkResponse(response);
    return response;
  };

  const del = async (url: string) => {
    const response = await fetch(buildApiUrl(url), {
      method: 'DELETE',
    }).catch();
    checkResponse(response);
    return response;
  };

  return {
    get,
    getJson,
    post,
    put,
    del,
  };
};
