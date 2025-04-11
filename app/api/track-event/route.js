// app/api/track-event/route.js
import { KinesisClient, PutRecordCommand } from "@aws-sdk/client-kinesis";
import {
  CognitoIdentityClient,
  GetIdCommand,
  GetCredentialsForIdentityCommand,
} from "@aws-sdk/client-cognito-identity";
import { decodeJwt } from "jose";

const region = process.env.REGION;
const streamName = process.env.KINESIS_STREAM_NAME;
const identityPoolId = process.env.COGNITO_IDENTITY_POOL_ID;
const oidcProvider = process.env.OIDC_PROVIDER;

// Function to retrieve temporary credentials from Cognito Identity Pools using the OIDC token
async function getTemporaryCredentials(oidcToken) {
  try {
    const cognitoClient = new CognitoIdentityClient({ region });

    // Get Identity Id using the token
    const getIdCommand = new GetIdCommand({
      IdentityPoolId: identityPoolId,
      Logins: {
        [oidcProvider]: oidcToken,
      },
    });
    const idData = await cognitoClient.send(getIdCommand);

    // Get temporary AWS credentials for the identity
    const getCredsCommand = new GetCredentialsForIdentityCommand({
      IdentityId: idData.IdentityId,
      Logins: {
        [oidcProvider]: oidcToken,
      },
    });
    const credsData = await cognitoClient.send(getCredsCommand);
    return credsData.Credentials; // Contains AccessKeyId, SecretKey, and SessionToken
  } catch (err) {
    console.error("Error obtaining temporary credentials:", err);
    throw err;
  }
}

export async function POST(request) {
  try {
    // Validate and retrieve the Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing token" }), {
        status: 401,
      });
    }
    const oidcToken = authHeader.split(" ")[1];

    // Decode the token to extract basic user information (for logging/enrichment)
    const decoded = decodeJwt(oidcToken); // For production, you should verify the signature

    // Parse the event data from the request body
    const eventData = await request.json();

    // Enrich the event data with user details and a timestamp
    const enrichedEvent = {
      ...eventData,
      userId: decoded.sub, // Unique identifier from the token
      email: decoded.email,
      timestamp: Date.now(),
    };

    // Retrieve temporary AWS credentials (including sessionToken) from Cognito Identity Pools
    const tempCredentials = await getTemporaryCredentials(oidcToken);

    // Create the Kinesis client using the temporary credentials
    const kinesisClient = new KinesisClient({
      region,
      credentials: {
        accessKeyId: tempCredentials.AccessKeyId,
        secretAccessKey: tempCredentials.SecretKey,
        sessionToken: tempCredentials.SessionToken, // Include the session token
      },
    });

    // Prepare parameters for putting the record in Kinesis
    const params = {
      Data: JSON.stringify(enrichedEvent),
      PartitionKey: enrichedEvent.userId || "default",
      StreamName: streamName,
    };

    // Send the record to Kinesis
    const command = new PutRecordCommand(params);
    const result = await kinesisClient.send(command);

    return new Response(JSON.stringify({ message: "Record sent", result }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error sending record to Kinesis:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
