export const handler = async (event) => {
    const request = event.Records[0].cf.request;
    const headers = request.headers;
    const uri = request.uri;
    
    console.log(`🔍 Processing request for: ${uri}`);
    
    // Allow access to gatekeeper.html (always accessible)
    if (uri === '/gatekeeper.html' || uri === '/') {
        console.log('✅ Allowing access to gatekeeper page');
        
        // If requesting root, redirect to gatekeeper.html
        if (uri === '/') {
            return {
                status: '302',
                statusDescription: 'Found',
                headers: {
                    'location': [{
                        key: 'Location',
                        value: '/gatekeeper.html'
                    }]
                }
            };
        }
        
        return request; // Allow access to gatekeeper.html
    }
    
    // For all other content, check for valid cookies
    if (hasValidCookies(headers)) {
        console.log('✅ Valid cookies found, allowing access to:', uri);
        return request; // Allow access to protected content
    }
    
    // No valid cookies - redirect to gatekeeper
    console.log('❌ No valid cookies, redirecting to gatekeeper');
    return {
        status: '302',
        statusDescription: 'Found',
        headers: {
            'location': [{
                key: 'Location',
                value: '/gatekeeper.html'
            }]
        }
    };
};

// Check for valid CloudFront signed cookies
function hasValidCookies(headers) {
    if (!headers.cookie) return false;
    
    const cookieString = headers.cookie[0].value;
    return cookieString.includes('CloudFront-Policy') && 
           cookieString.includes('CloudFront-Signature') && 
           cookieString.includes('CloudFront-Key-Pair-Id');
}
