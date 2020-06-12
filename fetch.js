export default async (domain, type) => {
    // Make the request
    const response = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(type)}`,
        {
            headers: {
                Accept: "application/dns-json",
            },
        }
    );
    if (!response || !response.ok) return "Failed to make DNS request";

    // Parse the JSON data
    const json = await response.json().catch(() => {});
    if (!json || !('Status' in json) || json.Status !== 0) return "Failed to parse DNS response";

    return Array.isArray(json.Answer) ? json.Answer : [];
};
