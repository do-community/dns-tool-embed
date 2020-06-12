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

export default async (domain, type) => {
    // Make the request
    const response = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(type)}`,
        {
            headers: {
                Accept: 'application/dns-json',
            },
        },
    );
    if (!response || !response.ok) return 'Failed to make DNS request';

    // Parse the JSON data
    const json = await response.json().catch(() => {});
    if (!json || !('Status' in json) || json.Status !== 0) return 'Failed to parse DNS response';

    return Array.isArray(json.Answer) ? json.Answer : [];
};
