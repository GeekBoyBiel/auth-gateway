export type GoogleCreds = { token: string };
export type AzureCreds  = { username: string; password: string };

export type GoogleBody = { provider: "google"; credentials: GoogleCreds };
export type AzureBody  = { provider: "azure";  credentials: AzureCreds  };

export type LoginBody = GoogleBody | AzureBody;
