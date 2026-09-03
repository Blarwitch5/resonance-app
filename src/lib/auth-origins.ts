export const CREDENTIAL_ACCOUNT_ISSUER = "local:credential";

export function developmentAuthOrigins(): string[] {
  return [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
  ];
}
