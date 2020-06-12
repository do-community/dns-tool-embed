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

import DNSEmbed from './embed';

const ready = func => {
    if (document.readyState === 'loading') return document.addEventListener('DOMContentLoaded', func);
    func();
};

const main = () => {
    // Detect all valid embeds to run
    const embedsElms = Array.from(document.querySelectorAll('[data-dns-tool-embed][data-dns-domain][data-dns-types]'));

    // Convert to DNSEmbed instances
    const embeds = embedsElms.map(x => new DNSEmbed(x));

    // Run fetch for all to generate data
    Promise.all(embeds.map(x => x.fetch())).then(() => {});
};

ready(main);
