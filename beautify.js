/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2023-2024 Toha <tohenk@yahoo.com>
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
 * Convert text to lower case then make its first words letter upper case.
 */
class Beautify {

    static beautify(s) {
        const res = [];
        Beautify.split(s).forEach(split => {
            let value = split[0];
            if (Beautify.exceptions.indexOf(value) < 0) {
                let done = false;
                [Beautify.HIGH, Beautify.NORMAL].forEach(prio => {
                    Beautify.mutators[prio].forEach(mutator => {
                        if (mutator.canHandle(value)) {
                            value = mutator.mutate(value);
                            done = true;
                            return true;
                        }
                    });
                    if (done) {
                        return true;
                    }
                });
            }
            if (split[1]) {
                value += split[1];
            }
            res.push(value);
        });
        return res.join('');
    }

    static split(s) {
        const res = [];
        s = s.toLowerCase();
        const pick = (start, end, delimiter) => {
            return [s.substr(start, end - start).trim(), delimiter];
        }
        const matches = s.matchAll(/[\s+\-\/\.\+\,]+/g);
        let idx = 0;
        while (true) {
            const m = matches.next();
            if (!m.value) {
                break;
            }
            res.push(pick(idx, m.value.index, m.value[0]));
            idx = m.value.index + m.value[0].length;
        }
        if (idx < s.length) {
            res.push(pick(idx, s.length, null));
        }
        return res;
    }

    static addMutator(Mutator, priority = null) {
        if (null === priority) {
            priority = Beautify.NORMAL;
        }
        Beautify.mutators[priority].push(Mutator);
    }

    static get mutators() {
        if (Beautify._mutators === undefined) {
            Beautify._mutators = {
                [Beautify.HIGH]: [],
                [Beautify.NORMAL]: []
            }
        }
        return Beautify._mutators;
    }

    static get exceptions() {
        if (Beautify._excepts === undefined) {
            Beautify._excepts = [];
        }
        return Beautify._excepts;
    }

    static get HIGH() {
        return 1;
    }

    static get NORMAL() {
        return 2;
    }
}

class FirstWordLetter {

    static canHandle(s) {
        return true;
    }

    static mutate(s) {
        return s.substr(0, 1).toUpperCase() + s.substr(1);
    }
}

Beautify.addMutator(FirstWordLetter);

module.exports = Beautify;