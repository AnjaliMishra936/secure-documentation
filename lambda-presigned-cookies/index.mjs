import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { createSign } from 'crypto';

export const handler = async (event) => {
    try {
        console.log('🔐 API Gateway access request received');
        
        const cloudfrontDomain = process.env.CF_DOMAIN;  
        const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID;
        const privateKeyBucket = process.env.CLOUDFRONT_KEY_BUCKET;
        const privateKeyObject = process.env.CLOUDFRONT_KEY_OBJECT;
        
        // Get private key from S3
        const s3Client = new S3Client({ region: 'ap-south-1' });
        const getObjectCommand = new GetObjectCommand({
            Bucket: privateKeyBucket,
            Key: privateKeyObject
        });
        
        const s3Response = await s3Client.send(getObjectCommand);
        const privateKeyPem = await s3Response.Body.transformToString();
        
        // Create policy (valid for 1 hour)
        const expiration = Math.floor((Date.now() + 3600000) / 1000);
        const policy = {
            Statement: [{
                Resource: `https://${cloudfrontDomain}/*`,
                Condition: {
                    DateLessThan: {
                        'AWS:EpochTime': expiration
                    }
                }
            }]
        };
        
        const policyString = JSON.stringify(policy);
        const policyBase64 = Buffer.from(policyString)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
        
        // Sign policy
        const sign = createSign('RSA-SHA1');
        sign.update(policyString);
        const signature = sign.sign(privateKeyPem, 'base64');
        const signatureBase64 = signature
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
        
        console.log('✅ Cookies generated, redirecting to CloudFront');
        
        // Return redirect response with cookies
        return {
            statusCode: 302,
            headers: {
                'Location': `https://${cloudfrontDomain}/index.html`,
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            },
            multiValueHeaders: {
                'Set-Cookie': [
                    `CloudFront-Policy=${policyBase64}; Domain=${cloudfrontDomain}; Path=/; Secure; SameSite=None`,
                    `CloudFront-Signature=${signatureBase64}; Domain=${cloudfrontDomain}; Path=/; Secure; SameSite=None`,
                    `CloudFront-Key-Pair-Id=${keyPairId}; Domain=${cloudfrontDomain}; Path=/; Secure; SameSite=None`
                ]
            }
        };
        
    } catch (error) {
        console.error('❌ Error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'text/plain' },
            body: `Error: ${error.message}`
        };
    }
};
