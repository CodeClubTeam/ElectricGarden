/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
export class Mandrill {
  constructor(apiKey: any) {}

  messages = {
    sendTemplate: (
      arg: any,
      resolve: () => void,
      reject: (err: any) => void,
    ) => {
      // console.log('intercepted mandrill.sendTemplate in mock');
      resolve();
    },
  };
}
