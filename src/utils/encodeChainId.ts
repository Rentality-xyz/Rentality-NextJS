export function parseId(encodedId: string): number {
  const decoded = Buffer.from(encodedId, "base64").toString();
  const [chainId] = decoded.split(":");
  return Number(chainId);
}
export function generateId(chainId: number, caseNumber: number): string {
  return Buffer.from(`${chainId}:${caseNumber}`).toString("base64");
}
