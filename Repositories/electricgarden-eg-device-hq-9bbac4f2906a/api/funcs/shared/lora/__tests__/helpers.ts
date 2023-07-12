import { Logger } from "@azure/functions";

const logProto: any = jest.fn();
logProto.info = jest.fn();
logProto.error = jest.fn();
logProto.warn = jest.fn();
logProto.verbose = jest.fn();

export const logMock = logProto as Logger;
