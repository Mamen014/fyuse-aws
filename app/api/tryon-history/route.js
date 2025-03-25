import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "ap-southeast-2" });

export async function GET(request) {
  console.log("🔥 ENV: DYNAMODB_TABLE =", process.env.DYNAMODB_TABLE);
  console.log("🔥 Request URL =", request.url);
  console.log("🔥 IAM Role:", process.env.AWS_ROLE_ARN);

  const userEmail = new URL(request.url).searchParams.get("email");
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", 
    "Access-Control-Allow-Methods": "GET",
  };

  if (!userEmail) {
    return new Response(JSON.stringify({ error: "Missing userEmail", items: [] }), {
      status: 400,
      headers,
    });
  }

  try {
    const result = await client.send(new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE || "TryonTaskStatus",
      IndexName: "userEmail-index",
      KeyConditionExpression: "userEmail = :email",
      ExpressionAttributeValues: {
        ":email": { S: userEmail },
      },
    }));

    if (!result || !result.Items) {
      console.error("🚨 DynamoDB returned an empty response.");
      return new Response(JSON.stringify({ error: "No data found", items: [] }), {
        status: 404,
        headers,
      });
    }

    const items = result.Items.map((item) => ({
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
      isInWardrobe: item.isInWardrobe?.BOOL === true,
    }));

    return new Response(JSON.stringify({ 
      debug: process.env.DYNAMODB_TABLE, 
      items 
    }), {
      status: 200,
      headers,
    });

  } catch (error) {
    if (error.name === "ResourceNotFoundException") {
      console.error("❌ Table or Index not found:", error);
    } else {
      console.error("❌ Unexpected DynamoDB error:", error);
    }

    return new Response(JSON.stringify({ error: error.message || "Internal Server Error", items: [] }), {
      status: 500,
      headers,
    });
  }
}
