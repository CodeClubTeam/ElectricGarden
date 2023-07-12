export class Mandrill {
  constructor(apiKey: any) {}

  messages = {
    sendTemplate: (
      arg: any,
      resolve: () => void,
      reject: (err: any) => void,
    ) => {
      // console.log('intercepted mandrill.sendTemplate');
      resolve();
    },
  };
}
