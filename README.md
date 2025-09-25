**Project Name:** Secure CloudFront Documentation Access

**Note:** Presigned cookies are planned but not yet implemented. Currently, only presigned URLs are functional.

**Description:**  
This project is a proof-of-concept to secure a multi-page static HTML5 documentation site using AWS CloudFront and S3. It ensures that the documentation cannot be accessed directly without a valid signature, providing session-based access via presigned URLs (presigned cookies support is a work-in-progress).

Users first access a gatekeeper page with an "Access Documents" button. Clicking this button triggers a backend process via AWS API Gateway, which invokes a Lambda function that generates a temporary signed access token for CloudFront. The user is then redirected to the documentation for a limited time.

Currently, only the index.html page is visible, and CSS or other static assets are not yet loading properly behind it.

**Project Overview:**  
The goal of this project is to test a secure setup for serving private documentation. Users first access a gatekeeper page with a button. Clicking the button triggers a backend Lambda function via API Gateway that generates a temporary signed URL or sets presigned cookies. This allows the user to access the documentation for a limited time without implementing a full authentication system.

Currently, only index.html is visible, and CSS/other resources are not yet applied.

**Features:**

Secure multi-page static HTML5 documentation hosted on S3

Private S3 bucket accessible only via CloudFront using Origin Access Control

Gatekeeper page with "Access Documents" button

Backend Lambda function generates **presigned URLs** (presigned cookies not yet working; under development) via API Gateway

Temporary access with automatic expiration

Full navigation through documentation while signature is valid

Direct access blocked (403 Forbidden) for unauthorized requests

**Currently only index.html is visible; CSS and other static assets are not yet loaded**

**Architecture:**  
User → Gatekeeper Page (HTML) → API Gateway **→** Lambda Function → Generates Presigned URL or Cookies → Redirects User → CloudFront Distribution → S3 Bucket (Private HTML Documentation)

**Setup and Installation:**

Clone the repository

Upload HTML documentation to a private S3 bucket.

**Configure CloudFront:**

Use Origin Access Control (OAC) to restrict S3 access.

Point the distribution to your private S3 bucket.

Enable signed URLs or signed cookies.

Deploy the Lambda function via API Gateway that generates presigned URLs or cookies.
**Set environment variables:**  
CF_DOMAIN = your-cloudfront-domain  
CLOUDFRONT_KEY_PAIR_ID = your-key-pair-id  
CLOUDFRONT_KEY_BUCKET = your-s3-bucket  
CLOUDFRONT_KEY_OBJECT = your-private-key-file

Deploy the gatekeeper page (HTML with "Access Documents" button) to a public location (S3 or CloudFront).

**Usage:**

Open the gatekeeper page in a browser.

Click the "Access Documents" button.

The Lambda function currently generates a **temporary presigned URL**.

**Presigned cookies functionality is not implemented yet** and will be added in future updates.

The user is redirected to index.html of the documentation.

Currently, only index.html is visible; CSS and other static assets are not applied.

Navigate through the documentation freely until the signature expires.

After expiration, any attempt to reload or access pages results in 403 Forbidden.

**Acceptance Criteria:**

**Direct Access Blocked:** Direct CloudFront URL access without a valid signature results in 403 Forbidden.

**Private S3 Bucket:** Only CloudFront OAC can access HTML files.

**Gatekeeper Page Exists:** Single button to initiate access.

**Token Generation:** Backend Lambda via API Gateway generates presigned URL or cookies on click.

**Successful Redirection:** Users redirected to main index.html.

**Full Site Access:** Users can navigate all pages while signature is valid.

**Access Expiration:** After presigned URL/cookie expires, any reload or access attempt results in 403 Forbidden.

Currently, only index.html is visible; CSS and other static assets are not yet loaded.