/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2018-2026 Toha <tohenk@yahoo.com>
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

const fs = require('fs');
const util = require('./util');
const EventEmitter = require('events');

/**
 * A simple logger.
 *
 * @author Toha <tohenk@yahoo.com>
 */
class Logger extends EventEmitter {

    constructor(filename) {
        super();
        /** @type {string} */
        this.logfile = filename;
        /** @type {string} */
        this.dateFormat = 'dd-MM HH:mm:ss.zzz';
        /** @type {string|string[]} */
        this.tag;
        this.create();
    }

    /**
     * Create logger console.
     *
     * @returns {void}
     */
    create() {
        this.stdout = fs.createWriteStream(this.logfile, {flags: 'a'});
        this.logger = new console.Console(this.stdout);
    }

    /**
     * Log messages.
     *
     * @param  {...any} args Arguments
     * @returns {Promise<boolean>}
     */
    log(...args) {
        const time = new Date();
        return new Promise((resolve, reject) => {
            this.rotate(time)
                .then(() => {
                    const prefixes = [util.formatDate(time, this.dateFormat)];
                    if (this.tag) {
                        prefixes.push((Array.isArray(this.tag) ? this.tag : [this.tag]).join(','));
                    }
                    const logs = [];
                    const prefix = prefixes.join(' ');
                    const formatter = require('util').format;
                    formatter(...args)
                        .split('\n')
                        .forEach(message => {
                            message = `${prefix} ${message}`;
                            this.logger.log(message);
                            logs.push(message);
                        });
                    this.emit('logs', logs);
                    resolve(true);
                })
                .catch(err => {
                    console.error(err);
                    resolve(false);
                });
        });
    }

    /**
     * Rotate log file.
     *
     * @param {Date|undefined} time Log file creation time
     * @returns {Promise<undefined>}
     */
    rotate(time) {
        if (time === undefined) {
            time = new Date();
        }
        if (!this.time && fs.existsSync(this.logfile)) {
            const info = fs.statSync(this.logfile);
            this.time = new Date(info.mtime);
        }
        if (this.time && time.getDate() !== this.time.getDate()) {
            this.time = time;
            return new Promise((resolve, reject) => {
                let filename;
                let seq = 0;
                while (true) {
                    filename = this.logfile + '.' + seq++;
                    if (!fs.existsSync(filename)) {
                        break;
                    }
                }
                fs.rename(this.logfile, filename, err => {
                    if (err) {
                        return reject(err);
                    }
                    this.create();
                    resolve();
                });
            });
        } else {
            return Promise.resolve();
        }
    }
}

module.exports = Logger;