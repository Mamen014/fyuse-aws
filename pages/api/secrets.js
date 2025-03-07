import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const secret_name = process.env.SECRET_NAME || "APIcredentials";
const client = new SecretsManagerClient({ region: process.env.AWS_REGION || "ap-southeast-2" });

async function getSecret() {
  try {
    const response = await client.send(new GetSecretValueCommand({ SecretId: secret_name }));

    if (response.SecretString) {
      const secrets = JSON.parse(response.SecretString);

      // ✅ Load secrets into process.env
      Object.keys(secrets).forEach((key) => {
        process.env[key] = secrets[key];
      });

      return secrets;
    } else {
      console.error("SecretString is empty.");
      return {};
    }
  } catch (error) {
    console.error("Error fetching secret:", error);
    throw error;
  }
}

export { getSecret };
