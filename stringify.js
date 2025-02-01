/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2023-2025 Toha <tohenk@yahoo.com>
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

const util = require('util');

/**
 * Convert javascript object to string.
 */
class Stringify {

    /**
     * Create a string representation of object.
     *
     * @param {object} object The object
     * @param {number} level The indentation level
     * @returns {string}
     */
    static from(object, level = 0) {
        const lines = this.toStr(object);
        this.fixIndent(lines, 2, this.size);
        if (level > 0) {
            this.addIndent(lines, level);
        }

        return lines.join('\n').trimStart();
    }

    /**
     * Inspect an object.
     *
     * @param {object} object Object to inspect
     * @returns {string[]}
     */
    static toStr(object) {
        const o = this.normalize(object);
        const lines = util.inspect(o, {depth: Infinity}).split('\n');
        this.normalizeFn(lines, o);

        return lines.map(line => line.replace(/\r$/, ''));
    }

    /**
     * Normalize function in object as its string representation.
     *
     * @param {object} object Object to normalize
     * @returns {object}
     */
    static normalize(object) {
        const result = {};
        for (const k of Object.keys(object)) {
            let v = object[k];
            if (typeof v === 'object' && !(v instanceof RawString)) {
                v = this.normalize(v);
            }
            if (typeof v === 'function') {
                v = this.raw(this.unIndent(v.toString()));
            }
            result[k] = v;
        }

        return result;
    }

    /**
     * Normalize function constructor to `fn()`.
     *
     * @param {string[]} lines Exploded object string representation
     * @param {object} ref Object reference for function
     * @returns {string[]}
     */
    static normalizeFn(lines, ref) {
        const functions = [];
        (function f(o) {
            for (const k of Object.keys(o)) {
                const v = o[k];
                if (typeof v === 'object') {
                    if (v instanceof RawString) {
                        const fn = v.toString();
                        if (fn.startsWith(`${k}(`) || fn.startsWith('function(')) {
                            functions.push({name: k, fn})
                        }
                    } else {
                        f(v);
                    }
                }
            }
        })(ref);
        for (const fn of functions) {
            const flines = fn.fn.split('\n');
            const fstr = `${fn.name}: ${flines[0]}`;
            const idx = lines.findIndex(line => line.indexOf(fstr) >= 0);
            if (idx >= 0) {
                let found = true;
                for (let i = 1; i < flines.length; i++) {
                    if (lines[idx + i].indexOf(flines[i]) < 0) {
                        found = false;
                        break;
                    }
                }
                if (found) {
                    lines[idx] = lines[idx].replace(
                        `${fn.name}: ${flines[0].startsWith(fn.name) ? fn.name : 'function'}`,
                        fn.name
                    );
                }
            }
        }

        return lines;
    }

    /**
     * Perform un-indentation to string.
     *
     * @param {string} s Input string
     * @returns {string}
     */
    static unIndent(s) {
        let indent, seq = 0;
        const lines = s.split('\n')
            .map(line => {
                return {seq: seq++, line, size: this.getIndent(line)};
            });
        lines.forEach(line => {
            if (line.seq > 0 && (indent === undefined || indent > line.size)) {
                indent = line.size;
            }
        });
        for (let i = 0; i < lines.length; i++) {
            const l = lines[i];
            lines[i] = l.seq > 0 && indent !== undefined ? l.line.substr(indent) : l.line;
        }
        this.fixIndent(lines, 4, 2);

        return lines.join('\n');
    }

    /**
     * Get indentation size from string.
     *
     * @param {string} s String
     * @returns {number}
     */
    static getIndent(s) {
        const matches = s.match(/^\s+/);

        return matches ? matches[0].length : 0;
    }

    /**
     * Fix line indentation.
     *
     * @param {string[]} lines Lines
     * @param {number} from Original identation size
     * @param {number} to Target identation size
     * @returns {string[]}
     */
    static fixIndent(lines, from, to) {
        if (Array.isArray(lines)) {
            for (let i = 0; i < lines.length; i++) {
                lines[i] = lines[i].replace(/^\s+/, match => {
                    const len = match.length;
                    const level = Math.floor(len / from);
                    const extra = len % from;
                    return ' '.repeat(to * level + extra);
                });
            }
        }
        return lines;
    }

    /**
     * Add indentation to string array by desired level.
     *
     * @param {string[]} lines Lines to add indentation
     * @param {number} level Indentation level
     * @returns {string[]}
     */
    static addIndent(lines, level = 1) {
        if (Array.isArray(lines)) {
            const sz = this.size;
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];
                if (line.trim().length > 0) {
                    line = ' '.repeat(sz * level) + line;
                }
                if (line !== lines[i]) {
                    lines[i] = line;
                }
            }
        }
        return lines;
    }

    /**
     * Create raw string.
     *
     * @param {string} value Raw string
     * @returns {RawString}
     */
    static raw(value) {
        return new RawString(value);
    }

    /**
     * Get indentation size.
     *
     * @returns {number}
     */
    static get size() {
        return 4;
    }
}

class RawString
{
    constructor(value) {
        this.value = value;
    }

    toString() {
        return `${this.value}`;
    }

    [util.inspect.custom](depth, options, inspect) {
        return this.toString();
    }
}

module.exports = Stringify;