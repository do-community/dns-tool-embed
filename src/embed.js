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

import records from './records';
import fetch from './fetch';
import refreshIcon from './icons/refresh-cw';
import externalLinkIcon from './icons/external-link';

export default class DNSEmbed {
    /**
     * Create a new DNS Embed from a valid DNS Embed div element.
     *
     * @param {HTMLDivElement} element The source div element from which to run the DNS Embed.
     */
    constructor(element) {
        // Save the elm
        this.element = element;

        // Save the data
        this.domain = element.getAttribute('data-dns-domain');
        this.types = element.getAttribute('data-dns-types').split(',')
            .map(type => type.trim().toUpperCase()).filter(type => records.includes(type));

        // Remove the data
        element.removeAttribute('data-dns-tool-embed');
        element.removeAttribute('data-dns-domain');
        element.removeAttribute('data-dns-types');

        // Prep results store
        this.results = {};
    }

    /**
     * Fetches DNS responses for all required types for the given domain, and renders the results as HTML.
     *
     * @param {Boolean} [cacheBypass=false] If the window-based cache for results should be bypassed.
     * @returns {Promise<void>}
     */
    async fetch(cacheBypass = false) {
        // Get all the data
        await Promise.all(this.types.map(async type => {
            this.results[type] = await fetch(this.domain, type, cacheBypass);
        }));

        // Container
        this.element.innerHTML = '';
        this.element.style.border = '1px solid #e5e5e5';
        this.element.style.borderRadius = '3px';
        this.element.style.margin = '16px 0';
        this.element.style.padding = '10px';

        // Heading
        const heading = document.createElement('h4');
        heading.textContent = `DNS lookup for ${this.domain}`;
        heading.style.fontSize = '15px';
        heading.style.margin = '0 0 20px';
        this.element.appendChild(heading);

        // Render the content
        this.content().forEach(div => this.element.appendChild(div));
        this.element.appendChild(this.button());
    }

    /**
     * Get the HTML content for the DNS Embed, based on the stored results.
     *
     * @private
     * @returns {HTMLDivElement[]}
     */
    content() {
        return Object.entries(this.results).sort(a => records.indexOf(a[0])).map(([type, results]) => {
            const div = document.createElement('div');

            // Heading
            const heading = document.createElement('h5');
            heading.textContent = `${type} records`;
            heading.style.fontSize = '15px';
            heading.style.margin = '10px 0 0';
            div.appendChild(heading);

            // Refresh
            const refresh = document.createElement('a');
            refresh.style.display = 'inline-block';
            refresh.style.border = 'none';
            refresh.style.cursor = 'pointer';
            refresh.style.margin = '0 0 0 5px';
            refresh.innerHTML = refreshIcon;
            refresh.firstElementChild.style.display = 'inline-block';
            refresh.firstElementChild.style.margin = '0 0 -1px';
            refresh.firstElementChild.style.verticalAlign = 'baseline';
            refresh.firstElementChild.className = '';
            refresh.firstElementChild.removeAttribute('width');
            refresh.firstElementChild.setAttribute('height', '12px');
            refresh.addEventListener('click', () => {
                refresh.style.display = 'none';
                this.fetch(true).then(() => {});
            });
            heading.appendChild(refresh);

            // Date
            const date = document.createElement('p');
            date.textContent = `Last fetched ${results[1].toLocaleString()}`;
            date.style.color = '#333';
            date.style.display = 'none';
            date.style.fontSize = '11px';
            date.style.margin = '0';
            div.appendChild(date);

            // Show date when hovering on heading (or date)
            let overHeading = false, overDate = false;
            const leave = () => { if (!overHeading && !overDate) date.style.display = 'none'; };
            heading.addEventListener('mouseenter', () => { overHeading = true; date.style.display = ''; });
            date.addEventListener('mouseenter', () => { overDate = true; date.style.display = ''; });
            heading.addEventListener('mouseleave', () => { overHeading = false; leave(); });
            date.addEventListener('mouseleave', () => { overDate = false; leave(); });

            // Handle results
            if (Array.isArray(results[0]) && results[0].length) {
                // Create a container so the table doesn't overflow
                const tableContainer = document.createElement('div');
                tableContainer.style.overflowX = 'auto';
                tableContainer.style.maxWidth = '100%';
                div.appendChild(tableContainer);

                // Create the table
                const table = document.createElement('table');
                table.style.background = 'none';
                table.style.border = '0';
                table.style.borderSpacing = '0';
                table.style.margin = '5px 0';
                table.style.tableLayout = 'unset';
                tableContainer.appendChild(table);

                const tableHeading = document.createElement('thead');
                tableHeading.style.background = 'none';
                table.appendChild(tableHeading);
                const tableBody = document.createElement('tbody');
                tableBody.style.background = 'none';
                table.appendChild(tableBody);

                // Create the table heading
                const headingRow = document.createElement('tr');
                tableHeading.appendChild(headingRow);
                headingRow.appendChild(this.tableHeading('Name'));
                headingRow.appendChild(this.tableHeading('TTL'));
                headingRow.appendChild(this.tableHeading('Data'));

                // Data
                results[0].forEach(result => {
                    const resultRow = document.createElement('tr');
                    tableBody.appendChild(resultRow);
                    resultRow.appendChild(this.tableCell(result.name));
                    resultRow.appendChild(this.tableCell(result.TTL, true));
                    resultRow.appendChild(this.tableCell(result.data, true));
                });

                return div;
            }

            // Error
            const paragraph = document.createElement('p');
            paragraph.textContent = results[0].length ? results[0].toString() : 'No records found';
            paragraph.style.color = '#666';
            paragraph.style.fontSize = '13px';
            paragraph.style.margin = '5px 6px 0';
            div.appendChild(paragraph);
            return div;
        });
    }

    /**
     * Create a table heading entry for the DNS records table.
     *
     * @private
     * @param {String} name The heading name to use for the cell.
     * @returns {HTMLTableHeaderCellElement}
     */
    tableHeading(name) {
        const heading = document.createElement('th');
        heading.textContent = name;
        heading.style.color = '#666';
        heading.style.fontSize = '13px';
        heading.style.fontWeight = 'normal';
        heading.style.textAlign = 'left';
        heading.style.padding = '2px 6px';
        return heading;
    }

    /**
     * Produces a table cell for DNS record data.
     *
     * @private
     * @param {String} content The contents to render in the cell, as text
     * @param {Boolean} [leftBorder=false] If the cell should render a border to the left of it
     * @returns {HTMLTableDataCellElement}
     */
    tableCell(content, leftBorder = false) {
        const cell = document.createElement('td');
        cell.textContent = content;
        cell.style.border = 'solid #f1f1f1';
        cell.style.borderWidth = `2px 0 0${leftBorder ? ' 2px' : ''}`;
        cell.style.padding = '2px 6px';
        return cell;
    }

    /**
     * Generate a button to perform a full DNS lookup of the given domain on the DO Community DNS Lookup tool.
     *
     * @private
     * @returns {HTMLAnchorElement}
     */
    button() {
        // Create the button
        const a = document.createElement('a');
        a.href = `https://www.digitalocean.com/community/tools/dns?domain=${encodeURIComponent(this.domain)}`;
        a.target = '_blank';
        a.textContent = `Perform a full DNS lookup for ${this.domain}`;
        a.style.background = '#0069ff';
        a.style.border = 'none';
        a.style.borderRadius = '3px';
        a.style.color = '#fff';
        a.style.display = 'inline-block';
        a.style.fontSize = '14px';
        a.style.margin = '15px 0 0';
        a.style.padding = '4px 12px 6px';
        a.style.textDecoration = 'none';

        // Add the external link
        const icon = document.createElement('div');
        icon.innerHTML = externalLinkIcon;
        icon.firstElementChild.className = '';
        icon.firstElementChild.removeAttribute('width');
        icon.firstElementChild.setAttribute('height', '12px');
        icon.firstElementChild.style.display = 'inline-block';
        icon.firstElementChild.style.margin = '0 0 -1px 5px';
        icon.firstElementChild.style.verticalAlign = 'baseline';
        a.appendChild(icon.firstElementChild);

        return a;
    }
}

