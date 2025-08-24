import { NextRequest, NextResponse } from 'next/server';
import { PutItemCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { logger } from '@/lib/logger';
import { getUserIdFromAuth } from '@/lib/session';

const dynamoDbClient = new DynamoDBClient({region: "ap-southeast-2"});
const tableName = 'activityLogging';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const sessionId = req.headers.get("x-session-id") || "unknown";
  const userId = getUserIdFromAuth(authHeader) || 'anonymous';

  const log = logger.withContext({
    sessionId,
    userId,
    routeName: "activity-logging",
  });

  if (!authHeader.startsWith("Bearer ")) {
    log.error("Authorization header missing or malformed");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, timestamp, selection, page = "UnknownPage" } = body;

    if (!action || !timestamp) {
      log.warn("Missing required fields", { body });
      return NextResponse.json({ message: "Missing required fields: action or timestamp." }, { status: 400 });
    }

    const payload = {
      userId,
      action,
      timestamp,
      selection,
      page,
    };

    const dynamoParams = {
      TableName: tableName,
      Item: {
        userId: { S: userId },
        action: { S: action },
        timestamp: { S: timestamp },
        page: { S: page },
        ...(selection ? { selection: { S: selection } } : {}),
      },
    };

    await dynamoDbClient.send(new PutItemCommand(dynamoParams));
    log.info("Activity recorded", payload);

    return NextResponse.json({ message: "Activity recorded", payload });
  } catch (error) {
    log.error("Failed to record activity", { error: (error as Error).message });
    return NextResponse.json({ message: "Failed to record activity." }, { status: 500 });
  }
}
