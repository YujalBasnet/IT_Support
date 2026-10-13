
import { randomBytes } from "node:crypto";

const loginCodes = new Map();

export const createLoginCode = (loginData) => {
  const code = randomBytes(32).toString("hex");

  loginCodes.set(code, {
    loginData,
    expiresAt: Date.now() + 60_000,
  });

  setTimeout(() => loginCodes.delete(code), 60_000).unref();

  return code;
};

export const consumeLoginCode = (code) => {
  const entry = loginCodes.get(code);
  if (!entry) return null;

  loginCodes.delete(code);

  if (Date.now() > entry.expiresAt) return null;

  return entry.loginData;
};
