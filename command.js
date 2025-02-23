/**
 * The MIT License (MIT)
 *
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

/*
 * Command Executor
 */

const path = require('path');
const fork = require('child_process').fork;
const util = require('./util');

function CommandExecutor(cmd, options) {
    let isHttp = cmd.url !== undefined;
    if (!isHttp && typeof cmd === 'string' &&
        (cmd.indexOf('http://') === 0 || cmd.indexOf('https://') === 0)) {
        isHttp = true;
    }
    if (isHttp) {
        return new HttpExecutor(cmd, options);
    } else {
        return new CliExecutor(cmd, options);
    }
}

class CliExecutor {

    bin = null
    env = null
    args = null
    defaultArgs = []
    values = []
    paths = []

    constructor(config, options) {
        if (Array.isArray(options.paths)) {
            for (const p of options.paths) {
                this.addPath(p);
            }
        }
        if (Array.isArray(options.args)) {
            for (const arg of options.args) {
                this.addDefaultArg(arg);
            }
        }
        if (typeof options.values === 'object') {
            for (const key in options.values) {
                this.addValue(key, options.values[key]);
            }
        }
        this.init(config);
    }

    init(config) {
        // config is cli itself
        if (typeof config === 'string') {
            this.values.CLI = this.findCLI(config);
        }
        // config is array (bin, cli, and args)
        if (typeof config === 'object') {
            if (config.bin) {
                this.bin = config.bin;
            }
            if (config.cli) {
                this.values.CLI = this.findCLI(config.cli);
            }
            if (config.args !== undefined) {
                this.args = Array.from(config.args);
            }
            if (typeof config.env === 'object') {
                this.env = config.env;
            }
        }
    }

    addPath(name) {
        this.paths.push(name);
    }

    addDefaultArg(arg) {
        this.defaultArgs.push(arg);
    }

    addValue(name, value) {
        this.values[name] = value;
    }

    findCLI(cli) {
        return util.findCLI(path.normalize(cli), this.paths);
    }

    exec(parameters) {
        if (!this.bin) {
            throw new Error(`Unable to execute CLI without binary: ${this.getId()}`);
        }
        const values = this.values;
        for (const key in parameters) {
            values[key] = parameters[key];
        }
        return util.exec(this.bin, this.args ? this.args : this.defaultArgs, values, this.env);
    }

    getId() {
        if (this.values.CLI) {
            return this.values.CLI;
        } else {
            return this.bin;
        }
    }
}

class HttpExecutor {

    url = null
    method = null
    defaults = {}

    constructor(config, options) {
        this.init(config);
    }

    init(config) {
        if (typeof config === 'string') {
            this.url = config;
        } else {
            if (config.url) {
                this.url = config.url;
            }
            if (config.method) {
                this.method = config.method;
            }
            if (config.data !== undefined) {
                for (const key in config.data) {
                    this.addDefault(key, config.data[key]);
                }
            }
        }
    }

    addDefault(key, value) {
        this.defaults[key] = value;
    }

    exec(parameters) {
        const params = {};
        for (const key in this.defaults) {
            params[key] = util.trans(this.defaults[key], parameters);
        }
        return fork(path.join(__dirname, 'httpcmd'), [JSON.stringify({
            url: this.url,
            method: this.method || 'get',
            params: params
        })], {stdio: ['pipe', 'pipe', 'pipe', 'ipc']});
    }

    getId() {
        return this.url;
    }
}

module.exports = CommandExecutor;