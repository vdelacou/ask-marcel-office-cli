export const getEnvOrThrow = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`missing required env var: ${key}`);
  return value;
};
