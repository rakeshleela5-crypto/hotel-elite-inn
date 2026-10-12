const fs = require('fs');

async function check() {
  const r = await fetch('https://hotel-elite-inn-backend-api-production-0dc9.up.railway.app/openapi.json');
  const openApi = await r.json();
  const apiPaths = openApi.paths;
  const backendApiCode = fs.readFileSync('src/utils/backendApi.js', 'utf8');

  // Extract all fetch urls using FASTAPI_BASE_URL
  const regex = /fetch\(\s*`\$\{FASTAPI_BASE_URL\}([^`?]+)(?:\?[^`]*)?`/g;
  let m;
  const feEndpoints = new Set();
  while ((m = regex.exec(backendApiCode)) !== null) {
    feEndpoints.add(m[1]);
  }

  // Also check non-template strings if any
  const regex2 = /fetch\(\s*FASTAPI_BASE_URL\s*\+\s*['"]([^'"]+)['"]/g;
  while ((m = regex2.exec(backendApiCode)) !== null) {
    feEndpoints.add(m[1]);
  }

  console.log('Total frontend endpoints extracted:', feEndpoints.size);
  const openApiPathsList = Object.keys(apiPaths);
  console.log('Total FastAPI endpoints in OpenAPI:', openApiPathsList.length);

  const matched = [];
  const missing = [];

  for (const ep of feEndpoints) {
    const epNorm = ep.replace(/\$\{[^}]+\}/g, '{param}');
    const found = openApiPathsList.find(p => {
      const pNorm = p.replace(/\{[^}]+\}/g, '{param}');
      return pNorm === epNorm || p === ep;
    });

    if (found) {
      matched.push({ frontend: ep, backend: found });
    } else {
      missing.push(ep);
    }
  }

  console.log(`Matched: ${matched.length}`);
  console.log(`Unmatched frontend endpoints (${missing.length}):`, missing);

  // Now check which FastAPI endpoints are NOT invoked in frontend
  const uncalledFastApi = openApiPathsList.filter(p => {
    const pNorm = p.replace(/\{[^}]+\}/g, '{param}');
    return !matched.some(m => {
      const mNorm = m.backend.replace(/\{[^}]+\}/g, '{param}');
      return mNorm === pNorm;
    });
  });

  console.log(`\nFastAPI endpoints NOT called by frontend (${uncalledFastApi.length}):`);
  console.log(uncalledFastApi);
}

check().catch(console.error);
