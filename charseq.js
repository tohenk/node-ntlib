/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2018-2020 Toha <tohenk@yahoo.com>
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

/**
 * Char sequence.
 */
class CharSequence {

    constructor(str) {
        this.str = str;
        this.pos = 0;
        this.len = this.str.length;
    }

    read(len) {
        let res;
        if (typeof len == 'undefined') {
            len = 0;
        }
        if (len == 0) {
            res = this.str.substr(this.pos);
        } else {
            res = this.str.substr(this.pos, len);
        }
        this.pos += res.length;
        return res;
    }

    readInt(len) {
        const res = this.read(len);
        if (res) {
            return parseInt('0x' + res);
        }
    }

    skip(len) {
        this.pos += len;
        return this;
    }

    rewind(len) {
        this.pos -= len;
        return this;
    }

    restart() {
        this.pos = 0;
        return this;
    }

    eof() {
        return this.pos > this.len;
    }

}

module.exports = CharSequence;