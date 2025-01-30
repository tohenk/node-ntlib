/**
 * Copyright (c) 2016-2025 Toha <tohenk@yahoo.com>
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
const path = require('path');
const spawn = require('child_process').spawn;

/**
 * Common utility.
 */
class AppUtil {

    findCLI(cli, paths) {
        if (!this.fileExist(cli)) {
            for (let i = 0; i < paths.length; i++) {
                if (this.fileExist(path.normalize([paths[i], cli].join(path.sep)))) {
                    cli = path.normalize([paths[i], cli].join(path.sep))
                    break;
                }
            }
        }
        return cli;
    }

    fileExist(filename) {
        return fs.existsSync(filename);
    }

    cleanBuffer(buffer) {
        if (Buffer.isBuffer(buffer)) {
            buffer = buffer.toString(); 
        }
        return buffer.trim();
    }

    cleanEol(buffer) {
        if (Buffer.isBuffer(buffer)) {
            buffer = buffer.toString(); 
        }
        while (buffer.charAt(0) === '\r' || buffer.charAt(0) === '\n') {
            buffer = buffer.substr(1);
        }
        while (buffer.substr(-1) === '\r' || buffer.substr(-1) === '\n') {
            buffer = buffer.substr(0, buffer.length - 1);
        }
        return buffer;
    }

    trans(str, vars) {
        for (const k in vars) {
            const re = '%' + k + '%';
            str = str.replace(re, vars[k]);
        }
        return str;
    }

    // https://gist.github.com/cstipkovic/3983879
    formatDate(date, format) {
        const day = date.getDate(),
            month = date.getMonth() + 1,
            year = date.getFullYear(),
            hours = date.getHours(),
            minutes = date.getMinutes(),
            seconds = date.getSeconds(),
            mseconds = date.getMilliseconds();
        /**
         * @param {string} s Input string
         * @param {number} len Padding length
         * @returns {string}
         */
        const pad = (s, len) => {
            if (typeof s === 'number') {
                s = s.toString();
            }
            return s.padStart(len, '0');
        }
        /**
         * @param {string} fmt Whole date format
         * @param {string} part Date part
         * @param {string} value Date value
         * @returns {string}
         */
        const repl = (fmt, part, value) => {
            if (fmt.indexOf(part) >= 0) {
                fmt = fmt.replace(part, value);
            }
            return fmt;
        }
        const values = {
            'yyyy': pad(year, 4),
            'yy': pad(year, 4).substr(2, 2),
            'MM': pad(month, 2),
            'dd': pad(day, 2),
            'HH': pad(hours, 2),
            'hh': pad(hours > 12 ? hours - 12 : (hours == 0 ? 12 : hours), 2),
            't': hours > 11 ? 'pm' : 'am',
            'mm': pad(minutes, 2),
            'ss': pad(seconds, 2),
            'zzz': pad(mseconds, 3)
        }
        if (!format) {
            format = 'MM/dd/yyyy';
        }
        for (const v in values) {
            format = repl(format, v, values[v]);
        }
        return format;
    }

    exec(executable, args, values, env = null) {
        args = args || [];
        values = values || [];
        const translatedArgs = [];
        args.forEach(v => {
            translatedArgs.push(this.trans(v, values));
        });
        const options = {};
        if (typeof env === 'object') {
            options.env = Object.assign({}, process.env, env);
        }
        if (process.platform === 'win32') {
            if (executable.endsWith('.bat') || executable.endsWith('.cmd')) {
                options.shell = true;
            }
        }
        return spawn(executable, translatedArgs, options);
    }
}

module.exports = new AppUtil();