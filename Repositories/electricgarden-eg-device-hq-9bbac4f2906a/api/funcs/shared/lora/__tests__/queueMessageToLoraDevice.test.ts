import fetch, { Response } from "node-fetch";
import { queueMessageToLoraDevice } from "../queueMessageToLoraDevice";
import { logMock } from "./helpers";

// NOTE: will fail to mock for pre-built project causing thing park to be called and test to fail
// if this happens try a yarn clean then yarn test
jest.mock("node-fetch");

const deviceId = "awefaeweg12e";
const payloadHex = "08ac";

describe("queueMessageToLoraDevice", () => {
  const mockThingParkResponse = ({
    ok,
    error,
  }: {
    ok: boolean;
    error?: string;
  }) => {
    (fetch as any).mockReturnValue(
      Promise.resolve({
        ok,
        status: ok ? 201 : 400,
        text: () => Promise.resolve(error ?? ""),
        json: () => Promise.resolve({}),
      } as Response),
    );
  };

  const run = () => {
    return queueMessageToLoraDevice(logMock, deviceId, payloadHex);
  };

  describe("valid message", () => {
    describe("thing park is happy", () => {
      beforeEach(async () => {
        mockThingParkResponse({ ok: true });
      });

      it("should not throw", async () => {
        expect.assertions(1);
        await run();
        expect(true).toBe(true);
      });
    });

    describe("thing park is NOT happy", () => {
      const error = "Not liking your stuff";
      beforeEach(async () => {
        mockThingParkResponse({ ok: false, error });
      });

      it("should throw", async () => {
        expect.assertions(1);
        try {
          await run();
        } catch (err) {
          expect(err).toBeDefined();
        }
      });

      it("should send back response text from thing park", async () => {
        expect.assertions(1);
        try {
          await run();
        } catch (err) {
          expect(err.message).toContain(error);
        }
      });
    });
  });
});
