/**
 * Copyright (c) 2025 Toha <tohenk@yahoo.com>
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

const assert = require('node:assert');
const test = require('node:test');
const Stringify = require('./stringify');

test('stringify', async (t) => {
    await t.test('string representation of inlined object', () => {
        const o = {fn: function() {}, test: 'test'};
        assert.strictEqual(Stringify.from(o), '{ fn() {}, test: \'test\' }');
    });
    await t.test('string representation of multi line object', () => {
        const o = {
            raw: Stringify.raw('`raw`'),
            test: function() {
                console.log('test');
            },
            testFn(a, b) {
            },
            fun(a, b) {
            },
            myfn: () => {},
            deep: {
                fn: function(c) {
                    // do something
                }
            }
        }
        const res = `{
    raw: \`raw\`,
    test() {
        console.log('test');
    },
    testFn(a, b) {
    },
    fun(a, b) {
    },
    myfn: () => {},
    deep: {
        fn(c) {
            // do something
        }
    }
}`;
        assert.strictEqual(Stringify.from(o), res);
    });
});
