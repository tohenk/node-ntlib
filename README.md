# A collection of common library

## Character Sequence (charseq.js)


Class to handle string as a sequence of character.

```js
const { CharSequence } = require('@ntlab/ntlib');

let charseq = new CharSequence('This is a string');
while (!charseq.eof()) {
    console.log(charseq.read(1));
}
```

## Command Line Argument Parser (cmd.js)

Provide functions to work with Command Line arguments.

```js
const path = require('path');
const { Cmd } = require('@ntlab/ntlib');

Cmd.addBool('help', 'h', 'Show program usage').setAccessible(false);
Cmd.addVar('something', 's', 'Something description', 'some-argument');

if (!Cmd.parse() || (Cmd.get('help') && usage())) {
    process.exit();
}

/* do something here */

function usage() {
    console.log('Usage:');
    console.log('  node %s [options]', path.basename(process.argv[1]));
    console.log('');
    console.log('Options:');
    console.log(Cmd.dump());
    console.log('');
    return true;
}
```

## CLI or HTTP Executor (command.js, httpcmd.js)

Execute a Command Line Interface (CLI) or HTTP command.

```js
const { CommandExecutor } = require('@ntlab/ntlib');
const cmd = {
    bin: 'php',
    cli: 'path/to/php.file.to.execute.php',
    args: [
        '-f',
        '%CLI%',
        '--',
        '%DATA%'
    ]
}
const p = CommandExecutor(cmd).exec({DATA: 'some-data'});
p.on('exit', (code) => {
    /* do something on exit */
});
p.stdout.on('data', (line) => {
    /* do something on stdout data */
});
p.stderr.on('data', (line) => {
    /* do something on stderr data */
});
```

## A Simple Logger (logger.js)

Provide a simple logger class.

```js
const { Logger } = require('@ntlab/ntlib');

const log = new Logger('/path/to/logfile');
log.log('Somthing to log');
```

## Queue Processing (queue.js)

Provide a queue mechanism.

```js
const { Queue } = require('@ntlab/ntlib');

const queues = ['One', 'Two', 'Three'];
const q = new Queue(queues, (seq) => {
    console.log(seq);
    q.next();
});
```

## Token Processing (token.js)

Provide an utility to parse string into tokens.

```js
const { Token } = require('@ntlab/ntlib');
console.log(Token.split('1, 2, (1, "ABC")')); // [1, 2, [1, "ABC"]]
```

## App Utility (util.js)

Internally used by CLI/HTTP Executor, also provide a small set of common functions.

```js
const { AppUtil } = require('@ntlab/ntlib');
console.log(AppUtil.trans('Translate %ME%', {ME: '123'})); // Translate 123
```

## Promise Based Work Queue (work.js)

Provide promise queue mechanism for easy chaining. It accepts a function as its
worker. Its also accepts an array with signature of `[function, function]` which
the first element would be the worker and the second would be a state function
and must be evaluated to true for worker to be executed.

```js
const { Work } = require('@ntlab/ntlib');
Work.works([
    [w => new Promise((resolve, reject) => {
        console.log('First work');
        resolve(false);
    })],
    [w => new Promise((resolve, reject) => {
        console.log('This will be skipped');
        resolve();
    }), w => w.getRes(0)],
    [w => new Promise((resolve, reject) => {
        console.log('It\'s done');
        resolve();
    })],
]);
```
