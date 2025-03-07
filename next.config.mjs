import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

/** Fetch secrets from AWS Secrets Manager */
async function getSecrets() {
  const client = new SecretsManagerClient({ region: "ap-southeast-2" });

  try {
    const data = await client.send(new GetSecretValueCommand({ SecretId: "APIcredentials" }));
    return JSON.parse(data.SecretString);
  } catch (err) {
    console.error("Error fetching secrets", err);
    return {};
  }
}

const secrets = await getSecrets();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    KOLORS_ACCESS_KEY_ID: secrets.KOLORS_ACCESS_KEY_ID || "",
    KOLORS_ACCESS_KEY_SECRET: secrets.KOLORS_ACCESS_KEY_SECRET || "",
    AWS_REGION: secrets.AWS_REGION || "ap-southeast-2",
    AWS_S3_BUCKET_NAME: secrets.AWS_S3_BUCKET_NAME || "fyuse-images",
  },
};

export default nextConfig;
