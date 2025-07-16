// scripts/fetch-secrets.js

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import fs from "fs";

const client = new SecretsManagerClient({ region: "ap-southeast-2" });
const secretName = "APIcredentials";

(async () => {
  console.log(`🔐 Fetching secrets from Secrets Manager: ${secretName}`);
  const command = new GetSecretValueCommand({ SecretId: secretName });

  try {
    const response = await client.send(command);
    const secrets = JSON.parse(response.SecretString || "{}");

    const lines = Object.entries(secrets).map(
      ([key, value]) => `${key}=${value}`
    );
    fs.writeFileSync(".env", lines.join("\n"));
    console.log("✅ .env file created.");
  } catch (err) {
    console.error("❌ Failed to fetch secrets:", err);
    process.exit(1);
  }
})();
