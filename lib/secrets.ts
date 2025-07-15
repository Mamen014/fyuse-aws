import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "ap-southeast-2" });

export type SecretsShape = {
  KOLORS_ACCESS_KEY_ID: string;
  KOLORS_ACCESS_KEY_SECRET: string;
  KOLORS_API_URL: string;
  TESTING_CALLBACK_URL: string;
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
};

let cachedSecrets: SecretsShape | null = null;

export async function getSecrets(): Promise<SecretsShape> {
  if (cachedSecrets) return cachedSecrets;

  const secretName = "APIcredentials";
  const command = new GetSecretValueCommand({ SecretId: secretName });

  try {
    const response = await client.send(command);
    if (response.SecretString) {
      const parsed = JSON.parse(response.SecretString) as SecretsShape;
      cachedSecrets = parsed;
      return parsed;
    }

    throw new Error("Secrets not found");
  } catch (error) {
    console.error("❌ Failed to load secrets:", error);
    throw error;
  }
}
