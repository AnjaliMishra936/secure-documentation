import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

export const handler = async () => {
  try {
    // 1. Load environment variables
    const cloudfrontDomain = process.env.CF_DOMAIN;          // e.g., d123abcd.cloudfront.net
    const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID;    // CloudFront Key Pair ID
    const privateKeyBucket = process.env.CLOUDFRONT_KEY_BUCKET;
    const privateKeyObject = process.env.CLOUDFRONT_KEY_OBJECT;

    // 2. Fetch private key PEM from S3
    const s3 = new S3Client({});
    const response = await s3.send(
      new GetObjectCommand({ Bucket: privateKeyBucket, Key: privateKeyObject })
    );
    const privateKeyPem = await streamToString(response.Body);

    // 3. Expiry time (5 minutes)
    const expireTime = Math.floor(Date.now() / 1000) + 300;

    // 4. Canned policy for *index.html*
    const policy = JSON.stringify({
      Statement: [
        {
          Resource: `https://${cloudfrontDomain}/index.html`,
          Condition: { DateLessThan: { "AWS:EpochTime": expireTime } },
        },
      ],
    });

    // 5. Sign the policy
    const sign = crypto.createSign("RSA-SHA1");
    sign.update(policy);
    const signature = sign.sign(privateKeyPem, "base64");

    // 6. URL-safe signature
    const safeSignature = signature
      .replace(/\+/g, "-")
      .replace(/=/g, "_")
      .replace(/\//g, "~");

    // 7. Generate signed URL
    const signedUrl = `https://${cloudfrontDomain}/index.html?Expires=${expireTime}&Signature=${safeSignature}&Key-Pair-Id=${keyPairId}`;

    // 8. Redirect response
    return {
      statusCode: 302,
      headers: {
        Location: signedUrl,
      },
    };
  } catch (err) {
    console.error("Error generating signed URL:", err);
    return { statusCode: 500, body: "Error generating signed URL" };
  }
};

// 🔹 Helper: convert S3 stream to string
async function streamToString(stream) {
  return await new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
}
