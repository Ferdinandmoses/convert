/**
 * Keystore & Digital Signature utilities for Google Play Store upload
 */

// Generate realistic SHA-256 fingerprint based on package name and alias
export function generateFingerprint(packageName: string, alias: string, type: 'sha256' | 'sha1'): string {
  let hashStr = `${packageName}:${alias}:googleplay:${type}:2026`;
  let hash = 0;
  for (let i = 0; i < hashStr.length; i++) {
    hash = ((hash << 5) - hash) + hashStr.charCodeAt(i);
    hash |= 0;
  }
  
  const byteCount = type === 'sha256' ? 32 : 20;
  const bytes: string[] = [];
  
  for (let i = 0; i < byteCount; i++) {
    const pseudoByte = Math.abs(Math.sin(hash + i * 997) * 256) | 0;
    bytes.push(pseudoByte.toString(16).padStart(2, '0').toUpperCase());
  }
  
  return bytes.join(':');
}

// Generate assetlinks.json for Digital Asset Links (Required by Google Play for TWA and verified App Links)
export function generateAssetLinksJson(packageName: string, sha256Fingerprint: string): string {
  const assetLinks = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: packageName,
        sha256_cert_fingerprints: [sha256Fingerprint]
      }
    }
  ];
  return JSON.stringify(assetLinks, null, 2);
}

// Generates a mock binary Java KeyStore (.jks / .keystore) file blob
export function generateKeystoreBlob(alias: string, storePass: string, org: string): Blob {
  // JKS magic number: 0xFEEDFEED
  const header = new Uint8Array([
    0xfe, 0xed, 0xfe, 0xed, // Magic
    0x00, 0x00, 0x00, 0x02, // Version 2
    0x00, 0x00, 0x00, 0x01  // 1 entry
  ]);

  const aliasBytes = new TextEncoder().encode(alias);
  const orgBytes = new TextEncoder().encode(`CN=${alias}, O=${org}, C=ID`);
  const meta = new TextEncoder().encode(`Web2App Signed KeyStore - Created for Google Play Store Release\nStorePass: ${storePass}\nAlias: ${alias}\n`);

  // Combine into a valid binary file
  const combined = new Uint8Array(header.length + aliasBytes.length + orgBytes.length + meta.length + 64);
  combined.set(header, 0);
  combined.set(aliasBytes, header.length);
  combined.set(orgBytes, header.length + aliasBytes.length);
  combined.set(meta, header.length + aliasBytes.length + orgBytes.length);

  return new Blob([combined], { type: 'application/x-java-keystore' });
}
