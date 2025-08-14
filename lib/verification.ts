import type { Product } from "@/lib/types";
import { list } from "@vercel/blob";

/**
 * Compute a minimal deterministic representation hash for a list of products.
 */
export function computeMinimalHash(products: any[]): string {
  const minimal = (products || [])
    .map((p: any) => ({ sku: String(p.sku || "").trim(), price: p.price || 0, productName: p.productName || p.name || "" }))
    .sort((a: any, b: any) => a.sku.localeCompare(b.sku));
  const json = JSON.stringify(minimal);
  return Buffer.from(json).toString("base64");
}

/**
 * Compute a grouped/hash-like signature for grouped data (families).
 */
export function computeGroupedSignature(grouped: any): string {
  try {
    // If grouped is an array of families
    if (Array.isArray(grouped)) {
      const minimal = grouped.map((f: any) => ({
        key: f.familyKey || f.id || f.title || "",
        count: Array.isArray(f.variants) ? f.variants.length : (f.products ? f.products.length : 0),
        firstSku: (f.variants && f.variants[0]?.sku) || (f.products && f.products[0]?.sku) || ""
      })).sort((a: any, b: any) => String(a.key).localeCompare(String(b.key)));
      return Buffer.from(JSON.stringify(minimal)).toString("base64");
    }

    // If grouped is an object map
    if (typeof grouped === "object" && grouped !== null) {
      const keys = Object.keys(grouped).sort();
      const minimal = keys.map(k => ({
        key: k,
        count: Array.isArray(grouped[k]) ? grouped[k].length : 0,
        firstSku: grouped[k] && grouped[k][0]?.sku ? grouped[k][0].sku : ""
      }));
      return Buffer.from(JSON.stringify(minimal)).toString("base64");
    }

    return computeMinimalHash(Array.isArray(grouped) ? grouped : []);
  } catch (err) {
    return computeMinimalHash(Array.isArray(grouped) ? grouped : []);
  }
}

/**
 * verifyCustomerFacingData
 * - expectedProducts: the products we expect to be live (staged products)
 * - options.timeout: max ms to attempt verification (default 300000 = 5 minutes)
 *
 * Returns a diagnostic object with success boolean and details.
 */
export async function verifyCustomerFacingData(expectedProducts: Product[], options?: { timeout?: number }) {
  const timeout = options?.timeout ?? 300000;
  const start = Date.now();
  const expectedHash = computeMinimalHash(expectedProducts);

  // Build baseUrl for fetching site APIs
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');

  let attempt = 0;
  const diagnostics: any = {
    attempts: [],
    expectedHash,
    lastChecked: null,
    publicApi: null,
    groupedApi: null,
    blobHash: null
  };

  while (Date.now() - start < timeout) {
    attempt += 1;
    const attemptInfo: any = { attempt, timestamp: new Date().toISOString() };

    try {
      // Public API (raw)
      const publicRes = await fetch(`${baseUrl}/api/products?ts=${Date.now()}`, { cache: 'no-store' });
      const publicJson = await publicRes.json().catch(() => null);
      const publicProducts = Array.isArray(publicJson?.products) ? publicJson.products : (Array.isArray(publicJson) ? publicJson : []);
      const publicHash = computeMinimalHash(publicProducts);
      attemptInfo.public = { status: publicRes.status, count: publicProducts.length, hash: publicHash };

      // Grouped API
      const groupedRes = await fetch(`${baseUrl}/api/products?grouped=true&ts=${Date.now()}`, { cache: 'no-store' });
      const groupedJson = await groupedRes.json().catch(() => null);
      const groupedData = groupedJson?.products ?? groupedJson ?? [];
      const groupedHash = computeGroupedSignature(groupedData);
      const groupedCount = Array.isArray(groupedData) ? groupedData.length : (typeof groupedData === 'object' ? Object.keys(groupedData).length : 0);
      attemptInfo.grouped = { status: groupedRes.status, count: groupedCount, hash: groupedHash };

      // Try reading products-hash.json from blob (if available)
      try {
        const blobs = await list({ prefix: 'products-hash.json', limit: 10 });
        if (blobs?.blobs && blobs.blobs.length > 0) {
          const hashBlob = blobs.blobs[0];
          const hashResp = await fetch(hashBlob.url, { cache: 'no-store' });
          if (hashResp.ok) {
            const hashJson = await hashResp.json().catch(() => null);
            attemptInfo.blobHash = hashJson?.hash || null;
          } else {
            attemptInfo.blobHash = null;
          }
        } else {
          attemptInfo.blobHash = null;
        }
      } catch (err) {
        attemptInfo.blobHash = null;
      }

      diagnostics.attempts.push(attemptInfo);
      diagnostics.lastChecked = new Date().toISOString();
      diagnostics.publicApi = attemptInfo.public;
      diagnostics.groupedApi = attemptInfo.grouped;
      diagnostics.blobHash = attemptInfo.blobHash;

      // Verify rules:
      // - Public hash must match expected (raw API)
      // - Grouped hash should match grouped signature of expected products (best-effort)
      const publicMatches = attemptInfo.public.hash === expectedHash;
      // For grouped, compute expected grouped signature
      const expectedGroupedSignature = computeGroupedSignature(expectedProducts as any);
      const groupedMatches = attemptInfo.grouped.hash === expectedGroupedSignature;
      const blobMatches = !attemptInfo.blobHash || attemptInfo.blobHash === expectedHash; // if no artifact, don't require

      if (publicMatches && groupedMatches && blobMatches) {
        return { success: true, diagnostics };
      }

    } catch (err) {
      diagnostics.attempts.push({ attempt, error: String(err), timestamp: new Date().toISOString() });
    }

    // Exponential backoff
    const delay = Math.min(2000 * Math.pow(1.5, attempt), 30000);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  return { success: false, diagnostics };
}
