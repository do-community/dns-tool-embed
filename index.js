import DNSEmbed from './embed';

const ready = func => {
    if (document.readyState === 'loading') return document.addEventListener('DOMContentLoaded', func);
    func();
};

const main = () => {
    // Detect all valid embeds to run
    const embedsElms = Array.from(document.querySelectorAll('[data-dns-tool-embed][data-dns-domain][data-dns-types]'));

    // Convert to embed classes
    const embeds = embedsElms.map(x => new DNSEmbed(x));

    // Run fetch for all
    Promise.all(embeds.map(x => x.fetch())).then(() => {});
};

ready(main);
