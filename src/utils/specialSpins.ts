const rawSpinAddresses: Record<string, number> = {
  ""
};


const specialSpinAddresses: Record<string, number> = Object.fromEntries(
  Object.entries(rawSpinAddresses).map(([addr, value]) => [addr.toLowerCase(), value])
);

export function getMaxSpinsForAddress(address: string | undefined): number {
  if (!address) return 1;
  return specialSpinAddresses[address.toLowerCase()] || 1;
}