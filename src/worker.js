const ROOT_FILES = new Set(["/", "/index.html", "/styles.css", "/script.js"]);

function isAllowedPath(pathname) {
  return ROOT_FILES.has(pathname) || pathname.startsWith("/design-elements/");
}

function withHeaders(response, pathname) {
  const headers = new Headers(response.headers);

  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  if (pathname === "/" || pathname === "/index.html") {
    headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  } else {
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname === "/" ? "/index.html" : url.pathname;

    if (!isAllowedPath(url.pathname) && !isAllowedPath(pathname)) {
      return new Response("Not found", { status: 404 });
    }

    url.pathname = pathname;
    const assetRequest = new Request(url.toString(), request);
    const response = await env.ASSETS.fetch(assetRequest);

    if (response.status === 404 && pathname !== "/index.html") {
      return new Response("Not found", { status: 404 });
    }

    return withHeaders(response, pathname);
  }
};