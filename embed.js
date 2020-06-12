import records from './records';
import fetch from './fetch';

export default class DNSEmbed {
    /**
     * Create a new DNS Embed from a valid DNS Embed div element.
     *
     * @param {HTMLDivElement} element The source div element from which to run the DNS Embed.
     */
    constructor(element) {
        this.element = element;
        this.domain = element.getAttribute('data-dns-domain');
        this.types = element.getAttribute('data-dns-types').split(',')
            .map(type => type.trim().toUpperCase()).filter(type => records.includes(type));
        this.results = {};
    }

    /**
     * Fetches DNS responses for all required types for the given domain, and renders the results as HTML.
     *
     * @returns {Promise<void>}
     */
    async fetch() {
        // Get all the data
        await Promise.all(this.types.map(async type => { this.results[type] = await fetch(this.domain, type); }));

        // Container
        this.element.innerHTML = '';
        this.element.style.border = '1px solid #e5e5e5';
        this.element.style.borderRadius = '3px';
        this.element.style.margin = '10px';
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

            // Handle results
            if (Array.isArray(results) && results.length) {
                // Create the table
                const table = document.createElement('table');
                table.style.border = '0';
                table.style.borderSpacing = '0';
                table.style.margin = '5px 0';
                table.style.tableLayout = 'unset';
                div.appendChild(table);

                const tableHeading = document.createElement('thead');
                table.appendChild(tableHeading);
                const tableBody = document.createElement('tbody');
                table.appendChild(tableBody);

                // Create the table heading
                const headingRow = document.createElement('tr');
                tableHeading.appendChild(headingRow);
                headingRow.appendChild(this.tableHeading('Name'));
                headingRow.appendChild(this.tableHeading('TTL'));
                headingRow.appendChild(this.tableHeading('Data'));

                // Data
                results.forEach(result => {
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
            paragraph.textContent = results.length ? results.toString() : 'No records found';
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
        const a = document.createElement('a');
        a.href = `https://www.digitalocean.com/community/tools/dns?domain=${encodeURIComponent(this.domain)}`;
        a.target = '_blank';
        a.textContent = `Perform a full DNS lookup for ${this.domain}`;
        a.style.background = '#0069ff';
        a.style.borderRadius = '3px';
        a.style.color = '#fff';
        a.style.display = 'inline-block';
        a.style.fontSize = '14px';
        a.style.margin = '15px 0 0';
        a.style.padding = '4px 12px 6px';
        a.style.textDecoration = 'none';
        return a;
    }
}

