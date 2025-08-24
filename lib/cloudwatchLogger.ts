import {
  CloudWatchLogsClient,
  CreateLogGroupCommand,
  CreateLogStreamCommand,
  DescribeLogStreamsCommand,
  PutLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";

const REGION = "ap-southeast-2";
const client = new CloudWatchLogsClient({ region: REGION });

const streamCache: Record<string, string | undefined> = {};

export async function logToCloudWatch(
  message: string,
  route: string,
  userId: string,
  sessionId: string
) {
  const logGroupName = `/fyuse/api/${route}`;
  const logStreamName = `user-${userId || "anonymous"}/session-${sessionId || "unknown"}`;
  const cacheKey = `${logGroupName}__${logStreamName}`;

  let sequenceToken = streamCache[cacheKey];

  try {
    if (!sequenceToken) {
      try {
        await client.send(new CreateLogGroupCommand({ logGroupName }));
      } catch {} // Group likely already exists

      try {
        await client.send(new CreateLogStreamCommand({ logGroupName, logStreamName }));
      } catch {} // Stream likely already exists

      const describeRes = await client.send(
        new DescribeLogStreamsCommand({
          logGroupName,
          logStreamNamePrefix: logStreamName,
        })
      );

      sequenceToken = describeRes.logStreams?.[0]?.uploadSequenceToken;
      streamCache[cacheKey] = sequenceToken;
    }

    const putRes = await client.send(
      new PutLogEventsCommand({
        logGroupName,
        logStreamName,
        logEvents: [
          {
            message, // ⚠️ Plain message (e.g. "INFO Fetched existing user profile")
            timestamp: Date.now(),
          },
        ],
        sequenceToken,
      })
    );

    streamCache[cacheKey] = putRes.nextSequenceToken;
  } catch (err) {
    console.error("CloudWatch putLog error:", err);
  }
}
