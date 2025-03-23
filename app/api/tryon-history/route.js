// app/api/tryon-history/route.js
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "ap-southeast-2" });

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userEmail = searchParams.get("email");

  if (!userEmail) {
    return new Response(JSON.stringify({ error: "Missing userEmail" }), { status: 400 });
  }

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE || "TryonTaskStatus",
      IndexName: "userEmail-index",
      KeyConditionExpression: "userEmail = :email",
      ExpressionAttributeValues: {
        ":email": { S: userEmail },
      },
    };

    const result = await client.send(new QueryCommand(params));
    const items = result.Items?.map((item) => ({
      taskId: item.taskId?.S,
      generatedImageUrl: item.generatedImageUrl?.S,
      matchingAnalysisText: item.matchingAnalysisText?.S,
      matchingPercentage: item.matchingPercentage?.S,
      clothingColor: item.clothingColor?.S,
      clothingFit: item.clothingFit?.S,
      bodyShape: item.bodyShape?.S,
      skinTone: item.skinTone?.S,
      gender: item.gender?.S,
      timestamp: item.timestamp?.S,
    })) || [];

    return new Response(JSON.stringify(items), { status: 200 });
  } catch (error) {
    console.error("Error querying DynamoDB:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
