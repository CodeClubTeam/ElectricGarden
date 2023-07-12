import { Context, HttpRequest } from "@azure/functions";
import { ValidationError } from "yup";
import { buildRaygunClient } from "../buildRaygunClient";
import { Message } from "../messages";

export type ResultWithHttpResponse<T = unknown> = {
  res: { status: number; body: T };
};

type AzureAsyncFunc<T = void> = (
  context: Context,
  ...args: any[]
) => Promise<T>;

export const azureAsyncFunc = <TResult = void>(
  name: string,
  func: AzureAsyncFunc<TResult>,
) => {
  const raygunClient = buildRaygunClient(name);
  return (...args: Parameters<AzureAsyncFunc<TResult>>) =>
    func(...args).catch((error) => {
      if (raygunClient) {
        raygunClient.send(error);
      }
      throw error;
    });
};

type HttpFunc<T = undefined> = (
  context: Context,
  req: HttpRequest,
) => Promise<ResultWithHttpResponse & T>;

export const azureHttpFunc = <TResult>(
  name: string,
  func: HttpFunc<TResult>,
) => {
  const raygunClient = buildRaygunClient(name);
  return (...args: Parameters<HttpFunc<TResult>>) =>
    func(args[0], args[1]).catch((error) => {
      if (error instanceof ValidationError) {
        return {
          res: {
            status: 400,
            body: {
              message: error.message,
            },
          },
        };
      }
      if (raygunClient) {
        raygunClient.send(error);
      }
      throw error;
    });
};

export type EventHubResponse = { messagesToEventHub: Message[] };

export const azureHttpFuncForEventHub = (
  name: string,
  func: HttpFunc<EventHubResponse>,
) => azureHttpFunc(name, func);
