import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { createSign } from 'crypto';

export const handler = async (event) => {
    try {
        console.log('🔐 API Gateway access request received');
        
        const cloudfrontDomain = process.env.CF_DOMAIN;  
        const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID;
        const privateKeyBucket = process.env.CLOUDFRONT_KEY_BUCKET;
        const privateKeyObject = process.env.CLOUDFRONT_KEY_OBJECT;
        const region = process.env.AWS_REGION || 'ap-south-1';
        
        // Validate required environment variables
        if (!cloudfrontDomain || !keyPairId || !privateKeyBucket || !privateKeyObject) {
            throw new Error('Missing required environment variables');
        }
        
        // Get private key from S3
        const s3Client = new S3Client({ region });
        const getObjectCommand = new GetObjectCommand({
            Bucket: privateKeyBucket,
            Key: privateKeyObject
        });
        
        const s3Response = await s3Client.send(getObjectCommand);
        const privateKeyPem = await s3Response.Body.transformToString();
        console.log('Private key loaded, length:', privateKeyPem.length);
        
        // Create policy (5 minutes like working code)
        const expiration = Math.floor(Date.now() / 1000) + 300;
        const policy = {
            Statement: [
                {
                    Resource: `https://${cloudfrontDomain}/docs/*`,
                    Condition: { DateLessThan: { "AWS:EpochTime": expiration } },
                },
            ],
        };
        
        const policyString = JSON.stringify(policy);
        console.log('Policy string:', policyString);
        
        const policyBase64 = Buffer.from(policyString)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/=/g, '_')
            .replace(/\//g, '~');
        
        console.log('Policy base64:', policyBase64);
        
        // Sign policy
        const sign = createSign('RSA-SHA1');
        sign.update(policyString);
        const signature = sign.sign(privateKeyPem, 'base64');
        const signatureBase64 = signature
            .replace(/\+/g, '-')
            .replace(/=/g, '_')
            .replace(/\//g, '~');
        
        console.log('Signature base64:', signatureBase64);
        console.log('Key Pair ID:', keyPairId);
        console.log('✅ Cookies generated, redirecting to CloudFront');
        
        // Return JavaScript to set cookies and redirect
        return {
            statusCode: 200,
            headers: { 
                'Content-Type': 'text/html',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            },
            body: `<script>
                document.cookie = "CloudFront-Policy=${policyBase64}; path=/; secure; SameSite=None";
                document.cookie = "CloudFront-Signature=${signatureBase64}; path=/; secure; SameSite=None";
                document.cookie = "CloudFront-Key-Pair-Id=${keyPairId}; path=/; secure; SameSite=None";
                
                // Verify cookies are set before redirecting
                setTimeout(() => {
                    console.log('Cookies set:', document.cookie);
                    window.location.href = "https://${cloudfrontDomain}/docs/HTML/Default.htm";
                }, 500);
            </script>`
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
