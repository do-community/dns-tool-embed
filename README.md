# Community DNS Lookup Embed

A portable, embeddable version of the DO Community DNS Lookup tool.

---

## DNS Lookup

A simple browser-based tool to perform DNS lookups. Type a domain, search, and instantly get results.

### [➡️ Use now](https://www.digitalocean.com/community/tools/dns)

## Development/Building

To setup the build/development environment, you will need to run `npm ci` with Node 12+ installed.
This will install the dependencies to allow you to build the project.

To develop for this embed script, run `npm run watch`.
This will start the bundler in watch mode, that will automatically rebuild the bundled embed script
 whenever changes are made to the source.

If you wish to host this embed script or use it in production, simply run `npm run build`.
You can then take the `build` folder and put it on your web server/bucket/site.

GitHub Actions is configured to do this automatically for this repository to deploy to gh-pages.

## Contributing

If you are contributing, please read the [contributing file](CONTRIBUTING.md) before submitting your pull requests.

## Thanks

Thanks to [Cloudflare](https://cloudflare.com) for their great WHOIS/DNS-over-HTTPS APIs.
You can learn more about the importance of DNS-over-HTTPS and how to use it [here](https://developers.cloudflare.com/1.1.1.1/dns-over-https/).
