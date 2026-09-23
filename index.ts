import { AntigravityCLIOAuthPlugin } from "./src/plugin";

export {
  AntigravityCLIOAuthPlugin,
  GoogleOAuthPlugin,
} from "./src/plugin";

export {
  authorizeAntigravity,
  exchangeAntigravity,
} from "./src/antigravity/oauth";

export type {
  AntigravityAuthorization,
  AntigravityTokenExchangeResult,
} from "./src/antigravity/oauth";

const defaultPlugin = {
  id: "antigravity-auth",
  setup: async (input: any) => {
    const patchedInput = {
      ...input,
      client: input.app || input.client || {},
      directory: input.location?.directory || input.directory || process.cwd(),
    };
    return AntigravityCLIOAuthPlugin(patchedInput);
  },
};

export default defaultPlugin;
