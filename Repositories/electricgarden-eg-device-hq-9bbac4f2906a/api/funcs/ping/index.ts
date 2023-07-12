import { azureHttpFunc } from "../shared";

export default azureHttpFunc("ping", async () => {
  return {
    res: {
      status: 200,
      body: undefined,
    },
  };
});
