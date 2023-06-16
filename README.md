# A collection of common library

## Beautify (beautify.js)

Beautify a text.

```javascript
const { Beautify } = require('@ntlab/ntlib');

console.log(Beautify.beautify('this is the message')); // This Is The Message

Beautify.exceptions.add('is');
console.log(Beautify.beautify('THIS IS THE MESSAGE')); // This is The Message
```

## Character Sequence (charseq.js)

Class to handle string as a sequence of character.

```javascript
const { CharSequence } = require('@ntlab/ntlib');

let charseq = new CharSequence('This is a string');
while (!charseq.eof()) {
    console.log(charseq.read(1));
}
```

## Command Line Argument Parser (cmd.js)

Provide functions to work with Command Line arguments.

```javascript
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

```javascript
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

```javascript
const { Logger } = require('@ntlab/ntlib');

const log = new Logger('/path/to/logfile');
log.log('Somthing to log');
```

## Stringify (stringify.js)

Convert javascript object to string.

```javascript
const { Stringify } = require('@ntlab/ntlib');

console.log(Stringify.from({
    message: 'message',
    raw: Stringify.raw('`string`'),
})); // {message: 'message', raw: `string`}
```

## Token Processing (token.js)

Provide an utility to parse string into tokens.

```javascript
const { Token } = require('@ntlab/ntlib');
console.log(Token.split('1, 2, (1, "ABC")')); // [1, 2, [1, "ABC"]]
```

## App Utility (util.js)

Internally used by CLI/HTTP Executor, also provide a small set of common functions.

```javascript
const { AppUtil } = require('@ntlab/ntlib');
console.log(AppUtil.trans('Translate %ME%', {ME: '123'})); // Translate 123
```