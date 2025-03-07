import {
    SecretsManagerClient,
    GetSecretValueCommand,
  } from "@aws-sdk/client-secrets-manager";
  
  const secret_name = "APIcredentials";
  const client = new SecretsManagerClient({ region: "ap-southeast-2" });
  
  async function getSecret() {
    try {
      const response = await client.send(
        new GetSecretValueCommand({ SecretId: secret_name })
      );
  
      if (response.SecretString) {
        return JSON.parse(response.SecretString);
      } else {
        console.error("SecretString is empty.");
        return {};
      }
    } catch (error) {
      console.error("Error fetching secret:", error);
      throw error;
    }
  }
  
  // ✅ Only fetch secrets when needed
  export { getSecret };
  