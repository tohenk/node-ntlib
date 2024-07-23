/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2017-2024 Toha <tohenk@yahoo.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/*
 * HTTP command
 */

const args = process.argv.slice(2);
const data = JSON.parse(args[0]);

if (data.url) {
    let content, headers, done = false;
    const method = data.method || 'GET';
    const contentType = data.contentType || 'application/x-www-form-urlencoded';
    switch (contentType) {
        case 'application/x-www-form-urlencoded':
            content = require('querystring').stringify(data.params);
            break;
        case 'application/json':
            content = JSON.stringify(data.params);
            break;
    }
    if (content) {
        headers = {
            'Content-Type': contentType,
            'Content-Length': Buffer.byteLength(content)
        }
    }
    console.log('URL: %s', data.url);
    console.log('METHOD: %s', method.toUpperCase());
    console.log('DATA: %s', content);
    const f = () => {
        let result, rcode, rheaders, err;
        const url = require('url').parse(data.url);
        const http = require('https:' === url.protocol ? 'https' : 'http');
        const options = {
            hostname: url.hostname,
            path: url.path,
            method: method.toUpperCase()
        }
        if (headers) {
            options.headers = headers;
        }
        const req = http.request(options, res => {
            rcode = res.statusCode;
            rheaders = res.headers;
            res.setEncoding('utf8');
            res.on('data', chunk => {
                if (typeof chunk === 'string') {
                    chunk = Buffer.from(chunk, 'utf8');
                }
                if (result === undefined) {
                    result = chunk;
                } else {
                    result = Buffer.concat([result, chunk]);
                }
            });
            res.on('end', () => {
                if (rcode === 301 || rcode === 302) {
                    if (res.headers.location) {
                        data.url = res.headers.location;
                    } else {
                        console.error('No redirection to follow!');
                    }
                } else {
                    done = true;
                }
            });
        });
        req.on('error', e => {
            err = e;
            console.error('Error: %s', e.message);
        });
        req.on('close', () => {
            if (!err) {
                if (done) {
                    console.log('STATUS: %s', rcode);
                    console.log('HEADERS: %s', JSON.stringify(rheaders));
                    console.log('BODY: %s', result);
                    if (rheaders['content-type'] && /^application\/json/.test(rheaders['content-type'])) {
                        result = JSON.parse(result);
                    }
                    process.send(result);
                } else {
                    f();
                }
            }
        });
        // write data to request body
        if (content) {
            req.write(content);
        }
        req.end();
    }
    f();
}