'use strict';
var __awaiter = (this && this.__awaiter) || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator['throw'](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
// @ts-ignore
require('dotenv').config();
const commander = require('commander');
try {
  (() => __awaiter(void 0, void 0, void 0, function* () {
    const program = new commander.Command();
    program
      .requiredOption('-e, --user-email', 'Admin users email')
      .option('-b, --billing-email', 'Billing email', null)
      .version('0.0.1', 'beta')
      .parse(program.argv);
  }))();
} catch (e) {
  console.error(e);
}
//# sourceMappingURL=add-manual-subscription.js.map
