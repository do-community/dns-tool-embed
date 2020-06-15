/*
Copyright 2020 DigitalOcean

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// Get a previous result made within this current window from the cache if it exists
const getFromCache = (domain, type) => {
    if (!('_DNSToolEmbedsCache' in window)) return;
    if (!window._DNSToolEmbedsCache) return;
    if (!(domain in window._DNSToolEmbedsCache)) return;
    if (!window._DNSToolEmbedsCache[domain]) return;
    if (!(type in window._DNSToolEmbedsCache[domain])) return;
    if (!window._DNSToolEmbedsCache[domain][type]) return;

    return window._DNSToolEmbedsCache[domain][type];
};

// Save this result to the window cache, so subsequent identical requests don't fire network calls
const saveInCache = (domain, type, result) => {
    window._DNSToolEmbedsCache = window._DNSToolEmbedsCache || {};
    window._DNSToolEmbedsCache[domain] = window._DNSToolEmbedsCache[domain] || {};
    window._DNSToolEmbedsCache[domain][type] = result;
    return result;
};

/**
 * Make a request to Cloudflare's DoH Resolver JSON API for a given domain and type.
 * This will use a cached value if present within the current window unless cacheBypass has a truthy value.
 *
 * @param {String} domain The domain to fetch the record type for.
 * @param {String} type The DNS record type to fetch results for.
 * @param {Boolean} [cacheBypass=false] If the window-based cache for results should be bypassed.
 * @returns {Promise<String|Array>}
 */
export default async (domain, type, cacheBypass = false) => {
    // If in the cache, use that result
    const cache = getFromCache(domain, type);
    if (!cacheBypass && cache !== undefined) return cache;

    // Make the request
    const response = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(type)}`,
        {
            headers: {
                Accept: 'application/dns-json',
            },
        },
    );
    if (!response || !response.ok)
        return saveInCache(domain, type, 'Failed to make DNS request');

    // Parse the JSON data
    const json = await response.json().catch(() => {});
    if (!json || !('Status' in json) || json.Status !== 0)
        return saveInCache(domain, type, 'Failed to parse DNS response');

    return saveInCache(domain, type, Array.isArray(json.Answer) ? json.Answer : []);
};
