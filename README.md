# Secure CloudFront Documentation Access

> **Status:** Both presigned URLs and presigned cookies are functional with different CloudFront configurations.

## Overview

A proof-of-concept for securing multi-page static HTML5 documentation using AWS CloudFront and S3. The system prevents direct access without valid signatures, providing session-based access through a gatekeeper interface.

## Features

- ✅ Secure static HTML5 documentation on S3
- ✅ Private S3 bucket with CloudFront Origin Access Control
- ✅ Gatekeeper page with access button
- ✅ Lambda function generates presigned URLs/cookies via API Gateway
- ✅ Temporary access with automatic expiration
- ✅ Direct access blocked (403 Forbidden)
- ✅ Both presigned URLs and cookies supported
- ✅ Full multi-page navigation supported

## Architecture

```
User → Gatekeeper Page → API Gateway → Lambda Function → Presigned URL/Cookies → CloudFront → S3 Bucket
```

## Configuration Options

### Presigned URLs
- **Use Case:** Single-page access or specific resource access
- **CloudFront Setting:** Enable "Trusted Signers" or "Trusted Key Groups"
- **Lambda Response:** Returns signed URL with expiration
- **Limitation:** Each resource needs individual signing
- **Best For:** Direct file access, API endpoints, single resources

### Presigned Cookies
- **Use Case:** Multi-page navigation with shared access
- **CloudFront Setting:** Enable "Trusted Signers" with cookie-based policies
- **Lambda Response:** Sets signed cookies in browser
- **Advantage:** Single authentication for entire site navigation
- **Best For:** Multi-page websites, seamless navigation, static sites

## Setup

1. **Clone repository**
   ```bash
   git clone <repository-url>
   ```

2. **Upload documentation to private S3 bucket**

3. **Configure CloudFront Distribution**
   - Enable Origin Access Control (OAC)
   - Point to private S3 bucket
   - Configure Trusted Key Groups for signing
   - **For URLs:** Standard behavior configuration
   - **For Cookies:** Enable cookie forwarding and cache policies

4. **Deploy Lambda function**
   - Set up API Gateway trigger
   - Configure environment variables:
     ```
     CF_DOMAIN=your-cloudfront-domain
     CLOUDFRONT_KEY_PAIR_ID=your-key-pair-id
     CLOUDFRONT_KEY_BUCKET=your-s3-bucket
     CLOUDFRONT_KEY_OBJECT=your-private-key-file
     ```

5. **Deploy gatekeeper page** to public location

## Usage

1. Open the gatekeeper page in browser
2. Click "Access Documents" button
3. Lambda generates temporary presigned URL or sets cookies
4. Redirect to `index.html` of documentation
5. Access expires after configured time limit

**Current Behavior:**
- ✅ Successful access to documentation
- ✅ Both URL and cookie signing methods work
- ✅ Full multi-page navigation functional
- ✅ CSS and static assets loading properly
- ✅ Access expiration works correctly

## Acceptance Criteria

| Requirement | Status | Notes |
|-------------|--------|---------|
| Direct access blocked | ✅ | 403 Forbidden without signature |
| Private S3 bucket | ✅ | Only CloudFront OAC access |
| Gatekeeper page | ✅ | Single button interface |
| Token generation | ✅ | Lambda via API Gateway |
| Successful redirection | ✅ | Redirects to `index.html` |
| Full site access | ✅ | Complete site navigation |
| Access expiration | ✅ | 403 after expiration |
| CSS/Assets loading | ✅ | All resources accessible |

## Next Steps

- [ ] Optimize cookie vs URL configuration based on use case
- [ ] Add error handling and user feedback
- [ ] Performance optimization for large documentation sites
- [ ] Add monitoring and analytics