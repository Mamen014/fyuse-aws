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

    throw new Error("SecretString is empty");
  } catch (error) {
    console.warn("⚠️ Failed to load secrets from Secrets Manager. Falling back to process.env");
    console.error("❌ Secrets error:", error);

    const fallbackSecrets: SecretsShape = {
      KOLORS_ACCESS_KEY_ID: process.env.KOLORS_ACCESS_KEY_ID || "",
      KOLORS_ACCESS_KEY_SECRET: process.env.KOLORS_ACCESS_KEY_SECRET || "",
      KOLORS_API_URL: process.env.KOLORS_API_URL || "",
      TESTING_CALLBACK_URL: process.env.TESTING_CALLBACK_URL || "",
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REST_URL || "",
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || "",
    };

    // ✅ Validation
    const missingKeys = Object.entries(fallbackSecrets)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingKeys.length > 0) {
      throw new Error(`Missing required env variables: ${missingKeys.join(", ")}`);
    }

    cachedSecrets = fallbackSecrets;
    return fallbackSecrets;
  }
}
