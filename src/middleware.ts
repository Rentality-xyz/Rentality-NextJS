import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // TODO check other options
  // const cspHeader = `
  // default-src 'self';
  // script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
  // style-src 'self' 'nonce-${nonce}';
  // img-src 'self' blob: data:;
  // font-src 'self';
  // object-src 'none';
  // base-uri 'self';
  // form-action 'self';
  // frame-ancestors 'none';
  // upgrade-insecure-requests;
  // `

  const cspHeader = `
    frame-ancestors 'none'; 
`;

  // Replace newline characters and spaces
  const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/g, " ").trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);
  requestHeaders.set("X-Frame-Options", "DENY");

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);
  response.headers.set("X-Frame-Options", "DENY");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
