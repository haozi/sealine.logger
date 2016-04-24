'use strict';

function Logger(config) {
  return new Logger.fn.init(config);
}
Logger.fn = Logger.prototype = {
  init: function(config) {
    if (typeof config === 'string') {
      config = {
        namespace: config
      }
    }
    if (!config.name) {
      config.name = ''
    }
    this.config = config;
  }
}

Logger.fn.init.prototype = Logger.fn;

function color(s, color) {
  s = String(s);
  var map = {
    red: '\x1b[31m%s\x1b[0m',
    green: '\x1b[32m%s\x1b[0m'
  }

  if (map[color]) {
    return map[color].replace('%s', s)
  }
  return s;
}
var opt = {
  log: {
    // color: 'red'
  },
  info: {
    // color: 'red'
  },
  warn: {
    // color: 'red'
  },
  error: {
    color: 'red'
  },
  danger: {
    // color: 'red'
  },
  debug: {
    // color: 'red'
  },
  ok: {
    color: 'green'
  }
};

function getLine(n) {
  // https://github.com/holy-grail/node-lancer/blob/master/line.js#L1
  var orig = Error.prepareStackTrace;
  Error.prepareStackTrace = function(err, stack) {
    return stack;
  };
  var err = new Error();
  Error.captureStackTrace(err, getLine);
  var stack = err.stack;
  Error.prepareStackTrace = orig;
  var stacks = stack.map(function(frame) {
    return {
      pathname: frame.getFileName(),
      row: frame.getLineNumber(),
      col: frame.getColumnNumber()
    }
  });
  if (null == n) {
    return stacks;
  }
  return stacks[n];
}


['log', 'info', 'warn', 'error', 'danger', 'debug'].forEach(type => {
  Logger.fn[type] = function() {
    var cnamespace = color(this.config.namespace, opt[type].color);
    var cmsg = Array.from(arguments).map(m => {
      return color(JSON.stringify(m, null, 2), opt[type].color);
    }).join('\n');
    var ctype = color(type, opt[type].color);
    var cline = '';

    if (type === 'error') {
      var lineInfo = getLine(1);
      cline = `${lineInfo.pathname.replace(process.cwd(), '.')} ${lineInfo.row}:${lineInfo.col}`;
    }

    console.log(`[${cnamespace}:${ctype}] - ${cmsg} ${cline}`.trim());
  }
});

module.exports = Logger;
