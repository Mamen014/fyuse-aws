import formidable from "formidable";
import fs from "node:fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch";

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = "fyuse-image";
const UPLOADED_FOLDER = "uploaded-image";
const GENERATED_FOLDER = "generated-image";
const USER_IMAGE_FOLDER = "user-image";
const APPAREL_IMAGE_FOLDER = "apparel-image";

export const config = { api: { bodyParser: false } };

// Parse form data properly
async function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: true, keepExtensions: true, maxFileSize: 100 * 1024 * 1024 });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve([fields, files]);
    });
  });
}

// Upload images to S3
async function uploadToS3(buffer, filename, folder) {
  const uniqueFilename = `${uuidv4()}-${filename}`;
  const key = `${folder}/${uniqueFilename}`;
  const contentType = filename.endsWith(".png") ? "image/png" : "image/jpeg";

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await s3.send(command);
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error("S3 upload error:", error);
    throw new Error("Failed to upload image to S3");
  }
}

// Convert Image URL to Base64 & Get Titan Embeddings
async function getImageEmbeddings(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");

    const command = new InvokeModelCommand({
      modelId: "amazon.titan-embed-image-v1",
      body: JSON.stringify({ inputImage: base64Image }),
      contentType: "application/json",
      accept: "application/json",
    });

    const titanResponse = await bedrock.send(command);
    const result = JSON.parse(new TextDecoder().decode(titanResponse.body));
    return result.embedding;
  } catch (error) {
    console.error("Amazon Titan Error:", error);
    throw new Error("Failed to extract image embeddings");
  }
}

// Calculate cosine similarity
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return (dotProduct / (normA * normB)) * 100;
}

export default async function tryonHandler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const [fields, files] = await parseForm(req);

    if (!files.personImg || !files.garmentImg) {
      res.status(400).json({ error: "Both person and garment images are required" });
      return;
    }

    const personImgFile = Array.isArray(files.personImg) ? files.personImg[0] : files.personImg;
    const garmentImgFile = Array.isArray(files.garmentImg) ? files.garmentImg[0] : files.garmentImg;

    const personImgBuffer = await fs.promises.readFile(personImgFile.filepath);
    const garmentImgBuffer = await fs.promises.readFile(garmentImgFile.filepath);

    const humanImageUrl = await uploadToS3(personImgBuffer, personImgFile.originalFilename, `${UPLOADED_FOLDER}/${USER_IMAGE_FOLDER}`);
    const clothImageUrl = await uploadToS3(garmentImgBuffer, garmentImgFile.originalFilename, `${UPLOADED_FOLDER}/${APPAREL_IMAGE_FOLDER}`);

    await fs.promises.unlink(personImgFile.filepath);
    await fs.promises.unlink(garmentImgFile.filepath);

    const userEmbedding = await getImageEmbeddings(humanImageUrl);
    const generatedEmbedding = await getImageEmbeddings(clothImageUrl);

    const matchPercentage = cosineSimilarity(userEmbedding, generatedEmbedding);

    res.status(200).json({ status: "success", human_image_url: humanImageUrl, cloth_image_url: clothImageUrl, match_percentage: matchPercentage.toFixed(2) });
  } catch (error) {
    console.error("Processing error:", error);
    res.status(500).json({ error: "Failed to process matching", details: error.message });
  }
}
