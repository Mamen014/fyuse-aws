import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "ap-southeast-2" });

async function fetchSecret() {
  try {
    const secret_name = "APIcredentials"; // Ensure this matches exactly
    const response = await client.send(new GetSecretValueCommand({ SecretId: secret_name }));

    if (response.SecretString) {
      const secrets = JSON.parse(response.SecretString);
      console.log("✅ Successfully retrieved secret:", secrets);
    } else {
      console.error("❌ SecretString is empty.");
    }
  } catch (error) {
    console.error("❌ Error fetching secret:", error);
  }
}

fetchSecret();
