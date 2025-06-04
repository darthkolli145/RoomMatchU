export function extractShortAddress(fullAddress: string): string {
  if (!fullAddress) return '';

  const parts = fullAddress.split(',').map(p => p.trim());
  const zipMatch = fullAddress.match(/\b\d{5}\b/);
  const zip = zipMatch ? zipMatch[0] : '';

  // 🔍 First, check if it already starts with a street number
  if (/^\d+/.test(parts[0])) {
    const street = parts[0];
    const streetName = parts[1] ?? '';
    const city = parts.find(part =>
      /(Santa Cruz|Capitola|Soquel|Aptos|Scotts Valley|Watsonville)/i.test(part)
    ) ?? '';
    return `${street} ${streetName}, ${city} ${zip}`;
  }

  // 👷‍♂️ Otherwise, scan for a number + street combo
  let streetAddress = '';
  for (let i = 0; i < parts.length - 1; i++) {
    const hasNumber = /^\d+/.test(parts[i]);
    const hasStreetName = /(Street|St|Road|Rd|Avenue|Ave|Boulevard|Blvd|Lane|Ln|Drive|Dr|Terrace|Way|Court|Ct|Circle|Cir)/i.test(parts[i + 1]);
    if (hasNumber && hasStreetName) {
      streetAddress = `${parts[i]} ${parts[i + 1]}`;
      break;
    }
  }

  const city = parts.find(part =>
    /(Santa Cruz|Capitola|Soquel|Aptos|Scotts Valley|Watsonville)/i.test(part)
  ) ?? '';

  if (streetAddress && city && zip) {
    return `${streetAddress}, ${city} ${zip}`;
  }

  // Fallback if all else fails
  return fullAddress;
}
