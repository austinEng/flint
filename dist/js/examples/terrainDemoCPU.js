/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 17);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var apply = Function.prototype.apply;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) {
  if (timeout) {
    timeout.close();
  }
};

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// setimmediate attaches itself to the global object
__webpack_require__(2);
exports.setImmediate = setImmediate;
exports.clearImmediate = clearImmediate;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var registerImmediate;

    function setImmediate(callback) {
      // Callback can either be a function or a string
      if (typeof callback !== "function") {
        callback = new Function("" + callback);
      }
      // Copy function arguments
      var args = new Array(arguments.length - 1);
      for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i + 1];
      }
      // Store and register the task
      var task = { callback: callback, args: args };
      tasksByHandle[nextHandle] = task;
      registerImmediate(nextHandle);
      return nextHandle++;
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
        case 0:
            callback();
            break;
        case 1:
            callback(args[0]);
            break;
        case 2:
            callback(args[0], args[1]);
            break;
        case 3:
            callback(args[0], args[1], args[2]);
            break;
        default:
            callback.apply(undefined, args);
            break;
        }
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(runIfPresent, 0, handle);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    run(task);
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function installNextTickImplementation() {
        registerImmediate = function(handle) {
            process.nextTick(function () { runIfPresent(handle); });
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        registerImmediate = function(handle) {
            global.postMessage(messagePrefix + handle, "*");
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        registerImmediate = function(handle) {
            channel.port2.postMessage(handle);
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function(handle) {
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
        };
    }

    function installSetTimeoutImplementation() {
        registerImmediate = function(handle) {
            setTimeout(runIfPresent, 0, handle);
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3), __webpack_require__(0)))

/***/ }),
/* 3 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 4 */
/***/ (function(module, exports) {



/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/* harmony export (immutable) */ __webpack_exports__["a"] = createStatsAndGUI;
/* harmony export (immutable) */ __webpack_exports__["b"] = setCanvasToWindowSize;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_stats_js__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_stats_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_stats_js__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_dat_gui__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_dat_gui___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_dat_gui__);



function createStatsAndGUI() {
  const stats = new __WEBPACK_IMPORTED_MODULE_0_stats_js___default.a();
  stats.setMode(1);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  const _requestAnimationFrame = requestAnimationFrame;
  stats.begin();
  requestAnimationFrame = function(cb) {
    stats.end();
    _requestAnimationFrame(cb);
    stats.begin();
  }

  const gui = new __WEBPACK_IMPORTED_MODULE_1_dat_gui___default.a.GUI();

  return gui;
}

function setCanvasToWindowSize(Module) {
  function resizeCanvas() {
    Module.canvas.width = window.innerWidth;
    Module.canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvas);

  // Strange, but for some reason the size doesn't get initialized immediately
  (function initializeSize() {
    resizeCanvas();
    process.nextTick(function() {
      if (window.innerWidth !== parseInt(Module.canvas.getAttribute('width'))) {
        setTimeout(initializeSize, 100);
      }
    });
  })();
}

/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(0)))

/***/ }),
/* 7 */
/***/ (function(module, exports) {

// stats.js - http://github.com/mrdoob/stats.js
var Stats=function(){var l=Date.now(),m=l,g=0,n=Infinity,o=0,h=0,p=Infinity,q=0,r=0,s=0,f=document.createElement("div");f.id="stats";f.addEventListener("mousedown",function(b){b.preventDefault();t(++s%2)},!1);f.style.cssText="width:80px;opacity:0.9;cursor:pointer";var a=document.createElement("div");a.id="fps";a.style.cssText="padding:0 0 3px 3px;text-align:left;background-color:#002";f.appendChild(a);var i=document.createElement("div");i.id="fpsText";i.style.cssText="color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";
i.innerHTML="FPS";a.appendChild(i);var c=document.createElement("div");c.id="fpsGraph";c.style.cssText="position:relative;width:74px;height:30px;background-color:#0ff";for(a.appendChild(c);74>c.children.length;){var j=document.createElement("span");j.style.cssText="width:1px;height:30px;float:left;background-color:#113";c.appendChild(j)}var d=document.createElement("div");d.id="ms";d.style.cssText="padding:0 0 3px 3px;text-align:left;background-color:#020;display:none";f.appendChild(d);var k=document.createElement("div");
k.id="msText";k.style.cssText="color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";k.innerHTML="MS";d.appendChild(k);var e=document.createElement("div");e.id="msGraph";e.style.cssText="position:relative;width:74px;height:30px;background-color:#0f0";for(d.appendChild(e);74>e.children.length;)j=document.createElement("span"),j.style.cssText="width:1px;height:30px;float:left;background-color:#131",e.appendChild(j);var t=function(b){s=b;switch(s){case 0:a.style.display=
"block";d.style.display="none";break;case 1:a.style.display="none",d.style.display="block"}};return{REVISION:12,domElement:f,setMode:t,begin:function(){l=Date.now()},end:function(){var b=Date.now();g=b-l;n=Math.min(n,g);o=Math.max(o,g);k.textContent=g+" MS ("+n+"-"+o+")";var a=Math.min(30,30-30*(g/200));e.appendChild(e.firstChild).style.height=a+"px";r++;b>m+1E3&&(h=Math.round(1E3*r/(b-m)),p=Math.min(p,h),q=Math.max(q,h),i.textContent=h+" FPS ("+p+"-"+q+")",a=Math.min(30,30-30*(h/100)),c.appendChild(c.firstChild).style.height=
a+"px",m=b,r=0);return b},update:function(){l=this.end()}}};"object"===typeof module&&(module.exports=Stats);


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(9)
module.exports.color = __webpack_require__(10)

/***/ }),
/* 9 */
/***/ (function(module, exports) {

/**
 * dat-gui JavaScript Controller Library
 * http://code.google.com/p/dat-gui
 *
 * Copyright 2011 Data Arts Team, Google Creative Lab
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/** @namespace */
var dat = module.exports = dat || {};

/** @namespace */
dat.gui = dat.gui || {};

/** @namespace */
dat.utils = dat.utils || {};

/** @namespace */
dat.controllers = dat.controllers || {};

/** @namespace */
dat.dom = dat.dom || {};

/** @namespace */
dat.color = dat.color || {};

dat.utils.css = (function () {
  return {
    load: function (url, doc) {
      doc = doc || document;
      var link = doc.createElement('link');
      link.type = 'text/css';
      link.rel = 'stylesheet';
      link.href = url;
      doc.getElementsByTagName('head')[0].appendChild(link);
    },
    inject: function(css, doc) {
      doc = doc || document;
      var injected = document.createElement('style');
      injected.type = 'text/css';
      injected.innerHTML = css;
      doc.getElementsByTagName('head')[0].appendChild(injected);
    }
  }
})();


dat.utils.common = (function () {
  
  var ARR_EACH = Array.prototype.forEach;
  var ARR_SLICE = Array.prototype.slice;

  /**
   * Band-aid methods for things that should be a lot easier in JavaScript.
   * Implementation and structure inspired by underscore.js
   * http://documentcloud.github.com/underscore/
   */

  return { 
    
    BREAK: {},
  
    extend: function(target) {
      
      this.each(ARR_SLICE.call(arguments, 1), function(obj) {
        
        for (var key in obj)
          if (!this.isUndefined(obj[key])) 
            target[key] = obj[key];
        
      }, this);
      
      return target;
      
    },
    
    defaults: function(target) {
      
      this.each(ARR_SLICE.call(arguments, 1), function(obj) {
        
        for (var key in obj)
          if (this.isUndefined(target[key])) 
            target[key] = obj[key];
        
      }, this);
      
      return target;
    
    },
    
    compose: function() {
      var toCall = ARR_SLICE.call(arguments);
            return function() {
              var args = ARR_SLICE.call(arguments);
              for (var i = toCall.length -1; i >= 0; i--) {
                args = [toCall[i].apply(this, args)];
              }
              return args[0];
            }
    },
    
    each: function(obj, itr, scope) {

      
      if (ARR_EACH && obj.forEach === ARR_EACH) { 
        
        obj.forEach(itr, scope);
        
      } else if (obj.length === obj.length + 0) { // Is number but not NaN
        
        for (var key = 0, l = obj.length; key < l; key++)
          if (key in obj && itr.call(scope, obj[key], key) === this.BREAK) 
            return;
            
      } else {

        for (var key in obj) 
          if (itr.call(scope, obj[key], key) === this.BREAK)
            return;
            
      }
            
    },
    
    defer: function(fnc) {
      setTimeout(fnc, 0);
    },
    
    toArray: function(obj) {
      if (obj.toArray) return obj.toArray();
      return ARR_SLICE.call(obj);
    },

    isUndefined: function(obj) {
      return obj === undefined;
    },
    
    isNull: function(obj) {
      return obj === null;
    },
    
    isNaN: function(obj) {
      return obj !== obj;
    },
    
    isArray: Array.isArray || function(obj) {
      return obj.constructor === Array;
    },
    
    isObject: function(obj) {
      return obj === Object(obj);
    },
    
    isNumber: function(obj) {
      return obj === obj+0;
    },
    
    isString: function(obj) {
      return obj === obj+'';
    },
    
    isBoolean: function(obj) {
      return obj === false || obj === true;
    },
    
    isFunction: function(obj) {
      return Object.prototype.toString.call(obj) === '[object Function]';
    }
  
  };
    
})();


dat.controllers.Controller = (function (common) {

  /**
   * @class An "abstract" class that represents a given property of an object.
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   *
   * @member dat.controllers
   */
  var Controller = function(object, property) {

    this.initialValue = object[property];

    /**
     * Those who extend this class will put their DOM elements in here.
     * @type {DOMElement}
     */
    this.domElement = document.createElement('div');

    /**
     * The object to manipulate
     * @type {Object}
     */
    this.object = object;

    /**
     * The name of the property to manipulate
     * @type {String}
     */
    this.property = property;

    /**
     * The function to be called on change.
     * @type {Function}
     * @ignore
     */
    this.__onChange = undefined;

    /**
     * The function to be called on finishing change.
     * @type {Function}
     * @ignore
     */
    this.__onFinishChange = undefined;

  };

  common.extend(

      Controller.prototype,

      /** @lends dat.controllers.Controller.prototype */
      {

        /**
         * Specify that a function fire every time someone changes the value with
         * this Controller.
         *
         * @param {Function} fnc This function will be called whenever the value
         * is modified via this Controller.
         * @returns {dat.controllers.Controller} this
         */
        onChange: function(fnc) {
          this.__onChange = fnc;
          return this;
        },

        /**
         * Specify that a function fire every time someone "finishes" changing
         * the value wih this Controller. Useful for values that change
         * incrementally like numbers or strings.
         *
         * @param {Function} fnc This function will be called whenever
         * someone "finishes" changing the value via this Controller.
         * @returns {dat.controllers.Controller} this
         */
        onFinishChange: function(fnc) {
          this.__onFinishChange = fnc;
          return this;
        },

        /**
         * Change the value of <code>object[property]</code>
         *
         * @param {Object} newValue The new value of <code>object[property]</code>
         */
        setValue: function(newValue) {
          this.object[this.property] = newValue;
          if (this.__onChange) {
            this.__onChange.call(this, newValue);
          }
          this.updateDisplay();
          return this;
        },

        /**
         * Gets the value of <code>object[property]</code>
         *
         * @returns {Object} The current value of <code>object[property]</code>
         */
        getValue: function() {
          return this.object[this.property];
        },

        /**
         * Refreshes the visual display of a Controller in order to keep sync
         * with the object's current value.
         * @returns {dat.controllers.Controller} this
         */
        updateDisplay: function() {
          return this;
        },

        /**
         * @returns {Boolean} true if the value has deviated from initialValue
         */
        isModified: function() {
          return this.initialValue !== this.getValue()
        }

      }

  );

  return Controller;


})(dat.utils.common);


dat.dom.dom = (function (common) {

  var EVENT_MAP = {
    'HTMLEvents': ['change'],
    'MouseEvents': ['click','mousemove','mousedown','mouseup', 'mouseover'],
    'KeyboardEvents': ['keydown']
  };

  var EVENT_MAP_INV = {};
  common.each(EVENT_MAP, function(v, k) {
    common.each(v, function(e) {
      EVENT_MAP_INV[e] = k;
    });
  });

  var CSS_VALUE_PIXELS = /(\d+(\.\d+)?)px/;

  function cssValueToPixels(val) {

    if (val === '0' || common.isUndefined(val)) return 0;

    var match = val.match(CSS_VALUE_PIXELS);

    if (!common.isNull(match)) {
      return parseFloat(match[1]);
    }

    // TODO ...ems? %?

    return 0;

  }

  /**
   * @namespace
   * @member dat.dom
   */
  var dom = {

    /**
     * 
     * @param elem
     * @param selectable
     */
    makeSelectable: function(elem, selectable) {

      if (elem === undefined || elem.style === undefined) return;

      elem.onselectstart = selectable ? function() {
        return false;
      } : function() {
      };

      elem.style.MozUserSelect = selectable ? 'auto' : 'none';
      elem.style.KhtmlUserSelect = selectable ? 'auto' : 'none';
      elem.unselectable = selectable ? 'on' : 'off';

    },

    /**
     *
     * @param elem
     * @param horizontal
     * @param vertical
     */
    makeFullscreen: function(elem, horizontal, vertical) {

      if (common.isUndefined(horizontal)) horizontal = true;
      if (common.isUndefined(vertical)) vertical = true;

      elem.style.position = 'absolute';

      if (horizontal) {
        elem.style.left = 0;
        elem.style.right = 0;
      }
      if (vertical) {
        elem.style.top = 0;
        elem.style.bottom = 0;
      }

    },

    /**
     *
     * @param elem
     * @param eventType
     * @param params
     */
    fakeEvent: function(elem, eventType, params, aux) {
      params = params || {};
      var className = EVENT_MAP_INV[eventType];
      if (!className) {
        throw new Error('Event type ' + eventType + ' not supported.');
      }
      var evt = document.createEvent(className);
      switch (className) {
        case 'MouseEvents':
          var clientX = params.x || params.clientX || 0;
          var clientY = params.y || params.clientY || 0;
          evt.initMouseEvent(eventType, params.bubbles || false,
              params.cancelable || true, window, params.clickCount || 1,
              0, //screen X
              0, //screen Y
              clientX, //client X
              clientY, //client Y
              false, false, false, false, 0, null);
          break;
        case 'KeyboardEvents':
          var init = evt.initKeyboardEvent || evt.initKeyEvent; // webkit || moz
          common.defaults(params, {
            cancelable: true,
            ctrlKey: false,
            altKey: false,
            shiftKey: false,
            metaKey: false,
            keyCode: undefined,
            charCode: undefined
          });
          init(eventType, params.bubbles || false,
              params.cancelable, window,
              params.ctrlKey, params.altKey,
              params.shiftKey, params.metaKey,
              params.keyCode, params.charCode);
          break;
        default:
          evt.initEvent(eventType, params.bubbles || false,
              params.cancelable || true);
          break;
      }
      common.defaults(evt, aux);
      elem.dispatchEvent(evt);
    },

    /**
     *
     * @param elem
     * @param event
     * @param func
     * @param bool
     */
    bind: function(elem, event, func, bool) {
      bool = bool || false;
      if (elem.addEventListener)
        elem.addEventListener(event, func, bool);
      else if (elem.attachEvent)
        elem.attachEvent('on' + event, func);
      return dom;
    },

    /**
     *
     * @param elem
     * @param event
     * @param func
     * @param bool
     */
    unbind: function(elem, event, func, bool) {
      bool = bool || false;
      if (elem.removeEventListener)
        elem.removeEventListener(event, func, bool);
      else if (elem.detachEvent)
        elem.detachEvent('on' + event, func);
      return dom;
    },

    /**
     *
     * @param elem
     * @param className
     */
    addClass: function(elem, className) {
      if (elem.className === undefined) {
        elem.className = className;
      } else if (elem.className !== className) {
        var classes = elem.className.split(/ +/);
        if (classes.indexOf(className) == -1) {
          classes.push(className);
          elem.className = classes.join(' ').replace(/^\s+/, '').replace(/\s+$/, '');
        }
      }
      return dom;
    },

    /**
     *
     * @param elem
     * @param className
     */
    removeClass: function(elem, className) {
      if (className) {
        if (elem.className === undefined) {
          // elem.className = className;
        } else if (elem.className === className) {
          elem.removeAttribute('class');
        } else {
          var classes = elem.className.split(/ +/);
          var index = classes.indexOf(className);
          if (index != -1) {
            classes.splice(index, 1);
            elem.className = classes.join(' ');
          }
        }
      } else {
        elem.className = undefined;
      }
      return dom;
    },

    hasClass: function(elem, className) {
      return new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)').test(elem.className) || false;
    },

    /**
     *
     * @param elem
     */
    getWidth: function(elem) {

      var style = getComputedStyle(elem);

      return cssValueToPixels(style['border-left-width']) +
          cssValueToPixels(style['border-right-width']) +
          cssValueToPixels(style['padding-left']) +
          cssValueToPixels(style['padding-right']) +
          cssValueToPixels(style['width']);
    },

    /**
     *
     * @param elem
     */
    getHeight: function(elem) {

      var style = getComputedStyle(elem);

      return cssValueToPixels(style['border-top-width']) +
          cssValueToPixels(style['border-bottom-width']) +
          cssValueToPixels(style['padding-top']) +
          cssValueToPixels(style['padding-bottom']) +
          cssValueToPixels(style['height']);
    },

    /**
     *
     * @param elem
     */
    getOffset: function(elem) {
      var offset = {left: 0, top:0};
      if (elem.offsetParent) {
        do {
          offset.left += elem.offsetLeft;
          offset.top += elem.offsetTop;
        } while (elem = elem.offsetParent);
      }
      return offset;
    },

    // http://stackoverflow.com/posts/2684561/revisions
    /**
     * 
     * @param elem
     */
    isActive: function(elem) {
      return elem === document.activeElement && ( elem.type || elem.href );
    }

  };

  return dom;

})(dat.utils.common);


dat.controllers.OptionController = (function (Controller, dom, common) {

  /**
   * @class Provides a select input to alter the property of an object, using a
   * list of accepted values.
   *
   * @extends dat.controllers.Controller
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   * @param {Object|string[]} options A map of labels to acceptable values, or
   * a list of acceptable string values.
   *
   * @member dat.controllers
   */
  var OptionController = function(object, property, options) {

    OptionController.superclass.call(this, object, property);

    var _this = this;

    /**
     * The drop down menu
     * @ignore
     */
    this.__select = document.createElement('select');

    if (common.isArray(options)) {
      var map = {};
      common.each(options, function(element) {
        map[element] = element;
      });
      options = map;
    }

    common.each(options, function(value, key) {

      var opt = document.createElement('option');
      opt.innerHTML = key;
      opt.setAttribute('value', value);
      _this.__select.appendChild(opt);

    });

    // Acknowledge original value
    this.updateDisplay();

    dom.bind(this.__select, 'change', function() {
      var desiredValue = this.options[this.selectedIndex].value;
      _this.setValue(desiredValue);
    });

    this.domElement.appendChild(this.__select);

  };

  OptionController.superclass = Controller;

  common.extend(

      OptionController.prototype,
      Controller.prototype,

      {

        setValue: function(v) {
          var toReturn = OptionController.superclass.prototype.setValue.call(this, v);
          if (this.__onFinishChange) {
            this.__onFinishChange.call(this, this.getValue());
          }
          return toReturn;
        },

        updateDisplay: function() {
          this.__select.value = this.getValue();
          return OptionController.superclass.prototype.updateDisplay.call(this);
        }

      }

  );

  return OptionController;

})(dat.controllers.Controller,
dat.dom.dom,
dat.utils.common);


dat.controllers.NumberController = (function (Controller, common) {

  /**
   * @class Represents a given property of an object that is a number.
   *
   * @extends dat.controllers.Controller
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   * @param {Object} [params] Optional parameters
   * @param {Number} [params.min] Minimum allowed value
   * @param {Number} [params.max] Maximum allowed value
   * @param {Number} [params.step] Increment by which to change value
   *
   * @member dat.controllers
   */
  var NumberController = function(object, property, params) {

    NumberController.superclass.call(this, object, property);

    params = params || {};

    this.__min = params.min;
    this.__max = params.max;
    this.__step = params.step;

    if (common.isUndefined(this.__step)) {

      if (this.initialValue == 0) {
        this.__impliedStep = 1; // What are we, psychics?
      } else {
        // Hey Doug, check this out.
        this.__impliedStep = Math.pow(10, Math.floor(Math.log(this.initialValue)/Math.LN10))/10;
      }

    } else {

      this.__impliedStep = this.__step;

    }

    this.__precision = numDecimals(this.__impliedStep);


  };

  NumberController.superclass = Controller;

  common.extend(

      NumberController.prototype,
      Controller.prototype,

      /** @lends dat.controllers.NumberController.prototype */
      {

        setValue: function(v) {

          if (this.__min !== undefined && v < this.__min) {
            v = this.__min;
          } else if (this.__max !== undefined && v > this.__max) {
            v = this.__max;
          }

          if (this.__step !== undefined && v % this.__step != 0) {
            v = Math.round(v / this.__step) * this.__step;
          }

          return NumberController.superclass.prototype.setValue.call(this, v);

        },

        /**
         * Specify a minimum value for <code>object[property]</code>.
         *
         * @param {Number} minValue The minimum value for
         * <code>object[property]</code>
         * @returns {dat.controllers.NumberController} this
         */
        min: function(v) {
          this.__min = v;
          return this;
        },

        /**
         * Specify a maximum value for <code>object[property]</code>.
         *
         * @param {Number} maxValue The maximum value for
         * <code>object[property]</code>
         * @returns {dat.controllers.NumberController} this
         */
        max: function(v) {
          this.__max = v;
          return this;
        },

        /**
         * Specify a step value that dat.controllers.NumberController
         * increments by.
         *
         * @param {Number} stepValue The step value for
         * dat.controllers.NumberController
         * @default if minimum and maximum specified increment is 1% of the
         * difference otherwise stepValue is 1
         * @returns {dat.controllers.NumberController} this
         */
        step: function(v) {
          this.__step = v;
          return this;
        }

      }

  );

  function numDecimals(x) {
    x = x.toString();
    if (x.indexOf('.') > -1) {
      return x.length - x.indexOf('.') - 1;
    } else {
      return 0;
    }
  }

  return NumberController;

})(dat.controllers.Controller,
dat.utils.common);


dat.controllers.NumberControllerBox = (function (NumberController, dom, common) {

  /**
   * @class Represents a given property of an object that is a number and
   * provides an input element with which to manipulate it.
   *
   * @extends dat.controllers.Controller
   * @extends dat.controllers.NumberController
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   * @param {Object} [params] Optional parameters
   * @param {Number} [params.min] Minimum allowed value
   * @param {Number} [params.max] Maximum allowed value
   * @param {Number} [params.step] Increment by which to change value
   *
   * @member dat.controllers
   */
  var NumberControllerBox = function(object, property, params) {

    this.__truncationSuspended = false;

    NumberControllerBox.superclass.call(this, object, property, params);

    var _this = this;

    /**
     * {Number} Previous mouse y position
     * @ignore
     */
    var prev_y;

    this.__input = document.createElement('input');
    this.__input.setAttribute('type', 'text');

    // Makes it so manually specified values are not truncated.

    dom.bind(this.__input, 'change', onChange);
    dom.bind(this.__input, 'blur', onBlur);
    dom.bind(this.__input, 'mousedown', onMouseDown);
    dom.bind(this.__input, 'keydown', function(e) {

      // When pressing entire, you can be as precise as you want.
      if (e.keyCode === 13) {
        _this.__truncationSuspended = true;
        this.blur();
        _this.__truncationSuspended = false;
      }

    });

    function onChange() {
      var attempted = parseFloat(_this.__input.value);
      if (!common.isNaN(attempted)) _this.setValue(attempted);
    }

    function onBlur() {
      onChange();
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }

    function onMouseDown(e) {
      dom.bind(window, 'mousemove', onMouseDrag);
      dom.bind(window, 'mouseup', onMouseUp);
      prev_y = e.clientY;
    }

    function onMouseDrag(e) {

      var diff = prev_y - e.clientY;
      _this.setValue(_this.getValue() + diff * _this.__impliedStep);

      prev_y = e.clientY;

    }

    function onMouseUp() {
      dom.unbind(window, 'mousemove', onMouseDrag);
      dom.unbind(window, 'mouseup', onMouseUp);
    }

    this.updateDisplay();

    this.domElement.appendChild(this.__input);

  };

  NumberControllerBox.superclass = NumberController;

  common.extend(

      NumberControllerBox.prototype,
      NumberController.prototype,

      {

        updateDisplay: function() {

          this.__input.value = this.__truncationSuspended ? this.getValue() : roundToDecimal(this.getValue(), this.__precision);
          return NumberControllerBox.superclass.prototype.updateDisplay.call(this);
        }

      }

  );

  function roundToDecimal(value, decimals) {
    var tenTo = Math.pow(10, decimals);
    return Math.round(value * tenTo) / tenTo;
  }

  return NumberControllerBox;

})(dat.controllers.NumberController,
dat.dom.dom,
dat.utils.common);


dat.controllers.NumberControllerSlider = (function (NumberController, dom, css, common, styleSheet) {

  /**
   * @class Represents a given property of an object that is a number, contains
   * a minimum and maximum, and provides a slider element with which to
   * manipulate it. It should be noted that the slider element is made up of
   * <code>&lt;div&gt;</code> tags, <strong>not</strong> the html5
   * <code>&lt;slider&gt;</code> element.
   *
   * @extends dat.controllers.Controller
   * @extends dat.controllers.NumberController
   * 
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   * @param {Number} minValue Minimum allowed value
   * @param {Number} maxValue Maximum allowed value
   * @param {Number} stepValue Increment by which to change value
   *
   * @member dat.controllers
   */
  var NumberControllerSlider = function(object, property, min, max, step) {

    NumberControllerSlider.superclass.call(this, object, property, { min: min, max: max, step: step });

    var _this = this;

    this.__background = document.createElement('div');
    this.__foreground = document.createElement('div');
    


    dom.bind(this.__background, 'mousedown', onMouseDown);
    
    dom.addClass(this.__background, 'slider');
    dom.addClass(this.__foreground, 'slider-fg');

    function onMouseDown(e) {

      dom.bind(window, 'mousemove', onMouseDrag);
      dom.bind(window, 'mouseup', onMouseUp);

      onMouseDrag(e);
    }

    function onMouseDrag(e) {

      e.preventDefault();

      var offset = dom.getOffset(_this.__background);
      var width = dom.getWidth(_this.__background);
      
      _this.setValue(
        map(e.clientX, offset.left, offset.left + width, _this.__min, _this.__max)
      );

      return false;

    }

    function onMouseUp() {
      dom.unbind(window, 'mousemove', onMouseDrag);
      dom.unbind(window, 'mouseup', onMouseUp);
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }

    this.updateDisplay();

    this.__background.appendChild(this.__foreground);
    this.domElement.appendChild(this.__background);

  };

  NumberControllerSlider.superclass = NumberController;

  /**
   * Injects default stylesheet for slider elements.
   */
  NumberControllerSlider.useDefaultStyles = function() {
    css.inject(styleSheet);
  };

  common.extend(

      NumberControllerSlider.prototype,
      NumberController.prototype,

      {

        updateDisplay: function() {
          var pct = (this.getValue() - this.__min)/(this.__max - this.__min);
          this.__foreground.style.width = pct*100+'%';
          return NumberControllerSlider.superclass.prototype.updateDisplay.call(this);
        }

      }



  );

  function map(v, i1, i2, o1, o2) {
    return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
  }

  return NumberControllerSlider;
  
})(dat.controllers.NumberController,
dat.dom.dom,
dat.utils.css,
dat.utils.common,
".slider {\n  box-shadow: inset 0 2px 4px rgba(0,0,0,0.15);\n  height: 1em;\n  border-radius: 1em;\n  background-color: #eee;\n  padding: 0 0.5em;\n  overflow: hidden;\n}\n\n.slider-fg {\n  padding: 1px 0 2px 0;\n  background-color: #aaa;\n  height: 1em;\n  margin-left: -0.5em;\n  padding-right: 0.5em;\n  border-radius: 1em 0 0 1em;\n}\n\n.slider-fg:after {\n  display: inline-block;\n  border-radius: 1em;\n  background-color: #fff;\n  border:  1px solid #aaa;\n  content: '';\n  float: right;\n  margin-right: -1em;\n  margin-top: -1px;\n  height: 0.9em;\n  width: 0.9em;\n}");


dat.controllers.FunctionController = (function (Controller, dom, common) {

  /**
   * @class Provides a GUI interface to fire a specified method, a property of an object.
   *
   * @extends dat.controllers.Controller
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   *
   * @member dat.controllers
   */
  var FunctionController = function(object, property, text) {

    FunctionController.superclass.call(this, object, property);

    var _this = this;

    this.__button = document.createElement('div');
    this.__button.innerHTML = text === undefined ? 'Fire' : text;
    dom.bind(this.__button, 'click', function(e) {
      e.preventDefault();
      _this.fire();
      return false;
    });

    dom.addClass(this.__button, 'button');

    this.domElement.appendChild(this.__button);


  };

  FunctionController.superclass = Controller;

  common.extend(

      FunctionController.prototype,
      Controller.prototype,
      {
        
        fire: function() {
          if (this.__onChange) {
            this.__onChange.call(this);
          }
          if (this.__onFinishChange) {
            this.__onFinishChange.call(this, this.getValue());
          }
          this.getValue().call(this.object);
        }
      }

  );

  return FunctionController;

})(dat.controllers.Controller,
dat.dom.dom,
dat.utils.common);


dat.controllers.BooleanController = (function (Controller, dom, common) {

  /**
   * @class Provides a checkbox input to alter the boolean property of an object.
   * @extends dat.controllers.Controller
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   *
   * @member dat.controllers
   */
  var BooleanController = function(object, property) {

    BooleanController.superclass.call(this, object, property);

    var _this = this;
    this.__prev = this.getValue();

    this.__checkbox = document.createElement('input');
    this.__checkbox.setAttribute('type', 'checkbox');


    dom.bind(this.__checkbox, 'change', onChange, false);

    this.domElement.appendChild(this.__checkbox);

    // Match original value
    this.updateDisplay();

    function onChange() {
      _this.setValue(!_this.__prev);
    }

  };

  BooleanController.superclass = Controller;

  common.extend(

      BooleanController.prototype,
      Controller.prototype,

      {

        setValue: function(v) {
          var toReturn = BooleanController.superclass.prototype.setValue.call(this, v);
          if (this.__onFinishChange) {
            this.__onFinishChange.call(this, this.getValue());
          }
          this.__prev = this.getValue();
          return toReturn;
        },

        updateDisplay: function() {
          
          if (this.getValue() === true) {
            this.__checkbox.setAttribute('checked', 'checked');
            this.__checkbox.checked = true;    
          } else {
              this.__checkbox.checked = false;
          }

          return BooleanController.superclass.prototype.updateDisplay.call(this);

        }


      }

  );

  return BooleanController;

})(dat.controllers.Controller,
dat.dom.dom,
dat.utils.common);


dat.color.toString = (function (common) {

  return function(color) {

    if (color.a == 1 || common.isUndefined(color.a)) {

      var s = color.hex.toString(16);
      while (s.length < 6) {
        s = '0' + s;
      }

      return '#' + s;

    } else {

      return 'rgba(' + Math.round(color.r) + ',' + Math.round(color.g) + ',' + Math.round(color.b) + ',' + color.a + ')';

    }

  }

})(dat.utils.common);


dat.color.interpret = (function (toString, common) {

  var result, toReturn;

  var interpret = function() {

    toReturn = false;

    var original = arguments.length > 1 ? common.toArray(arguments) : arguments[0];

    common.each(INTERPRETATIONS, function(family) {

      if (family.litmus(original)) {

        common.each(family.conversions, function(conversion, conversionName) {

          result = conversion.read(original);

          if (toReturn === false && result !== false) {
            toReturn = result;
            result.conversionName = conversionName;
            result.conversion = conversion;
            return common.BREAK;

          }

        });

        return common.BREAK;

      }

    });

    return toReturn;

  };

  var INTERPRETATIONS = [

    // Strings
    {

      litmus: common.isString,

      conversions: {

        THREE_CHAR_HEX: {

          read: function(original) {

            var test = original.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);
            if (test === null) return false;

            return {
              space: 'HEX',
              hex: parseInt(
                  '0x' +
                      test[1].toString() + test[1].toString() +
                      test[2].toString() + test[2].toString() +
                      test[3].toString() + test[3].toString())
            };

          },

          write: toString

        },

        SIX_CHAR_HEX: {

          read: function(original) {

            var test = original.match(/^#([A-F0-9]{6})$/i);
            if (test === null) return false;

            return {
              space: 'HEX',
              hex: parseInt('0x' + test[1].toString())
            };

          },

          write: toString

        },

        CSS_RGB: {

          read: function(original) {

            var test = original.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
            if (test === null) return false;

            return {
              space: 'RGB',
              r: parseFloat(test[1]),
              g: parseFloat(test[2]),
              b: parseFloat(test[3])
            };

          },

          write: toString

        },

        CSS_RGBA: {

          read: function(original) {

            var test = original.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\,\s*(.+)\s*\)/);
            if (test === null) return false;

            return {
              space: 'RGB',
              r: parseFloat(test[1]),
              g: parseFloat(test[2]),
              b: parseFloat(test[3]),
              a: parseFloat(test[4])
            };

          },

          write: toString

        }

      }

    },

    // Numbers
    {

      litmus: common.isNumber,

      conversions: {

        HEX: {
          read: function(original) {
            return {
              space: 'HEX',
              hex: original,
              conversionName: 'HEX'
            }
          },

          write: function(color) {
            return color.hex;
          }
        }

      }

    },

    // Arrays
    {

      litmus: common.isArray,

      conversions: {

        RGB_ARRAY: {
          read: function(original) {
            if (original.length != 3) return false;
            return {
              space: 'RGB',
              r: original[0],
              g: original[1],
              b: original[2]
            };
          },

          write: function(color) {
            return [color.r, color.g, color.b];
          }

        },

        RGBA_ARRAY: {
          read: function(original) {
            if (original.length != 4) return false;
            return {
              space: 'RGB',
              r: original[0],
              g: original[1],
              b: original[2],
              a: original[3]
            };
          },

          write: function(color) {
            return [color.r, color.g, color.b, color.a];
          }

        }

      }

    },

    // Objects
    {

      litmus: common.isObject,

      conversions: {

        RGBA_OBJ: {
          read: function(original) {
            if (common.isNumber(original.r) &&
                common.isNumber(original.g) &&
                common.isNumber(original.b) &&
                common.isNumber(original.a)) {
              return {
                space: 'RGB',
                r: original.r,
                g: original.g,
                b: original.b,
                a: original.a
              }
            }
            return false;
          },

          write: function(color) {
            return {
              r: color.r,
              g: color.g,
              b: color.b,
              a: color.a
            }
          }
        },

        RGB_OBJ: {
          read: function(original) {
            if (common.isNumber(original.r) &&
                common.isNumber(original.g) &&
                common.isNumber(original.b)) {
              return {
                space: 'RGB',
                r: original.r,
                g: original.g,
                b: original.b
              }
            }
            return false;
          },

          write: function(color) {
            return {
              r: color.r,
              g: color.g,
              b: color.b
            }
          }
        },

        HSVA_OBJ: {
          read: function(original) {
            if (common.isNumber(original.h) &&
                common.isNumber(original.s) &&
                common.isNumber(original.v) &&
                common.isNumber(original.a)) {
              return {
                space: 'HSV',
                h: original.h,
                s: original.s,
                v: original.v,
                a: original.a
              }
            }
            return false;
          },

          write: function(color) {
            return {
              h: color.h,
              s: color.s,
              v: color.v,
              a: color.a
            }
          }
        },

        HSV_OBJ: {
          read: function(original) {
            if (common.isNumber(original.h) &&
                common.isNumber(original.s) &&
                common.isNumber(original.v)) {
              return {
                space: 'HSV',
                h: original.h,
                s: original.s,
                v: original.v
              }
            }
            return false;
          },

          write: function(color) {
            return {
              h: color.h,
              s: color.s,
              v: color.v
            }
          }

        }

      }

    }


  ];

  return interpret;


})(dat.color.toString,
dat.utils.common);


dat.GUI = dat.gui.GUI = (function (css, saveDialogueContents, styleSheet, controllerFactory, Controller, BooleanController, FunctionController, NumberControllerBox, NumberControllerSlider, OptionController, ColorController, requestAnimationFrame, CenteredDiv, dom, common) {

  css.inject(styleSheet);

  /** Outer-most className for GUI's */
  var CSS_NAMESPACE = 'dg';

  var HIDE_KEY_CODE = 72;

  /** The only value shared between the JS and SCSS. Use caution. */
  var CLOSE_BUTTON_HEIGHT = 20;

  var DEFAULT_DEFAULT_PRESET_NAME = 'Default';

  var SUPPORTS_LOCAL_STORAGE = (function() {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  })();

  var SAVE_DIALOGUE;

  /** Have we yet to create an autoPlace GUI? */
  var auto_place_virgin = true;

  /** Fixed position div that auto place GUI's go inside */
  var auto_place_container;

  /** Are we hiding the GUI's ? */
  var hide = false;

  /** GUI's which should be hidden */
  var hideable_guis = [];

  /**
   * A lightweight controller library for JavaScript. It allows you to easily
   * manipulate variables and fire functions on the fly.
   * @class
   *
   * @member dat.gui
   *
   * @param {Object} [params]
   * @param {String} [params.name] The name of this GUI.
   * @param {Object} [params.load] JSON object representing the saved state of
   * this GUI.
   * @param {Boolean} [params.auto=true]
   * @param {dat.gui.GUI} [params.parent] The GUI I'm nested in.
   * @param {Boolean} [params.closed] If true, starts closed
   */
  var GUI = function(params) {

    var _this = this;

    /**
     * Outermost DOM Element
     * @type DOMElement
     */
    this.domElement = document.createElement('div');
    this.__ul = document.createElement('ul');
    this.domElement.appendChild(this.__ul);

    dom.addClass(this.domElement, CSS_NAMESPACE);

    /**
     * Nested GUI's by name
     * @ignore
     */
    this.__folders = {};

    this.__controllers = [];

    /**
     * List of objects I'm remembering for save, only used in top level GUI
     * @ignore
     */
    this.__rememberedObjects = [];

    /**
     * Maps the index of remembered objects to a map of controllers, only used
     * in top level GUI.
     *
     * @private
     * @ignore
     *
     * @example
     * [
     *  {
     *    propertyName: Controller,
     *    anotherPropertyName: Controller
     *  },
     *  {
     *    propertyName: Controller
     *  }
     * ]
     */
    this.__rememberedObjectIndecesToControllers = [];

    this.__listening = [];

    params = params || {};

    // Default parameters
    params = common.defaults(params, {
      autoPlace: true,
      width: GUI.DEFAULT_WIDTH
    });

    params = common.defaults(params, {
      resizable: params.autoPlace,
      hideable: params.autoPlace
    });


    if (!common.isUndefined(params.load)) {

      // Explicit preset
      if (params.preset) params.load.preset = params.preset;

    } else {

      params.load = { preset: DEFAULT_DEFAULT_PRESET_NAME };

    }

    if (common.isUndefined(params.parent) && params.hideable) {
      hideable_guis.push(this);
    }

    // Only root level GUI's are resizable.
    params.resizable = common.isUndefined(params.parent) && params.resizable;


    if (params.autoPlace && common.isUndefined(params.scrollable)) {
      params.scrollable = true;
    }
//    params.scrollable = common.isUndefined(params.parent) && params.scrollable === true;

    // Not part of params because I don't want people passing this in via
    // constructor. Should be a 'remembered' value.
    var use_local_storage =
        SUPPORTS_LOCAL_STORAGE &&
            localStorage.getItem(getLocalStorageHash(this, 'isLocal')) === 'true';

    Object.defineProperties(this,

        /** @lends dat.gui.GUI.prototype */
        {

          /**
           * The parent <code>GUI</code>
           * @type dat.gui.GUI
           */
          parent: {
            get: function() {
              return params.parent;
            }
          },

          scrollable: {
            get: function() {
              return params.scrollable;
            }
          },

          /**
           * Handles <code>GUI</code>'s element placement for you
           * @type Boolean
           */
          autoPlace: {
            get: function() {
              return params.autoPlace;
            }
          },

          /**
           * The identifier for a set of saved values
           * @type String
           */
          preset: {

            get: function() {
              if (_this.parent) {
                return _this.getRoot().preset;
              } else {
                return params.load.preset;
              }
            },

            set: function(v) {
              if (_this.parent) {
                _this.getRoot().preset = v;
              } else {
                params.load.preset = v;
              }
              setPresetSelectIndex(this);
              _this.revert();
            }

          },

          /**
           * The width of <code>GUI</code> element
           * @type Number
           */
          width: {
            get: function() {
              return params.width;
            },
            set: function(v) {
              params.width = v;
              setWidth(_this, v);
            }
          },

          /**
           * The name of <code>GUI</code>. Used for folders. i.e
           * a folder's name
           * @type String
           */
          name: {
            get: function() {
              return params.name;
            },
            set: function(v) {
              // TODO Check for collisions among sibling folders
              params.name = v;
              if (title_row_name) {
                title_row_name.innerHTML = params.name;
              }
            }
          },

          /**
           * Whether the <code>GUI</code> is collapsed or not
           * @type Boolean
           */
          closed: {
            get: function() {
              return params.closed;
            },
            set: function(v) {
              params.closed = v;
              if (params.closed) {
                dom.addClass(_this.__ul, GUI.CLASS_CLOSED);
              } else {
                dom.removeClass(_this.__ul, GUI.CLASS_CLOSED);
              }
              // For browsers that aren't going to respect the CSS transition,
              // Lets just check our height against the window height right off
              // the bat.
              this.onResize();

              if (_this.__closeButton) {
                _this.__closeButton.innerHTML = v ? GUI.TEXT_OPEN : GUI.TEXT_CLOSED;
              }
            }
          },

          /**
           * Contains all presets
           * @type Object
           */
          load: {
            get: function() {
              return params.load;
            }
          },

          /**
           * Determines whether or not to use <a href="https://developer.mozilla.org/en/DOM/Storage#localStorage">localStorage</a> as the means for
           * <code>remember</code>ing
           * @type Boolean
           */
          useLocalStorage: {

            get: function() {
              return use_local_storage;
            },
            set: function(bool) {
              if (SUPPORTS_LOCAL_STORAGE) {
                use_local_storage = bool;
                if (bool) {
                  dom.bind(window, 'unload', saveToLocalStorage);
                } else {
                  dom.unbind(window, 'unload', saveToLocalStorage);
                }
                localStorage.setItem(getLocalStorageHash(_this, 'isLocal'), bool);
              }
            }

          }

        });

    // Are we a root level GUI?
    if (common.isUndefined(params.parent)) {

      params.closed = false;

      dom.addClass(this.domElement, GUI.CLASS_MAIN);
      dom.makeSelectable(this.domElement, false);

      // Are we supposed to be loading locally?
      if (SUPPORTS_LOCAL_STORAGE) {

        if (use_local_storage) {

          _this.useLocalStorage = true;

          var saved_gui = localStorage.getItem(getLocalStorageHash(this, 'gui'));

          if (saved_gui) {
            params.load = JSON.parse(saved_gui);
          }

        }

      }

      this.__closeButton = document.createElement('div');
      this.__closeButton.innerHTML = GUI.TEXT_CLOSED;
      dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_BUTTON);
      this.domElement.appendChild(this.__closeButton);

      dom.bind(this.__closeButton, 'click', function() {

        _this.closed = !_this.closed;


      });


      // Oh, you're a nested GUI!
    } else {

      if (params.closed === undefined) {
        params.closed = true;
      }

      var title_row_name = document.createTextNode(params.name);
      dom.addClass(title_row_name, 'controller-name');

      var title_row = addRow(_this, title_row_name);

      var on_click_title = function(e) {
        e.preventDefault();
        _this.closed = !_this.closed;
        return false;
      };

      dom.addClass(this.__ul, GUI.CLASS_CLOSED);

      dom.addClass(title_row, 'title');
      dom.bind(title_row, 'click', on_click_title);

      if (!params.closed) {
        this.closed = false;
      }

    }

    if (params.autoPlace) {

      if (common.isUndefined(params.parent)) {

        if (auto_place_virgin) {
          auto_place_container = document.createElement('div');
          dom.addClass(auto_place_container, CSS_NAMESPACE);
          dom.addClass(auto_place_container, GUI.CLASS_AUTO_PLACE_CONTAINER);
          document.body.appendChild(auto_place_container);
          auto_place_virgin = false;
        }

        // Put it in the dom for you.
        auto_place_container.appendChild(this.domElement);

        // Apply the auto styles
        dom.addClass(this.domElement, GUI.CLASS_AUTO_PLACE);

      }


      // Make it not elastic.
      if (!this.parent) setWidth(_this, params.width);

    }

    dom.bind(window, 'resize', function() { _this.onResize() });
    dom.bind(this.__ul, 'webkitTransitionEnd', function() { _this.onResize(); });
    dom.bind(this.__ul, 'transitionend', function() { _this.onResize() });
    dom.bind(this.__ul, 'oTransitionEnd', function() { _this.onResize() });
    this.onResize();


    if (params.resizable) {
      addResizeHandle(this);
    }

    function saveToLocalStorage() {
      localStorage.setItem(getLocalStorageHash(_this, 'gui'), JSON.stringify(_this.getSaveObject()));
    }

    var root = _this.getRoot();
    function resetWidth() {
        var root = _this.getRoot();
        root.width += 1;
        common.defer(function() {
          root.width -= 1;
        });
      }

      if (!params.parent) {
        resetWidth();
      }

  };

  GUI.toggleHide = function() {

    hide = !hide;
    common.each(hideable_guis, function(gui) {
      gui.domElement.style.zIndex = hide ? -999 : 999;
      gui.domElement.style.opacity = hide ? 0 : 1;
    });
  };

  GUI.CLASS_AUTO_PLACE = 'a';
  GUI.CLASS_AUTO_PLACE_CONTAINER = 'ac';
  GUI.CLASS_MAIN = 'main';
  GUI.CLASS_CONTROLLER_ROW = 'cr';
  GUI.CLASS_TOO_TALL = 'taller-than-window';
  GUI.CLASS_CLOSED = 'closed';
  GUI.CLASS_CLOSE_BUTTON = 'close-button';
  GUI.CLASS_DRAG = 'drag';

  GUI.DEFAULT_WIDTH = 245;
  GUI.TEXT_CLOSED = 'Close Controls';
  GUI.TEXT_OPEN = 'Open Controls';

  dom.bind(window, 'keydown', function(e) {

    if (document.activeElement.type !== 'text' &&
        (e.which === HIDE_KEY_CODE || e.keyCode == HIDE_KEY_CODE)) {
      GUI.toggleHide();
    }

  }, false);

  common.extend(

      GUI.prototype,

      /** @lends dat.gui.GUI */
      {

        /**
         * @param object
         * @param property
         * @returns {dat.controllers.Controller} The new controller that was added.
         * @instance
         */
        add: function(object, property) {

          return add(
              this,
              object,
              property,
              {
                factoryArgs: Array.prototype.slice.call(arguments, 2)
              }
          );

        },

        /**
         * @param object
         * @param property
         * @returns {dat.controllers.ColorController} The new controller that was added.
         * @instance
         */
        addColor: function(object, property) {

          return add(
              this,
              object,
              property,
              {
                color: true
              }
          );

        },

        /**
         * @param controller
         * @instance
         */
        remove: function(controller) {

          // TODO listening?
          this.__ul.removeChild(controller.__li);
          this.__controllers.slice(this.__controllers.indexOf(controller), 1);
          var _this = this;
          common.defer(function() {
            _this.onResize();
          });

        },

        destroy: function() {

          if (this.autoPlace) {
            auto_place_container.removeChild(this.domElement);
          }

        },

        /**
         * @param name
         * @returns {dat.gui.GUI} The new folder.
         * @throws {Error} if this GUI already has a folder by the specified
         * name
         * @instance
         */
        addFolder: function(name) {

          // We have to prevent collisions on names in order to have a key
          // by which to remember saved values
          if (this.__folders[name] !== undefined) {
            throw new Error('You already have a folder in this GUI by the' +
                ' name "' + name + '"');
          }

          var new_gui_params = { name: name, parent: this };

          // We need to pass down the autoPlace trait so that we can
          // attach event listeners to open/close folder actions to
          // ensure that a scrollbar appears if the window is too short.
          new_gui_params.autoPlace = this.autoPlace;

          // Do we have saved appearance data for this folder?

          if (this.load && // Anything loaded?
              this.load.folders && // Was my parent a dead-end?
              this.load.folders[name]) { // Did daddy remember me?

            // Start me closed if I was closed
            new_gui_params.closed = this.load.folders[name].closed;

            // Pass down the loaded data
            new_gui_params.load = this.load.folders[name];

          }

          var gui = new GUI(new_gui_params);
          this.__folders[name] = gui;

          var li = addRow(this, gui.domElement);
          dom.addClass(li, 'folder');
          return gui;

        },

        open: function() {
          this.closed = false;
        },

        close: function() {
          this.closed = true;
        },

        onResize: function() {

          var root = this.getRoot();

          if (root.scrollable) {

            var top = dom.getOffset(root.__ul).top;
            var h = 0;

            common.each(root.__ul.childNodes, function(node) {
              if (! (root.autoPlace && node === root.__save_row))
                h += dom.getHeight(node);
            });

            if (window.innerHeight - top - CLOSE_BUTTON_HEIGHT < h) {
              dom.addClass(root.domElement, GUI.CLASS_TOO_TALL);
              root.__ul.style.height = window.innerHeight - top - CLOSE_BUTTON_HEIGHT + 'px';
            } else {
              dom.removeClass(root.domElement, GUI.CLASS_TOO_TALL);
              root.__ul.style.height = 'auto';
            }

          }

          if (root.__resize_handle) {
            common.defer(function() {
              root.__resize_handle.style.height = root.__ul.offsetHeight + 'px';
            });
          }

          if (root.__closeButton) {
            root.__closeButton.style.width = root.width + 'px';
          }

        },

        /**
         * Mark objects for saving. The order of these objects cannot change as
         * the GUI grows. When remembering new objects, append them to the end
         * of the list.
         *
         * @param {Object...} objects
         * @throws {Error} if not called on a top level GUI.
         * @instance
         */
        remember: function() {

          if (common.isUndefined(SAVE_DIALOGUE)) {
            SAVE_DIALOGUE = new CenteredDiv();
            SAVE_DIALOGUE.domElement.innerHTML = saveDialogueContents;
          }

          if (this.parent) {
            throw new Error("You can only call remember on a top level GUI.");
          }

          var _this = this;

          common.each(Array.prototype.slice.call(arguments), function(object) {
            if (_this.__rememberedObjects.length == 0) {
              addSaveMenu(_this);
            }
            if (_this.__rememberedObjects.indexOf(object) == -1) {
              _this.__rememberedObjects.push(object);
            }
          });

          if (this.autoPlace) {
            // Set save row width
            setWidth(this, this.width);
          }

        },

        /**
         * @returns {dat.gui.GUI} the topmost parent GUI of a nested GUI.
         * @instance
         */
        getRoot: function() {
          var gui = this;
          while (gui.parent) {
            gui = gui.parent;
          }
          return gui;
        },

        /**
         * @returns {Object} a JSON object representing the current state of
         * this GUI as well as its remembered properties.
         * @instance
         */
        getSaveObject: function() {

          var toReturn = this.load;

          toReturn.closed = this.closed;

          // Am I remembering any values?
          if (this.__rememberedObjects.length > 0) {

            toReturn.preset = this.preset;

            if (!toReturn.remembered) {
              toReturn.remembered = {};
            }

            toReturn.remembered[this.preset] = getCurrentPreset(this);

          }

          toReturn.folders = {};
          common.each(this.__folders, function(element, key) {
            toReturn.folders[key] = element.getSaveObject();
          });

          return toReturn;

        },

        save: function() {

          if (!this.load.remembered) {
            this.load.remembered = {};
          }

          this.load.remembered[this.preset] = getCurrentPreset(this);
          markPresetModified(this, false);

        },

        saveAs: function(presetName) {

          if (!this.load.remembered) {

            // Retain default values upon first save
            this.load.remembered = {};
            this.load.remembered[DEFAULT_DEFAULT_PRESET_NAME] = getCurrentPreset(this, true);

          }

          this.load.remembered[presetName] = getCurrentPreset(this);
          this.preset = presetName;
          addPresetOption(this, presetName, true);

        },

        revert: function(gui) {

          common.each(this.__controllers, function(controller) {
            // Make revert work on Default.
            if (!this.getRoot().load.remembered) {
              controller.setValue(controller.initialValue);
            } else {
              recallSavedValue(gui || this.getRoot(), controller);
            }
          }, this);

          common.each(this.__folders, function(folder) {
            folder.revert(folder);
          });

          if (!gui) {
            markPresetModified(this.getRoot(), false);
          }


        },

        listen: function(controller) {

          var init = this.__listening.length == 0;
          this.__listening.push(controller);
          if (init) updateDisplays(this.__listening);

        }

      }

  );

  function add(gui, object, property, params) {

    if (object[property] === undefined) {
      throw new Error("Object " + object + " has no property \"" + property + "\"");
    }

    var controller;

    if (params.color) {

      controller = new ColorController(object, property);

    } else {

      var factoryArgs = [object,property].concat(params.factoryArgs);
      controller = controllerFactory.apply(gui, factoryArgs);

    }

    if (params.before instanceof Controller) {
      params.before = params.before.__li;
    }

    recallSavedValue(gui, controller);

    dom.addClass(controller.domElement, 'c');

    var name = document.createElement('span');
    dom.addClass(name, 'property-name');
    name.innerHTML = controller.property;

    var container = document.createElement('div');
    container.appendChild(name);
    container.appendChild(controller.domElement);

    var li = addRow(gui, container, params.before);

    dom.addClass(li, GUI.CLASS_CONTROLLER_ROW);
    dom.addClass(li, typeof controller.getValue());

    augmentController(gui, li, controller);

    gui.__controllers.push(controller);

    return controller;

  }

  /**
   * Add a row to the end of the GUI or before another row.
   *
   * @param gui
   * @param [dom] If specified, inserts the dom content in the new row
   * @param [liBefore] If specified, places the new row before another row
   */
  function addRow(gui, dom, liBefore) {
    var li = document.createElement('li');
    if (dom) li.appendChild(dom);
    if (liBefore) {
      gui.__ul.insertBefore(li, params.before);
    } else {
      gui.__ul.appendChild(li);
    }
    gui.onResize();
    return li;
  }

  function augmentController(gui, li, controller) {

    controller.__li = li;
    controller.__gui = gui;

    common.extend(controller, {

      options: function(options) {

        if (arguments.length > 1) {
          controller.remove();

          return add(
              gui,
              controller.object,
              controller.property,
              {
                before: controller.__li.nextElementSibling,
                factoryArgs: [common.toArray(arguments)]
              }
          );

        }

        if (common.isArray(options) || common.isObject(options)) {
          controller.remove();

          return add(
              gui,
              controller.object,
              controller.property,
              {
                before: controller.__li.nextElementSibling,
                factoryArgs: [options]
              }
          );

        }

      },

      name: function(v) {
        controller.__li.firstElementChild.firstElementChild.innerHTML = v;
        return controller;
      },

      listen: function() {
        controller.__gui.listen(controller);
        return controller;
      },

      remove: function() {
        controller.__gui.remove(controller);
        return controller;
      }

    });

    // All sliders should be accompanied by a box.
    if (controller instanceof NumberControllerSlider) {

      var box = new NumberControllerBox(controller.object, controller.property,
          { min: controller.__min, max: controller.__max, step: controller.__step });

      common.each(['updateDisplay', 'onChange', 'onFinishChange'], function(method) {
        var pc = controller[method];
        var pb = box[method];
        controller[method] = box[method] = function() {
          var args = Array.prototype.slice.call(arguments);
          pc.apply(controller, args);
          return pb.apply(box, args);
        }
      });

      dom.addClass(li, 'has-slider');
      controller.domElement.insertBefore(box.domElement, controller.domElement.firstElementChild);

    }
    else if (controller instanceof NumberControllerBox) {

      var r = function(returned) {

        // Have we defined both boundaries?
        if (common.isNumber(controller.__min) && common.isNumber(controller.__max)) {

          // Well, then lets just replace this with a slider.
          controller.remove();
          return add(
              gui,
              controller.object,
              controller.property,
              {
                before: controller.__li.nextElementSibling,
                factoryArgs: [controller.__min, controller.__max, controller.__step]
              });

        }

        return returned;

      };

      controller.min = common.compose(r, controller.min);
      controller.max = common.compose(r, controller.max);

    }
    else if (controller instanceof BooleanController) {

      dom.bind(li, 'click', function() {
        dom.fakeEvent(controller.__checkbox, 'click');
      });

      dom.bind(controller.__checkbox, 'click', function(e) {
        e.stopPropagation(); // Prevents double-toggle
      })

    }
    else if (controller instanceof FunctionController) {

      dom.bind(li, 'click', function() {
        dom.fakeEvent(controller.__button, 'click');
      });

      dom.bind(li, 'mouseover', function() {
        dom.addClass(controller.__button, 'hover');
      });

      dom.bind(li, 'mouseout', function() {
        dom.removeClass(controller.__button, 'hover');
      });

    }
    else if (controller instanceof ColorController) {

      dom.addClass(li, 'color');
      controller.updateDisplay = common.compose(function(r) {
        li.style.borderLeftColor = controller.__color.toString();
        return r;
      }, controller.updateDisplay);

      controller.updateDisplay();

    }

    controller.setValue = common.compose(function(r) {
      if (gui.getRoot().__preset_select && controller.isModified()) {
        markPresetModified(gui.getRoot(), true);
      }
      return r;
    }, controller.setValue);

  }

  function recallSavedValue(gui, controller) {

    // Find the topmost GUI, that's where remembered objects live.
    var root = gui.getRoot();

    // Does the object we're controlling match anything we've been told to
    // remember?
    var matched_index = root.__rememberedObjects.indexOf(controller.object);

    // Why yes, it does!
    if (matched_index != -1) {

      // Let me fetch a map of controllers for thcommon.isObject.
      var controller_map =
          root.__rememberedObjectIndecesToControllers[matched_index];

      // Ohp, I believe this is the first controller we've created for this
      // object. Lets make the map fresh.
      if (controller_map === undefined) {
        controller_map = {};
        root.__rememberedObjectIndecesToControllers[matched_index] =
            controller_map;
      }

      // Keep track of this controller
      controller_map[controller.property] = controller;

      // Okay, now have we saved any values for this controller?
      if (root.load && root.load.remembered) {

        var preset_map = root.load.remembered;

        // Which preset are we trying to load?
        var preset;

        if (preset_map[gui.preset]) {

          preset = preset_map[gui.preset];

        } else if (preset_map[DEFAULT_DEFAULT_PRESET_NAME]) {

          // Uhh, you can have the default instead?
          preset = preset_map[DEFAULT_DEFAULT_PRESET_NAME];

        } else {

          // Nada.

          return;

        }


        // Did the loaded object remember thcommon.isObject?
        if (preset[matched_index] &&

          // Did we remember this particular property?
            preset[matched_index][controller.property] !== undefined) {

          // We did remember something for this guy ...
          var value = preset[matched_index][controller.property];

          // And that's what it is.
          controller.initialValue = value;
          controller.setValue(value);

        }

      }

    }

  }

  function getLocalStorageHash(gui, key) {
    // TODO how does this deal with multiple GUI's?
    return document.location.href + '.' + key;

  }

  function addSaveMenu(gui) {

    var div = gui.__save_row = document.createElement('li');

    dom.addClass(gui.domElement, 'has-save');

    gui.__ul.insertBefore(div, gui.__ul.firstChild);

    dom.addClass(div, 'save-row');

    var gears = document.createElement('span');
    gears.innerHTML = '&nbsp;';
    dom.addClass(gears, 'button gears');

    // TODO replace with FunctionController
    var button = document.createElement('span');
    button.innerHTML = 'Save';
    dom.addClass(button, 'button');
    dom.addClass(button, 'save');

    var button2 = document.createElement('span');
    button2.innerHTML = 'New';
    dom.addClass(button2, 'button');
    dom.addClass(button2, 'save-as');

    var button3 = document.createElement('span');
    button3.innerHTML = 'Revert';
    dom.addClass(button3, 'button');
    dom.addClass(button3, 'revert');

    var select = gui.__preset_select = document.createElement('select');

    if (gui.load && gui.load.remembered) {

      common.each(gui.load.remembered, function(value, key) {
        addPresetOption(gui, key, key == gui.preset);
      });

    } else {
      addPresetOption(gui, DEFAULT_DEFAULT_PRESET_NAME, false);
    }

    dom.bind(select, 'change', function() {


      for (var index = 0; index < gui.__preset_select.length; index++) {
        gui.__preset_select[index].innerHTML = gui.__preset_select[index].value;
      }

      gui.preset = this.value;

    });

    div.appendChild(select);
    div.appendChild(gears);
    div.appendChild(button);
    div.appendChild(button2);
    div.appendChild(button3);

    if (SUPPORTS_LOCAL_STORAGE) {

      var saveLocally = document.getElementById('dg-save-locally');
      var explain = document.getElementById('dg-local-explain');

      saveLocally.style.display = 'block';

      var localStorageCheckBox = document.getElementById('dg-local-storage');

      if (localStorage.getItem(getLocalStorageHash(gui, 'isLocal')) === 'true') {
        localStorageCheckBox.setAttribute('checked', 'checked');
      }

      function showHideExplain() {
        explain.style.display = gui.useLocalStorage ? 'block' : 'none';
      }

      showHideExplain();

      // TODO: Use a boolean controller, fool!
      dom.bind(localStorageCheckBox, 'change', function() {
        gui.useLocalStorage = !gui.useLocalStorage;
        showHideExplain();
      });

    }

    var newConstructorTextArea = document.getElementById('dg-new-constructor');

    dom.bind(newConstructorTextArea, 'keydown', function(e) {
      if (e.metaKey && (e.which === 67 || e.keyCode == 67)) {
        SAVE_DIALOGUE.hide();
      }
    });

    dom.bind(gears, 'click', function() {
      newConstructorTextArea.innerHTML = JSON.stringify(gui.getSaveObject(), undefined, 2);
      SAVE_DIALOGUE.show();
      newConstructorTextArea.focus();
      newConstructorTextArea.select();
    });

    dom.bind(button, 'click', function() {
      gui.save();
    });

    dom.bind(button2, 'click', function() {
      var presetName = prompt('Enter a new preset name.');
      if (presetName) gui.saveAs(presetName);
    });

    dom.bind(button3, 'click', function() {
      gui.revert();
    });

//    div.appendChild(button2);

  }

  function addResizeHandle(gui) {

    gui.__resize_handle = document.createElement('div');

    common.extend(gui.__resize_handle.style, {

      width: '6px',
      marginLeft: '-3px',
      height: '200px',
      cursor: 'ew-resize',
      position: 'absolute'
//      border: '1px solid blue'

    });

    var pmouseX;

    dom.bind(gui.__resize_handle, 'mousedown', dragStart);
    dom.bind(gui.__closeButton, 'mousedown', dragStart);

    gui.domElement.insertBefore(gui.__resize_handle, gui.domElement.firstElementChild);

    function dragStart(e) {

      e.preventDefault();

      pmouseX = e.clientX;

      dom.addClass(gui.__closeButton, GUI.CLASS_DRAG);
      dom.bind(window, 'mousemove', drag);
      dom.bind(window, 'mouseup', dragStop);

      return false;

    }

    function drag(e) {

      e.preventDefault();

      gui.width += pmouseX - e.clientX;
      gui.onResize();
      pmouseX = e.clientX;

      return false;

    }

    function dragStop() {

      dom.removeClass(gui.__closeButton, GUI.CLASS_DRAG);
      dom.unbind(window, 'mousemove', drag);
      dom.unbind(window, 'mouseup', dragStop);

    }

  }

  function setWidth(gui, w) {
    gui.domElement.style.width = w + 'px';
    // Auto placed save-rows are position fixed, so we have to
    // set the width manually if we want it to bleed to the edge
    if (gui.__save_row && gui.autoPlace) {
      gui.__save_row.style.width = w + 'px';
    }if (gui.__closeButton) {
      gui.__closeButton.style.width = w + 'px';
    }
  }

  function getCurrentPreset(gui, useInitialValues) {

    var toReturn = {};

    // For each object I'm remembering
    common.each(gui.__rememberedObjects, function(val, index) {

      var saved_values = {};

      // The controllers I've made for thcommon.isObject by property
      var controller_map =
          gui.__rememberedObjectIndecesToControllers[index];

      // Remember each value for each property
      common.each(controller_map, function(controller, property) {
        saved_values[property] = useInitialValues ? controller.initialValue : controller.getValue();
      });

      // Save the values for thcommon.isObject
      toReturn[index] = saved_values;

    });

    return toReturn;

  }

  function addPresetOption(gui, name, setSelected) {
    var opt = document.createElement('option');
    opt.innerHTML = name;
    opt.value = name;
    gui.__preset_select.appendChild(opt);
    if (setSelected) {
      gui.__preset_select.selectedIndex = gui.__preset_select.length - 1;
    }
  }

  function setPresetSelectIndex(gui) {
    for (var index = 0; index < gui.__preset_select.length; index++) {
      if (gui.__preset_select[index].value == gui.preset) {
        gui.__preset_select.selectedIndex = index;
      }
    }
  }

  function markPresetModified(gui, modified) {
    var opt = gui.__preset_select[gui.__preset_select.selectedIndex];
//    console.log('mark', modified, opt);
    if (modified) {
      opt.innerHTML = opt.value + "*";
    } else {
      opt.innerHTML = opt.value;
    }
  }

  function updateDisplays(controllerArray) {


    if (controllerArray.length != 0) {

      requestAnimationFrame(function() {
        updateDisplays(controllerArray);
      });

    }

    common.each(controllerArray, function(c) {
      c.updateDisplay();
    });

  }

  return GUI;

})(dat.utils.css,
"<div id=\"dg-save\" class=\"dg dialogue\">\n\n  Here's the new load parameter for your <code>GUI</code>'s constructor:\n\n  <textarea id=\"dg-new-constructor\"></textarea>\n\n  <div id=\"dg-save-locally\">\n\n    <input id=\"dg-local-storage\" type=\"checkbox\"/> Automatically save\n    values to <code>localStorage</code> on exit.\n\n    <div id=\"dg-local-explain\">The values saved to <code>localStorage</code> will\n      override those passed to <code>dat.GUI</code>'s constructor. This makes it\n      easier to work incrementally, but <code>localStorage</code> is fragile,\n      and your friends may not see the same values you do.\n      \n    </div>\n    \n  </div>\n\n</div>",
".dg ul{list-style:none;margin:0;padding:0;width:100%;clear:both}.dg.ac{position:fixed;top:0;left:0;right:0;height:0;z-index:0}.dg:not(.ac) .main{overflow:hidden}.dg.main{-webkit-transition:opacity 0.1s linear;-o-transition:opacity 0.1s linear;-moz-transition:opacity 0.1s linear;transition:opacity 0.1s linear}.dg.main.taller-than-window{overflow-y:auto}.dg.main.taller-than-window .close-button{opacity:1;margin-top:-1px;border-top:1px solid #2c2c2c}.dg.main ul.closed .close-button{opacity:1 !important}.dg.main:hover .close-button,.dg.main .close-button.drag{opacity:1}.dg.main .close-button{-webkit-transition:opacity 0.1s linear;-o-transition:opacity 0.1s linear;-moz-transition:opacity 0.1s linear;transition:opacity 0.1s linear;border:0;position:absolute;line-height:19px;height:20px;cursor:pointer;text-align:center;background-color:#000}.dg.main .close-button:hover{background-color:#111}.dg.a{float:right;margin-right:15px;overflow-x:hidden}.dg.a.has-save ul{margin-top:27px}.dg.a.has-save ul.closed{margin-top:0}.dg.a .save-row{position:fixed;top:0;z-index:1002}.dg li{-webkit-transition:height 0.1s ease-out;-o-transition:height 0.1s ease-out;-moz-transition:height 0.1s ease-out;transition:height 0.1s ease-out}.dg li:not(.folder){cursor:auto;height:27px;line-height:27px;overflow:hidden;padding:0 4px 0 5px}.dg li.folder{padding:0;border-left:4px solid rgba(0,0,0,0)}.dg li.title{cursor:pointer;margin-left:-4px}.dg .closed li:not(.title),.dg .closed ul li,.dg .closed ul li > *{height:0;overflow:hidden;border:0}.dg .cr{clear:both;padding-left:3px;height:27px}.dg .property-name{cursor:default;float:left;clear:left;width:40%;overflow:hidden;text-overflow:ellipsis}.dg .c{float:left;width:60%}.dg .c input[type=text]{border:0;margin-top:4px;padding:3px;width:100%;float:right}.dg .has-slider input[type=text]{width:30%;margin-left:0}.dg .slider{float:left;width:66%;margin-left:-5px;margin-right:0;height:19px;margin-top:4px}.dg .slider-fg{height:100%}.dg .c input[type=checkbox]{margin-top:9px}.dg .c select{margin-top:5px}.dg .cr.function,.dg .cr.function .property-name,.dg .cr.function *,.dg .cr.boolean,.dg .cr.boolean *{cursor:pointer}.dg .selector{display:none;position:absolute;margin-left:-9px;margin-top:23px;z-index:10}.dg .c:hover .selector,.dg .selector.drag{display:block}.dg li.save-row{padding:0}.dg li.save-row .button{display:inline-block;padding:0px 6px}.dg.dialogue{background-color:#222;width:460px;padding:15px;font-size:13px;line-height:15px}#dg-new-constructor{padding:10px;color:#222;font-family:Monaco, monospace;font-size:10px;border:0;resize:none;box-shadow:inset 1px 1px 1px #888;word-wrap:break-word;margin:12px 0;display:block;width:440px;overflow-y:scroll;height:100px;position:relative}#dg-local-explain{display:none;font-size:11px;line-height:17px;border-radius:3px;background-color:#333;padding:8px;margin-top:10px}#dg-local-explain code{font-size:10px}#dat-gui-save-locally{display:none}.dg{color:#eee;font:11px 'Lucida Grande', sans-serif;text-shadow:0 -1px 0 #111}.dg.main::-webkit-scrollbar{width:5px;background:#1a1a1a}.dg.main::-webkit-scrollbar-corner{height:0;display:none}.dg.main::-webkit-scrollbar-thumb{border-radius:5px;background:#676767}.dg li:not(.folder){background:#1a1a1a;border-bottom:1px solid #2c2c2c}.dg li.save-row{line-height:25px;background:#dad5cb;border:0}.dg li.save-row select{margin-left:5px;width:108px}.dg li.save-row .button{margin-left:5px;margin-top:1px;border-radius:2px;font-size:9px;line-height:7px;padding:4px 4px 5px 4px;background:#c5bdad;color:#fff;text-shadow:0 1px 0 #b0a58f;box-shadow:0 -1px 0 #b0a58f;cursor:pointer}.dg li.save-row .button.gears{background:#c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;height:7px;width:8px}.dg li.save-row .button:hover{background-color:#bab19e;box-shadow:0 -1px 0 #b0a58f}.dg li.folder{border-bottom:0}.dg li.title{padding-left:16px;background:#000 url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.2)}.dg .closed li.title{background-image:url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==)}.dg .cr.boolean{border-left:3px solid #806787}.dg .cr.function{border-left:3px solid #e61d5f}.dg .cr.number{border-left:3px solid #2fa1d6}.dg .cr.number input[type=text]{color:#2fa1d6}.dg .cr.string{border-left:3px solid #1ed36f}.dg .cr.string input[type=text]{color:#1ed36f}.dg .cr.function:hover,.dg .cr.boolean:hover{background:#111}.dg .c input[type=text]{background:#303030;outline:none}.dg .c input[type=text]:hover{background:#3c3c3c}.dg .c input[type=text]:focus{background:#494949;color:#fff}.dg .c .slider{background:#303030;cursor:ew-resize}.dg .c .slider-fg{background:#2fa1d6}.dg .c .slider:hover{background:#3c3c3c}.dg .c .slider:hover .slider-fg{background:#44abda}\n",
dat.controllers.factory = (function (OptionController, NumberControllerBox, NumberControllerSlider, StringController, FunctionController, BooleanController, common) {

      return function(object, property) {

        var initialValue = object[property];

        // Providing options?
        if (common.isArray(arguments[2]) || common.isObject(arguments[2])) {
          return new OptionController(object, property, arguments[2]);
        }

        // Providing a map?

        if (common.isNumber(initialValue)) {

          if (common.isNumber(arguments[2]) && common.isNumber(arguments[3])) {

            // Has min and max.
            return new NumberControllerSlider(object, property, arguments[2], arguments[3]);

          } else {

            return new NumberControllerBox(object, property, { min: arguments[2], max: arguments[3] });

          }

        }

        if (common.isString(initialValue)) {
          return new StringController(object, property);
        }

        if (common.isFunction(initialValue)) {
          return new FunctionController(object, property, '');
        }

        if (common.isBoolean(initialValue)) {
          return new BooleanController(object, property);
        }

      }

    })(dat.controllers.OptionController,
dat.controllers.NumberControllerBox,
dat.controllers.NumberControllerSlider,
dat.controllers.StringController = (function (Controller, dom, common) {

  /**
   * @class Provides a text input to alter the string property of an object.
   *
   * @extends dat.controllers.Controller
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   *
   * @member dat.controllers
   */
  var StringController = function(object, property) {

    StringController.superclass.call(this, object, property);

    var _this = this;

    this.__input = document.createElement('input');
    this.__input.setAttribute('type', 'text');

    dom.bind(this.__input, 'keyup', onChange);
    dom.bind(this.__input, 'change', onChange);
    dom.bind(this.__input, 'blur', onBlur);
    dom.bind(this.__input, 'keydown', function(e) {
      if (e.keyCode === 13) {
        this.blur();
      }
    });
    

    function onChange() {
      _this.setValue(_this.__input.value);
    }

    function onBlur() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }

    this.updateDisplay();

    this.domElement.appendChild(this.__input);

  };

  StringController.superclass = Controller;

  common.extend(

      StringController.prototype,
      Controller.prototype,

      {

        updateDisplay: function() {
          // Stops the caret from moving on account of:
          // keyup -> setValue -> updateDisplay
          if (!dom.isActive(this.__input)) {
            this.__input.value = this.getValue();
          }
          return StringController.superclass.prototype.updateDisplay.call(this);
        }

      }

  );

  return StringController;

})(dat.controllers.Controller,
dat.dom.dom,
dat.utils.common),
dat.controllers.FunctionController,
dat.controllers.BooleanController,
dat.utils.common),
dat.controllers.Controller,
dat.controllers.BooleanController,
dat.controllers.FunctionController,
dat.controllers.NumberControllerBox,
dat.controllers.NumberControllerSlider,
dat.controllers.OptionController,
dat.controllers.ColorController = (function (Controller, dom, Color, interpret, common) {

  var ColorController = function(object, property) {

    ColorController.superclass.call(this, object, property);

    this.__color = new Color(this.getValue());
    this.__temp = new Color(0);

    var _this = this;

    this.domElement = document.createElement('div');

    dom.makeSelectable(this.domElement, false);

    this.__selector = document.createElement('div');
    this.__selector.className = 'selector';

    this.__saturation_field = document.createElement('div');
    this.__saturation_field.className = 'saturation-field';

    this.__field_knob = document.createElement('div');
    this.__field_knob.className = 'field-knob';
    this.__field_knob_border = '2px solid ';

    this.__hue_knob = document.createElement('div');
    this.__hue_knob.className = 'hue-knob';

    this.__hue_field = document.createElement('div');
    this.__hue_field.className = 'hue-field';

    this.__input = document.createElement('input');
    this.__input.type = 'text';
    this.__input_textShadow = '0 1px 1px ';

    dom.bind(this.__input, 'keydown', function(e) {
      if (e.keyCode === 13) { // on enter
        onBlur.call(this);
      }
    });

    dom.bind(this.__input, 'blur', onBlur);

    dom.bind(this.__selector, 'mousedown', function(e) {

      dom
        .addClass(this, 'drag')
        .bind(window, 'mouseup', function(e) {
          dom.removeClass(_this.__selector, 'drag');
        });

    });

    var value_field = document.createElement('div');

    common.extend(this.__selector.style, {
      width: '122px',
      height: '102px',
      padding: '3px',
      backgroundColor: '#222',
      boxShadow: '0px 1px 3px rgba(0,0,0,0.3)'
    });

    common.extend(this.__field_knob.style, {
      position: 'absolute',
      width: '12px',
      height: '12px',
      border: this.__field_knob_border + (this.__color.v < .5 ? '#fff' : '#000'),
      boxShadow: '0px 1px 3px rgba(0,0,0,0.5)',
      borderRadius: '12px',
      zIndex: 1
    });
    
    common.extend(this.__hue_knob.style, {
      position: 'absolute',
      width: '15px',
      height: '2px',
      borderRight: '4px solid #fff',
      zIndex: 1
    });

    common.extend(this.__saturation_field.style, {
      width: '100px',
      height: '100px',
      border: '1px solid #555',
      marginRight: '3px',
      display: 'inline-block',
      cursor: 'pointer'
    });

    common.extend(value_field.style, {
      width: '100%',
      height: '100%',
      background: 'none'
    });
    
    linearGradient(value_field, 'top', 'rgba(0,0,0,0)', '#000');

    common.extend(this.__hue_field.style, {
      width: '15px',
      height: '100px',
      display: 'inline-block',
      border: '1px solid #555',
      cursor: 'ns-resize'
    });

    hueGradient(this.__hue_field);

    common.extend(this.__input.style, {
      outline: 'none',
//      width: '120px',
      textAlign: 'center',
//      padding: '4px',
//      marginBottom: '6px',
      color: '#fff',
      border: 0,
      fontWeight: 'bold',
      textShadow: this.__input_textShadow + 'rgba(0,0,0,0.7)'
    });

    dom.bind(this.__saturation_field, 'mousedown', fieldDown);
    dom.bind(this.__field_knob, 'mousedown', fieldDown);

    dom.bind(this.__hue_field, 'mousedown', function(e) {
      setH(e);
      dom.bind(window, 'mousemove', setH);
      dom.bind(window, 'mouseup', unbindH);
    });

    function fieldDown(e) {
      setSV(e);
      // document.body.style.cursor = 'none';
      dom.bind(window, 'mousemove', setSV);
      dom.bind(window, 'mouseup', unbindSV);
    }

    function unbindSV() {
      dom.unbind(window, 'mousemove', setSV);
      dom.unbind(window, 'mouseup', unbindSV);
      // document.body.style.cursor = 'default';
    }

    function onBlur() {
      var i = interpret(this.value);
      if (i !== false) {
        _this.__color.__state = i;
        _this.setValue(_this.__color.toOriginal());
      } else {
        this.value = _this.__color.toString();
      }
    }

    function unbindH() {
      dom.unbind(window, 'mousemove', setH);
      dom.unbind(window, 'mouseup', unbindH);
    }

    this.__saturation_field.appendChild(value_field);
    this.__selector.appendChild(this.__field_knob);
    this.__selector.appendChild(this.__saturation_field);
    this.__selector.appendChild(this.__hue_field);
    this.__hue_field.appendChild(this.__hue_knob);

    this.domElement.appendChild(this.__input);
    this.domElement.appendChild(this.__selector);

    this.updateDisplay();

    function setSV(e) {

      e.preventDefault();

      var w = dom.getWidth(_this.__saturation_field);
      var o = dom.getOffset(_this.__saturation_field);
      var s = (e.clientX - o.left + document.body.scrollLeft) / w;
      var v = 1 - (e.clientY - o.top + document.body.scrollTop) / w;

      if (v > 1) v = 1;
      else if (v < 0) v = 0;

      if (s > 1) s = 1;
      else if (s < 0) s = 0;

      _this.__color.v = v;
      _this.__color.s = s;

      _this.setValue(_this.__color.toOriginal());


      return false;

    }

    function setH(e) {

      e.preventDefault();

      var s = dom.getHeight(_this.__hue_field);
      var o = dom.getOffset(_this.__hue_field);
      var h = 1 - (e.clientY - o.top + document.body.scrollTop) / s;

      if (h > 1) h = 1;
      else if (h < 0) h = 0;

      _this.__color.h = h * 360;

      _this.setValue(_this.__color.toOriginal());

      return false;

    }

  };

  ColorController.superclass = Controller;

  common.extend(

      ColorController.prototype,
      Controller.prototype,

      {

        updateDisplay: function() {

          var i = interpret(this.getValue());

          if (i !== false) {

            var mismatch = false;

            // Check for mismatch on the interpreted value.

            common.each(Color.COMPONENTS, function(component) {
              if (!common.isUndefined(i[component]) &&
                  !common.isUndefined(this.__color.__state[component]) &&
                  i[component] !== this.__color.__state[component]) {
                mismatch = true;
                return {}; // break
              }
            }, this);

            // If nothing diverges, we keep our previous values
            // for statefulness, otherwise we recalculate fresh
            if (mismatch) {
              common.extend(this.__color.__state, i);
            }

          }

          common.extend(this.__temp.__state, this.__color.__state);

          this.__temp.a = 1;

          var flip = (this.__color.v < .5 || this.__color.s > .5) ? 255 : 0;
          var _flip = 255 - flip;

          common.extend(this.__field_knob.style, {
            marginLeft: 100 * this.__color.s - 7 + 'px',
            marginTop: 100 * (1 - this.__color.v) - 7 + 'px',
            backgroundColor: this.__temp.toString(),
            border: this.__field_knob_border + 'rgb(' + flip + ',' + flip + ',' + flip +')'
          });

          this.__hue_knob.style.marginTop = (1 - this.__color.h / 360) * 100 + 'px'

          this.__temp.s = 1;
          this.__temp.v = 1;

          linearGradient(this.__saturation_field, 'left', '#fff', this.__temp.toString());

          common.extend(this.__input.style, {
            backgroundColor: this.__input.value = this.__color.toString(),
            color: 'rgb(' + flip + ',' + flip + ',' + flip +')',
            textShadow: this.__input_textShadow + 'rgba(' + _flip + ',' + _flip + ',' + _flip +',.7)'
          });

        }

      }

  );
  
  var vendors = ['-moz-','-o-','-webkit-','-ms-',''];
  
  function linearGradient(elem, x, a, b) {
    elem.style.background = '';
    common.each(vendors, function(vendor) {
      elem.style.cssText += 'background: ' + vendor + 'linear-gradient('+x+', '+a+' 0%, ' + b + ' 100%); ';
    });
  }
  
  function hueGradient(elem) {
    elem.style.background = '';
    elem.style.cssText += 'background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);'
    elem.style.cssText += 'background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);'
    elem.style.cssText += 'background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);'
    elem.style.cssText += 'background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);'
    elem.style.cssText += 'background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);'
  }


  return ColorController;

})(dat.controllers.Controller,
dat.dom.dom,
dat.color.Color = (function (interpret, math, toString, common) {

  var Color = function() {

    this.__state = interpret.apply(this, arguments);

    if (this.__state === false) {
      throw 'Failed to interpret color arguments';
    }

    this.__state.a = this.__state.a || 1;


  };

  Color.COMPONENTS = ['r','g','b','h','s','v','hex','a'];

  common.extend(Color.prototype, {

    toString: function() {
      return toString(this);
    },

    toOriginal: function() {
      return this.__state.conversion.write(this);
    }

  });

  defineRGBComponent(Color.prototype, 'r', 2);
  defineRGBComponent(Color.prototype, 'g', 1);
  defineRGBComponent(Color.prototype, 'b', 0);

  defineHSVComponent(Color.prototype, 'h');
  defineHSVComponent(Color.prototype, 's');
  defineHSVComponent(Color.prototype, 'v');

  Object.defineProperty(Color.prototype, 'a', {

    get: function() {
      return this.__state.a;
    },

    set: function(v) {
      this.__state.a = v;
    }

  });

  Object.defineProperty(Color.prototype, 'hex', {

    get: function() {

      if (!this.__state.space !== 'HEX') {
        this.__state.hex = math.rgb_to_hex(this.r, this.g, this.b);
      }

      return this.__state.hex;

    },

    set: function(v) {

      this.__state.space = 'HEX';
      this.__state.hex = v;

    }

  });

  function defineRGBComponent(target, component, componentHexIndex) {

    Object.defineProperty(target, component, {

      get: function() {

        if (this.__state.space === 'RGB') {
          return this.__state[component];
        }

        recalculateRGB(this, component, componentHexIndex);

        return this.__state[component];

      },

      set: function(v) {

        if (this.__state.space !== 'RGB') {
          recalculateRGB(this, component, componentHexIndex);
          this.__state.space = 'RGB';
        }

        this.__state[component] = v;

      }

    });

  }

  function defineHSVComponent(target, component) {

    Object.defineProperty(target, component, {

      get: function() {

        if (this.__state.space === 'HSV')
          return this.__state[component];

        recalculateHSV(this);

        return this.__state[component];

      },

      set: function(v) {

        if (this.__state.space !== 'HSV') {
          recalculateHSV(this);
          this.__state.space = 'HSV';
        }

        this.__state[component] = v;

      }

    });

  }

  function recalculateRGB(color, component, componentHexIndex) {

    if (color.__state.space === 'HEX') {

      color.__state[component] = math.component_from_hex(color.__state.hex, componentHexIndex);

    } else if (color.__state.space === 'HSV') {

      common.extend(color.__state, math.hsv_to_rgb(color.__state.h, color.__state.s, color.__state.v));

    } else {

      throw 'Corrupted color state';

    }

  }

  function recalculateHSV(color) {

    var result = math.rgb_to_hsv(color.r, color.g, color.b);

    common.extend(color.__state,
        {
          s: result.s,
          v: result.v
        }
    );

    if (!common.isNaN(result.h)) {
      color.__state.h = result.h;
    } else if (common.isUndefined(color.__state.h)) {
      color.__state.h = 0;
    }

  }

  return Color;

})(dat.color.interpret,
dat.color.math = (function () {

  var tmpComponent;

  return {

    hsv_to_rgb: function(h, s, v) {

      var hi = Math.floor(h / 60) % 6;

      var f = h / 60 - Math.floor(h / 60);
      var p = v * (1.0 - s);
      var q = v * (1.0 - (f * s));
      var t = v * (1.0 - ((1.0 - f) * s));
      var c = [
        [v, t, p],
        [q, v, p],
        [p, v, t],
        [p, q, v],
        [t, p, v],
        [v, p, q]
      ][hi];

      return {
        r: c[0] * 255,
        g: c[1] * 255,
        b: c[2] * 255
      };

    },

    rgb_to_hsv: function(r, g, b) {

      var min = Math.min(r, g, b),
          max = Math.max(r, g, b),
          delta = max - min,
          h, s;

      if (max != 0) {
        s = delta / max;
      } else {
        return {
          h: NaN,
          s: 0,
          v: 0
        };
      }

      if (r == max) {
        h = (g - b) / delta;
      } else if (g == max) {
        h = 2 + (b - r) / delta;
      } else {
        h = 4 + (r - g) / delta;
      }
      h /= 6;
      if (h < 0) {
        h += 1;
      }

      return {
        h: h * 360,
        s: s,
        v: max / 255
      };
    },

    rgb_to_hex: function(r, g, b) {
      var hex = this.hex_with_component(0, 2, r);
      hex = this.hex_with_component(hex, 1, g);
      hex = this.hex_with_component(hex, 0, b);
      return hex;
    },

    component_from_hex: function(hex, componentIndex) {
      return (hex >> (componentIndex * 8)) & 0xFF;
    },

    hex_with_component: function(hex, componentIndex, value) {
      return value << (tmpComponent = componentIndex * 8) | (hex & ~ (0xFF << tmpComponent));
    }

  }

})(),
dat.color.toString,
dat.utils.common),
dat.color.interpret,
dat.utils.common),
dat.utils.requestAnimationFrame = (function () {

  /**
   * requirejs version of Paul Irish's RequestAnimationFrame
   * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
   */

  return window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(callback, element) {

        window.setTimeout(callback, 1000 / 60);

      };
})(),
dat.dom.CenteredDiv = (function (dom, common) {


  var CenteredDiv = function() {

    this.backgroundElement = document.createElement('div');
    common.extend(this.backgroundElement.style, {
      backgroundColor: 'rgba(0,0,0,0.8)',
      top: 0,
      left: 0,
      display: 'none',
      zIndex: '1000',
      opacity: 0,
      WebkitTransition: 'opacity 0.2s linear'
    });

    dom.makeFullscreen(this.backgroundElement);
    this.backgroundElement.style.position = 'fixed';

    this.domElement = document.createElement('div');
    common.extend(this.domElement.style, {
      position: 'fixed',
      display: 'none',
      zIndex: '1001',
      opacity: 0,
      WebkitTransition: '-webkit-transform 0.2s ease-out, opacity 0.2s linear'
    });


    document.body.appendChild(this.backgroundElement);
    document.body.appendChild(this.domElement);

    var _this = this;
    dom.bind(this.backgroundElement, 'click', function() {
      _this.hide();
    });


  };

  CenteredDiv.prototype.show = function() {

    var _this = this;
    


    this.backgroundElement.style.display = 'block';

    this.domElement.style.display = 'block';
    this.domElement.style.opacity = 0;
//    this.domElement.style.top = '52%';
    this.domElement.style.webkitTransform = 'scale(1.1)';

    this.layout();

    common.defer(function() {
      _this.backgroundElement.style.opacity = 1;
      _this.domElement.style.opacity = 1;
      _this.domElement.style.webkitTransform = 'scale(1)';
    });

  };

  CenteredDiv.prototype.hide = function() {

    var _this = this;

    var hide = function() {

      _this.domElement.style.display = 'none';
      _this.backgroundElement.style.display = 'none';

      dom.unbind(_this.domElement, 'webkitTransitionEnd', hide);
      dom.unbind(_this.domElement, 'transitionend', hide);
      dom.unbind(_this.domElement, 'oTransitionEnd', hide);

    };

    dom.bind(this.domElement, 'webkitTransitionEnd', hide);
    dom.bind(this.domElement, 'transitionend', hide);
    dom.bind(this.domElement, 'oTransitionEnd', hide);

    this.backgroundElement.style.opacity = 0;
//    this.domElement.style.top = '48%';
    this.domElement.style.opacity = 0;
    this.domElement.style.webkitTransform = 'scale(1.1)';

  };

  CenteredDiv.prototype.layout = function() {
    this.domElement.style.left = window.innerWidth/2 - dom.getWidth(this.domElement) / 2 + 'px';
    this.domElement.style.top = window.innerHeight/2 - dom.getHeight(this.domElement) / 2 + 'px';
  };
  
  function lockScroll(e) {
    console.log(e);
  }

  return CenteredDiv;

})(dat.dom.dom,
dat.utils.common),
dat.dom.dom,
dat.utils.common);

/***/ }),
/* 10 */
/***/ (function(module, exports) {

/**
 * dat-gui JavaScript Controller Library
 * http://code.google.com/p/dat-gui
 *
 * Copyright 2011 Data Arts Team, Google Creative Lab
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/** @namespace */
var dat = module.exports = dat || {};

/** @namespace */
dat.color = dat.color || {};

/** @namespace */
dat.utils = dat.utils || {};

dat.utils.common = (function () {
  
  var ARR_EACH = Array.prototype.forEach;
  var ARR_SLICE = Array.prototype.slice;

  /**
   * Band-aid methods for things that should be a lot easier in JavaScript.
   * Implementation and structure inspired by underscore.js
   * http://documentcloud.github.com/underscore/
   */

  return { 
    
    BREAK: {},
  
    extend: function(target) {
      
      this.each(ARR_SLICE.call(arguments, 1), function(obj) {
        
        for (var key in obj)
          if (!this.isUndefined(obj[key])) 
            target[key] = obj[key];
        
      }, this);
      
      return target;
      
    },
    
    defaults: function(target) {
      
      this.each(ARR_SLICE.call(arguments, 1), function(obj) {
        
        for (var key in obj)
          if (this.isUndefined(target[key])) 
            target[key] = obj[key];
        
      }, this);
      
      return target;
    
    },
    
    compose: function() {
      var toCall = ARR_SLICE.call(arguments);
            return function() {
              var args = ARR_SLICE.call(arguments);
              for (var i = toCall.length -1; i >= 0; i--) {
                args = [toCall[i].apply(this, args)];
              }
              return args[0];
            }
    },
    
    each: function(obj, itr, scope) {

      
      if (ARR_EACH && obj.forEach === ARR_EACH) { 
        
        obj.forEach(itr, scope);
        
      } else if (obj.length === obj.length + 0) { // Is number but not NaN
        
        for (var key = 0, l = obj.length; key < l; key++)
          if (key in obj && itr.call(scope, obj[key], key) === this.BREAK) 
            return;
            
      } else {

        for (var key in obj) 
          if (itr.call(scope, obj[key], key) === this.BREAK)
            return;
            
      }
            
    },
    
    defer: function(fnc) {
      setTimeout(fnc, 0);
    },
    
    toArray: function(obj) {
      if (obj.toArray) return obj.toArray();
      return ARR_SLICE.call(obj);
    },

    isUndefined: function(obj) {
      return obj === undefined;
    },
    
    isNull: function(obj) {
      return obj === null;
    },
    
    isNaN: function(obj) {
      return obj !== obj;
    },
    
    isArray: Array.isArray || function(obj) {
      return obj.constructor === Array;
    },
    
    isObject: function(obj) {
      return obj === Object(obj);
    },
    
    isNumber: function(obj) {
      return obj === obj+0;
    },
    
    isString: function(obj) {
      return obj === obj+'';
    },
    
    isBoolean: function(obj) {
      return obj === false || obj === true;
    },
    
    isFunction: function(obj) {
      return Object.prototype.toString.call(obj) === '[object Function]';
    }
  
  };
    
})();


dat.color.toString = (function (common) {

  return function(color) {

    if (color.a == 1 || common.isUndefined(color.a)) {

      var s = color.hex.toString(16);
      while (s.length < 6) {
        s = '0' + s;
      }

      return '#' + s;

    } else {

      return 'rgba(' + Math.round(color.r) + ',' + Math.round(color.g) + ',' + Math.round(color.b) + ',' + color.a + ')';

    }

  }

})(dat.utils.common);


dat.Color = dat.color.Color = (function (interpret, math, toString, common) {

  var Color = function() {

    this.__state = interpret.apply(this, arguments);

    if (this.__state === false) {
      throw 'Failed to interpret color arguments';
    }

    this.__state.a = this.__state.a || 1;


  };

  Color.COMPONENTS = ['r','g','b','h','s','v','hex','a'];

  common.extend(Color.prototype, {

    toString: function() {
      return toString(this);
    },

    toOriginal: function() {
      return this.__state.conversion.write(this);
    }

  });

  defineRGBComponent(Color.prototype, 'r', 2);
  defineRGBComponent(Color.prototype, 'g', 1);
  defineRGBComponent(Color.prototype, 'b', 0);

  defineHSVComponent(Color.prototype, 'h');
  defineHSVComponent(Color.prototype, 's');
  defineHSVComponent(Color.prototype, 'v');

  Object.defineProperty(Color.prototype, 'a', {

    get: function() {
      return this.__state.a;
    },

    set: function(v) {
      this.__state.a = v;
    }

  });

  Object.defineProperty(Color.prototype, 'hex', {

    get: function() {

      if (!this.__state.space !== 'HEX') {
        this.__state.hex = math.rgb_to_hex(this.r, this.g, this.b);
      }

      return this.__state.hex;

    },

    set: function(v) {

      this.__state.space = 'HEX';
      this.__state.hex = v;

    }

  });

  function defineRGBComponent(target, component, componentHexIndex) {

    Object.defineProperty(target, component, {

      get: function() {

        if (this.__state.space === 'RGB') {
          return this.__state[component];
        }

        recalculateRGB(this, component, componentHexIndex);

        return this.__state[component];

      },

      set: function(v) {

        if (this.__state.space !== 'RGB') {
          recalculateRGB(this, component, componentHexIndex);
          this.__state.space = 'RGB';
        }

        this.__state[component] = v;

      }

    });

  }

  function defineHSVComponent(target, component) {

    Object.defineProperty(target, component, {

      get: function() {

        if (this.__state.space === 'HSV')
          return this.__state[component];

        recalculateHSV(this);

        return this.__state[component];

      },

      set: function(v) {

        if (this.__state.space !== 'HSV') {
          recalculateHSV(this);
          this.__state.space = 'HSV';
        }

        this.__state[component] = v;

      }

    });

  }

  function recalculateRGB(color, component, componentHexIndex) {

    if (color.__state.space === 'HEX') {

      color.__state[component] = math.component_from_hex(color.__state.hex, componentHexIndex);

    } else if (color.__state.space === 'HSV') {

      common.extend(color.__state, math.hsv_to_rgb(color.__state.h, color.__state.s, color.__state.v));

    } else {

      throw 'Corrupted color state';

    }

  }

  function recalculateHSV(color) {

    var result = math.rgb_to_hsv(color.r, color.g, color.b);

    common.extend(color.__state,
        {
          s: result.s,
          v: result.v
        }
    );

    if (!common.isNaN(result.h)) {
      color.__state.h = result.h;
    } else if (common.isUndefined(color.__state.h)) {
      color.__state.h = 0;
    }

  }

  return Color;

})(dat.color.interpret = (function (toString, common) {

  var result, toReturn;

  var interpret = function() {

    toReturn = false;

    var original = arguments.length > 1 ? common.toArray(arguments) : arguments[0];

    common.each(INTERPRETATIONS, function(family) {

      if (family.litmus(original)) {

        common.each(family.conversions, function(conversion, conversionName) {

          result = conversion.read(original);

          if (toReturn === false && result !== false) {
            toReturn = result;
            result.conversionName = conversionName;
            result.conversion = conversion;
            return common.BREAK;

          }

        });

        return common.BREAK;

      }

    });

    return toReturn;

  };

  var INTERPRETATIONS = [

    // Strings
    {

      litmus: common.isString,

      conversions: {

        THREE_CHAR_HEX: {

          read: function(original) {

            var test = original.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);
            if (test === null) return false;

            return {
              space: 'HEX',
              hex: parseInt(
                  '0x' +
                      test[1].toString() + test[1].toString() +
                      test[2].toString() + test[2].toString() +
                      test[3].toString() + test[3].toString())
            };

          },

          write: toString

        },

        SIX_CHAR_HEX: {

          read: function(original) {

            var test = original.match(/^#([A-F0-9]{6})$/i);
            if (test === null) return false;

            return {
              space: 'HEX',
              hex: parseInt('0x' + test[1].toString())
            };

          },

          write: toString

        },

        CSS_RGB: {

          read: function(original) {

            var test = original.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
            if (test === null) return false;

            return {
              space: 'RGB',
              r: parseFloat(test[1]),
              g: parseFloat(test[2]),
              b: parseFloat(test[3])
            };

          },

          write: toString

        },

        CSS_RGBA: {

          read: function(original) {

            var test = original.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\,\s*(.+)\s*\)/);
            if (test === null) return false;

            return {
              space: 'RGB',
              r: parseFloat(test[1]),
              g: parseFloat(test[2]),
              b: parseFloat(test[3]),
              a: parseFloat(test[4])
            };

          },

          write: toString

        }

      }

    },

    // Numbers
    {

      litmus: common.isNumber,

      conversions: {

        HEX: {
          read: function(original) {
            return {
              space: 'HEX',
              hex: original,
              conversionName: 'HEX'
            }
          },

          write: function(color) {
            return color.hex;
          }
        }

      }

    },

    // Arrays
    {

      litmus: common.isArray,

      conversions: {

        RGB_ARRAY: {
          read: function(original) {
            if (original.length != 3) return false;
            return {
              space: 'RGB',
              r: original[0],
              g: original[1],
              b: original[2]
            };
          },

          write: function(color) {
            return [color.r, color.g, color.b];
          }

        },

        RGBA_ARRAY: {
          read: function(original) {
            if (original.length != 4) return false;
            return {
              space: 'RGB',
              r: original[0],
              g: original[1],
              b: original[2],
              a: original[3]
            };
          },

          write: function(color) {
            return [color.r, color.g, color.b, color.a];
          }

        }

      }

    },

    // Objects
    {

      litmus: common.isObject,

      conversions: {

        RGBA_OBJ: {
          read: function(original) {
            if (common.isNumber(original.r) &&
                common.isNumber(original.g) &&
                common.isNumber(original.b) &&
                common.isNumber(original.a)) {
              return {
                space: 'RGB',
                r: original.r,
                g: original.g,
                b: original.b,
                a: original.a
              }
            }
            return false;
          },

          write: function(color) {
            return {
              r: color.r,
              g: color.g,
              b: color.b,
              a: color.a
            }
          }
        },

        RGB_OBJ: {
          read: function(original) {
            if (common.isNumber(original.r) &&
                common.isNumber(original.g) &&
                common.isNumber(original.b)) {
              return {
                space: 'RGB',
                r: original.r,
                g: original.g,
                b: original.b
              }
            }
            return false;
          },

          write: function(color) {
            return {
              r: color.r,
              g: color.g,
              b: color.b
            }
          }
        },

        HSVA_OBJ: {
          read: function(original) {
            if (common.isNumber(original.h) &&
                common.isNumber(original.s) &&
                common.isNumber(original.v) &&
                common.isNumber(original.a)) {
              return {
                space: 'HSV',
                h: original.h,
                s: original.s,
                v: original.v,
                a: original.a
              }
            }
            return false;
          },

          write: function(color) {
            return {
              h: color.h,
              s: color.s,
              v: color.v,
              a: color.a
            }
          }
        },

        HSV_OBJ: {
          read: function(original) {
            if (common.isNumber(original.h) &&
                common.isNumber(original.s) &&
                common.isNumber(original.v)) {
              return {
                space: 'HSV',
                h: original.h,
                s: original.s,
                v: original.v
              }
            }
            return false;
          },

          write: function(color) {
            return {
              h: color.h,
              s: color.s,
              v: color.v
            }
          }

        }

      }

    }


  ];

  return interpret;


})(dat.color.toString,
dat.utils.common),
dat.color.math = (function () {

  var tmpComponent;

  return {

    hsv_to_rgb: function(h, s, v) {

      var hi = Math.floor(h / 60) % 6;

      var f = h / 60 - Math.floor(h / 60);
      var p = v * (1.0 - s);
      var q = v * (1.0 - (f * s));
      var t = v * (1.0 - ((1.0 - f) * s));
      var c = [
        [v, t, p],
        [q, v, p],
        [p, v, t],
        [p, q, v],
        [t, p, v],
        [v, p, q]
      ][hi];

      return {
        r: c[0] * 255,
        g: c[1] * 255,
        b: c[2] * 255
      };

    },

    rgb_to_hsv: function(r, g, b) {

      var min = Math.min(r, g, b),
          max = Math.max(r, g, b),
          delta = max - min,
          h, s;

      if (max != 0) {
        s = delta / max;
      } else {
        return {
          h: NaN,
          s: 0,
          v: 0
        };
      }

      if (r == max) {
        h = (g - b) / delta;
      } else if (g == max) {
        h = 2 + (b - r) / delta;
      } else {
        h = 4 + (r - g) / delta;
      }
      h /= 6;
      if (h < 0) {
        h += 1;
      }

      return {
        h: h * 360,
        s: s,
        v: max / 255
      };
    },

    rgb_to_hex: function(r, g, b) {
      var hex = this.hex_with_component(0, 2, r);
      hex = this.hex_with_component(hex, 1, g);
      hex = this.hex_with_component(hex, 0, b);
      return hex;
    },

    component_from_hex: function(hex, componentIndex) {
      return (hex >> (componentIndex * 8)) & 0xFF;
    },

    hex_with_component: function(hex, componentIndex, value) {
      return value << (tmpComponent = componentIndex * 8) | (hex & ~ (0xFF << tmpComponent));
    }

  }

})(),
dat.color.toString,
dat.utils.common);

/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = main;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(6);


function main(TerrainDemo, workers) {
  const canvas = document.getElementById('canvas');
  canvas.addEventListener("webglcontextlost", function(e) {
    alert('WebGL context lost. You will need to reload the page.'); e.preventDefault();
  }, false);

  const params = {
    showBoundingBoxes: false,
    traverseMainThread: false,
  };

  const terrainDemoModule = new TerrainDemo({
    canvas,
    arguments: [window.innerWidth.toString(), window.innerHeight.toString()],
    onRuntimeInitialized() {
      Object(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* setCanvasToWindowSize */])(terrainDemoModule);
      moduleBindings.updateShowBoundingBoxes(params.showBoundingBoxes);
      moduleBindings.updateTraverseMainThread(params.traverseMainThread);
    },
    getWorkerURL(moduleName) {
      return workers[moduleName];
    },
  });

  const moduleBindings = {
    updateShowBoundingBoxes: terrainDemoModule.cwrap('updateShowBoundingBoxes', 'number', ['number']),
    updateTraverseMainThread: terrainDemoModule.cwrap('updateTraverseMainThread', 'number', ['number']),
  };

  const gui = Object(__WEBPACK_IMPORTED_MODULE_0__utils__["a" /* createStatsAndGUI */])();
  gui.add(params, 'showBoundingBoxes').onChange(moduleBindings.updateShowBoundingBoxes);
  gui.add(params, 'traverseMainThread').onChange(moduleBindings.updateTraverseMainThread);

}


/***/ }),
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_examples_terrainDemoCPU__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_examples_terrainDemoCPU___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_examples_terrainDemoCPU__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__main__ = __webpack_require__(11);



Object(__WEBPACK_IMPORTED_MODULE_1__main__["a" /* main */])(__WEBPACK_IMPORTED_MODULE_0_examples_terrainDemoCPU___default.a, {
  TerrainGenerator: __webpack_require__(19),
});


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process, setImmediate) {var Module = function(Module) {
  Module = Module || {};

var Module=typeof Module!=="undefined"?Module:{};var moduleOverrides={};var key;for(key in Module){if(Module.hasOwnProperty(key)){moduleOverrides[key]=Module[key]}}Module["arguments"]=[];Module["thisProgram"]="./this.program";Module["quit"]=(function(status,toThrow){throw toThrow});Module["preRun"]=[];Module["postRun"]=[];var ENVIRONMENT_IS_WEB=false;var ENVIRONMENT_IS_WORKER=false;var ENVIRONMENT_IS_NODE=false;var ENVIRONMENT_IS_SHELL=false;if(Module["ENVIRONMENT"]){if(Module["ENVIRONMENT"]==="WEB"){ENVIRONMENT_IS_WEB=true}else if(Module["ENVIRONMENT"]==="WORKER"){ENVIRONMENT_IS_WORKER=true}else if(Module["ENVIRONMENT"]==="NODE"){ENVIRONMENT_IS_NODE=true}else if(Module["ENVIRONMENT"]==="SHELL"){ENVIRONMENT_IS_SHELL=true}else{throw new Error("Module['ENVIRONMENT'] value is not valid. must be one of: WEB|WORKER|NODE|SHELL.")}}else{ENVIRONMENT_IS_WEB=typeof window==="object";ENVIRONMENT_IS_WORKER=typeof importScripts==="function";ENVIRONMENT_IS_NODE=typeof process==="object"&&"function"==="function"&&!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_WORKER;ENVIRONMENT_IS_SHELL=!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_NODE&&!ENVIRONMENT_IS_WORKER}if(ENVIRONMENT_IS_NODE){var nodeFS;var nodePath;Module["read"]=function shell_read(filename,binary){var ret;if(!nodeFS)nodeFS=__webpack_require__(4);if(!nodePath)nodePath=__webpack_require__(5);filename=nodePath["normalize"](filename);ret=nodeFS["readFileSync"](filename);return binary?ret:ret.toString()};Module["readBinary"]=function readBinary(filename){var ret=Module["read"](filename,true);if(!ret.buffer){ret=new Uint8Array(ret)}assert(ret.buffer);return ret};if(process["argv"].length>1){Module["thisProgram"]=process["argv"][1].replace(/\\/g,"/")}Module["arguments"]=process["argv"].slice(2);process["on"]("uncaughtException",(function(ex){if(!(ex instanceof ExitStatus)){throw ex}}));process["on"]("unhandledRejection",(function(reason,p){process["exit"](1)}));Module["inspect"]=(function(){return"[Emscripten Module object]"})}else if(ENVIRONMENT_IS_SHELL){if(typeof read!="undefined"){Module["read"]=function shell_read(f){return read(f)}}Module["readBinary"]=function readBinary(f){var data;if(typeof readbuffer==="function"){return new Uint8Array(readbuffer(f))}data=read(f,"binary");assert(typeof data==="object");return data};if(typeof scriptArgs!="undefined"){Module["arguments"]=scriptArgs}else if(typeof arguments!="undefined"){Module["arguments"]=arguments}if(typeof quit==="function"){Module["quit"]=(function(status,toThrow){quit(status)})}}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){Module["read"]=function shell_read(url){var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.send(null);return xhr.responseText};if(ENVIRONMENT_IS_WORKER){Module["readBinary"]=function readBinary(url){var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.responseType="arraybuffer";xhr.send(null);return new Uint8Array(xhr.response)}}Module["readAsync"]=function readAsync(url,onload,onerror){var xhr=new XMLHttpRequest;xhr.open("GET",url,true);xhr.responseType="arraybuffer";xhr.onload=function xhr_onload(){if(xhr.status==200||xhr.status==0&&xhr.response){onload(xhr.response);return}onerror()};xhr.onerror=onerror;xhr.send(null)};if(typeof arguments!="undefined"){Module["arguments"]=arguments}Module["setWindowTitle"]=(function(title){document.title=title})}Module["print"]=typeof console!=="undefined"?console.log.bind(console):typeof print!=="undefined"?print:null;Module["printErr"]=typeof printErr!=="undefined"?printErr:typeof console!=="undefined"&&console.warn.bind(console)||Module["print"];Module.print=Module["print"];Module.printErr=Module["printErr"];for(key in moduleOverrides){if(moduleOverrides.hasOwnProperty(key)){Module[key]=moduleOverrides[key]}}moduleOverrides=undefined;var STACK_ALIGN=16;function staticAlloc(size){assert(!staticSealed);var ret=STATICTOP;STATICTOP=STATICTOP+size+15&-16;return ret}function dynamicAlloc(size){assert(DYNAMICTOP_PTR);var ret=HEAP32[DYNAMICTOP_PTR>>2];var end=ret+size+15&-16;HEAP32[DYNAMICTOP_PTR>>2]=end;if(end>=TOTAL_MEMORY){var success=enlargeMemory();if(!success){HEAP32[DYNAMICTOP_PTR>>2]=ret;return 0}}return ret}function alignMemory(size,factor){if(!factor)factor=STACK_ALIGN;var ret=size=Math.ceil(size/factor)*factor;return ret}function getNativeTypeSize(type){switch(type){case"i1":case"i8":return 1;case"i16":return 2;case"i32":return 4;case"i64":return 8;case"float":return 4;case"double":return 8;default:{if(type[type.length-1]==="*"){return 4}else if(type[0]==="i"){var bits=parseInt(type.substr(1));assert(bits%8===0);return bits/8}else{return 0}}}}function warnOnce(text){if(!warnOnce.shown)warnOnce.shown={};if(!warnOnce.shown[text]){warnOnce.shown[text]=1;Module.printErr(text)}}var jsCallStartIndex=1;var functionPointers=new Array(0);var funcWrappers={};function getFuncWrapper(func,sig){if(!func)return;assert(sig);if(!funcWrappers[sig]){funcWrappers[sig]={}}var sigCache=funcWrappers[sig];if(!sigCache[func]){if(sig.length===1){sigCache[func]=function dynCall_wrapper(){return dynCall(sig,func)}}else if(sig.length===2){sigCache[func]=function dynCall_wrapper(arg){return dynCall(sig,func,[arg])}}else{sigCache[func]=function dynCall_wrapper(){return dynCall(sig,func,Array.prototype.slice.call(arguments))}}}return sigCache[func]}function dynCall(sig,ptr,args){if(args&&args.length){return Module["dynCall_"+sig].apply(null,[ptr].concat(args))}else{return Module["dynCall_"+sig].call(null,ptr)}}var GLOBAL_BASE=8;var ABORT=0;var EXITSTATUS=0;function assert(condition,text){if(!condition){abort("Assertion failed: "+text)}}function getCFunc(ident){var func=Module["_"+ident];assert(func,"Cannot call unknown function "+ident+", make sure it is exported");return func}var JSfuncs={"stackSave":(function(){stackSave()}),"stackRestore":(function(){stackRestore()}),"arrayToC":(function(arr){var ret=stackAlloc(arr.length);writeArrayToMemory(arr,ret);return ret}),"stringToC":(function(str){var ret=0;if(str!==null&&str!==undefined&&str!==0){var len=(str.length<<2)+1;ret=stackAlloc(len);stringToUTF8(str,ret,len)}return ret})};var toC={"string":JSfuncs["stringToC"],"array":JSfuncs["arrayToC"]};function ccall(ident,returnType,argTypes,args,opts){var func=getCFunc(ident);var cArgs=[];var stack=0;if(args){for(var i=0;i<args.length;i++){var converter=toC[argTypes[i]];if(converter){if(stack===0)stack=stackSave();cArgs[i]=converter(args[i])}else{cArgs[i]=args[i]}}}var ret=func.apply(null,cArgs);if(returnType==="string")ret=Pointer_stringify(ret);if(stack!==0){stackRestore(stack)}return ret}function cwrap(ident,returnType,argTypes){argTypes=argTypes||[];var cfunc=getCFunc(ident);var numericArgs=argTypes.every((function(type){return type==="number"}));var numericRet=returnType!=="string";if(numericRet&&numericArgs){return cfunc}return(function(){return ccall(ident,returnType,argTypes,arguments)})}function setValue(ptr,value,type,noSafe){type=type||"i8";if(type.charAt(type.length-1)==="*")type="i32";switch(type){case"i1":HEAP8[ptr>>0]=value;break;case"i8":HEAP8[ptr>>0]=value;break;case"i16":HEAP16[ptr>>1]=value;break;case"i32":HEAP32[ptr>>2]=value;break;case"i64":tempI64=[value>>>0,(tempDouble=value,+Math_abs(tempDouble)>=+1?tempDouble>+0?(Math_min(+Math_floor(tempDouble/+4294967296),+4294967295)|0)>>>0:~~+Math_ceil((tempDouble- +(~~tempDouble>>>0))/+4294967296)>>>0:0)],HEAP32[ptr>>2]=tempI64[0],HEAP32[ptr+4>>2]=tempI64[1];break;case"float":HEAPF32[ptr>>2]=value;break;case"double":HEAPF64[ptr>>3]=value;break;default:abort("invalid type for setValue: "+type)}}var ALLOC_NORMAL=0;var ALLOC_STATIC=2;var ALLOC_NONE=4;function allocate(slab,types,allocator,ptr){var zeroinit,size;if(typeof slab==="number"){zeroinit=true;size=slab}else{zeroinit=false;size=slab.length}var singleType=typeof types==="string"?types:null;var ret;if(allocator==ALLOC_NONE){ret=ptr}else{ret=[typeof _malloc==="function"?_malloc:staticAlloc,stackAlloc,staticAlloc,dynamicAlloc][allocator===undefined?ALLOC_STATIC:allocator](Math.max(size,singleType?1:types.length))}if(zeroinit){var stop;ptr=ret;assert((ret&3)==0);stop=ret+(size&~3);for(;ptr<stop;ptr+=4){HEAP32[ptr>>2]=0}stop=ret+size;while(ptr<stop){HEAP8[ptr++>>0]=0}return ret}if(singleType==="i8"){if(slab.subarray||slab.slice){HEAPU8.set(slab,ret)}else{HEAPU8.set(new Uint8Array(slab),ret)}return ret}var i=0,type,typeSize,previousType;while(i<size){var curr=slab[i];type=singleType||types[i];if(type===0){i++;continue}if(type=="i64")type="i32";setValue(ret+i,curr,type);if(previousType!==type){typeSize=getNativeTypeSize(type);previousType=type}i+=typeSize}return ret}function Pointer_stringify(ptr,length){if(length===0||!ptr)return"";var hasUtf=0;var t;var i=0;while(1){t=HEAPU8[ptr+i>>0];hasUtf|=t;if(t==0&&!length)break;i++;if(length&&i==length)break}if(!length)length=i;var ret="";if(hasUtf<128){var MAX_CHUNK=1024;var curr;while(length>0){curr=String.fromCharCode.apply(String,HEAPU8.subarray(ptr,ptr+Math.min(length,MAX_CHUNK)));ret=ret?ret+curr:curr;ptr+=MAX_CHUNK;length-=MAX_CHUNK}return ret}return UTF8ToString(ptr)}var UTF8Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf8"):undefined;function UTF8ArrayToString(u8Array,idx){var endPtr=idx;while(u8Array[endPtr])++endPtr;if(endPtr-idx>16&&u8Array.subarray&&UTF8Decoder){return UTF8Decoder.decode(u8Array.subarray(idx,endPtr))}else{var u0,u1,u2,u3,u4,u5;var str="";while(1){u0=u8Array[idx++];if(!u0)return str;if(!(u0&128)){str+=String.fromCharCode(u0);continue}u1=u8Array[idx++]&63;if((u0&224)==192){str+=String.fromCharCode((u0&31)<<6|u1);continue}u2=u8Array[idx++]&63;if((u0&240)==224){u0=(u0&15)<<12|u1<<6|u2}else{u3=u8Array[idx++]&63;if((u0&248)==240){u0=(u0&7)<<18|u1<<12|u2<<6|u3}else{u4=u8Array[idx++]&63;if((u0&252)==248){u0=(u0&3)<<24|u1<<18|u2<<12|u3<<6|u4}else{u5=u8Array[idx++]&63;u0=(u0&1)<<30|u1<<24|u2<<18|u3<<12|u4<<6|u5}}}if(u0<65536){str+=String.fromCharCode(u0)}else{var ch=u0-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}}}}function UTF8ToString(ptr){return UTF8ArrayToString(HEAPU8,ptr)}function stringToUTF8Array(str,outU8Array,outIdx,maxBytesToWrite){if(!(maxBytesToWrite>0))return 0;var startIdx=outIdx;var endIdx=outIdx+maxBytesToWrite-1;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343)u=65536+((u&1023)<<10)|str.charCodeAt(++i)&1023;if(u<=127){if(outIdx>=endIdx)break;outU8Array[outIdx++]=u}else if(u<=2047){if(outIdx+1>=endIdx)break;outU8Array[outIdx++]=192|u>>6;outU8Array[outIdx++]=128|u&63}else if(u<=65535){if(outIdx+2>=endIdx)break;outU8Array[outIdx++]=224|u>>12;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else if(u<=2097151){if(outIdx+3>=endIdx)break;outU8Array[outIdx++]=240|u>>18;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else if(u<=67108863){if(outIdx+4>=endIdx)break;outU8Array[outIdx++]=248|u>>24;outU8Array[outIdx++]=128|u>>18&63;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else{if(outIdx+5>=endIdx)break;outU8Array[outIdx++]=252|u>>30;outU8Array[outIdx++]=128|u>>24&63;outU8Array[outIdx++]=128|u>>18&63;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}}outU8Array[outIdx]=0;return outIdx-startIdx}function stringToUTF8(str,outPtr,maxBytesToWrite){return stringToUTF8Array(str,HEAPU8,outPtr,maxBytesToWrite)}function lengthBytesUTF8(str){var len=0;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343)u=65536+((u&1023)<<10)|str.charCodeAt(++i)&1023;if(u<=127){++len}else if(u<=2047){len+=2}else if(u<=65535){len+=3}else if(u<=2097151){len+=4}else if(u<=67108863){len+=5}else{len+=6}}return len}var UTF16Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf-16le"):undefined;function allocateUTF8OnStack(str){var size=lengthBytesUTF8(str)+1;var ret=stackAlloc(size);stringToUTF8Array(str,HEAP8,ret,size);return ret}function demangle(func){return func}function demangleAll(text){var regex=/__Z[\w\d_]+/g;return text.replace(regex,(function(x){var y=demangle(x);return x===y?x:x+" ["+y+"]"}))}function jsStackTrace(){var err=new Error;if(!err.stack){try{throw new Error(0)}catch(e){err=e}if(!err.stack){return"(no stack trace available)"}}return err.stack.toString()}var WASM_PAGE_SIZE=65536;var ASMJS_PAGE_SIZE=16777216;var MIN_TOTAL_MEMORY=16777216;function alignUp(x,multiple){if(x%multiple>0){x+=multiple-x%multiple}return x}var buffer,HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAPF64;function updateGlobalBuffer(buf){Module["buffer"]=buffer=buf}function updateGlobalBufferViews(){Module["HEAP8"]=HEAP8=new Int8Array(buffer);Module["HEAP16"]=HEAP16=new Int16Array(buffer);Module["HEAP32"]=HEAP32=new Int32Array(buffer);Module["HEAPU8"]=HEAPU8=new Uint8Array(buffer);Module["HEAPU16"]=HEAPU16=new Uint16Array(buffer);Module["HEAPU32"]=HEAPU32=new Uint32Array(buffer);Module["HEAPF32"]=HEAPF32=new Float32Array(buffer);Module["HEAPF64"]=HEAPF64=new Float64Array(buffer)}var STATIC_BASE,STATICTOP,staticSealed;var STACK_BASE,STACKTOP,STACK_MAX;var DYNAMIC_BASE,DYNAMICTOP_PTR;STATIC_BASE=STATICTOP=STACK_BASE=STACKTOP=STACK_MAX=DYNAMIC_BASE=DYNAMICTOP_PTR=0;staticSealed=false;function abortOnCannotGrowMemory(){abort("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value "+TOTAL_MEMORY+", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or (4) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ")}if(!Module["reallocBuffer"])Module["reallocBuffer"]=(function(size){var ret;try{if(ArrayBuffer.transfer){ret=ArrayBuffer.transfer(buffer,size)}else{var oldHEAP8=HEAP8;ret=new ArrayBuffer(size);var temp=new Int8Array(ret);temp.set(oldHEAP8)}}catch(e){return false}var success=_emscripten_replace_memory(ret);if(!success)return false;return ret});function enlargeMemory(){var PAGE_MULTIPLE=Module["usingWasm"]?WASM_PAGE_SIZE:ASMJS_PAGE_SIZE;var LIMIT=2147483648-PAGE_MULTIPLE;if(HEAP32[DYNAMICTOP_PTR>>2]>LIMIT){return false}var OLD_TOTAL_MEMORY=TOTAL_MEMORY;TOTAL_MEMORY=Math.max(TOTAL_MEMORY,MIN_TOTAL_MEMORY);while(TOTAL_MEMORY<HEAP32[DYNAMICTOP_PTR>>2]){if(TOTAL_MEMORY<=536870912){TOTAL_MEMORY=alignUp(2*TOTAL_MEMORY,PAGE_MULTIPLE)}else{TOTAL_MEMORY=Math.min(alignUp((3*TOTAL_MEMORY+2147483648)/4,PAGE_MULTIPLE),LIMIT)}}var replacement=Module["reallocBuffer"](TOTAL_MEMORY);if(!replacement||replacement.byteLength!=TOTAL_MEMORY){TOTAL_MEMORY=OLD_TOTAL_MEMORY;return false}updateGlobalBuffer(replacement);updateGlobalBufferViews();return true}var byteLength;try{byteLength=Function.prototype.call.bind(Object.getOwnPropertyDescriptor(ArrayBuffer.prototype,"byteLength").get);byteLength(new ArrayBuffer(4))}catch(e){byteLength=(function(buffer){return buffer.byteLength})}var TOTAL_STACK=Module["TOTAL_STACK"]||5242880;var TOTAL_MEMORY=Module["TOTAL_MEMORY"]||16777216;if(TOTAL_MEMORY<TOTAL_STACK)Module.printErr("TOTAL_MEMORY should be larger than TOTAL_STACK, was "+TOTAL_MEMORY+"! (TOTAL_STACK="+TOTAL_STACK+")");if(Module["buffer"]){buffer=Module["buffer"]}else{{buffer=new ArrayBuffer(TOTAL_MEMORY)}Module["buffer"]=buffer}updateGlobalBufferViews();function getTotalMemory(){return TOTAL_MEMORY}HEAP32[0]=1668509029;HEAP16[1]=25459;if(HEAPU8[2]!==115||HEAPU8[3]!==99)throw"Runtime error: expected the system to be little-endian!";function callRuntimeCallbacks(callbacks){while(callbacks.length>0){var callback=callbacks.shift();if(typeof callback=="function"){callback();continue}var func=callback.func;if(typeof func==="number"){if(callback.arg===undefined){Module["dynCall_v"](func)}else{Module["dynCall_vi"](func,callback.arg)}}else{func(callback.arg===undefined?null:callback.arg)}}}var __ATPRERUN__=[];var __ATINIT__=[];var __ATMAIN__=[];var __ATEXIT__=[];var __ATPOSTRUN__=[];var runtimeInitialized=false;var runtimeExited=false;function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift())}}callRuntimeCallbacks(__ATPRERUN__)}function ensureInitRuntime(){if(runtimeInitialized)return;runtimeInitialized=true;callRuntimeCallbacks(__ATINIT__)}function preMain(){callRuntimeCallbacks(__ATMAIN__)}function exitRuntime(){callRuntimeCallbacks(__ATEXIT__);runtimeExited=true}function postRun(){if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift())}}callRuntimeCallbacks(__ATPOSTRUN__)}function addOnPreRun(cb){__ATPRERUN__.unshift(cb)}function addOnPostRun(cb){__ATPOSTRUN__.unshift(cb)}function writeArrayToMemory(array,buffer){HEAP8.set(array,buffer)}function writeAsciiToMemory(str,buffer,dontAddNull){for(var i=0;i<str.length;++i){HEAP8[buffer++>>0]=str.charCodeAt(i)}if(!dontAddNull)HEAP8[buffer>>0]=0}var Math_abs=Math.abs;var Math_cos=Math.cos;var Math_sin=Math.sin;var Math_tan=Math.tan;var Math_acos=Math.acos;var Math_asin=Math.asin;var Math_atan=Math.atan;var Math_atan2=Math.atan2;var Math_exp=Math.exp;var Math_log=Math.log;var Math_sqrt=Math.sqrt;var Math_ceil=Math.ceil;var Math_floor=Math.floor;var Math_pow=Math.pow;var Math_imul=Math.imul;var Math_fround=Math.fround;var Math_round=Math.round;var Math_min=Math.min;var Math_max=Math.max;var Math_clz32=Math.clz32;var Math_trunc=Math.trunc;var runDependencies=0;var runDependencyWatcher=null;var dependenciesFulfilled=null;function getUniqueRunDependency(id){return id}function addRunDependency(id){runDependencies++;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}}function removeRunDependency(id){runDependencies--;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}if(runDependencies==0){if(runDependencyWatcher!==null){clearInterval(runDependencyWatcher);runDependencyWatcher=null}if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback()}}}Module["preloadedImages"]={};Module["preloadedAudios"]={};var memoryInitializer=null;var dataURIPrefix="data:application/octet-stream;base64,";function isDataURI(filename){return String.prototype.startsWith?filename.startsWith(dataURIPrefix):filename.indexOf(dataURIPrefix)===0}var ASM_CONSTS=[(function(){Module.canvas.addEventListener("contextmenu",(function(e){e.preventDefault()}),false)}),(function($0,$1){Module.stringToUTF8(Module.getWorkerURL(Module.UTF8ToString($0)),$1,100)})];function _emscripten_asm_const_i(code){return ASM_CONSTS[code]()}function _emscripten_asm_const_iii(code,a0,a1){return ASM_CONSTS[code](a0,a1)}STATIC_BASE=GLOBAL_BASE;STATICTOP=STATIC_BASE+12544;__ATINIT__.push({func:(function(){__GLOBAL__sub_I_main_cpp()})},{func:(function(){__GLOBAL__sub_I_WireProgram_cc()})},{func:(function(){__GLOBAL__sub_I_TerrainTileContent_cc()})});memoryInitializer="terrainDemoCPU.js.mem";var tempDoublePtr=STATICTOP;STATICTOP+=16;function __ZN16TerrainGenerator23UpdateShowBoundingBoxesEPviS0_(){Module["printErr"]("missing function: _ZN16TerrainGenerator23UpdateShowBoundingBoxesEPviS0_");abort(-1)}function __ZN16TerrainGenerator6UpdateEPviS0_(){Module["printErr"]("missing function: _ZN16TerrainGenerator6UpdateEPviS0_");abort(-1)}function ___cxa_allocate_exception(size){return _malloc(size)}function __ZSt18uncaught_exceptionv(){return!!__ZSt18uncaught_exceptionv.uncaught_exception}var EXCEPTIONS={last:0,caught:[],infos:{},deAdjust:(function(adjusted){if(!adjusted||EXCEPTIONS.infos[adjusted])return adjusted;for(var ptr in EXCEPTIONS.infos){var info=EXCEPTIONS.infos[ptr];if(info.adjusted===adjusted){return ptr}}return adjusted}),addRef:(function(ptr){if(!ptr)return;var info=EXCEPTIONS.infos[ptr];info.refcount++}),decRef:(function(ptr){if(!ptr)return;var info=EXCEPTIONS.infos[ptr];assert(info.refcount>0);info.refcount--;if(info.refcount===0&&!info.rethrown){if(info.destructor){Module["dynCall_vi"](info.destructor,ptr)}delete EXCEPTIONS.infos[ptr];___cxa_free_exception(ptr)}}),clearRef:(function(ptr){if(!ptr)return;var info=EXCEPTIONS.infos[ptr];info.refcount=0})};function ___cxa_begin_catch(ptr){var info=EXCEPTIONS.infos[ptr];if(info&&!info.caught){info.caught=true;__ZSt18uncaught_exceptionv.uncaught_exception--}if(info)info.rethrown=false;EXCEPTIONS.caught.push(ptr);EXCEPTIONS.addRef(EXCEPTIONS.deAdjust(ptr));return ptr}function ___cxa_pure_virtual(){ABORT=true;throw"Pure virtual function called!"}function ___resumeException(ptr){if(!EXCEPTIONS.last){EXCEPTIONS.last=ptr}throw ptr+" - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch."}function ___cxa_find_matching_catch(){var thrown=EXCEPTIONS.last;if(!thrown){return(setTempRet0(0),0)|0}var info=EXCEPTIONS.infos[thrown];var throwntype=info.type;if(!throwntype){return(setTempRet0(0),thrown)|0}var typeArray=Array.prototype.slice.call(arguments);var pointer=Module["___cxa_is_pointer_type"](throwntype);if(!___cxa_find_matching_catch.buffer)___cxa_find_matching_catch.buffer=_malloc(4);HEAP32[___cxa_find_matching_catch.buffer>>2]=thrown;thrown=___cxa_find_matching_catch.buffer;for(var i=0;i<typeArray.length;i++){if(typeArray[i]&&Module["___cxa_can_catch"](typeArray[i],throwntype,thrown)){thrown=HEAP32[thrown>>2];info.adjusted=thrown;return(setTempRet0(typeArray[i]),thrown)|0}}thrown=HEAP32[thrown>>2];return(setTempRet0(throwntype),thrown)|0}function ___cxa_throw(ptr,type,destructor){EXCEPTIONS.infos[ptr]={ptr:ptr,adjusted:ptr,type:type,destructor:destructor,refcount:0,caught:false,rethrown:false};EXCEPTIONS.last=ptr;if(!("uncaught_exception"in __ZSt18uncaught_exceptionv)){__ZSt18uncaught_exceptionv.uncaught_exception=1}else{__ZSt18uncaught_exceptionv.uncaught_exception++}throw ptr+" - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch."}function ___gxx_personality_v0(){}var SYSCALLS={varargs:0,get:(function(varargs){SYSCALLS.varargs+=4;var ret=HEAP32[SYSCALLS.varargs-4>>2];return ret}),getStr:(function(){var ret=Pointer_stringify(SYSCALLS.get());return ret}),get64:(function(){var low=SYSCALLS.get(),high=SYSCALLS.get();if(low>=0)assert(high===0);else assert(high===-1);return low}),getZero:(function(){assert(SYSCALLS.get()===0)})};function ___syscall140(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(),offset_high=SYSCALLS.get(),offset_low=SYSCALLS.get(),result=SYSCALLS.get(),whence=SYSCALLS.get();var offset=offset_low;FS.llseek(stream,offset,whence);HEAP32[result>>2]=stream.position;if(stream.getdents&&offset===0&&whence===0)stream.getdents=null;return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function flush_NO_FILESYSTEM(){var fflush=Module["_fflush"];if(fflush)fflush(0);var printChar=___syscall146.printChar;if(!printChar)return;var buffers=___syscall146.buffers;if(buffers[1].length)printChar(1,10);if(buffers[2].length)printChar(2,10)}function ___syscall146(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.get(),iov=SYSCALLS.get(),iovcnt=SYSCALLS.get();var ret=0;if(!___syscall146.buffers){___syscall146.buffers=[null,[],[]];___syscall146.printChar=(function(stream,curr){var buffer=___syscall146.buffers[stream];assert(buffer);if(curr===0||curr===10){(stream===1?Module["print"]:Module["printErr"])(UTF8ArrayToString(buffer,0));buffer.length=0}else{buffer.push(curr)}})}for(var i=0;i<iovcnt;i++){var ptr=HEAP32[iov+i*8>>2];var len=HEAP32[iov+(i*8+4)>>2];for(var j=0;j<len;j++){___syscall146.printChar(stream,HEAPU8[ptr+j])}ret+=len}return ret}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function ___syscall6(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD();FS.close(stream);return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}var cttz_i8=allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0],"i8",ALLOC_STATIC);function _abort(){Module["abort"]()}function _emscripten_get_now(){abort()}function _emscripten_get_now_is_monotonic(){return ENVIRONMENT_IS_NODE||typeof dateNow!=="undefined"||(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER)&&self["performance"]&&self["performance"]["now"]}var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};function ___setErrNo(value){if(Module["___errno_location"])HEAP32[Module["___errno_location"]()>>2]=value;return value}function _clock_gettime(clk_id,tp){var now;if(clk_id===0){now=Date.now()}else if(clk_id===1&&_emscripten_get_now_is_monotonic()){now=_emscripten_get_now()}else{___setErrNo(ERRNO_CODES.EINVAL);return-1}HEAP32[tp>>2]=now/1e3|0;HEAP32[tp+4>>2]=now%1e3*1e3*1e3|0;return 0}function _emscripten_set_main_loop_timing(mode,value){Browser.mainLoop.timingMode=mode;Browser.mainLoop.timingValue=value;if(!Browser.mainLoop.func){return 1}if(mode==0){Browser.mainLoop.scheduler=function Browser_mainLoop_scheduler_setTimeout(){var timeUntilNextTick=Math.max(0,Browser.mainLoop.tickStartTime+value-_emscripten_get_now())|0;setTimeout(Browser.mainLoop.runner,timeUntilNextTick)};Browser.mainLoop.method="timeout"}else if(mode==1){Browser.mainLoop.scheduler=function Browser_mainLoop_scheduler_rAF(){Browser.requestAnimationFrame(Browser.mainLoop.runner)};Browser.mainLoop.method="rAF"}else if(mode==2){if(typeof setImmediate==="undefined"){var setImmediates=[];var emscriptenMainLoopMessageId="setimmediate";function Browser_setImmediate_messageHandler(event){if(event.data===emscriptenMainLoopMessageId||event.data.target===emscriptenMainLoopMessageId){event.stopPropagation();setImmediates.shift()()}}addEventListener("message",Browser_setImmediate_messageHandler,true);setImmediate=function Browser_emulated_setImmediate(func){setImmediates.push(func);if(ENVIRONMENT_IS_WORKER){if(Module["setImmediates"]===undefined)Module["setImmediates"]=[];Module["setImmediates"].push(func);postMessage({target:emscriptenMainLoopMessageId})}else postMessage(emscriptenMainLoopMessageId,"*")}}Browser.mainLoop.scheduler=function Browser_mainLoop_scheduler_setImmediate(){setImmediate(Browser.mainLoop.runner)};Browser.mainLoop.method="immediate"}return 0}function _emscripten_set_main_loop(func,fps,simulateInfiniteLoop,arg,noSetTiming){Module["noExitRuntime"]=true;assert(!Browser.mainLoop.func,"emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.");Browser.mainLoop.func=func;Browser.mainLoop.arg=arg;var browserIterationFunc;if(typeof arg!=="undefined"){browserIterationFunc=(function(){Module["dynCall_vi"](func,arg)})}else{browserIterationFunc=(function(){Module["dynCall_v"](func)})}var thisMainLoopId=Browser.mainLoop.currentlyRunningMainloop;Browser.mainLoop.runner=function Browser_mainLoop_runner(){if(ABORT)return;if(Browser.mainLoop.queue.length>0){var start=Date.now();var blocker=Browser.mainLoop.queue.shift();blocker.func(blocker.arg);if(Browser.mainLoop.remainingBlockers){var remaining=Browser.mainLoop.remainingBlockers;var next=remaining%1==0?remaining-1:Math.floor(remaining);if(blocker.counted){Browser.mainLoop.remainingBlockers=next}else{next=next+.5;Browser.mainLoop.remainingBlockers=(8*remaining+next)/9}}console.log('main loop blocker "'+blocker.name+'" took '+(Date.now()-start)+" ms");Browser.mainLoop.updateStatus();if(thisMainLoopId<Browser.mainLoop.currentlyRunningMainloop)return;setTimeout(Browser.mainLoop.runner,0);return}if(thisMainLoopId<Browser.mainLoop.currentlyRunningMainloop)return;Browser.mainLoop.currentFrameNumber=Browser.mainLoop.currentFrameNumber+1|0;if(Browser.mainLoop.timingMode==1&&Browser.mainLoop.timingValue>1&&Browser.mainLoop.currentFrameNumber%Browser.mainLoop.timingValue!=0){Browser.mainLoop.scheduler();return}else if(Browser.mainLoop.timingMode==0){Browser.mainLoop.tickStartTime=_emscripten_get_now()}if(Browser.mainLoop.method==="timeout"&&Module.ctx){Module.printErr("Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!");Browser.mainLoop.method=""}Browser.mainLoop.runIter(browserIterationFunc);if(thisMainLoopId<Browser.mainLoop.currentlyRunningMainloop)return;if(typeof SDL==="object"&&SDL.audio&&SDL.audio.queueNewAudioData)SDL.audio.queueNewAudioData();Browser.mainLoop.scheduler()};if(!noSetTiming){if(fps&&fps>0)_emscripten_set_main_loop_timing(0,1e3/fps);else _emscripten_set_main_loop_timing(1,1);Browser.mainLoop.scheduler()}if(simulateInfiniteLoop){throw"SimulateInfiniteLoop"}}var Browser={mainLoop:{scheduler:null,method:"",currentlyRunningMainloop:0,func:null,arg:0,timingMode:0,timingValue:0,currentFrameNumber:0,queue:[],pause:(function(){Browser.mainLoop.scheduler=null;Browser.mainLoop.currentlyRunningMainloop++}),resume:(function(){Browser.mainLoop.currentlyRunningMainloop++;var timingMode=Browser.mainLoop.timingMode;var timingValue=Browser.mainLoop.timingValue;var func=Browser.mainLoop.func;Browser.mainLoop.func=null;_emscripten_set_main_loop(func,0,false,Browser.mainLoop.arg,true);_emscripten_set_main_loop_timing(timingMode,timingValue);Browser.mainLoop.scheduler()}),updateStatus:(function(){if(Module["setStatus"]){var message=Module["statusMessage"]||"Please wait...";var remaining=Browser.mainLoop.remainingBlockers;var expected=Browser.mainLoop.expectedBlockers;if(remaining){if(remaining<expected){Module["setStatus"](message+" ("+(expected-remaining)+"/"+expected+")")}else{Module["setStatus"](message)}}else{Module["setStatus"]("")}}}),runIter:(function(func){if(ABORT)return;if(Module["preMainLoop"]){var preRet=Module["preMainLoop"]();if(preRet===false){return}}try{func()}catch(e){if(e instanceof ExitStatus){return}else{if(e&&typeof e==="object"&&e.stack)Module.printErr("exception thrown: "+[e,e.stack]);throw e}}if(Module["postMainLoop"])Module["postMainLoop"]()})},isFullscreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:(function(){if(!Module["preloadPlugins"])Module["preloadPlugins"]=[];if(Browser.initted)return;Browser.initted=true;try{new Blob;Browser.hasBlobConstructor=true}catch(e){Browser.hasBlobConstructor=false;console.log("warning: no blob constructor, cannot create blobs with mimetypes")}Browser.BlobBuilder=typeof MozBlobBuilder!="undefined"?MozBlobBuilder:typeof WebKitBlobBuilder!="undefined"?WebKitBlobBuilder:!Browser.hasBlobConstructor?console.log("warning: no BlobBuilder"):null;Browser.URLObject=typeof window!="undefined"?window.URL?window.URL:window.webkitURL:undefined;if(!Module.noImageDecoding&&typeof Browser.URLObject==="undefined"){console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");Module.noImageDecoding=true}var imagePlugin={};imagePlugin["canHandle"]=function imagePlugin_canHandle(name){return!Module.noImageDecoding&&/\.(jpg|jpeg|png|bmp)$/i.test(name)};imagePlugin["handle"]=function imagePlugin_handle(byteArray,name,onload,onerror){var b=null;if(Browser.hasBlobConstructor){try{b=new Blob([byteArray],{type:Browser.getMimetype(name)});if(b.size!==byteArray.length){b=new Blob([(new Uint8Array(byteArray)).buffer],{type:Browser.getMimetype(name)})}}catch(e){warnOnce("Blob constructor present but fails: "+e+"; falling back to blob builder")}}if(!b){var bb=new Browser.BlobBuilder;bb.append((new Uint8Array(byteArray)).buffer);b=bb.getBlob()}var url=Browser.URLObject.createObjectURL(b);var img=new Image;img.onload=function img_onload(){assert(img.complete,"Image "+name+" could not be decoded");var canvas=document.createElement("canvas");canvas.width=img.width;canvas.height=img.height;var ctx=canvas.getContext("2d");ctx.drawImage(img,0,0);Module["preloadedImages"][name]=canvas;Browser.URLObject.revokeObjectURL(url);if(onload)onload(byteArray)};img.onerror=function img_onerror(event){console.log("Image "+url+" could not be decoded");if(onerror)onerror()};img.src=url};Module["preloadPlugins"].push(imagePlugin);var audioPlugin={};audioPlugin["canHandle"]=function audioPlugin_canHandle(name){return!Module.noAudioDecoding&&name.substr(-4)in{".ogg":1,".wav":1,".mp3":1}};audioPlugin["handle"]=function audioPlugin_handle(byteArray,name,onload,onerror){var done=false;function finish(audio){if(done)return;done=true;Module["preloadedAudios"][name]=audio;if(onload)onload(byteArray)}function fail(){if(done)return;done=true;Module["preloadedAudios"][name]=new Audio;if(onerror)onerror()}if(Browser.hasBlobConstructor){try{var b=new Blob([byteArray],{type:Browser.getMimetype(name)})}catch(e){return fail()}var url=Browser.URLObject.createObjectURL(b);var audio=new Audio;audio.addEventListener("canplaythrough",(function(){finish(audio)}),false);audio.onerror=function audio_onerror(event){if(done)return;console.log("warning: browser could not fully decode audio "+name+", trying slower base64 approach");function encode64(data){var BASE="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";var PAD="=";var ret="";var leftchar=0;var leftbits=0;for(var i=0;i<data.length;i++){leftchar=leftchar<<8|data[i];leftbits+=8;while(leftbits>=6){var curr=leftchar>>leftbits-6&63;leftbits-=6;ret+=BASE[curr]}}if(leftbits==2){ret+=BASE[(leftchar&3)<<4];ret+=PAD+PAD}else if(leftbits==4){ret+=BASE[(leftchar&15)<<2];ret+=PAD}return ret}audio.src="data:audio/x-"+name.substr(-3)+";base64,"+encode64(byteArray);finish(audio)};audio.src=url;Browser.safeSetTimeout((function(){finish(audio)}),1e4)}else{return fail()}};Module["preloadPlugins"].push(audioPlugin);function pointerLockChange(){Browser.pointerLock=document["pointerLockElement"]===Module["canvas"]||document["mozPointerLockElement"]===Module["canvas"]||document["webkitPointerLockElement"]===Module["canvas"]||document["msPointerLockElement"]===Module["canvas"]}var canvas=Module["canvas"];if(canvas){canvas.requestPointerLock=canvas["requestPointerLock"]||canvas["mozRequestPointerLock"]||canvas["webkitRequestPointerLock"]||canvas["msRequestPointerLock"]||(function(){});canvas.exitPointerLock=document["exitPointerLock"]||document["mozExitPointerLock"]||document["webkitExitPointerLock"]||document["msExitPointerLock"]||(function(){});canvas.exitPointerLock=canvas.exitPointerLock.bind(document);document.addEventListener("pointerlockchange",pointerLockChange,false);document.addEventListener("mozpointerlockchange",pointerLockChange,false);document.addEventListener("webkitpointerlockchange",pointerLockChange,false);document.addEventListener("mspointerlockchange",pointerLockChange,false);if(Module["elementPointerLock"]){canvas.addEventListener("click",(function(ev){if(!Browser.pointerLock&&Module["canvas"].requestPointerLock){Module["canvas"].requestPointerLock();ev.preventDefault()}}),false)}}}),createContext:(function(canvas,useWebGL,setInModule,webGLContextAttributes){if(useWebGL&&Module.ctx&&canvas==Module.canvas)return Module.ctx;var ctx;var contextHandle;if(useWebGL){var contextAttributes={antialias:false,alpha:false};if(webGLContextAttributes){for(var attribute in webGLContextAttributes){contextAttributes[attribute]=webGLContextAttributes[attribute]}}contextHandle=GL.createContext(canvas,contextAttributes);if(contextHandle){ctx=GL.getContext(contextHandle).GLctx}}else{ctx=canvas.getContext("2d")}if(!ctx)return null;if(setInModule){if(!useWebGL)assert(typeof GLctx==="undefined","cannot set in module if GLctx is used, but we are a non-GL context that would replace it");Module.ctx=ctx;if(useWebGL)GL.makeContextCurrent(contextHandle);Module.useWebGL=useWebGL;Browser.moduleContextCreatedCallbacks.forEach((function(callback){callback()}));Browser.init()}return ctx}),destroyContext:(function(canvas,useWebGL,setInModule){}),fullscreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullscreen:(function(lockPointer,resizeCanvas,vrDevice){Browser.lockPointer=lockPointer;Browser.resizeCanvas=resizeCanvas;Browser.vrDevice=vrDevice;if(typeof Browser.lockPointer==="undefined")Browser.lockPointer=true;if(typeof Browser.resizeCanvas==="undefined")Browser.resizeCanvas=false;if(typeof Browser.vrDevice==="undefined")Browser.vrDevice=null;var canvas=Module["canvas"];function fullscreenChange(){Browser.isFullscreen=false;var canvasContainer=canvas.parentNode;if((document["fullscreenElement"]||document["mozFullScreenElement"]||document["msFullscreenElement"]||document["webkitFullscreenElement"]||document["webkitCurrentFullScreenElement"])===canvasContainer){canvas.exitFullscreen=document["exitFullscreen"]||document["cancelFullScreen"]||document["mozCancelFullScreen"]||document["msExitFullscreen"]||document["webkitCancelFullScreen"]||(function(){});canvas.exitFullscreen=canvas.exitFullscreen.bind(document);if(Browser.lockPointer)canvas.requestPointerLock();Browser.isFullscreen=true;if(Browser.resizeCanvas)Browser.setFullscreenCanvasSize()}else{canvasContainer.parentNode.insertBefore(canvas,canvasContainer);canvasContainer.parentNode.removeChild(canvasContainer);if(Browser.resizeCanvas)Browser.setWindowedCanvasSize()}if(Module["onFullScreen"])Module["onFullScreen"](Browser.isFullscreen);if(Module["onFullscreen"])Module["onFullscreen"](Browser.isFullscreen);Browser.updateCanvasDimensions(canvas)}if(!Browser.fullscreenHandlersInstalled){Browser.fullscreenHandlersInstalled=true;document.addEventListener("fullscreenchange",fullscreenChange,false);document.addEventListener("mozfullscreenchange",fullscreenChange,false);document.addEventListener("webkitfullscreenchange",fullscreenChange,false);document.addEventListener("MSFullscreenChange",fullscreenChange,false)}var canvasContainer=document.createElement("div");canvas.parentNode.insertBefore(canvasContainer,canvas);canvasContainer.appendChild(canvas);canvasContainer.requestFullscreen=canvasContainer["requestFullscreen"]||canvasContainer["mozRequestFullScreen"]||canvasContainer["msRequestFullscreen"]||(canvasContainer["webkitRequestFullscreen"]?(function(){canvasContainer["webkitRequestFullscreen"](Element["ALLOW_KEYBOARD_INPUT"])}):null)||(canvasContainer["webkitRequestFullScreen"]?(function(){canvasContainer["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"])}):null);if(vrDevice){canvasContainer.requestFullscreen({vrDisplay:vrDevice})}else{canvasContainer.requestFullscreen()}}),requestFullScreen:(function(lockPointer,resizeCanvas,vrDevice){Module.printErr("Browser.requestFullScreen() is deprecated. Please call Browser.requestFullscreen instead.");Browser.requestFullScreen=(function(lockPointer,resizeCanvas,vrDevice){return Browser.requestFullscreen(lockPointer,resizeCanvas,vrDevice)});return Browser.requestFullscreen(lockPointer,resizeCanvas,vrDevice)}),nextRAF:0,fakeRequestAnimationFrame:(function(func){var now=Date.now();if(Browser.nextRAF===0){Browser.nextRAF=now+1e3/60}else{while(now+2>=Browser.nextRAF){Browser.nextRAF+=1e3/60}}var delay=Math.max(Browser.nextRAF-now,0);setTimeout(func,delay)}),requestAnimationFrame:function requestAnimationFrame(func){if(typeof window==="undefined"){Browser.fakeRequestAnimationFrame(func)}else{if(!window.requestAnimationFrame){window.requestAnimationFrame=window["requestAnimationFrame"]||window["mozRequestAnimationFrame"]||window["webkitRequestAnimationFrame"]||window["msRequestAnimationFrame"]||window["oRequestAnimationFrame"]||Browser.fakeRequestAnimationFrame}window.requestAnimationFrame(func)}},safeCallback:(function(func){return(function(){if(!ABORT)return func.apply(null,arguments)})}),allowAsyncCallbacks:true,queuedAsyncCallbacks:[],pauseAsyncCallbacks:(function(){Browser.allowAsyncCallbacks=false}),resumeAsyncCallbacks:(function(){Browser.allowAsyncCallbacks=true;if(Browser.queuedAsyncCallbacks.length>0){var callbacks=Browser.queuedAsyncCallbacks;Browser.queuedAsyncCallbacks=[];callbacks.forEach((function(func){func()}))}}),safeRequestAnimationFrame:(function(func){return Browser.requestAnimationFrame((function(){if(ABORT)return;if(Browser.allowAsyncCallbacks){func()}else{Browser.queuedAsyncCallbacks.push(func)}}))}),safeSetTimeout:(function(func,timeout){Module["noExitRuntime"]=true;return setTimeout((function(){if(ABORT)return;if(Browser.allowAsyncCallbacks){func()}else{Browser.queuedAsyncCallbacks.push(func)}}),timeout)}),safeSetInterval:(function(func,timeout){Module["noExitRuntime"]=true;return setInterval((function(){if(ABORT)return;if(Browser.allowAsyncCallbacks){func()}}),timeout)}),getMimetype:(function(name){return{"jpg":"image/jpeg","jpeg":"image/jpeg","png":"image/png","bmp":"image/bmp","ogg":"audio/ogg","wav":"audio/wav","mp3":"audio/mpeg"}[name.substr(name.lastIndexOf(".")+1)]}),getUserMedia:(function(func){if(!window.getUserMedia){window.getUserMedia=navigator["getUserMedia"]||navigator["mozGetUserMedia"]}window.getUserMedia(func)}),getMovementX:(function(event){return event["movementX"]||event["mozMovementX"]||event["webkitMovementX"]||0}),getMovementY:(function(event){return event["movementY"]||event["mozMovementY"]||event["webkitMovementY"]||0}),getMouseWheelDelta:(function(event){var delta=0;switch(event.type){case"DOMMouseScroll":delta=event.detail;break;case"mousewheel":delta=event.wheelDelta;break;case"wheel":delta=event["deltaY"];break;default:throw"unrecognized mouse wheel event: "+event.type}return delta}),mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,touches:{},lastTouches:{},calculateMouseEvent:(function(event){if(Browser.pointerLock){if(event.type!="mousemove"&&"mozMovementX"in event){Browser.mouseMovementX=Browser.mouseMovementY=0}else{Browser.mouseMovementX=Browser.getMovementX(event);Browser.mouseMovementY=Browser.getMovementY(event)}if(typeof SDL!="undefined"){Browser.mouseX=SDL.mouseX+Browser.mouseMovementX;Browser.mouseY=SDL.mouseY+Browser.mouseMovementY}else{Browser.mouseX+=Browser.mouseMovementX;Browser.mouseY+=Browser.mouseMovementY}}else{var rect=Module["canvas"].getBoundingClientRect();var cw=Module["canvas"].width;var ch=Module["canvas"].height;var scrollX=typeof window.scrollX!=="undefined"?window.scrollX:window.pageXOffset;var scrollY=typeof window.scrollY!=="undefined"?window.scrollY:window.pageYOffset;if(event.type==="touchstart"||event.type==="touchend"||event.type==="touchmove"){var touch=event.touch;if(touch===undefined){return}var adjustedX=touch.pageX-(scrollX+rect.left);var adjustedY=touch.pageY-(scrollY+rect.top);adjustedX=adjustedX*(cw/rect.width);adjustedY=adjustedY*(ch/rect.height);var coords={x:adjustedX,y:adjustedY};if(event.type==="touchstart"){Browser.lastTouches[touch.identifier]=coords;Browser.touches[touch.identifier]=coords}else if(event.type==="touchend"||event.type==="touchmove"){var last=Browser.touches[touch.identifier];if(!last)last=coords;Browser.lastTouches[touch.identifier]=last;Browser.touches[touch.identifier]=coords}return}var x=event.pageX-(scrollX+rect.left);var y=event.pageY-(scrollY+rect.top);x=x*(cw/rect.width);y=y*(ch/rect.height);Browser.mouseMovementX=x-Browser.mouseX;Browser.mouseMovementY=y-Browser.mouseY;Browser.mouseX=x;Browser.mouseY=y}}),asyncLoad:(function(url,onload,onerror,noRunDep){var dep=!noRunDep?getUniqueRunDependency("al "+url):"";Module["readAsync"](url,(function(arrayBuffer){assert(arrayBuffer,'Loading data file "'+url+'" failed (no arrayBuffer).');onload(new Uint8Array(arrayBuffer));if(dep)removeRunDependency(dep)}),(function(event){if(onerror){onerror()}else{throw'Loading data file "'+url+'" failed.'}}));if(dep)addRunDependency(dep)}),resizeListeners:[],updateResizeListeners:(function(){var canvas=Module["canvas"];Browser.resizeListeners.forEach((function(listener){listener(canvas.width,canvas.height)}))}),setCanvasSize:(function(width,height,noUpdates){var canvas=Module["canvas"];Browser.updateCanvasDimensions(canvas,width,height);if(!noUpdates)Browser.updateResizeListeners()}),windowedWidth:0,windowedHeight:0,setFullscreenCanvasSize:(function(){if(typeof SDL!="undefined"){var flags=HEAPU32[SDL.screen>>2];flags=flags|8388608;HEAP32[SDL.screen>>2]=flags}Browser.updateResizeListeners()}),setWindowedCanvasSize:(function(){if(typeof SDL!="undefined"){var flags=HEAPU32[SDL.screen>>2];flags=flags&~8388608;HEAP32[SDL.screen>>2]=flags}Browser.updateResizeListeners()}),updateCanvasDimensions:(function(canvas,wNative,hNative){if(wNative&&hNative){canvas.widthNative=wNative;canvas.heightNative=hNative}else{wNative=canvas.widthNative;hNative=canvas.heightNative}var w=wNative;var h=hNative;if(Module["forcedAspectRatio"]&&Module["forcedAspectRatio"]>0){if(w/h<Module["forcedAspectRatio"]){w=Math.round(h*Module["forcedAspectRatio"])}else{h=Math.round(w/Module["forcedAspectRatio"])}}if((document["fullscreenElement"]||document["mozFullScreenElement"]||document["msFullscreenElement"]||document["webkitFullscreenElement"]||document["webkitCurrentFullScreenElement"])===canvas.parentNode&&typeof screen!="undefined"){var factor=Math.min(screen.width/w,screen.height/h);w=Math.round(w*factor);h=Math.round(h*factor)}if(Browser.resizeCanvas){if(canvas.width!=w)canvas.width=w;if(canvas.height!=h)canvas.height=h;if(typeof canvas.style!="undefined"){canvas.style.removeProperty("width");canvas.style.removeProperty("height")}}else{if(canvas.width!=wNative)canvas.width=wNative;if(canvas.height!=hNative)canvas.height=hNative;if(typeof canvas.style!="undefined"){if(w!=wNative||h!=hNative){canvas.style.setProperty("width",w+"px","important");canvas.style.setProperty("height",h+"px","important")}else{canvas.style.removeProperty("width");canvas.style.removeProperty("height")}}}}),wgetRequests:{},nextWgetRequestHandle:0,getNextWgetRequestHandle:(function(){var handle=Browser.nextWgetRequestHandle;Browser.nextWgetRequestHandle++;return handle})};function _emscripten_call_worker(id,funcName,data,size,callback,arg){Module["noExitRuntime"]=true;funcName=Pointer_stringify(funcName);var info=Browser.workers[id];var callbackId=-1;if(callback){callbackId=info.callbacks.length;info.callbacks.push({func:getFuncWrapper(callback,"viii"),arg:arg});info.awaited++}var transferObject={"funcName":funcName,"callbackId":callbackId,"data":data?new Uint8Array(HEAPU8.subarray(data,data+size)):0};if(data){info.worker.postMessage(transferObject,[transferObject.data.buffer])}else{info.worker.postMessage(transferObject)}}function _emscripten_create_worker(url){url=Pointer_stringify(url);var id=Browser.workers.length;var info={worker:new Worker(url),callbacks:[],awaited:0,buffer:0,bufferSize:0};info.worker.onmessage=function info_worker_onmessage(msg){if(ABORT)return;var info=Browser.workers[id];if(!info)return;var callbackId=msg.data["callbackId"];var callbackInfo=info.callbacks[callbackId];if(!callbackInfo)return;if(msg.data["finalResponse"]){info.awaited--;info.callbacks[callbackId]=null}var data=msg.data["data"];if(data){if(!data.byteLength)data=new Uint8Array(data);if(!info.buffer||info.bufferSize<data.length){if(info.buffer)_free(info.buffer);info.bufferSize=data.length;info.buffer=_malloc(data.length)}HEAPU8.set(data,info.buffer);callbackInfo.func(info.buffer,data.length,callbackInfo.arg)}else{callbackInfo.func(0,0,callbackInfo.arg)}};Browser.workers.push(info);return id}function _emscripten_force_exit(status){Module["noExitRuntime"]=false;Module["exit"](status)}function _emscripten_set_main_loop_arg(func,arg,fps,simulateInfiniteLoop){_emscripten_set_main_loop(func,fps,simulateInfiniteLoop,arg)}var JSEvents={keyEvent:0,mouseEvent:0,wheelEvent:0,uiEvent:0,focusEvent:0,deviceOrientationEvent:0,deviceMotionEvent:0,fullscreenChangeEvent:0,pointerlockChangeEvent:0,visibilityChangeEvent:0,touchEvent:0,lastGamepadState:null,lastGamepadStateFrame:null,numGamepadsConnected:0,previousFullscreenElement:null,previousScreenX:null,previousScreenY:null,removeEventListenersRegistered:false,staticInit:(function(){if(typeof window!=="undefined"){window.addEventListener("gamepadconnected",(function(){++JSEvents.numGamepadsConnected}));window.addEventListener("gamepaddisconnected",(function(){--JSEvents.numGamepadsConnected}));var firstState=navigator.getGamepads?navigator.getGamepads():navigator.webkitGetGamepads?navigator.webkitGetGamepads():null;if(firstState){JSEvents.numGamepadsConnected=firstState.length}}}),registerRemoveEventListeners:(function(){if(!JSEvents.removeEventListenersRegistered){__ATEXIT__.push((function(){for(var i=JSEvents.eventHandlers.length-1;i>=0;--i){JSEvents._removeHandler(i)}}));JSEvents.removeEventListenersRegistered=true}}),findEventTarget:(function(target){if(target){if(typeof target=="number"){target=Pointer_stringify(target)}if(target=="#window")return window;else if(target=="#document")return document;else if(target=="#screen")return window.screen;else if(target=="#canvas")return Module["canvas"];if(typeof target=="string")return document.getElementById(target);else return target}else{return window}}),deferredCalls:[],deferCall:(function(targetFunction,precedence,argsList){function arraysHaveEqualContent(arrA,arrB){if(arrA.length!=arrB.length)return false;for(var i in arrA){if(arrA[i]!=arrB[i])return false}return true}for(var i in JSEvents.deferredCalls){var call=JSEvents.deferredCalls[i];if(call.targetFunction==targetFunction&&arraysHaveEqualContent(call.argsList,argsList)){return}}JSEvents.deferredCalls.push({targetFunction:targetFunction,precedence:precedence,argsList:argsList});JSEvents.deferredCalls.sort((function(x,y){return x.precedence<y.precedence}))}),removeDeferredCalls:(function(targetFunction){for(var i=0;i<JSEvents.deferredCalls.length;++i){if(JSEvents.deferredCalls[i].targetFunction==targetFunction){JSEvents.deferredCalls.splice(i,1);--i}}}),canPerformEventHandlerRequests:(function(){return JSEvents.inEventHandler&&JSEvents.currentEventHandler.allowsDeferredCalls}),runDeferredCalls:(function(){if(!JSEvents.canPerformEventHandlerRequests()){return}for(var i=0;i<JSEvents.deferredCalls.length;++i){var call=JSEvents.deferredCalls[i];JSEvents.deferredCalls.splice(i,1);--i;call.targetFunction.apply(this,call.argsList)}}),inEventHandler:0,currentEventHandler:null,eventHandlers:[],isInternetExplorer:(function(){return navigator.userAgent.indexOf("MSIE")!==-1||navigator.appVersion.indexOf("Trident/")>0}),removeAllHandlersOnTarget:(function(target,eventTypeString){for(var i=0;i<JSEvents.eventHandlers.length;++i){if(JSEvents.eventHandlers[i].target==target&&(!eventTypeString||eventTypeString==JSEvents.eventHandlers[i].eventTypeString)){JSEvents._removeHandler(i--)}}}),_removeHandler:(function(i){var h=JSEvents.eventHandlers[i];h.target.removeEventListener(h.eventTypeString,h.eventListenerFunc,h.useCapture);JSEvents.eventHandlers.splice(i,1)}),registerOrRemoveHandler:(function(eventHandler){var jsEventHandler=function jsEventHandler(event){++JSEvents.inEventHandler;JSEvents.currentEventHandler=eventHandler;JSEvents.runDeferredCalls();eventHandler.handlerFunc(event);JSEvents.runDeferredCalls();--JSEvents.inEventHandler};if(eventHandler.callbackfunc){eventHandler.eventListenerFunc=jsEventHandler;eventHandler.target.addEventListener(eventHandler.eventTypeString,jsEventHandler,eventHandler.useCapture);JSEvents.eventHandlers.push(eventHandler);JSEvents.registerRemoveEventListeners()}else{for(var i=0;i<JSEvents.eventHandlers.length;++i){if(JSEvents.eventHandlers[i].target==eventHandler.target&&JSEvents.eventHandlers[i].eventTypeString==eventHandler.eventTypeString){JSEvents._removeHandler(i--)}}}}),registerKeyEventCallback:(function(target,userData,useCapture,callbackfunc,eventTypeId,eventTypeString){if(!JSEvents.keyEvent){JSEvents.keyEvent=_malloc(164)}var handlerFunc=(function(event){var e=event||window.event;stringToUTF8(e.key?e.key:"",JSEvents.keyEvent+0,32);stringToUTF8(e.code?e.code:"",JSEvents.keyEvent+32,32);HEAP32[JSEvents.keyEvent+64>>2]=e.location;HEAP32[JSEvents.keyEvent+68>>2]=e.ctrlKey;HEAP32[JSEvents.keyEvent+72>>2]=e.shiftKey;HEAP32[JSEvents.keyEvent+76>>2]=e.altKey;HEAP32[JSEvents.keyEvent+80>>2]=e.metaKey;HEAP32[JSEvents.keyEvent+84>>2]=e.repeat;stringToUTF8(e.locale?e.locale:"",JSEvents.keyEvent+88,32);stringToUTF8(e.char?e.char:"",JSEvents.keyEvent+120,32);HEAP32[JSEvents.keyEvent+152>>2]=e.charCode;HEAP32[JSEvents.keyEvent+156>>2]=e.keyCode;HEAP32[JSEvents.keyEvent+160>>2]=e.which;var shouldCancel=Module["dynCall_iiii"](callbackfunc,eventTypeId,JSEvents.keyEvent,userData);if(shouldCancel){e.preventDefault()}});var eventHandler={target:JSEvents.findEventTarget(target),allowsDeferredCalls:JSEvents.isInternetExplorer()?false:true,eventTypeString:eventTypeString,callbackfunc:callbackfunc,handlerFunc:handlerFunc,useCapture:useCapture};JSEvents.registerOrRemoveHandler(eventHandler)}),getBoundingClientRectOrZeros:(function(target){return target.getBoundingClientRect?target.getBoundingClientRect():{left:0,top:0}}),fillMouseEventData:(function(eventStruct,e,target){HEAPF64[eventStruct>>3]=JSEvents.tick();HEAP32[eventStruct+8>>2]=e.screenX;HEAP32[eventStruct+12>>2]=e.screenY;HEAP32[eventStruct+16>>2]=e.clientX;HEAP32[eventStruct+20>>2]=e.clientY;HEAP32[eventStruct+24>>2]=e.ctrlKey;HEAP32[eventStruct+28>>2]=e.shiftKey;HEAP32[eventStruct+32>>2]=e.altKey;HEAP32[eventStruct+36>>2]=e.metaKey;HEAP16[eventStruct+40>>1]=e.button;HEAP16[eventStruct+42>>1]=e.buttons;HEAP32[eventStruct+44>>2]=e["movementX"]||e["mozMovementX"]||e["webkitMovementX"]||e.screenX-JSEvents.previousScreenX;HEAP32[eventStruct+48>>2]=e["movementY"]||e["mozMovementY"]||e["webkitMovementY"]||e.screenY-JSEvents.previousScreenY;if(Module["canvas"]){var rect=Module["canvas"].getBoundingClientRect();HEAP32[eventStruct+60>>2]=e.clientX-rect.left;HEAP32[eventStruct+64>>2]=e.clientY-rect.top}else{HEAP32[eventStruct+60>>2]=0;HEAP32[eventStruct+64>>2]=0}if(target){var rect=JSEvents.getBoundingClientRectOrZeros(target);HEAP32[eventStruct+52>>2]=e.clientX-rect.left;HEAP32[eventStruct+56>>2]=e.clientY-rect.top}else{HEAP32[eventStruct+52>>2]=0;HEAP32[eventStruct+56>>2]=0}if(e.type!=="wheel"&&e.type!=="mousewheel"){JSEvents.previousScreenX=e.screenX;JSEvents.previousScreenY=e.screenY}}),registerMouseEventCallback:(function(target,userData,useCapture,callbackfunc,eventTypeId,eventTypeString){if(!JSEvents.mouseEvent){JSEvents.mouseEvent=_malloc(72)}target=JSEvents.findEventTarget(target);var handlerFunc=(function(event){var e=event||window.event;JSEvents.fillMouseEventData(JSEvents.mouseEvent,e,target);var shouldCancel=Module["dynCall_iiii"](callbackfunc,eventTypeId,JSEvents.mouseEvent,userData);if(shouldCancel){e.preventDefault()}});var eventHandler={target:target,allowsDeferredCalls:eventTypeString!="mousemove"&&eventTypeString!="mouseenter"&&eventTypeString!="mouseleave",eventTypeString:eventTypeString,callbackfunc:callbackfunc,handlerFunc:handlerFunc,useCapture:useCapture};if(JSEvents.isInternetExplorer()&&eventTypeString=="mousedown")eventHandler.allowsDeferredCalls=false;JSEvents.registerOrRemoveHandler(eventHandler)}),registerWheelEventCallback:(function(target,userData,useCapture,callbackfunc,eventTypeId,eventTypeString){if(!JSEvents.wheelEvent){JSEvents.wheelEvent=_malloc(104)}target=JSEvents.findEventTarget(target);var wheelHandlerFunc=(function(event){var e=event||window.event;JSEvents.fillMouseEventData(JSEvents.wheelEvent,e,target);HEAPF64[JSEvents.wheelEvent+72>>3]=e["deltaX"];HEAPF64[JSEvents.wheelEvent+80>>3]=e["deltaY"];HEAPF64[JSEvents.wheelEvent+88>>3]=e["deltaZ"];HEAP32[JSEvents.wheelEvent+96>>2]=e["deltaMode"];var shouldCancel=Module["dynCall_iiii"](callbackfunc,eventTypeId,JSEvents.wheelEvent,userData);if(shouldCancel){e.preventDefault()}});var mouseWheelHandlerFunc=(function(event){var e=event||window.event;JSEvents.fillMouseEventData(JSEvents.wheelEvent,e,target);HEAPF64[JSEvents.wheelEvent+72>>3]=e["wheelDeltaX"]||0;HEAPF64[JSEvents.wheelEvent+80>>3]=-(e["wheelDeltaY"]?e["wheelDeltaY"]:e["wheelDelta"]);HEAPF64[JSEvents.wheelEvent+88>>3]=0;HEAP32[JSEvents.wheelEvent+96>>2]=0;var shouldCancel=Module["dynCall_iiii"](callbackfunc,eventTypeId,JSEvents.wheelEvent,userData);if(shouldCancel){e.preventDefault()}});var eventHandler={target:target,allowsDeferredCalls:true,eventTypeString:eventTypeString,callbackfunc:callbackfunc,handlerFunc:eventTypeString=="wheel"?wheelHandlerFunc:mouseWheelHandlerFunc,useCapture:useCapture};JSEvents.registerOrRemoveHandler(eventHandler)}),pageScrollPos:(function(){if(window.pageXOffset>0||window.pageYOffset>0){return[window.pageXOffset,window.pageYOffset]}if(typeof document.documentElement.scrollLeft!=="undefined"||typeof document.documentElement.scrollTop!=="undefined"){return[document.documentElement.scrollLeft,document.documentElement.scrollTop]}return[document.body.scrollLeft|0,document.body.scrollTop|0]}),registerUiEventCallback:(function(target,userData,useCapture,callbackfunc,eventTypeId,eventTypeString){if(!JSEvents.uiEvent){JSEvents.uiEvent=_malloc(36)}if(eventTypeString=="scroll"&&!target){target=document}else{target=JSEvents.findEventTarget(target)}var handlerFunc=(function(event){var e=event||window.event;if(e.target!=target){return}var scrollPos=JSEvents.pageScrollPos();HEAP32[JSEvents.uiEvent>>2]=e.detail;HEAP32[JSEvents.uiEvent+4>>2]=document.body.clientWidth;HEAP32[JSEvents.uiEvent+8>>2]=document.body.clientHeight;HEAP32[JSEvents.uiEvent+12>>2]=window.innerWidth;HEAP32[JSEvents.uiEvent+16>>2]=window.innerHeight;HEAP32[JSEvents.uiEvent+20>>2]=window.outerWidth;HEAP32[JSEvents.uiEvent+24>>2]=window.outerHeight;HEAP32[JSEvents.uiEvent+28>>2]=scrollPos[0];HEAP32[JSEvents.uiEvent+32>>2]=scrollPos[1];var shouldCancel=Module["dynCall_iiii"](callbackfunc,eventTypeId,JSEvents.uiEvent,userData);if(shouldCancel){e.preventDefault()}});var eventHandler={target:target,allowsDeferredCalls:false,eventTypeString:eventTypeString,callbackfunc:callbackfunc,handlerFunc:handlerFunc,useCapture:useCapture};JSEvents.registerOrRemoveHandler(eventHandler)}),getNodeNameForTarget:(function(target){if(!target)return"";if(target==window)return"#window";if(target==window.screen)return"#screen";return target&&target.nodeName?target.nodeName:""}),registerFocusEventCallback:(function(target,userData,useCapture,callbackfunc,eventTypeId,eventTypeString){if(!JSEvents.focusEvent){JSEvents.focusEvent=_malloc(256)}var handlerFunc=(function(event){var e=event||window.event;var nodeName=JSEvents.getNodeNameForTarget(e.target);var id=e.target.id?e.target.id:"";stringToUTF8(nodeName,JSEvents.focusEvent+0,128);stringToUTF8(id,JSEvents.focusEvent+128,128);var shouldCancel=Module["dynCall_iiii"](callbackfunc,eventTypeId,JSEvents.focusEvent,userData);if(shouldCancel){e.preventDefault()}});var eventHandler={target:JSEvents.findEventTarget(target),allowsDeferredCalls:false,eventTypeString:eventTypeString,callbackfunc:callbackfunc,handlerFunc:handlerFunc,useCapture:useCapture};JSEvents.registerOrRemoveHandler(eventHandler)}),tick:(function(){if(window["performance"]&&window["performance"]["now"])return window["performance"]["now"]();else return Date.now()}),registerDeviceOrientationEventCallback:(function(target,userData,useCapture,callbackfunc,eventTypeId,eventTypeString){if(!JSEvents.deviceOrientationEvent){JSEvents.deviceOrientationEvent=_malloc(40)}var handlerFunc=(function(event){var e=event||window.event;HEAPF64[JSEvents.deviceOrientationEvent>>3]=JSEvents.tick();HEAPF64[JSEvents.deviceOrientationEvent+8>>3]=e.alpha;HEAPF64[JSEvents.deviceOrientationEvent+16>>3]=e.beta;HEAPF64[JSEvents.deviceOrientationEvent+24>>3]=e.gamma;HEAP32[JSEvents.deviceOrientationEvent+32>>2]=e.absolute;var shouldCancel=Module["dynCall_iiii"](callbackfunc,eventTypeId,JSEvents.deviceOrientationEvent,userData);if(shouldCancel){e.preventDefault()}});var eventHandler={target:JSEvents.findEventTarget(target),allowsDeferredCalls:false,eventTypeString:eventTypeString,callbackfunc:callbackfunc,handlerFunc:handlerFunc,useCapture:useCapture};JSEvents.registerOrRemoveHandler(eventHandler)}),registerDeviceMotionEventCallback:(function(target,userData,useCapture,callbackfunc,eventTypeId,eventTypeString){if(!JSEvents.deviceMotionEvent){JSEvents.deviceMotionEvent=_malloc(80)}var handlerFunc=(function(event){var e=event||window.event;HEAPF64[JSEvents.deviceMotionEvent>>3]=JSEvents.tick();HEAPF64[JSEvents.deviceMotionEvent+8>>3]=e.acceleration.x;HEAPF64[JSEvents.deviceMotionEvent+16>>3]=e.acceleration.y;HEAPF64[JSEvents.deviceMotionEvent+24>>3]=e.acceleration.z;HEAPF64[JSEvents.deviceMotionEvent+32>>3]=e.accelerationIncludingGravity.x;HEAPF64[JSEvents.deviceMotionEvent+40>>3]=e.accelerationIncludingGravity.y;HEAPF64[JSEvents.deviceMotionEvent+48>>3]=e.accelerationIncludingGravity.z;HEAPF64[JSEvents.deviceMotionEvent+56>>3]=e.rotationRate.alpha;HEAPF64[JSEvents.deviceMotionEvent+64>>3]=e.rotationRate.beta;HEAPF64[JSEvents.deviceMotionEvent+72>>3]=e.rotationRate.gamma;var shouldCancel=Module["dynCall_iiii"](callbackfunc,eventTypeId,JSEvents.deviceMotionEvent,userData);if(shouldCancel){e.preventDefault()}});var eventHandler={target:JSEvents.findEventTarget(target),allowsDeferredCalls:false,eventTypeString:eventTypeString,callbackfunc:callbackfunc,handlerFunc:handlerFunc,useCapture:useCapture};JSEvents.registerOrRemoveHandler(eventHandler)}),screenOrientation:(function(){if(!window.screen)return undefined;return window.screen.orientation||window.screen.mozOrientation||window.screen.webkitOrientation||window.screen.msOrientation}),fillOrientationChangeEventData:(function(eventStruct,e){var orientations=["portrait-primary","portrait-secondary","landscape-primary","landscape-secondary"];var orientations2=["portrait","portrait","landscape","landscape"];var orientationString=JSEvents.screenOrientation();var orientation=orientations.indexOf(orientationString);if(orientation==-1){orientation=orientations2.indexOf(orientationString)}HEAP32[eventStruct>>2]=1<<orientation;HEAP32[eventStruct+4>>2]=window.orientation}),registerOrientationChangeEventCallback:(function(target,userData,useCapture,callbackfunc,eventTypeId,eventTypeString){if(!JSEvents.orientationChangeEvent){JSEvents.orientationChangeEvent=_malloc(8)}if(!target){target=window.screen}else{target=JSEvents.findEventTarget(target)}var handlerFunc=(function(event){var e=event||window.event;JSEvents.fillOrientationChangeEventData(JSEvents.orientationChangeEvent,e);var shouldCancel=Module["dynCall_iiii"](callbackfunc,eventTypeId,JSEvents.orientationChangeEvent,userData);if(shouldCancel){e.preventDefault()}});if(eventTypeString=="orientationchange"&&window.screen.mozOrientation!==undefined){eventTypeString="mozorientationchange"}var eventHandler={target:target,allowsDeferredCalls:false,eventTypeString:eventTypeString,callbackfunc:callbackfunc,handlerFunc:handlerFunc,useCapture:useCapture};JSEvents.registerOrRemoveHandler(eventHandler)}),fullscreenEnabled:(function(){return document.fullscreenEnabled||document.mozFullScreenEnabled||document.webkitFullscreenEnabled||document.msFullscreenEnabled}),fillFullscreenChangeEventData:(function(eventStruct,e){var fullscreenElement=document.fullscreenElement||document.mozFullScreenElement||document.webkitFullscreenElement||document.msFullscreenElement;var isFullscreen=!!fullscreenElement;HEAP32[eventStruct>>2]=isFullscreen;HEAP32[eventStruct+4>>2]=JSEvents.fullscreenEnabled();var reportedElement=isFullscreen?fullscreenElement:JSEvents.previousFullscreenElement;var nodeName=JSEvents.getNodeNameForTarget(reportedElement);var id=reportedElement&&reportedElement.id?reportedElement.id:"";stringToUTF8(nodeName,eventStruct+8,128);stringToUTF8(id,eventStruct+136,128);HEAP32[eventStruct+264>>2]=reportedElement?reportedElement.clientWidth:0;HEAP32[eventStruct+268>>2]=reportedElement?reportedElement.clientHeight:0;HEAP32[eventStruct+272>>2]=screen.width;HEAP32[eventStruct+276>>2]=screen.height;if(isFullscreen){JSEvents.previousFullscreenElement=fullscreenElement}}),registerFullscreenChangeEventCallback:(function(target,userData,useCapture,callbackfunc,eventTypeId,eventTypeString){if(!JSEvents.fullscreenChangeEvent){JSEvents.fullscreenChangeEvent=_malloc(280)}if(!target){target=document}else{target=JSEvents.findEventTarget(target)}var handlerFunc=(function(event){var e=event||window.event;JSEvents.fillFullscreenChangeEventData(JSEvents.fullscreenChangeEvent,e);var shouldCancel=Module["dynCall_iiii"](callbackfunc,eventTypeId,JSEvents.fullscreenChangeEvent,userData);if(shouldCancel){e.preventDefault()}});var eventHandler={target:target,allowsDeferredCalls:false,eventTypeString:eventTypeString,callbackfunc:callbackfunc,handlerFunc:handlerFunc,useCapture:useCapture};JSEvents.registerOrRemoveHandler(eventHandler)}),resizeCanvasForFullscreen:(function(target,strategy){var restoreOldStyle=__registerRestoreOldStyle(target);var cssWidth=strategy.softFullscreen?window.innerWidth:screen.width;var cssHeight=strategy.softFullscreen?window.innerHeight:screen.height;var rect=target.getBoundingClientRect();var windowedCssWidth=rect.right-rect.left;var windowedCssHeight=rect.bottom-rect.top;var windowedRttWidth=target.width;var windowedRttHeight=target.height;if(strategy.scaleMode==3){__setLetterbox(target,(cssHeight-windowedCssHeight)/2,(cssWidth-windowedCssWidth)/2);cssWidth=windowedCssWidth;cssHeight=windowedCssHeight}else if(strategy.scaleMode==2){if(cssWidth*windowedRttHeight<windowedRttWidth*cssHeight){var desiredCssHeight=windowedRttHeight*cssWidth/windowedRttWidth;__setLetterbox(target,(cssHeight-desiredCssHeight)/2,0);cssHeight=desiredCssHeight}else{var desiredCssWidth=windowedRttWidth*cssHeight/windowedRttHeight;__setLetterbox(target,0,(cssWidth-desiredCssWidth)/2);cssWidth=desiredCssWidth}}if(!target.style.backgroundColor)target.style.backgroundColor="black";if(!document.body.style.backgroundColor)document.body.style.backgroundColor="black";target.style.width=cssWidth+"px";target.style.height=cssHeight+"px";if(strategy.filteringMode==1){target.style.imageRendering="optimizeSpeed";target.style.imageRendering="-moz-crisp-edges";target.style.imageRendering="-o-crisp-edges";target.style.imageRendering="-webkit-optimize-contrast";target.style.imageRendering="optimize-contrast";target.style.imageRendering="crisp-edges";target.style.imageRendering="pixelated"}var dpiScale=strategy.canvasResolutionScaleMode==2?window.devicePixelRatio:1;if(strategy.canvasResolutionScaleMode!=0){target.width=cssWidth*dpiScale;target.height=cssHeight*dpiScale;if(target.GLctxObject)target.GLctxObject.GLctx.viewport(0,0,target.width,target.height)}return restoreOldStyle}),requestFullscreen:(function(target,strategy){if(strategy.scaleMode!=0||strategy.canvasResolutionScaleMode!=0){JSEvents.resizeCanvasForFullscreen(target,strategy)}if(target.requestFullscreen){target.requestFullscreen()}else if(target.msRequestFullscreen){target.msRequestFullscreen()}else if(target.mozRequestFullScreen){target.mozRequestFullScreen()}else if(target.mozRequestFullscreen){target.mozRequestFullscreen()}else if(target.webkitRequestFullscreen){target.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)}else{if(typeof JSEvents.fullscreenEnabled()==="undefined"){return-1}else{return-3}}if(strategy.canvasResizedCallback){Module["dynCall_iiii"](strategy.canvasResizedCallback,37,0,strategy.canvasResizedCallbackUserData)}return 0}),fillPointerlockChangeEventData:(function(eventStruct,e){var pointerLockElement=document.pointerLockElement||document.mozPointerLockElement||document.webkitPointerLockElement||document.msPointerLockElement;var isPointerlocked=!!pointerLockElement;HEAP32[eventStruct>>2]=isPointerlocked;var nodeName=JSEvents.getNodeNameForTarget(pointerLockElement);var id=pointerLockElement&&pointerLockElement.id?pointerLockElement.id:"";stringToUTF8(nodeName,eventStruct+4,128);stringToUTF8(id,eventStruct+132,128)}),registerPointerlockChangeEventCallback:(function(target,userData,useCapture,callbackfunc,eventTypeId,eventTypeString){if(!JSEvents.pointerlockChangeEvent){JSEvents.pointerlockChangeEvent=_malloc(260)}if(!target){target=document}else{target=JSEvents.findEventTarget(target)}var handlerFunc=(function(event){var e=event||window.event;JSEvents.fillPointerlockChangeEventData(JSEvents.pointerlockChangeEvent,e);var shouldCancel=Module["dynCall_iiii"](callbackfunc,eventTypeId,JSEvents.pointerlockChangeEvent,userData);if(shouldCancel){e.preventDefault()}});var eventHandler={target:target,allowsDeferredCalls:false,eventTypeString:eventTypeString,callbackfunc:callbackfunc,handlerFunc:handlerFunc,useCapture:useCapture};JSEvents.registerOrRemoveHandler(eventHandler)}),registerPointerlockErrorEventCallback:(function(target,userData,useCapture,callbackfunc,eventTypeId,eventTypeString){if(!target){target=document}else{target=JSEvents.findEventTarget(target)}var handlerFunc=(function(event){var e=event||window.event;var shouldCancel=Module["dynCall_iiii"](callbackfunc,eventTypeId,0,userData);if(shouldCancel){e.preventDefault()}});var eventHandler={target:target,allowsDeferredCalls:false,eventTypeString:eventTypeString,callbackfunc:callbackfunc,handlerFunc:handlerFunc,useCapture:useCapture};JSEvents.registerOrRemoveHandler(eventHandler)}),requestPointerLock:(function(target){if(target.requestPointerLock){target.requestPointerLock()}else if(target.mozRequestPointerLock){target.mozRequestPointerLock()}else if(target.webkitRequestPointerLock){target.webkitRequestPointerLock()}else if(target.msRequestPointerLock){target.msRequestPointerLock()}else{if(document.body.requestPointerLock||document.body.mozRequestPointerLock||document.body.webkitRequestPointerLock||document.body.msRequestPointerLock){return-3}else{return-1}}return 0}),fillVisibilityChangeEventData:(function(eventStruct,e){var visibilityStates=["hidden","visible","prerender","unloaded"];var visibilityState=visibilityStates.indexOf(document.visibilityState);HEAP32[eventStruct>>2]=document.hidden;HEAP32[eventStruct+4>>2]=visibilityState}),registerVisibilityChangeEventCallback:(function(target,userData,useCapture,callbackfunc,eventTypeId,eventTypeString){if(!JSEvents.visibilityChangeEvent){JSEvents.visibilityChangeEvent=_malloc(8)}if(!target){target=document}else{target=JSEvents.findEventTarget(target)}var handlerFunc=(function(event){var e=event||window.event;JSEvents.fillVisibilityChangeEventData(JSEvents.visibilityChangeEvent,e);var shouldCancel=Module["dynCall_iiii"](callbackfunc,eventTypeId,JSEvents.visibilityChangeEvent,userData);if(shouldCancel){e.preventDefault()}});var eventHandler={target:target,allowsDeferredCalls:false,eventTypeString:eventTypeString,callbackfunc:callbackfunc,handlerFunc:handlerFunc,useCapture:useCapture};JSEvents.registerOrRemoveHandler(eventHandler)}),registerTouchEventCallback:(function(target,userData,useCapture,callbackfunc,eventTypeId,eventTypeString){if(!JSEvents.touchEvent){JSEvents.touchEvent=_malloc(1684)}target=JSEvents.findEventTarget(target);var handlerFunc=(function(event){var e=event||window.event;var touches={};for(var i=0;i<e.touches.length;++i){var touch=e.touches[i];touches[touch.identifier]=touch}for(var i=0;i<e.changedTouches.length;++i){var touch=e.changedTouches[i];touches[touch.identifier]=touch;touch.changed=true}for(var i=0;i<e.targetTouches.length;++i){var touch=e.targetTouches[i];touches[touch.identifier].onTarget=true}var ptr=JSEvents.touchEvent;HEAP32[ptr+4>>2]=e.ctrlKey;HEAP32[ptr+8>>2]=e.shiftKey;HEAP32[ptr+12>>2]=e.altKey;HEAP32[ptr+16>>2]=e.metaKey;ptr+=20;var canvasRect=Module["canvas"]?Module["canvas"].getBoundingClientRect():undefined;var targetRect=JSEvents.getBoundingClientRectOrZeros(target);var numTouches=0;for(var i in touches){var t=touches[i];HEAP32[ptr>>2]=t.identifier;HEAP32[ptr+4>>2]=t.screenX;HEAP32[ptr+8>>2]=t.screenY;HEAP32[ptr+12>>2]=t.clientX;HEAP32[ptr+16>>2]=t.clientY;HEAP32[ptr+20>>2]=t.pageX;HEAP32[ptr+24>>2]=t.pageY;HEAP32[ptr+28>>2]=t.changed;HEAP32[ptr+32>>2]=t.onTarget;if(canvasRect){HEAP32[ptr+44>>2]=t.clientX-canvasRect.left;HEAP32[ptr+48>>2]=t.clientY-canvasRect.top}else{HEAP32[ptr+44>>2]=0;HEAP32[ptr+48>>2]=0}HEAP32[ptr+36>>2]=t.clientX-targetRect.left;HEAP32[ptr+40>>2]=t.clientY-targetRect.top;ptr+=52;if(++numTouches>=32){break}}HEAP32[JSEvents.touchEvent>>2]=numTouches;var shouldCancel=Module["dynCall_iiii"](callbackfunc,eventTypeId,JSEvents.touchEvent,userData);if(shouldCancel){e.preventDefault()}});var eventHandler={target:target,allowsDeferredCalls:eventTypeString=="touchstart"||eventTypeString=="touchend",eventTypeString:eventTypeString,callbackfunc:callbackfunc,handlerFunc:handlerFunc,useCapture:useCapture};JSEvents.registerOrRemoveHandler(eventHandler)}),fillGamepadEventData:(function(eventStruct,e){HEAPF64[eventStruct>>3]=e.timestamp;for(var i=0;i<e.axes.length;++i){HEAPF64[eventStruct+i*8+16>>3]=e.axes[i]}for(var i=0;i<e.buttons.length;++i){if(typeof e.buttons[i]==="object"){HEAPF64[eventStruct+i*8+528>>3]=e.buttons[i].value}else{HEAPF64[eventStruct+i*8+528>>3]=e.buttons[i]}}for(var i=0;i<e.buttons.length;++i){if(typeof e.buttons[i]==="object"){HEAP32[eventStruct+i*4+1040>>2]=e.buttons[i].pressed}else{HEAP32[eventStruct+i*4+1040>>2]=e.buttons[i]==1}}HEAP32[eventStruct+1296>>2]=e.connected;HEAP32[eventStruct+1300>>2]=e.index;HEAP32[eventStruct+8>>2]=e.axes.length;HEAP32[eventStruct+12>>2]=e.buttons.length;stringToUTF8(e.id,eventStruct+1304,64);stringToUTF8(e.mapping,eventStruct+1368,64)}),registerGamepadEventCallback:(function(target,userData,useCapture,callbackfunc,eventTypeId,eventTypeString){if(!JSEvents.gamepadEvent){JSEvents.gamepadEvent=_malloc(1432)}var handlerFunc=(function(event){var e=event||window.event;JSEvents.fillGamepadEventData(JSEvents.gamepadEvent,e.gamepad);var shouldCancel=Module["dynCall_iiii"](callbackfunc,eventTypeId,JSEvents.gamepadEvent,userData);if(shouldCancel){e.preventDefault()}});var eventHandler={target:JSEvents.findEventTarget(target),allowsDeferredCalls:true,eventTypeString:eventTypeString,callbackfunc:callbackfunc,handlerFunc:handlerFunc,useCapture:useCapture};JSEvents.registerOrRemoveHandler(eventHandler)}),registerBeforeUnloadEventCallback:(function(target,userData,useCapture,callbackfunc,eventTypeId,eventTypeString){var handlerFunc=(function(event){var e=event||window.event;var confirmationMessage=Module["dynCall_iiii"](callbackfunc,eventTypeId,0,userData);if(confirmationMessage){confirmationMessage=Pointer_stringify(confirmationMessage)}if(confirmationMessage){e.preventDefault();e.returnValue=confirmationMessage;return confirmationMessage}});var eventHandler={target:JSEvents.findEventTarget(target),allowsDeferredCalls:false,eventTypeString:eventTypeString,callbackfunc:callbackfunc,handlerFunc:handlerFunc,useCapture:useCapture};JSEvents.registerOrRemoveHandler(eventHandler)}),battery:(function(){return navigator.battery||navigator.mozBattery||navigator.webkitBattery}),fillBatteryEventData:(function(eventStruct,e){HEAPF64[eventStruct>>3]=e.chargingTime;HEAPF64[eventStruct+8>>3]=e.dischargingTime;HEAPF64[eventStruct+16>>3]=e.level;HEAP32[eventStruct+24>>2]=e.charging}),registerBatteryEventCallback:(function(target,userData,useCapture,callbackfunc,eventTypeId,eventTypeString){if(!JSEvents.batteryEvent){JSEvents.batteryEvent=_malloc(32)}var handlerFunc=(function(event){var e=event||window.event;JSEvents.fillBatteryEventData(JSEvents.batteryEvent,JSEvents.battery());var shouldCancel=Module["dynCall_iiii"](callbackfunc,eventTypeId,JSEvents.batteryEvent,userData);if(shouldCancel){e.preventDefault()}});var eventHandler={target:JSEvents.findEventTarget(target),allowsDeferredCalls:false,eventTypeString:eventTypeString,callbackfunc:callbackfunc,handlerFunc:handlerFunc,useCapture:useCapture};JSEvents.registerOrRemoveHandler(eventHandler)}),registerWebGlEventCallback:(function(target,userData,useCapture,callbackfunc,eventTypeId,eventTypeString){if(!target){target=Module["canvas"]}var handlerFunc=(function(event){var e=event||window.event;var shouldCancel=Module["dynCall_iiii"](callbackfunc,eventTypeId,0,userData);if(shouldCancel){e.preventDefault()}});var eventHandler={target:JSEvents.findEventTarget(target),allowsDeferredCalls:false,eventTypeString:eventTypeString,callbackfunc:callbackfunc,handlerFunc:handlerFunc,useCapture:useCapture};JSEvents.registerOrRemoveHandler(eventHandler)})};function _emscripten_set_mousedown_callback(target,userData,useCapture,callbackfunc){JSEvents.registerMouseEventCallback(target,userData,useCapture,callbackfunc,5,"mousedown");return 0}function _emscripten_set_mousemove_callback(target,userData,useCapture,callbackfunc){JSEvents.registerMouseEventCallback(target,userData,useCapture,callbackfunc,8,"mousemove");return 0}function _emscripten_set_wheel_callback(target,userData,useCapture,callbackfunc){target=JSEvents.findEventTarget(target);if(typeof target.onwheel!=="undefined"){JSEvents.registerWheelEventCallback(target,userData,useCapture,callbackfunc,9,"wheel");return 0}else if(typeof target.onmousewheel!=="undefined"){JSEvents.registerWheelEventCallback(target,userData,useCapture,callbackfunc,9,"mousewheel");return 0}else{return-1}}function _emscripten_worker_respond(data,size){if(workerResponded)throw"already responded with final response!";workerResponded=true;var transferObject={"callbackId":workerCallbackId,"finalResponse":true,"data":data?new Uint8Array(HEAPU8.subarray(data,data+size)):0};if(data){postMessage(transferObject,[transferObject.data.buffer])}else{postMessage(transferObject)}}var GL={counter:1,lastError:0,buffers:[],mappedBuffers:{},programs:[],framebuffers:[],renderbuffers:[],textures:[],uniforms:[],shaders:[],vaos:[],contexts:[],currentContext:null,offscreenCanvases:{},timerQueriesEXT:[],queries:[],samplers:[],transformFeedbacks:[],syncs:[],byteSizeByTypeRoot:5120,byteSizeByType:[1,1,2,2,4,4,4,2,3,4,8],programInfos:{},stringCache:{},stringiCache:{},tempFixedLengthArray:[],packAlignment:4,unpackAlignment:4,init:(function(){GL.miniTempBuffer=new Float32Array(GL.MINI_TEMP_BUFFER_SIZE);for(var i=0;i<GL.MINI_TEMP_BUFFER_SIZE;i++){GL.miniTempBufferViews[i]=GL.miniTempBuffer.subarray(0,i+1)}for(var i=0;i<32;i++){GL.tempFixedLengthArray.push(new Array(i))}}),recordError:function recordError(errorCode){if(!GL.lastError){GL.lastError=errorCode}},getNewId:(function(table){var ret=GL.counter++;for(var i=table.length;i<ret;i++){table[i]=null}return ret}),MINI_TEMP_BUFFER_SIZE:256,miniTempBuffer:null,miniTempBufferViews:[0],getSource:(function(shader,count,string,length){var source="";for(var i=0;i<count;++i){var frag;if(length){var len=HEAP32[length+i*4>>2];if(len<0){frag=Pointer_stringify(HEAP32[string+i*4>>2])}else{frag=Pointer_stringify(HEAP32[string+i*4>>2],len)}}else{frag=Pointer_stringify(HEAP32[string+i*4>>2])}source+=frag}return source}),createContext:(function(canvas,webGLContextAttributes){if(typeof webGLContextAttributes["majorVersion"]==="undefined"&&typeof webGLContextAttributes["minorVersion"]==="undefined"){if(typeof WebGL2RenderingContext!=="undefined")webGLContextAttributes["majorVersion"]=2;else webGLContextAttributes["majorVersion"]=1;webGLContextAttributes["minorVersion"]=0}var ctx;var errorInfo="?";function onContextCreationError(event){errorInfo=event.statusMessage||errorInfo}try{canvas.addEventListener("webglcontextcreationerror",onContextCreationError,false);try{if(webGLContextAttributes["majorVersion"]==1&&webGLContextAttributes["minorVersion"]==0){ctx=canvas.getContext("webgl",webGLContextAttributes)||canvas.getContext("experimental-webgl",webGLContextAttributes)}else if(webGLContextAttributes["majorVersion"]==2&&webGLContextAttributes["minorVersion"]==0){ctx=canvas.getContext("webgl2",webGLContextAttributes)}else{throw"Unsupported WebGL context version "+majorVersion+"."+minorVersion+"!"}}finally{canvas.removeEventListener("webglcontextcreationerror",onContextCreationError,false)}if(!ctx)throw":("}catch(e){Module.print("Could not create canvas: "+[errorInfo,e,JSON.stringify(webGLContextAttributes)]);return 0}if(!ctx)return 0;var context=GL.registerContext(ctx,webGLContextAttributes);return context}),registerContext:(function(ctx,webGLContextAttributes){var handle=GL.getNewId(GL.contexts);var context={handle:handle,attributes:webGLContextAttributes,version:webGLContextAttributes["majorVersion"],GLctx:ctx};function getChromeVersion(){var raw=navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);return raw?parseInt(raw[2],10):false}context.supportsWebGL2EntryPoints=context.version>=2&&(getChromeVersion()===false||getChromeVersion()>=58);if(ctx.canvas)ctx.canvas.GLctxObject=context;GL.contexts[handle]=context;if(typeof webGLContextAttributes["enableExtensionsByDefault"]==="undefined"||webGLContextAttributes["enableExtensionsByDefault"]){GL.initExtensions(context)}return handle}),makeContextCurrent:(function(contextHandle){var context=GL.contexts[contextHandle];if(!context)return false;GLctx=Module.ctx=context.GLctx;GL.currentContext=context;return true}),getContext:(function(contextHandle){return GL.contexts[contextHandle]}),deleteContext:(function(contextHandle){if(GL.currentContext===GL.contexts[contextHandle])GL.currentContext=null;if(typeof JSEvents==="object")JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas);if(GL.contexts[contextHandle]&&GL.contexts[contextHandle].GLctx.canvas)GL.contexts[contextHandle].GLctx.canvas.GLctxObject=undefined;GL.contexts[contextHandle]=null}),initExtensions:(function(context){if(!context)context=GL.currentContext;if(context.initExtensionsDone)return;context.initExtensionsDone=true;var GLctx=context.GLctx;context.maxVertexAttribs=GLctx.getParameter(GLctx.MAX_VERTEX_ATTRIBS);if(context.version<2){var instancedArraysExt=GLctx.getExtension("ANGLE_instanced_arrays");if(instancedArraysExt){GLctx["vertexAttribDivisor"]=(function(index,divisor){instancedArraysExt["vertexAttribDivisorANGLE"](index,divisor)});GLctx["drawArraysInstanced"]=(function(mode,first,count,primcount){instancedArraysExt["drawArraysInstancedANGLE"](mode,first,count,primcount)});GLctx["drawElementsInstanced"]=(function(mode,count,type,indices,primcount){instancedArraysExt["drawElementsInstancedANGLE"](mode,count,type,indices,primcount)})}var vaoExt=GLctx.getExtension("OES_vertex_array_object");if(vaoExt){GLctx["createVertexArray"]=(function(){return vaoExt["createVertexArrayOES"]()});GLctx["deleteVertexArray"]=(function(vao){vaoExt["deleteVertexArrayOES"](vao)});GLctx["bindVertexArray"]=(function(vao){vaoExt["bindVertexArrayOES"](vao)});GLctx["isVertexArray"]=(function(vao){return vaoExt["isVertexArrayOES"](vao)})}var drawBuffersExt=GLctx.getExtension("WEBGL_draw_buffers");if(drawBuffersExt){GLctx["drawBuffers"]=(function(n,bufs){drawBuffersExt["drawBuffersWEBGL"](n,bufs)})}}GLctx.disjointTimerQueryExt=GLctx.getExtension("EXT_disjoint_timer_query");var automaticallyEnabledExtensions=["OES_texture_float","OES_texture_half_float","OES_standard_derivatives","OES_vertex_array_object","WEBGL_compressed_texture_s3tc","WEBGL_depth_texture","OES_element_index_uint","EXT_texture_filter_anisotropic","ANGLE_instanced_arrays","OES_texture_float_linear","OES_texture_half_float_linear","WEBGL_compressed_texture_atc","WEBKIT_WEBGL_compressed_texture_pvrtc","WEBGL_compressed_texture_pvrtc","EXT_color_buffer_half_float","WEBGL_color_buffer_float","EXT_frag_depth","EXT_sRGB","WEBGL_draw_buffers","WEBGL_shared_resources","EXT_shader_texture_lod","EXT_color_buffer_float"];var exts=GLctx.getSupportedExtensions();if(exts&&exts.length>0){GLctx.getSupportedExtensions().forEach((function(ext){if(automaticallyEnabledExtensions.indexOf(ext)!=-1){GLctx.getExtension(ext)}}))}}),populateUniformTable:(function(program){var p=GL.programs[program];GL.programInfos[program]={uniforms:{},maxUniformLength:0,maxAttributeLength:-1,maxUniformBlockNameLength:-1};var ptable=GL.programInfos[program];var utable=ptable.uniforms;var numUniforms=GLctx.getProgramParameter(p,GLctx.ACTIVE_UNIFORMS);for(var i=0;i<numUniforms;++i){var u=GLctx.getActiveUniform(p,i);var name=u.name;ptable.maxUniformLength=Math.max(ptable.maxUniformLength,name.length+1);if(name.indexOf("]",name.length-1)!==-1){var ls=name.lastIndexOf("[");name=name.slice(0,ls)}var loc=GLctx.getUniformLocation(p,name);if(loc!=null){var id=GL.getNewId(GL.uniforms);utable[name]=[u.size,id];GL.uniforms[id]=loc;for(var j=1;j<u.size;++j){var n=name+"["+j+"]";loc=GLctx.getUniformLocation(p,n);id=GL.getNewId(GL.uniforms);GL.uniforms[id]=loc}}}})};function _glAttachShader(program,shader){GLctx.attachShader(GL.programs[program],GL.shaders[shader])}function _glBindBuffer(target,buffer){var bufferObj=buffer?GL.buffers[buffer]:null;if(target==35051){GLctx.currentPixelPackBufferBinding=buffer}else if(target==35052){GLctx.currentPixelUnpackBufferBinding=buffer}GLctx.bindBuffer(target,bufferObj)}function _glBindVertexArray(vao){GLctx["bindVertexArray"](GL.vaos[vao])}function _glBufferData(target,size,data,usage){if(!data){GLctx.bufferData(target,size,usage)}else{if(GL.currentContext.supportsWebGL2EntryPoints){GLctx.bufferData(target,HEAPU8,usage,data,size);return}GLctx.bufferData(target,HEAPU8.subarray(data,data+size),usage)}}function _glClear(x0){GLctx["clear"](x0)}function _glClearColor(x0,x1,x2,x3){GLctx["clearColor"](x0,x1,x2,x3)}function _glCompileShader(shader){GLctx.compileShader(GL.shaders[shader])}function _glCreateProgram(){var id=GL.getNewId(GL.programs);var program=GLctx.createProgram();program.name=id;GL.programs[id]=program;return id}function _glCreateShader(shaderType){var id=GL.getNewId(GL.shaders);GL.shaders[id]=GLctx.createShader(shaderType);return id}function _glDeleteBuffers(n,buffers){for(var i=0;i<n;i++){var id=HEAP32[buffers+i*4>>2];var buffer=GL.buffers[id];if(!buffer)continue;GLctx.deleteBuffer(buffer);buffer.name=0;GL.buffers[id]=null;if(id==GL.currArrayBuffer)GL.currArrayBuffer=0;if(id==GL.currElementArrayBuffer)GL.currElementArrayBuffer=0}}function _glDeleteProgram(id){if(!id)return;var program=GL.programs[id];if(!program){GL.recordError(1281);return}GLctx.deleteProgram(program);program.name=0;GL.programs[id]=null;GL.programInfos[id]=null}function _glDeleteShader(id){if(!id)return;var shader=GL.shaders[id];if(!shader){GL.recordError(1281);return}GLctx.deleteShader(shader);GL.shaders[id]=null}function _glDeleteVertexArrays(n,vaos){for(var i=0;i<n;i++){var id=HEAP32[vaos+i*4>>2];GLctx["deleteVertexArray"](GL.vaos[id]);GL.vaos[id]=null}}function _glDisableVertexAttribArray(index){GLctx.disableVertexAttribArray(index)}function _glDrawArrays(mode,first,count){GLctx.drawArrays(mode,first,count)}function _glDrawElements(mode,count,type,indices){GLctx.drawElements(mode,count,type,indices)}function _glEnable(x0){GLctx["enable"](x0)}function _glEnableVertexAttribArray(index){GLctx.enableVertexAttribArray(index)}function _glGenBuffers(n,buffers){for(var i=0;i<n;i++){var buffer=GLctx.createBuffer();if(!buffer){GL.recordError(1282);while(i<n)HEAP32[buffers+i++*4>>2]=0;return}var id=GL.getNewId(GL.buffers);buffer.name=id;GL.buffers[id]=buffer;HEAP32[buffers+i*4>>2]=id}}function _glGenVertexArrays(n,arrays){for(var i=0;i<n;i++){var vao=GLctx["createVertexArray"]();if(!vao){GL.recordError(1282);while(i<n)HEAP32[arrays+i++*4>>2]=0;return}var id=GL.getNewId(GL.vaos);vao.name=id;GL.vaos[id]=vao;HEAP32[arrays+i*4>>2]=id}}function _glGetProgramInfoLog(program,maxLength,length,infoLog){var log=GLctx.getProgramInfoLog(GL.programs[program]);if(log===null)log="(unknown error)";if(maxLength>0&&infoLog){var numBytesWrittenExclNull=stringToUTF8(log,infoLog,maxLength);if(length)HEAP32[length>>2]=numBytesWrittenExclNull}else{if(length)HEAP32[length>>2]=0}}function _glGetProgramiv(program,pname,p){if(!p){GL.recordError(1281);return}if(program>=GL.counter){GL.recordError(1281);return}var ptable=GL.programInfos[program];if(!ptable){GL.recordError(1282);return}if(pname==35716){var log=GLctx.getProgramInfoLog(GL.programs[program]);if(log===null)log="(unknown error)";HEAP32[p>>2]=log.length+1}else if(pname==35719){HEAP32[p>>2]=ptable.maxUniformLength}else if(pname==35722){if(ptable.maxAttributeLength==-1){program=GL.programs[program];var numAttribs=GLctx.getProgramParameter(program,GLctx.ACTIVE_ATTRIBUTES);ptable.maxAttributeLength=0;for(var i=0;i<numAttribs;++i){var activeAttrib=GLctx.getActiveAttrib(program,i);ptable.maxAttributeLength=Math.max(ptable.maxAttributeLength,activeAttrib.name.length+1)}}HEAP32[p>>2]=ptable.maxAttributeLength}else if(pname==35381){if(ptable.maxUniformBlockNameLength==-1){program=GL.programs[program];var numBlocks=GLctx.getProgramParameter(program,GLctx.ACTIVE_UNIFORM_BLOCKS);ptable.maxUniformBlockNameLength=0;for(var i=0;i<numBlocks;++i){var activeBlockName=GLctx.getActiveUniformBlockName(program,i);ptable.maxUniformBlockNameLength=Math.max(ptable.maxUniformBlockNameLength,activeBlockName.length+1)}}HEAP32[p>>2]=ptable.maxUniformBlockNameLength}else{HEAP32[p>>2]=GLctx.getProgramParameter(GL.programs[program],pname)}}function _glGetShaderInfoLog(shader,maxLength,length,infoLog){var log=GLctx.getShaderInfoLog(GL.shaders[shader]);if(log===null)log="(unknown error)";if(maxLength>0&&infoLog){var numBytesWrittenExclNull=stringToUTF8(log,infoLog,maxLength);if(length)HEAP32[length>>2]=numBytesWrittenExclNull}else{if(length)HEAP32[length>>2]=0}}function _glGetShaderiv(shader,pname,p){if(!p){GL.recordError(1281);return}if(pname==35716){var log=GLctx.getShaderInfoLog(GL.shaders[shader]);if(log===null)log="(unknown error)";HEAP32[p>>2]=log.length+1}else if(pname==35720){var source=GLctx.getShaderSource(GL.shaders[shader]);var sourceLength=source===null||source.length==0?0:source.length+1;HEAP32[p>>2]=sourceLength}else{HEAP32[p>>2]=GLctx.getShaderParameter(GL.shaders[shader],pname)}}function _glGetUniformLocation(program,name){name=Pointer_stringify(name);var arrayOffset=0;if(name.indexOf("]",name.length-1)!==-1){var ls=name.lastIndexOf("[");var arrayIndex=name.slice(ls+1,-1);if(arrayIndex.length>0){arrayOffset=parseInt(arrayIndex);if(arrayOffset<0){return-1}}name=name.slice(0,ls)}var ptable=GL.programInfos[program];if(!ptable){return-1}var utable=ptable.uniforms;var uniformInfo=utable[name];if(uniformInfo&&arrayOffset<uniformInfo[0]){return uniformInfo[1]+arrayOffset}else{return-1}}function _glLinkProgram(program){GLctx.linkProgram(GL.programs[program]);GL.programInfos[program]=null;GL.populateUniformTable(program)}function _glShaderSource(shader,count,string,length){var source=GL.getSource(shader,count,string,length);GLctx.shaderSource(GL.shaders[shader],source)}function _glUniform1f(location,v0){GLctx.uniform1f(GL.uniforms[location],v0)}function _glUniform1ui(location,v0){GLctx.uniform1ui(GL.uniforms[location],v0)}function _glUniform3fv(location,count,value){if(GL.currentContext.supportsWebGL2EntryPoints){GLctx.uniform3fv(GL.uniforms[location],HEAPF32,value>>2,count*3);return}var view;if(3*count<=GL.MINI_TEMP_BUFFER_SIZE){view=GL.miniTempBufferViews[3*count-1];for(var i=0;i<3*count;i+=3){view[i]=HEAPF32[value+4*i>>2];view[i+1]=HEAPF32[value+(4*i+4)>>2];view[i+2]=HEAPF32[value+(4*i+8)>>2]}}else{view=HEAPF32.subarray(value>>2,value+count*12>>2)}GLctx.uniform3fv(GL.uniforms[location],view)}function _glUniform4fv(location,count,value){if(GL.currentContext.supportsWebGL2EntryPoints){GLctx.uniform4fv(GL.uniforms[location],HEAPF32,value>>2,count*4);return}var view;if(4*count<=GL.MINI_TEMP_BUFFER_SIZE){view=GL.miniTempBufferViews[4*count-1];for(var i=0;i<4*count;i+=4){view[i]=HEAPF32[value+4*i>>2];view[i+1]=HEAPF32[value+(4*i+4)>>2];view[i+2]=HEAPF32[value+(4*i+8)>>2];view[i+3]=HEAPF32[value+(4*i+12)>>2]}}else{view=HEAPF32.subarray(value>>2,value+count*16>>2)}GLctx.uniform4fv(GL.uniforms[location],view)}function _glUniformMatrix4fv(location,count,transpose,value){if(GL.currentContext.supportsWebGL2EntryPoints){GLctx.uniformMatrix4fv(GL.uniforms[location],!!transpose,HEAPF32,value>>2,count*16);return}var view;if(16*count<=GL.MINI_TEMP_BUFFER_SIZE){view=GL.miniTempBufferViews[16*count-1];for(var i=0;i<16*count;i+=16){view[i]=HEAPF32[value+4*i>>2];view[i+1]=HEAPF32[value+(4*i+4)>>2];view[i+2]=HEAPF32[value+(4*i+8)>>2];view[i+3]=HEAPF32[value+(4*i+12)>>2];view[i+4]=HEAPF32[value+(4*i+16)>>2];view[i+5]=HEAPF32[value+(4*i+20)>>2];view[i+6]=HEAPF32[value+(4*i+24)>>2];view[i+7]=HEAPF32[value+(4*i+28)>>2];view[i+8]=HEAPF32[value+(4*i+32)>>2];view[i+9]=HEAPF32[value+(4*i+36)>>2];view[i+10]=HEAPF32[value+(4*i+40)>>2];view[i+11]=HEAPF32[value+(4*i+44)>>2];view[i+12]=HEAPF32[value+(4*i+48)>>2];view[i+13]=HEAPF32[value+(4*i+52)>>2];view[i+14]=HEAPF32[value+(4*i+56)>>2];view[i+15]=HEAPF32[value+(4*i+60)>>2]}}else{view=HEAPF32.subarray(value>>2,value+count*64>>2)}GLctx.uniformMatrix4fv(GL.uniforms[location],!!transpose,view)}function _glUseProgram(program){GLctx.useProgram(program?GL.programs[program]:null)}function _glVertexAttribDivisor(index,divisor){GLctx["vertexAttribDivisor"](index,divisor)}function _glVertexAttribPointer(index,size,type,normalized,stride,ptr){GLctx.vertexAttribPointer(index,size,type,!!normalized,stride,ptr)}function _glViewport(x0,x1,x2,x3){GLctx["viewport"](x0,x1,x2,x3)}var GLFW={Window:(function(id,width,height,title,monitor,share){this.id=id;this.x=0;this.y=0;this.fullscreen=false;this.storedX=0;this.storedY=0;this.width=width;this.height=height;this.storedWidth=width;this.storedHeight=height;this.title=title;this.monitor=monitor;this.share=share;this.attributes=GLFW.hints;this.inputModes={208897:212993,208898:0,208899:0};this.buttons=0;this.keys=new Array;this.domKeys=new Array;this.shouldClose=0;this.title=null;this.windowPosFunc=null;this.windowSizeFunc=null;this.windowCloseFunc=null;this.windowRefreshFunc=null;this.windowFocusFunc=null;this.windowIconifyFunc=null;this.framebufferSizeFunc=null;this.mouseButtonFunc=null;this.cursorPosFunc=null;this.cursorEnterFunc=null;this.scrollFunc=null;this.dropFunc=null;this.keyFunc=null;this.charFunc=null;this.userptr=null}),WindowFromId:(function(id){if(id<=0||!GLFW.windows)return null;return GLFW.windows[id-1]}),joystickFunc:null,errorFunc:null,monitorFunc:null,active:null,windows:null,monitors:null,monitorString:null,versionString:null,initialTime:null,extensions:null,hints:null,defaultHints:{131073:0,131074:0,131075:1,131076:1,131077:1,135169:8,135170:8,135171:8,135172:8,135173:24,135174:8,135175:0,135176:0,135177:0,135178:0,135179:0,135180:0,135181:0,135182:0,135183:0,139265:196609,139266:1,139267:0,139268:0,139269:0,139270:0,139271:0,139272:0},DOMToGLFWKeyCode:(function(keycode){switch(keycode){case 32:return 32;case 222:return 39;case 188:return 44;case 173:return 45;case 189:return 45;case 190:return 46;case 191:return 47;case 48:return 48;case 49:return 49;case 50:return 50;case 51:return 51;case 52:return 52;case 53:return 53;case 54:return 54;case 55:return 55;case 56:return 56;case 57:return 57;case 59:return 59;case 61:return 61;case 187:return 61;case 65:return 65;case 66:return 66;case 67:return 67;case 68:return 68;case 69:return 69;case 70:return 70;case 71:return 71;case 72:return 72;case 73:return 73;case 74:return 74;case 75:return 75;case 76:return 76;case 77:return 77;case 78:return 78;case 79:return 79;case 80:return 80;case 81:return 81;case 82:return 82;case 83:return 83;case 84:return 84;case 85:return 85;case 86:return 86;case 87:return 87;case 88:return 88;case 89:return 89;case 90:return 90;case 219:return 91;case 220:return 92;case 221:return 93;case 192:return 94;case 27:return 256;case 13:return 257;case 9:return 258;case 8:return 259;case 45:return 260;case 46:return 261;case 39:return 262;case 37:return 263;case 40:return 264;case 38:return 265;case 33:return 266;case 34:return 267;case 36:return 268;case 35:return 269;case 20:return 280;case 145:return 281;case 144:return 282;case 44:return 283;case 19:return 284;case 112:return 290;case 113:return 291;case 114:return 292;case 115:return 293;case 116:return 294;case 117:return 295;case 118:return 296;case 119:return 297;case 120:return 298;case 121:return 299;case 122:return 300;case 123:return 301;case 124:return 302;case 125:return 303;case 126:return 304;case 127:return 305;case 128:return 306;case 129:return 307;case 130:return 308;case 131:return 309;case 132:return 310;case 133:return 311;case 134:return 312;case 135:return 313;case 136:return 314;case 96:return 320;case 97:return 321;case 98:return 322;case 99:return 323;case 100:return 324;case 101:return 325;case 102:return 326;case 103:return 327;case 104:return 328;case 105:return 329;case 110:return 330;case 111:return 331;case 106:return 332;case 109:return 333;case 107:return 334;case 16:return 340;case 17:return 341;case 18:return 342;case 91:return 343;case 93:return 348;default:return-1}}),getModBits:(function(win){var mod=0;if(win.keys[340])mod|=1;if(win.keys[341])mod|=2;if(win.keys[342])mod|=4;if(win.keys[343])mod|=8;return mod}),onKeyPress:(function(event){if(!GLFW.active||!GLFW.active.charFunc)return;if(event.ctrlKey||event.metaKey)return;var charCode=event.charCode;if(charCode==0||charCode>=0&&charCode<=31)return;Module["dynCall_vii"](GLFW.active.charFunc,GLFW.active.id,charCode)}),onKeyChanged:(function(keyCode,status){if(!GLFW.active)return;var key=GLFW.DOMToGLFWKeyCode(keyCode);if(key==-1)return;var repeat=status&&GLFW.active.keys[key];GLFW.active.keys[key]=status;GLFW.active.domKeys[keyCode]=status;if(!GLFW.active.keyFunc)return;if(repeat)status=2;Module["dynCall_viiiii"](GLFW.active.keyFunc,GLFW.active.id,key,keyCode,status,GLFW.getModBits(GLFW.active))}),onGamepadConnected:(function(event){GLFW.refreshJoysticks()}),onGamepadDisconnected:(function(event){GLFW.refreshJoysticks()}),onKeydown:(function(event){GLFW.onKeyChanged(event.keyCode,1);if(event.keyCode===8||event.keyCode===9){event.preventDefault()}}),onKeyup:(function(event){GLFW.onKeyChanged(event.keyCode,0)}),onBlur:(function(event){if(!GLFW.active)return;for(var i=0;i<GLFW.active.domKeys.length;++i){if(GLFW.active.domKeys[i]){GLFW.onKeyChanged(i,0)}}}),onMousemove:(function(event){if(!GLFW.active)return;Browser.calculateMouseEvent(event);if(event.target!=Module["canvas"]||!GLFW.active.cursorPosFunc)return;Module["dynCall_vidd"](GLFW.active.cursorPosFunc,GLFW.active.id,Browser.mouseX,Browser.mouseY)}),DOMToGLFWMouseButton:(function(event){var eventButton=event["button"];if(eventButton>0){if(eventButton==1){eventButton=2}else{eventButton=1}}return eventButton}),onMouseenter:(function(event){if(!GLFW.active)return;if(event.target!=Module["canvas"]||!GLFW.active.cursorEnterFunc)return;Module["dynCall_vii"](GLFW.active.cursorEnterFunc,GLFW.active.id,1)}),onMouseleave:(function(event){if(!GLFW.active)return;if(event.target!=Module["canvas"]||!GLFW.active.cursorEnterFunc)return;Module["dynCall_vii"](GLFW.active.cursorEnterFunc,GLFW.active.id,0)}),onMouseButtonChanged:(function(event,status){if(!GLFW.active)return;Browser.calculateMouseEvent(event);if(event.target!=Module["canvas"])return;eventButton=GLFW.DOMToGLFWMouseButton(event);if(status==1){GLFW.active.buttons|=1<<eventButton;try{event.target.setCapture()}catch(e){}}else{GLFW.active.buttons&=~(1<<eventButton)}if(!GLFW.active.mouseButtonFunc)return;Module["dynCall_viiii"](GLFW.active.mouseButtonFunc,GLFW.active.id,eventButton,status,GLFW.getModBits(GLFW.active))}),onMouseButtonDown:(function(event){if(!GLFW.active)return;GLFW.onMouseButtonChanged(event,1)}),onMouseButtonUp:(function(event){if(!GLFW.active)return;GLFW.onMouseButtonChanged(event,0)}),onMouseWheel:(function(event){var delta=-Browser.getMouseWheelDelta(event);delta=delta==0?0:delta>0?Math.max(delta,1):Math.min(delta,-1);GLFW.wheelPos+=delta;if(!GLFW.active||!GLFW.active.scrollFunc||event.target!=Module["canvas"])return;var sx=0;var sy=0;if(event.type=="mousewheel"){sx=event.wheelDeltaX;sy=event.wheelDeltaY}else{sx=event.deltaX;sy=event.deltaY}Module["dynCall_vidd"](GLFW.active.scrollFunc,GLFW.active.id,sx,sy);event.preventDefault()}),onCanvasResize:(function(width,height){if(!GLFW.active)return;var resizeNeeded=true;if(document["fullscreen"]||document["fullScreen"]||document["mozFullScreen"]||document["webkitIsFullScreen"]){GLFW.active.storedX=GLFW.active.x;GLFW.active.storedY=GLFW.active.y;GLFW.active.storedWidth=GLFW.active.width;GLFW.active.storedHeight=GLFW.active.height;GLFW.active.x=GLFW.active.y=0;GLFW.active.width=screen.width;GLFW.active.height=screen.height;GLFW.active.fullscreen=true}else if(GLFW.active.fullscreen==true){GLFW.active.x=GLFW.active.storedX;GLFW.active.y=GLFW.active.storedY;GLFW.active.width=GLFW.active.storedWidth;GLFW.active.height=GLFW.active.storedHeight;GLFW.active.fullscreen=false}else if(GLFW.active.width!=width||GLFW.active.height!=height){GLFW.active.width=width;GLFW.active.height=height}else{resizeNeeded=false}if(resizeNeeded){Browser.setCanvasSize(GLFW.active.width,GLFW.active.height,true);GLFW.onWindowSizeChanged();GLFW.onFramebufferSizeChanged()}}),onWindowSizeChanged:(function(){if(!GLFW.active)return;if(!GLFW.active.windowSizeFunc)return;Module["dynCall_viii"](GLFW.active.windowSizeFunc,GLFW.active.id,GLFW.active.width,GLFW.active.height)}),onFramebufferSizeChanged:(function(){if(!GLFW.active)return;if(!GLFW.active.framebufferSizeFunc)return;Module["dynCall_viii"](GLFW.active.framebufferSizeFunc,GLFW.active.id,GLFW.active.width,GLFW.active.height)}),requestFullscreen:(function(){var RFS=Module["canvas"]["requestFullscreen"]||Module["canvas"]["mozRequestFullScreen"]||Module["canvas"]["webkitRequestFullScreen"]||(function(){});RFS.apply(Module["canvas"],[])}),requestFullScreen:(function(){Module.printErr("GLFW.requestFullScreen() is deprecated. Please call GLFW.requestFullscreen instead.");GLFW.requestFullScreen=(function(){return GLFW.requestFullscreen()});return GLFW.requestFullscreen()}),exitFullscreen:(function(){var CFS=document["exitFullscreen"]||document["cancelFullScreen"]||document["mozCancelFullScreen"]||document["webkitCancelFullScreen"]||(function(){});CFS.apply(document,[])}),cancelFullScreen:(function(){Module.printErr("GLFW.cancelFullScreen() is deprecated. Please call GLFW.exitFullscreen instead.");GLFW.cancelFullScreen=(function(){return GLFW.exitFullscreen()});return GLFW.exitFullscreen()}),getTime:(function(){return _emscripten_get_now()/1e3}),setWindowTitle:(function(winid,title){var win=GLFW.WindowFromId(winid);if(!win)return;win.title=Pointer_stringify(title);if(GLFW.active.id==win.id){document.title=win.title}}),setJoystickCallback:(function(cbfun){GLFW.joystickFunc=cbfun;GLFW.refreshJoysticks()}),joys:{},lastGamepadState:null,lastGamepadStateFrame:null,refreshJoysticks:(function(){if(Browser.mainLoop.currentFrameNumber!==GLFW.lastGamepadStateFrame||!Browser.mainLoop.currentFrameNumber){GLFW.lastGamepadState=navigator.getGamepads?navigator.getGamepads():navigator.webkitGetGamepads?navigator.webkitGetGamepads:null;GLFW.lastGamepadStateFrame=Browser.mainLoop.currentFrameNumber;for(var joy=0;joy<GLFW.lastGamepadState.length;++joy){var gamepad=GLFW.lastGamepadState[joy];if(gamepad){if(!GLFW.joys[joy]){console.log("glfw joystick connected:",joy);GLFW.joys[joy]={id:allocate(intArrayFromString(gamepad.id),"i8",ALLOC_NORMAL),buttonsCount:gamepad.buttons.length,axesCount:gamepad.axes.length,buttons:allocate(new Array(gamepad.buttons.length),"i8",ALLOC_NORMAL),axes:allocate(new Array(gamepad.axes.length*4),"float",ALLOC_NORMAL)};if(GLFW.joystickFunc){Module["dynCall_vii"](GLFW.joystickFunc,joy,262145)}}var data=GLFW.joys[joy];for(var i=0;i<gamepad.buttons.length;++i){setValue(data.buttons+i,gamepad.buttons[i].pressed,"i8")}for(var i=0;i<gamepad.axes.length;++i){setValue(data.axes+i*4,gamepad.axes[i],"float")}}else{if(GLFW.joys[joy]){console.log("glfw joystick disconnected",joy);if(GLFW.joystickFunc){Module["dynCall_vii"](GLFW.joystickFunc,joy,262146)}_free(GLFW.joys[joy].id);_free(GLFW.joys[joy].buttons);_free(GLFW.joys[joy].axes);delete GLFW.joys[joy]}}}}}),setKeyCallback:(function(winid,cbfun){var win=GLFW.WindowFromId(winid);if(!win)return;win.keyFunc=cbfun}),setCharCallback:(function(winid,cbfun){var win=GLFW.WindowFromId(winid);if(!win)return;win.charFunc=cbfun}),setMouseButtonCallback:(function(winid,cbfun){var win=GLFW.WindowFromId(winid);if(!win)return;win.mouseButtonFunc=cbfun}),setCursorPosCallback:(function(winid,cbfun){var win=GLFW.WindowFromId(winid);if(!win)return;win.cursorPosFunc=cbfun}),setScrollCallback:(function(winid,cbfun){var win=GLFW.WindowFromId(winid);if(!win)return;win.scrollFunc=cbfun}),setDropCallback:(function(winid,cbfun){var win=GLFW.WindowFromId(winid);if(!win)return;win.dropFunc=cbfun}),onDrop:(function(event){if(!GLFW.active||!GLFW.active.dropFunc)return;if(!event.dataTransfer||!event.dataTransfer.files||event.dataTransfer.files.length==0)return;event.preventDefault();var filenames=allocate(new Array(event.dataTransfer.files.length*4),"i8*",ALLOC_NORMAL);var filenamesArray=[];var count=event.dataTransfer.files.length;var written=0;var drop_dir=".glfw_dropped_files";FS.createPath("/",drop_dir);function save(file){var path="/"+drop_dir+"/"+file.name.replace(/\//g,"_");var reader=new FileReader;reader.onloadend=(function(e){if(reader.readyState!=2){++written;console.log("failed to read dropped file: "+file.name+": "+reader.error);return}var data=e.target.result;FS.writeFile(path,new Uint8Array(data));if(++written===count){Module["dynCall_viii"](GLFW.active.dropFunc,GLFW.active.id,count,filenames);for(var i=0;i<filenamesArray.length;++i){_free(filenamesArray[i])}_free(filenames)}});reader.readAsArrayBuffer(file);var filename=allocate(intArrayFromString(path),"i8",ALLOC_NORMAL);filenamesArray.push(filename);setValue(filenames+i*4,filename,"i8*")}for(var i=0;i<count;++i){save(event.dataTransfer.files[i])}return false}),onDragover:(function(event){if(!GLFW.active||!GLFW.active.dropFunc)return;event.preventDefault();return false}),setWindowSizeCallback:(function(winid,cbfun){var win=GLFW.WindowFromId(winid);if(!win)return;win.windowSizeFunc=cbfun}),setWindowCloseCallback:(function(winid,cbfun){var win=GLFW.WindowFromId(winid);if(!win)return;win.windowCloseFunc=cbfun}),setWindowRefreshCallback:(function(winid,cbfun){var win=GLFW.WindowFromId(winid);if(!win)return;win.windowRefreshFunc=cbfun}),onClickRequestPointerLock:(function(e){if(!Browser.pointerLock&&Module["canvas"].requestPointerLock){Module["canvas"].requestPointerLock();e.preventDefault()}}),setInputMode:(function(winid,mode,value){var win=GLFW.WindowFromId(winid);if(!win)return;switch(mode){case 208897:{switch(value){case 212993:{win.inputModes[mode]=value;Module["canvas"].removeEventListener("click",GLFW.onClickRequestPointerLock,true);Module["canvas"].exitPointerLock();break};case 212994:{console.log("glfwSetInputMode called with GLFW_CURSOR_HIDDEN value not implemented.");break};case 212995:{win.inputModes[mode]=value;Module["canvas"].addEventListener("click",GLFW.onClickRequestPointerLock,true);Module["canvas"].requestPointerLock();break};default:{console.log("glfwSetInputMode called with unknown value parameter value: "+value+".");break}}break};case 208898:{console.log("glfwSetInputMode called with GLFW_STICKY_KEYS mode not implemented.");break};case 208899:{console.log("glfwSetInputMode called with GLFW_STICKY_MOUSE_BUTTONS mode not implemented.");break};default:{console.log("glfwSetInputMode called with unknown mode parameter value: "+mode+".");break}}}),getKey:(function(winid,key){var win=GLFW.WindowFromId(winid);if(!win)return 0;return win.keys[key]}),getMouseButton:(function(winid,button){var win=GLFW.WindowFromId(winid);if(!win)return 0;return(win.buttons&1<<button)>0}),getCursorPos:(function(winid,x,y){setValue(x,Browser.mouseX,"double");setValue(y,Browser.mouseY,"double")}),getMousePos:(function(winid,x,y){setValue(x,Browser.mouseX,"i32");setValue(y,Browser.mouseY,"i32")}),setCursorPos:(function(winid,x,y){}),getWindowPos:(function(winid,x,y){var wx=0;var wy=0;var win=GLFW.WindowFromId(winid);if(win){wx=win.x;wy=win.y}setValue(x,wx,"i32");setValue(y,wy,"i32")}),setWindowPos:(function(winid,x,y){var win=GLFW.WindowFromId(winid);if(!win)return;win.x=x;win.y=y}),getWindowSize:(function(winid,width,height){var ww=0;var wh=0;var win=GLFW.WindowFromId(winid);if(win){ww=win.width;wh=win.height}setValue(width,ww,"i32");setValue(height,wh,"i32")}),setWindowSize:(function(winid,width,height){var win=GLFW.WindowFromId(winid);if(!win)return;if(GLFW.active.id==win.id){if(width==screen.width&&height==screen.height){GLFW.requestFullscreen()}else{GLFW.exitFullscreen();Browser.setCanvasSize(width,height);win.width=width;win.height=height}}if(!win.windowSizeFunc)return;Module["dynCall_viii"](win.windowSizeFunc,win.id,width,height)}),createWindow:(function(width,height,title,monitor,share){var i,id;for(i=0;i<GLFW.windows.length&&GLFW.windows[i]!==null;i++);if(i>0)throw"glfwCreateWindow only supports one window at time currently";id=i+1;if(width<=0||height<=0)return 0;if(monitor){GLFW.requestFullscreen()}else{Browser.setCanvasSize(width,height)}for(i=0;i<GLFW.windows.length&&GLFW.windows[i]==null;i++);if(i==GLFW.windows.length){var contextAttributes={antialias:GLFW.hints[135181]>1,depth:GLFW.hints[135173]>0,stencil:GLFW.hints[135174]>0,alpha:GLFW.hints[135172]>0};Module.ctx=Browser.createContext(Module["canvas"],true,true,contextAttributes)}if(!Module.ctx)return 0;var win=new GLFW.Window(id,width,height,title,monitor,share);if(id-1==GLFW.windows.length){GLFW.windows.push(win)}else{GLFW.windows[id-1]=win}GLFW.active=win;return win.id}),destroyWindow:(function(winid){var win=GLFW.WindowFromId(winid);if(!win)return;if(win.windowCloseFunc)Module["dynCall_vi"](win.windowCloseFunc,win.id);GLFW.windows[win.id-1]=null;if(GLFW.active.id==win.id)GLFW.active=null;for(var i=0;i<GLFW.windows.length;i++)if(GLFW.windows[i]!==null)return;Module.ctx=Browser.destroyContext(Module["canvas"],true,true)}),swapBuffers:(function(winid){}),GLFW2ParamToGLFW3Param:(function(param){table={196609:0,196610:0,196611:0,196612:0,196613:0,196614:0,131073:0,131074:0,131075:0,131076:0,131077:135169,131078:135170,131079:135171,131080:135172,131081:135173,131082:135174,131083:135183,131084:135175,131085:135176,131086:135177,131087:135178,131088:135179,131089:135180,131090:0,131091:135181,131092:139266,131093:139267,131094:139270,131095:139271,131096:139272};return table[param]})};function _glfwCreateWindow(width,height,title,monitor,share){return GLFW.createWindow(width,height,title,monitor,share)}function _glfwDestroyWindow(winid){return GLFW.destroyWindow(winid)}function _glfwInit(){if(GLFW.windows)return 1;GLFW.initialTime=GLFW.getTime();GLFW.hints=GLFW.defaultHints;GLFW.windows=new Array;GLFW.active=null;window.addEventListener("gamepadconnected",GLFW.onGamepadConnected,true);window.addEventListener("gamepaddisconnected",GLFW.onGamepadDisconnected,true);window.addEventListener("keydown",GLFW.onKeydown,true);window.addEventListener("keypress",GLFW.onKeyPress,true);window.addEventListener("keyup",GLFW.onKeyup,true);window.addEventListener("blur",GLFW.onBlur,true);Module["canvas"].addEventListener("mousemove",GLFW.onMousemove,true);Module["canvas"].addEventListener("mousedown",GLFW.onMouseButtonDown,true);Module["canvas"].addEventListener("mouseup",GLFW.onMouseButtonUp,true);Module["canvas"].addEventListener("wheel",GLFW.onMouseWheel,true);Module["canvas"].addEventListener("mousewheel",GLFW.onMouseWheel,true);Module["canvas"].addEventListener("mouseenter",GLFW.onMouseenter,true);Module["canvas"].addEventListener("mouseleave",GLFW.onMouseleave,true);Module["canvas"].addEventListener("drop",GLFW.onDrop,true);Module["canvas"].addEventListener("dragover",GLFW.onDragover,true);Browser.resizeListeners.push((function(width,height){GLFW.onCanvasResize(width,height)}));return 1}function _glfwMakeContextCurrent(winid){}function _glfwPollEvents(){}function _glfwSetErrorCallback(cbfun){GLFW.errorFunc=cbfun}function _glfwSetWindowSizeCallback(winid,cbfun){GLFW.setWindowSizeCallback(winid,cbfun)}function _glfwSwapBuffers(winid){GLFW.swapBuffers(winid)}function _glfwTerminate(){window.removeEventListener("gamepadconnected",GLFW.onGamepadConnected,true);window.removeEventListener("gamepaddisconnected",GLFW.onGamepadDisconnected,true);window.removeEventListener("keydown",GLFW.onKeydown,true);window.removeEventListener("keypress",GLFW.onKeyPress,true);window.removeEventListener("keyup",GLFW.onKeyup,true);window.removeEventListener("blur",GLFW.onBlur,true);Module["canvas"].removeEventListener("mousemove",GLFW.onMousemove,true);Module["canvas"].removeEventListener("mousedown",GLFW.onMouseButtonDown,true);Module["canvas"].removeEventListener("mouseup",GLFW.onMouseButtonUp,true);Module["canvas"].removeEventListener("wheel",GLFW.onMouseWheel,true);Module["canvas"].removeEventListener("mousewheel",GLFW.onMouseWheel,true);Module["canvas"].removeEventListener("mouseenter",GLFW.onMouseenter,true);Module["canvas"].removeEventListener("mouseleave",GLFW.onMouseleave,true);Module["canvas"].removeEventListener("drop",GLFW.onDrop,true);Module["canvas"].removeEventListener("dragover",GLFW.onDragover,true);Module["canvas"].width=Module["canvas"].height=1;GLFW.windows=null;GLFW.active=null}function _glfwWindowHint(target,hint){GLFW.hints[target]=hint}var _llvm_fabs_f32=Math_abs;var _llvm_pow_f64=Math_pow;var _llvm_sqrt_f32=Math_sqrt;function _llvm_trap(){abort("trap!")}function _emscripten_memcpy_big(dest,src,num){HEAPU8.set(HEAPU8.subarray(src,src+num),dest);return dest}var PTHREAD_SPECIFIC={};function _pthread_getspecific(key){return PTHREAD_SPECIFIC[key]||0}var PTHREAD_SPECIFIC_NEXT_KEY=1;function _pthread_key_create(key,destructor){if(key==0){return ERRNO_CODES.EINVAL}HEAP32[key>>2]=PTHREAD_SPECIFIC_NEXT_KEY;PTHREAD_SPECIFIC[PTHREAD_SPECIFIC_NEXT_KEY]=0;PTHREAD_SPECIFIC_NEXT_KEY++;return 0}function _pthread_once(ptr,func){if(!_pthread_once.seen)_pthread_once.seen={};if(ptr in _pthread_once.seen)return;Module["dynCall_v"](func);_pthread_once.seen[ptr]=1}function _pthread_setspecific(key,value){if(!(key in PTHREAD_SPECIFIC)){return ERRNO_CODES.EINVAL}PTHREAD_SPECIFIC[key]=value;return 0}if(ENVIRONMENT_IS_NODE){_emscripten_get_now=function _emscripten_get_now_actual(){var t=process["hrtime"]();return t[0]*1e3+t[1]/1e6}}else if(typeof dateNow!=="undefined"){_emscripten_get_now=dateNow}else if(typeof self==="object"&&self["performance"]&&typeof self["performance"]["now"]==="function"){_emscripten_get_now=(function(){return self["performance"]["now"]()})}else if(typeof performance==="object"&&typeof performance["now"]==="function"){_emscripten_get_now=(function(){return performance["now"]()})}else{_emscripten_get_now=Date.now}Module["requestFullScreen"]=function Module_requestFullScreen(lockPointer,resizeCanvas,vrDevice){Module.printErr("Module.requestFullScreen is deprecated. Please call Module.requestFullscreen instead.");Module["requestFullScreen"]=Module["requestFullscreen"];Browser.requestFullScreen(lockPointer,resizeCanvas,vrDevice)};Module["requestFullscreen"]=function Module_requestFullscreen(lockPointer,resizeCanvas,vrDevice){Browser.requestFullscreen(lockPointer,resizeCanvas,vrDevice)};Module["requestAnimationFrame"]=function Module_requestAnimationFrame(func){Browser.requestAnimationFrame(func)};Module["setCanvasSize"]=function Module_setCanvasSize(width,height,noUpdates){Browser.setCanvasSize(width,height,noUpdates)};Module["pauseMainLoop"]=function Module_pauseMainLoop(){Browser.mainLoop.pause()};Module["resumeMainLoop"]=function Module_resumeMainLoop(){Browser.mainLoop.resume()};Module["getUserMedia"]=function Module_getUserMedia(){Browser.getUserMedia()};Module["createContext"]=function Module_createContext(canvas,useWebGL,setInModule,webGLContextAttributes){return Browser.createContext(canvas,useWebGL,setInModule,webGLContextAttributes)};JSEvents.staticInit();var GLctx;GL.init();DYNAMICTOP_PTR=staticAlloc(4);STACK_BASE=STACKTOP=alignMemory(STATICTOP);STACK_MAX=STACK_BASE+TOTAL_STACK;DYNAMIC_BASE=alignMemory(STACK_MAX);HEAP32[DYNAMICTOP_PTR>>2]=DYNAMIC_BASE;staticSealed=true;var ASSERTIONS=false;function intArrayFromString(stringy,dontAddNull,length){var len=length>0?length:lengthBytesUTF8(stringy)+1;var u8array=new Array(len);var numBytesWritten=stringToUTF8Array(stringy,u8array,0,u8array.length);if(dontAddNull)u8array.length=numBytesWritten;return u8array}function invoke_ii(index,a1){try{return Module["dynCall_ii"](index,a1)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_iii(index,a1,a2){try{return Module["dynCall_iii"](index,a1,a2)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_iiii(index,a1,a2,a3){try{return Module["dynCall_iiii"](index,a1,a2,a3)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_v(index){try{Module["dynCall_v"](index)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_vi(index,a1){try{Module["dynCall_vi"](index,a1)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_vii(index,a1,a2){try{Module["dynCall_vii"](index,a1,a2)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_viii(index,a1,a2,a3){try{Module["dynCall_viii"](index,a1,a2,a3)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_viiii(index,a1,a2,a3,a4){try{Module["dynCall_viiii"](index,a1,a2,a3,a4)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_viiiii(index,a1,a2,a3,a4,a5){try{Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6){try{Module["dynCall_viiiiii"](index,a1,a2,a3,a4,a5,a6)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}Module.asmGlobalArg={"Math":Math,"Int8Array":Int8Array,"Int16Array":Int16Array,"Int32Array":Int32Array,"Uint8Array":Uint8Array,"Uint16Array":Uint16Array,"Uint32Array":Uint32Array,"Float32Array":Float32Array,"Float64Array":Float64Array,"NaN":NaN,"Infinity":Infinity,"byteLength":byteLength};Module.asmLibraryArg={"abort":abort,"assert":assert,"enlargeMemory":enlargeMemory,"getTotalMemory":getTotalMemory,"abortOnCannotGrowMemory":abortOnCannotGrowMemory,"invoke_ii":invoke_ii,"invoke_iii":invoke_iii,"invoke_iiii":invoke_iiii,"invoke_v":invoke_v,"invoke_vi":invoke_vi,"invoke_vii":invoke_vii,"invoke_viii":invoke_viii,"invoke_viiii":invoke_viiii,"invoke_viiiii":invoke_viiiii,"invoke_viiiiii":invoke_viiiiii,"__ZN16TerrainGenerator23UpdateShowBoundingBoxesEPviS0_":__ZN16TerrainGenerator23UpdateShowBoundingBoxesEPviS0_,"__ZN16TerrainGenerator6UpdateEPviS0_":__ZN16TerrainGenerator6UpdateEPviS0_,"__ZSt18uncaught_exceptionv":__ZSt18uncaught_exceptionv,"___cxa_allocate_exception":___cxa_allocate_exception,"___cxa_begin_catch":___cxa_begin_catch,"___cxa_find_matching_catch":___cxa_find_matching_catch,"___cxa_pure_virtual":___cxa_pure_virtual,"___cxa_throw":___cxa_throw,"___gxx_personality_v0":___gxx_personality_v0,"___resumeException":___resumeException,"___setErrNo":___setErrNo,"___syscall140":___syscall140,"___syscall146":___syscall146,"___syscall6":___syscall6,"_abort":_abort,"_clock_gettime":_clock_gettime,"_emscripten_asm_const_i":_emscripten_asm_const_i,"_emscripten_asm_const_iii":_emscripten_asm_const_iii,"_emscripten_call_worker":_emscripten_call_worker,"_emscripten_create_worker":_emscripten_create_worker,"_emscripten_force_exit":_emscripten_force_exit,"_emscripten_get_now":_emscripten_get_now,"_emscripten_get_now_is_monotonic":_emscripten_get_now_is_monotonic,"_emscripten_memcpy_big":_emscripten_memcpy_big,"_emscripten_set_main_loop":_emscripten_set_main_loop,"_emscripten_set_main_loop_arg":_emscripten_set_main_loop_arg,"_emscripten_set_main_loop_timing":_emscripten_set_main_loop_timing,"_emscripten_set_mousedown_callback":_emscripten_set_mousedown_callback,"_emscripten_set_mousemove_callback":_emscripten_set_mousemove_callback,"_emscripten_set_wheel_callback":_emscripten_set_wheel_callback,"_emscripten_worker_respond":_emscripten_worker_respond,"_glAttachShader":_glAttachShader,"_glBindBuffer":_glBindBuffer,"_glBindVertexArray":_glBindVertexArray,"_glBufferData":_glBufferData,"_glClear":_glClear,"_glClearColor":_glClearColor,"_glCompileShader":_glCompileShader,"_glCreateProgram":_glCreateProgram,"_glCreateShader":_glCreateShader,"_glDeleteBuffers":_glDeleteBuffers,"_glDeleteProgram":_glDeleteProgram,"_glDeleteShader":_glDeleteShader,"_glDeleteVertexArrays":_glDeleteVertexArrays,"_glDisableVertexAttribArray":_glDisableVertexAttribArray,"_glDrawArrays":_glDrawArrays,"_glDrawElements":_glDrawElements,"_glEnable":_glEnable,"_glEnableVertexAttribArray":_glEnableVertexAttribArray,"_glGenBuffers":_glGenBuffers,"_glGenVertexArrays":_glGenVertexArrays,"_glGetProgramInfoLog":_glGetProgramInfoLog,"_glGetProgramiv":_glGetProgramiv,"_glGetShaderInfoLog":_glGetShaderInfoLog,"_glGetShaderiv":_glGetShaderiv,"_glGetUniformLocation":_glGetUniformLocation,"_glLinkProgram":_glLinkProgram,"_glShaderSource":_glShaderSource,"_glUniform1f":_glUniform1f,"_glUniform1ui":_glUniform1ui,"_glUniform3fv":_glUniform3fv,"_glUniform4fv":_glUniform4fv,"_glUniformMatrix4fv":_glUniformMatrix4fv,"_glUseProgram":_glUseProgram,"_glVertexAttribDivisor":_glVertexAttribDivisor,"_glVertexAttribPointer":_glVertexAttribPointer,"_glViewport":_glViewport,"_glfwCreateWindow":_glfwCreateWindow,"_glfwDestroyWindow":_glfwDestroyWindow,"_glfwInit":_glfwInit,"_glfwMakeContextCurrent":_glfwMakeContextCurrent,"_glfwPollEvents":_glfwPollEvents,"_glfwSetErrorCallback":_glfwSetErrorCallback,"_glfwSetWindowSizeCallback":_glfwSetWindowSizeCallback,"_glfwSwapBuffers":_glfwSwapBuffers,"_glfwTerminate":_glfwTerminate,"_glfwWindowHint":_glfwWindowHint,"_llvm_fabs_f32":_llvm_fabs_f32,"_llvm_pow_f64":_llvm_pow_f64,"_llvm_sqrt_f32":_llvm_sqrt_f32,"_llvm_trap":_llvm_trap,"_pthread_getspecific":_pthread_getspecific,"_pthread_key_create":_pthread_key_create,"_pthread_once":_pthread_once,"_pthread_setspecific":_pthread_setspecific,"flush_NO_FILESYSTEM":flush_NO_FILESYSTEM,"DYNAMICTOP_PTR":DYNAMICTOP_PTR,"tempDoublePtr":tempDoublePtr,"ABORT":ABORT,"STACKTOP":STACKTOP,"STACK_MAX":STACK_MAX,"cttz_i8":cttz_i8};// EMSCRIPTEN_START_ASM
var asm=(/** @suppress {uselessCode} */ function(global,env,buffer) {
"almost asm";var a=global.Int8Array;var b=new a(buffer);var c=global.Int16Array;var d=new c(buffer);var e=global.Int32Array;var f=new e(buffer);var g=global.Uint8Array;var h=new g(buffer);var i=global.Uint16Array;var j=new i(buffer);var k=global.Uint32Array;var l=new k(buffer);var m=global.Float32Array;var n=new m(buffer);var o=global.Float64Array;var p=new o(buffer);var q=global.byteLength;var r=env.DYNAMICTOP_PTR|0;var s=env.tempDoublePtr|0;var t=env.ABORT|0;var u=env.STACKTOP|0;var v=env.STACK_MAX|0;var w=env.cttz_i8|0;var x=0;var y=0;var z=0;var A=0;var B=global.NaN,C=global.Infinity;var D=0,E=0,F=0,G=0,H=0.0;var I=0;var J=global.Math.floor;var K=global.Math.abs;var L=global.Math.sqrt;var M=global.Math.pow;var N=global.Math.cos;var O=global.Math.sin;var P=global.Math.tan;var Q=global.Math.acos;var R=global.Math.asin;var S=global.Math.atan;var T=global.Math.atan2;var U=global.Math.exp;var V=global.Math.log;var W=global.Math.ceil;var X=global.Math.imul;var Y=global.Math.min;var Z=global.Math.max;var _=global.Math.clz32;var $=env.abort;var aa=env.assert;var ba=env.enlargeMemory;var ca=env.getTotalMemory;var da=env.abortOnCannotGrowMemory;var ea=env.invoke_ii;var fa=env.invoke_iii;var ga=env.invoke_iiii;var ha=env.invoke_v;var ia=env.invoke_vi;var ja=env.invoke_vii;var ka=env.invoke_viii;var la=env.invoke_viiii;var ma=env.invoke_viiiii;var na=env.invoke_viiiiii;var oa=env.__ZN16TerrainGenerator23UpdateShowBoundingBoxesEPviS0_;var pa=env.__ZN16TerrainGenerator6UpdateEPviS0_;var qa=env.__ZSt18uncaught_exceptionv;var ra=env.___cxa_allocate_exception;var sa=env.___cxa_begin_catch;var ta=env.___cxa_find_matching_catch;var ua=env.___cxa_pure_virtual;var va=env.___cxa_throw;var wa=env.___gxx_personality_v0;var xa=env.___resumeException;var ya=env.___setErrNo;var za=env.___syscall140;var Aa=env.___syscall146;var Ba=env.___syscall6;var Ca=env._abort;var Da=env._clock_gettime;var Ea=env._emscripten_asm_const_i;var Fa=env._emscripten_asm_const_iii;var Ga=env._emscripten_call_worker;var Ha=env._emscripten_create_worker;var Ia=env._emscripten_force_exit;var Ja=env._emscripten_get_now;var Ka=env._emscripten_get_now_is_monotonic;var La=env._emscripten_memcpy_big;var Ma=env._emscripten_set_main_loop;var Na=env._emscripten_set_main_loop_arg;var Oa=env._emscripten_set_main_loop_timing;var Pa=env._emscripten_set_mousedown_callback;var Qa=env._emscripten_set_mousemove_callback;var Ra=env._emscripten_set_wheel_callback;var Sa=env._emscripten_worker_respond;var Ta=env._glAttachShader;var Ua=env._glBindBuffer;var Va=env._glBindVertexArray;var Wa=env._glBufferData;var Xa=env._glClear;var Ya=env._glClearColor;var Za=env._glCompileShader;var _a=env._glCreateProgram;var $a=env._glCreateShader;var ab=env._glDeleteBuffers;var bb=env._glDeleteProgram;var cb=env._glDeleteShader;var db=env._glDeleteVertexArrays;var eb=env._glDisableVertexAttribArray;var fb=env._glDrawArrays;var gb=env._glDrawElements;var hb=env._glEnable;var ib=env._glEnableVertexAttribArray;var jb=env._glGenBuffers;var kb=env._glGenVertexArrays;var lb=env._glGetProgramInfoLog;var mb=env._glGetProgramiv;var nb=env._glGetShaderInfoLog;var ob=env._glGetShaderiv;var pb=env._glGetUniformLocation;var qb=env._glLinkProgram;var rb=env._glShaderSource;var sb=env._glUniform1f;var tb=env._glUniform1ui;var ub=env._glUniform3fv;var vb=env._glUniform4fv;var wb=env._glUniformMatrix4fv;var xb=env._glUseProgram;var yb=env._glVertexAttribDivisor;var zb=env._glVertexAttribPointer;var Ab=env._glViewport;var Bb=env._glfwCreateWindow;var Cb=env._glfwDestroyWindow;var Db=env._glfwInit;var Eb=env._glfwMakeContextCurrent;var Fb=env._glfwPollEvents;var Gb=env._glfwSetErrorCallback;var Hb=env._glfwSetWindowSizeCallback;var Ib=env._glfwSwapBuffers;var Jb=env._glfwTerminate;var Kb=env._glfwWindowHint;var Lb=env._llvm_fabs_f32;var Mb=env._llvm_pow_f64;var Nb=env._llvm_sqrt_f32;var Ob=env._llvm_trap;var Pb=env._pthread_getspecific;var Qb=env._pthread_key_create;var Rb=env._pthread_once;var Sb=env._pthread_setspecific;var Tb=env.flush_NO_FILESYSTEM;var Ub=0.0;function Vb(newBuffer){if(q(newBuffer)&16777215||q(newBuffer)<=16777215||q(newBuffer)>2147483648)return false;b=new a(newBuffer);d=new c(newBuffer);f=new e(newBuffer);h=new g(newBuffer);j=new i(newBuffer);l=new k(newBuffer);n=new m(newBuffer);p=new o(newBuffer);buffer=newBuffer;return true}
// EMSCRIPTEN_START_FUNCS
function ec(a){a=a|0;var b=0;b=u;u=u+a|0;u=u+15&-16;return b|0}function fc(){return u|0}function gc(a){a=a|0;u=a}function hc(a,b){a=a|0;b=b|0;u=a;v=b}function ic(a,b){a=a|0;b=b|0;if(!x){x=a;y=b}}function jc(a){a=a|0;I=a}function kc(){return I|0}function lc(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;d=u;u=u+16|0;e=d;pa(e|0,a|0,b|0,c|0);Sa(f[e>>2]|0,f[e+4>>2]|0);u=d;return}function mc(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;d=u;u=u+16|0;e=d;oa(e|0,a|0,b|0,c|0);Sa(f[e>>2]|0,f[e+4>>2]|0);u=d;return}function nc(a,c){a=a|0;c=c|0;var d=0,e=0,g=0,h=0,i=0;d=u;u=u+128|0;e=d+24|0;g=d;if((a|0)<3){h=800;i=1200}else{a=Og(f[c+4>>2]|0)|0;h=Og(f[c+8>>2]|0)|0;i=a}f[2884]=i;f[2885]=h;If(g,1795,i,h);Hb(Mf(g)|0,7)|0;Ab(0,0,i|0,h|0);Ya(0.0,0.0,0.0,1.0);hb(2929);n[2813]=.10000000149011612;n[2814]=4.0e4;n[2809]=0.0;n[2808]=.5235987901687622;n[2810]=.009999999776482582;n[2811]=+(i|0)/+(h|0);b[11533]=1;f[2839]=0;f[2840]=0;f[2841]=0;b[11532]=1;f[2941]=11232;Pa(0,0,1,5)|0;Qa(0,0,1,6)|0;Ra(0,0,1,7)|0;Ea(0)|0;h=gh(8)|0;Lc(h);f[2930]=h;h=Dc()|0;f[2931]=h;h=gh(4)|0;Fa(1,1979,e|0)|0;i=Ha(e|0)|0;f[h>>2]=i;f[2932]=h;Nf(g,38);Kf(g);u=d;return 0}function oc(a,c,d){a=a|0;c=c|0;d=d|0;Ab(0,0,c|0,d|0);f[2884]=c;f[2885]=d;n[2811]=+(c|0)/+(d|0);b[11533]=1;return}function pc(a){a=a|0;var c=0,d=0,e=0.0,g=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,o=0,p=0,q=0,r=0,s=0,t=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;c=u;u=u+112|0;d=c+96|0;Fb();e=+jg(+n[2808]+-4.3633198365569115e-03,6.28318530717958);n[2808]=e;e=+n[2809];g=e<-1.539380431175232?-1.539380431175232:e;n[2809]=g>1.539380431175232?1.539380431175232:g;b[11532]=1;tc(11232);g=+n[2842];e=-g;h=+n[2844];i=-h;j=h*h+g*g;if(j>0.0){g=+L(+j);k=e/g;l=i/g}else{k=e;l=i}n[2839]=+n[2839]+k*100.0;n[2841]=+n[2841]+l*100.0;b[11532]=1;tc(11232);l=+n[2810];k=+n[2842]*l+ +n[2839];i=+n[2843]*l+ +n[2840];e=+n[2844]*l+ +n[2841];yd(d,f[2931]|0,k,e,0);l=+n[d>>2]+1.0e3;if(l>i){tc(11232);m=l}else{tc(11232);m=l*.050000011920928955+i*.949999988079071}i=+n[2810];l=+n[2843]*i;g=+n[2844]*i;n[2839]=k-+n[2842]*i;n[2840]=m-l;n[2841]=e-g;b[11532]=1;d=b[12528]|0;if((b[12530]|0)!=d<<24>>24){b[12530]=d;d=f[f[2932]>>2]|0;o=f[101]|0;p=gh(8)|0;f[p>>2]=8;f[p+4>>2]=0;Ga(d|0,o|0,12530,1,9,p|0)}if(b[12529]|0){sc(c,11232);Nc(f[2930]|0);Ld(f[2931]|0,11232,f[2930]|0);Md(f[2931]|0,11232,f[2930]|0);Xa(16640);rf(11640,Hc(Mc(f[2930]|0)|0)|0);Lf(a);q=11544;r=q;s=f[r>>2]|0;t=q+4|0;v=t;w=f[v>>2]|0;x=yi(s|0,w|0,1,0)|0;y=I;z=11544;A=z;f[A>>2]=x;B=z+4|0;C=B;f[C>>2]=y;u=c;return}if(f[2929]|0)do{rf(11640,f[(f[2928]|0)+8>>2]|0);p=f[2928]|0;o=p+4|0;d=f[p>>2]|0;f[d+4>>2]=f[o>>2];f[f[o>>2]>>2]=d;f[2929]=(f[2929]|0)+-1;d=f[p+12>>2]|0;if(d|0){o=p+16|0;if((f[o>>2]|0)!=(d|0))f[o>>2]=d;hh(d)}hh(p)}while((f[2929]|0)!=0);Xa(16640);p=f[2933]|0;if(p|0)rf(11640,p);if(b[12531]|0){Lf(a);q=11544;r=q;s=f[r>>2]|0;t=q+4|0;v=t;w=f[v>>2]|0;x=yi(s|0,w|0,1,0)|0;y=I;z=11544;A=z;f[A>>2]=x;B=z+4|0;C=B;f[C>>2]=y;u=c;return}b[12531]=1;p=f[f[2932]>>2]|0;d=f[100]|0;o=gh(8)|0;f[o>>2]=10;f[o+4>>2]=0;Ga(p|0,d|0,11232,320,11,o|0);Lf(a);q=11544;r=q;s=f[r>>2]|0;t=q+4|0;v=t;w=f[v>>2]|0;x=yi(s|0,w|0,1,0)|0;y=I;z=11544;A=z;f[A>>2]=x;B=z+4|0;C=B;f[C>>2]=y;u=c;return}function qc(a){a=a|0;b[12528]=(a|0)!=0&1;return}function rc(a){a=a|0;b[12529]=(a|0)!=0&1;return}function sc(a,b){a=a|0;b=b|0;var c=0.0,d=0.0,e=0.0,g=0.0,h=0.0,i=0.0,j=0,k=0.0,l=0.0,m=0,o=0.0,p=0.0,q=0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,M=0.0,N=0.0,O=0.0,Q=0.0,R=0.0,S=0.0,T=0.0,U=0.0,V=0.0,W=0,X=0,Y=0;tc(b);c=+n[b+20>>2];d=c*+P(+(+n[b+16>>2]*.5));e=-d;g=d*+n[b+12>>2];h=-g;i=+n[b+24>>2];tc(b);j=b+136|0;k=+n[j>>2];l=-k;m=b+140|0;o=+n[m>>2];p=-o;q=b+144|0;r=+n[q>>2];s=-r;tc(b);t=+n[b+8>>2];u=+n[j>>2]*t+ +n[b+124>>2];v=+n[m>>2]*t+ +n[b+128>>2];w=+n[q>>2]*t+ +n[b+132>>2];t=c*l;x=c*p;y=c*s;c=+n[b+160>>2];z=t+c*h;A=+n[b+164>>2];B=x+A*h;C=+n[b+168>>2];D=y+C*h;h=+n[b+156>>2];E=+n[b+152>>2];F=h*B-E*D;G=+n[b+148>>2];H=G*D-h*z;D=E*z-G*B;B=H*H+F*F+D*D;if(B>0.0){z=+L(+B);I=D/z;J=F/z;K=H/z}else{I=D;J=F;K=H}H=t+c*g;F=x+A*g;D=y+C*g;g=D*E-h*F;z=h*H-G*D;D=G*F-E*H;H=z*z+g*g+D*D;if(H>0.0){F=+L(+H);M=D/F;N=g/F;O=z/F}else{M=D;N=g;O=z}z=t+G*e;g=x+E*e;D=y+h*e;e=D*A-C*g;F=C*z-c*D;D=c*g-A*z;z=F*F+e*e+D*D;if(z>0.0){g=+L(+z);Q=D/g;R=e/g;S=F/g}else{Q=D;R=e;S=F}F=t+G*d;G=x+E*d;E=y+h*d;d=C*G-A*E;h=c*E-C*F;C=A*F-c*G;G=h*h+d*d+C*C;if(G>0.0){c=+L(+G);T=C/c;U=d/c;V=h/c}else{T=C;U=d;V=h}q=b+28|0;n[q>>2]=J;n[b+32>>2]=K;n[b+36>>2]=I;n[b+40>>2]=-(I*w+(J*u+K*v));m=b+44|0;n[m>>2]=N;n[b+48>>2]=O;n[b+52>>2]=M;n[b+56>>2]=-(M*w+(N*u+O*v));j=b+60|0;n[j>>2]=R;n[b+64>>2]=S;n[b+68>>2]=Q;n[b+72>>2]=-(Q*w+(R*u+S*v));W=b+76|0;n[W>>2]=U;n[b+80>>2]=V;n[b+84>>2]=T;n[b+88>>2]=-(T*w+(U*u+V*v));X=b+92|0;n[X>>2]=l;n[b+96>>2]=p;n[b+100>>2]=s;n[b+104>>2]=-((t+u)*l+(x+v)*p+(y+w)*s);Y=b+108|0;n[Y>>2]=k;n[b+112>>2]=o;n[b+116>>2]=r;n[b+120>>2]=(i*p+v)*p+(i*l+u)*l+(i*s+w)*s;f[a>>2]=f[q>>2];f[a+4>>2]=f[q+4>>2];f[a+8>>2]=f[q+8>>2];f[a+12>>2]=f[q+12>>2];q=a+16|0;f[q>>2]=f[m>>2];f[q+4>>2]=f[m+4>>2];f[q+8>>2]=f[m+8>>2];f[q+12>>2]=f[m+12>>2];m=a+32|0;f[m>>2]=f[j>>2];f[m+4>>2]=f[j+4>>2];f[m+8>>2]=f[j+8>>2];f[m+12>>2]=f[j+12>>2];j=a+48|0;f[j>>2]=f[W>>2];f[j+4>>2]=f[W+4>>2];f[j+8>>2]=f[W+8>>2];f[j+12>>2]=f[W+12>>2];W=a+64|0;f[W>>2]=f[X>>2];f[W+4>>2]=f[X+4>>2];f[W+8>>2]=f[X+8>>2];f[W+12>>2]=f[X+12>>2];X=a+80|0;f[X>>2]=f[Y>>2];f[X+4>>2]=f[Y+4>>2];f[X+8>>2]=f[Y+8>>2];f[X+12>>2]=f[Y+12>>2];return}function tc(a){a=a|0;var c=0,d=0.0,e=0.0,g=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,o=0.0,p=0.0,q=0,r=0;c=a+300|0;if(b[c>>0]|0){d=+n[a>>2]*.5;e=+N(+d);g=+O(+d);d=+n[a+4>>2]*.5;h=+N(+d);i=+O(+d);d=h*e;j=i*g;k=h*g;g=i*e;e=g*2.0;i=k*-2.0;h=i*k+1.0-e*g;g=e*d-i*j;k=e*j+i*d;n[a+136>>2]=h;n[a+140>>2]=g;n[a+144>>2]=k;d=+n[a+8>>2];i=h*d+ +n[a+124>>2];j=g*d+ +n[a+128>>2];e=k*d+ +n[a+132>>2];d=-h;l=h*h+k*k;if(l>0.0){m=+L(+l);o=d/m;p=k/m}else{o=d;p=k}n[a+160>>2]=p;f[a+164>>2]=0;n[a+168>>2]=o;d=o*g;m=p*k-h*o;l=-(g*p);n[a+148>>2]=d;n[a+152>>2]=m;n[a+156>>2]=l;n[a+172>>2]=p;n[a+176>>2]=d;n[a+180>>2]=h;f[a+184>>2]=0;f[a+188>>2]=0;n[a+192>>2]=m;n[a+196>>2]=g;f[a+200>>2]=0;n[a+204>>2]=o;n[a+208>>2]=l;n[a+212>>2]=k;f[a+216>>2]=0;n[a+220>>2]=-(p*i+o*e);n[a+224>>2]=-(d*i+m*j+e*l);n[a+228>>2]=-(h*i+g*j+k*e);f[a+232>>2]=1065353216}q=a+301|0;if(!(b[q>>0]|0)){b[c>>0]=0;b[q>>0]=0;return}e=+P(+(+n[a+16>>2]*.5));k=+n[a+20>>2];j=+n[a+24>>2];g=j-k;n[a+236>>2]=1.0/(e*+n[a+12>>2]);r=a+240|0;f[r>>2]=0;f[r+4>>2]=0;f[r+8>>2]=0;f[r+12>>2]=0;n[a+256>>2]=1.0/e;r=a+260|0;f[r>>2]=0;f[r+4>>2]=0;f[r+8>>2]=0;f[r+12>>2]=0;n[a+276>>2]=-(k+j)/g;f[a+280>>2]=-1082130432;f[a+284>>2]=0;f[a+288>>2]=0;n[a+292>>2]=k*-2.0*j/g;f[a+296>>2]=0;b[c>>0]=0;b[q>>0]=0;return}function uc(a,b,c){a=a|0;b=b|0;c=c|0;ac[f[c>>2]&15](a,b,f[c+4>>2]|0);if(!c)return;hh(c);return}function vc(a,b,c){a=a|0;b=b|0;c=c|0;return}function wc(a,b,c){a=a|0;b=b|0;c=c|0;ac[f[c>>2]&15](a,b,f[c+4>>2]|0);if(!c)return;hh(c);return}function xc(a,c,d){a=a|0;c=c|0;d=d|0;var e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;d=u;u=u+16|0;c=d;if((b[11552]|0)==0?pi(11552)|0:0){f[2934]=0;f[2935]=0;f[2936]=0;f[2937]=0;f[2938]=0;f[2939]=0}if(!a){b[12531]=0;u=d;return}e=a+(f[a>>2]|0)|0;g=a+(f[a+4>>2]|0)|0;h=a+8|0;i=f[h>>2]|0;f[c>>2]=0;j=c+4|0;f[j>>2]=0;f[c+8>>2]=0;if(!i){k=0;l=0}else{if((i|0)<0)Wg(c);m=gh(i)|0;f[j>>2]=m;f[c>>2]=m;f[c+8>>2]=m+i;n=i;i=m;do{b[i>>0]=0;i=(f[j>>2]|0)+1|0;f[j>>2]=i;n=n+-1|0}while((n|0)!=0);k=f[c>>2]|0;l=f[h>>2]|0}Hi(k|0,e|0,l|0)|0;l=Kc(k,f[h>>2]|0)|0;h=gh(24)|0;f[h+8>>2]=l;f[h+12>>2]=f[c>>2];f[h+16>>2]=f[j>>2];l=c+8|0;f[h+20>>2]=f[l>>2];f[l>>2]=0;f[j>>2]=0;f[c>>2]=0;f[h+4>>2]=11708;l=f[2927]|0;f[h>>2]=l;f[l+4>>2]=h;f[2927]=h;f[2929]=(f[2929]|0)+1;h=f[2940]|0;l=11736+(h*12|0)|0;k=a+12|0;a=f[k>>2]|0;e=11736+(h*12|0)+4|0;n=f[e>>2]|0;i=f[l>>2]|0;m=n-i|0;o=i;i=n;if(a>>>0<=m>>>0)if(a>>>0<m>>>0?(n=o+a|0,(n|0)!=(i|0)):0){f[e>>2]=n;p=h;q=a}else{p=h;q=a}else{yc(l,a-m|0);p=f[2940]|0;q=f[k>>2]|0}m=11736+(p*12|0)|0;if(!q)r=0;else{Ii(f[m>>2]|0,g|0,q|0)|0;r=f[k>>2]|0}k=Kc(f[m>>2]|0,r)|0;f[2933]=k;f[2940]=1-(f[2940]|0);k=f[c>>2]|0;if(k|0){if((f[j>>2]|0)!=(k|0))f[j>>2]=k;hh(k)}b[12531]=0;u=d;return}function yc(a,c){a=a|0;c=c|0;var d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0;d=a+8|0;e=f[d>>2]|0;g=a+4|0;h=f[g>>2]|0;if((e-h|0)>>>0>=c>>>0){i=c;j=h;do{b[j>>0]=0;j=(f[g>>2]|0)+1|0;f[g>>2]=j;i=i+-1|0}while((i|0)!=0);return}i=f[a>>2]|0;j=h-i|0;h=j+c|0;if((h|0)<0)Wg(a);k=e-i|0;i=k<<1;e=k>>>0<1073741823?(i>>>0<h>>>0?h:i):2147483647;if(!e)l=0;else l=gh(e)|0;i=l+j|0;j=l+e|0;e=c;c=i;l=i;do{b[l>>0]=0;l=c+1|0;c=l;e=e+-1|0}while((e|0)!=0);e=f[a>>2]|0;l=(f[g>>2]|0)-e|0;h=i+(0-l)|0;if((l|0)>0)Hi(h|0,e|0,l|0)|0;f[a>>2]=h;f[g>>2]=c;f[d>>2]=j;if(!e)return;hh(e);return}function zc(a,b,c){a=a|0;b=b|0;c=c|0;return 1}function Ac(a,c,d){a=a|0;c=c|0;d=d|0;var e=0.0,g=0.0,h=0.0,i=0.0,k=0,l=0.0;e=+(f[c+60>>2]|0);g=e-+p[1445];h=+(f[c+64>>2]|0);i=h-+p[1446];p[1445]=e;p[1446]=h;d=j[c+42>>1]|0;do if(!((d&4|0)!=0|(d&3|0)==3)){if(d&1|0){c=f[2941]|0;h=+jg(+n[c>>2]-g*.009999999776482582,6.28318530717958);n[c>>2]=h;a=c+4|0;h=+n[a>>2]+i*.009999999776482582;e=h<-1.539380431175232?-1.539380431175232:h;n[a>>2]=e>1.539380431175232?1.539380431175232:e;k=c;break}if(!(d&2))return 0;else{c=f[2941]|0;e=i*.20000000298023224;tc(c);a=c+124|0;n[a>>2]=+n[a>>2]-+n[c+136>>2]*e;a=c+128|0;n[a>>2]=+n[a>>2]-+n[c+140>>2]*e;a=c+132|0;n[a>>2]=+n[a>>2]-+n[c+144>>2]*e;k=c;break}}else{c=f[2941]|0;tc(c);e=+n[c+8>>2];a=c+124|0;h=g*-2.0000000949949026e-03*e;l=i*2.0000000949949026e-03*e;n[a>>2]=+n[a>>2]+ +n[c+160>>2]*h+ +n[c+148>>2]*l;a=c+128|0;n[a>>2]=+n[a>>2]+ +n[c+164>>2]*h+ +n[c+152>>2]*l;a=c+132|0;n[a>>2]=+n[a>>2]+ +n[c+168>>2]*h+ +n[c+156>>2]*l;k=c}while(0);b[k+300>>0]=1;return 0}function Bc(a,c,d){a=a|0;c=c|0;d=d|0;var e=0.0;d=f[2941]|0;a=d+8|0;e=+U(+(+p[c+80>>3]*2.4999999441206455e-03))*+n[a>>2];n[a>>2]=e;b[d+300>>0]=1;return 0}function Cc(){var a=0;n[2808]=0.0;n[2809]=0.0;n[2810]=10.0;n[2811]=1.0;n[2812]=1.5707963705062866;n[2813]=.10000000149011612;n[2814]=1.0e3;sc(11260,11232);b[11532]=1;b[11533]=1;a=11544;f[a>>2]=0;f[a+4>>2]=0;ef(11640,11232);f[2927]=11708;f[2928]=11708;f[2929]=0;b[12528]=b[12530]|0;return}function Dc(){var a=0;a=gh(148)|0;Pc(a,0);return a|0}function Ec(a){a=a|0;f[a>>2]=0;f[a+4>>2]=2048;f[a+8>>2]=0;f[a+12>>2]=0;f[a+16>>2]=0;return}function Fc(a){a=a|0;var b=0,c=0,d=0,e=0;f[a+4>>2]=2048;b=f[a>>2]|0;if(!b){c=gh(12)|0;f[c>>2]=2048;d=Sf(2048)|0;f[c+4>>2]=d;f[c+8>>2]=0;f[a>>2]=c;e=c}else e=b;f[a+8>>2]=e;b=f[e+4>>2]|0;f[a+12>>2]=b;f[a+16>>2]=b+(f[e>>2]|0);b=e;do{f[f[b+4>>2]>>2]=-1;b=f[b+8>>2]|0}while((b|0)!=0);return}function Gc(a){a=a|0;var b=0,c=0,d=0,e=0,g=0;b=f[a>>2]|0;if(!b){c=gh(12)|0;d=f[a+4>>2]|0;f[c>>2]=d;e=Sf(d)|0;f[c+4>>2]=e;f[c+8>>2]=0;f[a>>2]=c;g=c}else g=b;f[a+8>>2]=g;b=f[g+4>>2]|0;f[a+12>>2]=b;f[a+16>>2]=b+(f[g>>2]|0);b=g;do{f[f[b+4>>2]>>2]=-1;b=f[b+8>>2]|0}while((b|0)!=0);return}function Hc(a){a=a|0;return f[a>>2]|0}function Ic(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,g=0,h=0,i=0,j=0,k=0;c=a+8|0;d=(f[c>>2]|0)+8|0;e=f[d>>2]|0;if(!e){g=a+4|0;h=f[g>>2]<<1;i=h>>>0<16384?h:16384;h=i>>>0>b>>>0?i:b;f[g>>2]=h;g=gh(12)|0;f[g>>2]=h;b=Sf(h)|0;f[g+4>>2]=b;f[g+8>>2]=0;f[d>>2]=g;if(!b){j=0;return j|0}else k=g}else k=e;f[c>>2]=k;c=(f[k+4>>2]|0)+3&-4;e=c;f[a+12>>2]=e;f[a+16>>2]=e+(f[k>>2]|0);f[c>>2]=-1;j=1;return j|0}function Jc(a){a=a|0;var b=0;b=f[a+4>>2]|0;if(b|0)hh(b);b=f[a+8>>2]|0;if(!b)return;else{Jc(b);hh(b);return}}function Kc(a,b){a=a|0;b=b|0;var c=0,d=0,e=0;if(!a)return a|0;else{c=a;d=a}while(1){b=d+4|0;f[b>>2]=a+(f[b>>2]|0);b=d+8|0;if(!(f[b>>2]|0))break;e=c+12|0;f[b>>2]=e;c=e;d=e}return a|0}function Lc(a){a=a|0;var c=0;c=gh(20)|0;Ec(c);f[a>>2]=c;b[a+4>>0]=1;return}function Mc(a){a=a|0;return f[a>>2]|0}function Nc(a){a=a|0;Gc(f[a>>2]|0);return}function Oc(a,b){a=a|0;b=b|0;var c=0;c=a+4|0;a=f[c>>2]|0;f[a+12>>2]=b;f[b+8>>2]=a;f[c>>2]=b;return}function Pc(a,c){a=a|0;c=c|0;var e=0,g=0;f[a+4>>2]=1065353216;e=a+8|0;f[e>>2]=0;f[e+4>>2]=0;f[e+8>>2]=0;f[e+12>>2]=0;f[a+24>>2]=1065353216;e=a+28|0;f[e>>2]=0;f[e+4>>2]=0;f[e+8>>2]=0;f[e+12>>2]=0;f[a+44>>2]=1065353216;e=a+48|0;f[e>>2]=0;f[e+4>>2]=0;f[e+8>>2]=0;f[e+12>>2]=0;f[a+64>>2]=1065353216;e=a+68|0;g=e+36|0;do{f[e>>2]=0;e=e+4|0}while((e|0)<(g|0));f[a>>2]=416;f[a+108>>2]=0;f[a+112>>2]=0;f[a+104>>2]=a+108;n[a+116>>2]=20.0;e=a+120|0;f[e>>2]=0;f[e+4>>2]=0;f[e+8>>2]=0;f[e+12>>2]=0;f[a+136>>2]=e;f[a+140>>2]=e;d[a+144>>1]=c;b[a+146>>0]=0;return}function Qc(a,b){a=a|0;b=b|0;pd(a,b);return}function Rc(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0;c=f[a+68>>2]|0;d=f[a+72>>2]|0;if((c|0)==(d|0))return;else e=c;do{c=f[e>>2]|0;a=f[e+4>>2]|0;if(!a)Hd(c,b);else{bh(a);Hd(c,b);dh(a)}e=e+8|0}while((e|0)!=(d|0));return}function Sc(a,b,c){a=a|0;b=b|0;c=c|0;gd(a,b,c);return}function Tc(a,b){a=a|0;b=b|0;ad(a,b);return}function Uc(a,b){a=a|0;b=b|0;_c(a,b);return}function Vc(a){a=a|0;var b=0;f[a>>2]=416;b=f[a+124>>2]|0;if(b|0)dh(b);Xc(a+104|0,f[a+108>>2]|0);Yc(a);return}function Wc(a){a=a|0;var b=0;f[a>>2]=416;b=f[a+124>>2]|0;if(b|0)dh(b);Xc(a+104|0,f[a+108>>2]|0);Yc(a);hh(a);return}function Xc(a,b){a=a|0;b=b|0;if(!b)return;Xc(a,f[b>>2]|0);Xc(a,f[b+4>>2]|0);a=f[b+32>>2]|0;if(a|0)dh(a);hh(b);return}function Yc(a){a=a|0;var b=0,c=0,d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;f[a>>2]=452;b=a+92|0;c=f[b>>2]|0;if(c|0){d=a+96|0;e=f[d>>2]|0;if((e|0)==(c|0))g=c;else{h=e;while(1){e=h+-8|0;f[d>>2]=e;i=f[h+-4>>2]|0;if(!i)j=e;else{dh(i);j=f[d>>2]|0}if((j|0)==(c|0))break;else h=j}g=f[b>>2]|0}hh(g)}g=a+80|0;b=f[g>>2]|0;if(b|0){j=a+84|0;h=f[j>>2]|0;if((h|0)==(b|0))k=b;else{c=h;while(1){h=c+-8|0;f[j>>2]=h;d=f[c+-4>>2]|0;if(!d)l=h;else{dh(d);l=f[j>>2]|0}if((l|0)==(b|0))break;else c=l}k=f[g>>2]|0}hh(k)}k=a+68|0;g=f[k>>2]|0;if(!g)return;l=a+72|0;a=f[l>>2]|0;if((a|0)==(g|0))m=g;else{c=a;while(1){a=c+-8|0;f[l>>2]=a;b=f[c+-4>>2]|0;if(!b)n=a;else{dh(b);n=f[l>>2]|0}if((n|0)==(g|0))break;else c=n}m=f[k>>2]|0}hh(m);return}function Zc(a){a=a|0;Ob()}function _c(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;c=a+120|0;d=a+132|0;e=f[d>>2]|0;if(!e){f[d>>2]=0;g=a+140|0;f[g>>2]=c;return}h=a+104|0;i=a+108|0;j=a+112|0;k=e;while(1){e=f[k>>2]|0;l=k+4|0;m=f[l>>2]|0;n=(m|0)==0;if(!n){bh(m);o=f[l>>2]|0;p=f[k+12>>2]|0;f[k>>2]=0;f[l>>2]=0;if(!o)q=p;else{dh(o);q=p}}else{p=f[k+12>>2]|0;f[k>>2]=0;f[l>>2]=0;q=p}a:do if(e|0?(Gd(e,b),p=f[i>>2]|0,p|0):0){l=f[e+244>>2]|0;o=f[e+248>>2]|0;r=f[e+252>>2]|0;s=i;t=p;b:while(1){u=t;c:while(1){v=f[u+16>>2]|0;do if((v|0)==(l|0)){w=f[u+20>>2]|0;if((w|0)==(o|0))if((f[u+24>>2]|0)<(r|0))break;else break c;else if((w|0)<(o|0))break;else break c}else if(v>>>0>=l>>>0)break c;while(0);v=f[u+4>>2]|0;if(!v){x=s;break b}else u=v}t=f[u>>2]|0;if(!t){x=u;break}else s=u}if((x|0)!=(i|0)){s=f[x+16>>2]|0;do if((l|0)==(s|0)){t=f[x+20>>2]|0;if((o|0)==(t|0))if((r|0)<(f[x+24>>2]|0))break a;else break;else if((o|0)<(t|0))break a;else break}else if(l>>>0<s>>>0)break a;while(0);s=f[x+4>>2]|0;if(!s){l=x+8|0;o=f[l>>2]|0;if((f[o>>2]|0)==(x|0))y=o;else{o=l;do{l=f[o>>2]|0;o=l+8|0;r=f[o>>2]|0}while((f[r>>2]|0)!=(l|0));y=r}}else{o=s;while(1){r=f[o>>2]|0;if(!r)break;else o=r}y=o}if((f[h>>2]|0)==(x|0))f[h>>2]=y;f[j>>2]=(f[j>>2]|0)+-1;$c(p,x);s=f[x+32>>2]|0;if(s|0)dh(s);hh(x)}}while(0);if(!n)dh(m);if(!q)break;else k=q}f[d>>2]=0;g=a+140|0;f[g>>2]=c;return}function $c(a,c){a=a|0;c=c|0;var d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;d=f[c>>2]|0;if(d){e=f[c+4>>2]|0;if(!e){g=c;h=d}else{d=e;while(1){e=f[d>>2]|0;if(!e){g=d;h=0;break}else d=e}}}else{g=c;h=0}d=g+4|0;e=f[(h|0?g:d)>>2]|0;h=(e|0)!=0;i=g+8|0;if(h)f[e+8>>2]=f[i>>2];j=f[i>>2]|0;k=f[j>>2]|0;if((k|0)==(g|0)){f[j>>2]=e;if((g|0)==(a|0)){l=e;m=0}else{l=a;m=f[j+4>>2]|0}}else{f[j+4>>2]=e;l=a;m=k}k=g+12|0;a=(b[k>>0]|0)!=0;if((g|0)==(c|0))n=l;else{j=c+8|0;o=f[j>>2]|0;f[i>>2]=o;f[((f[f[j>>2]>>2]|0)==(c|0)?o:o+4|0)>>2]=g;o=f[c>>2]|0;f[g>>2]=o;f[o+8>>2]=g;o=f[c+4>>2]|0;f[d>>2]=o;if(o|0)f[o+8>>2]=g;b[k>>0]=b[c+12>>0]|0;n=(l|0)==(c|0)?g:l}if(!(a&(n|0)!=0))return;if(h){b[e+12>>0]=1;return}else{p=m;q=n}while(1){n=p+8|0;m=f[n>>2]|0;e=p+12|0;h=(b[e>>0]|0)!=0;if((f[m>>2]|0)==(p|0)){if(h){r=p;s=q}else{b[e>>0]=1;b[m+12>>0]=0;a=p+4|0;l=f[a>>2]|0;f[m>>2]=l;if(l|0)f[l+8>>2]=m;l=m+8|0;f[n>>2]=f[l>>2];n=f[l>>2]|0;f[((f[n>>2]|0)==(m|0)?n:n+4|0)>>2]=p;f[a>>2]=m;f[l>>2]=p;r=f[m>>2]|0;s=(q|0)==(m|0)?p:q}t=f[r>>2]|0;u=(t|0)==0;if(!u?(b[t+12>>0]|0)==0:0){v=49;break}l=f[r+4>>2]|0;if(l|0?(b[l+12>>0]|0)==0:0){v=48;break}b[r+12>>0]=0;l=f[r+8>>2]|0;w=l+12|0;if((l|0)==(s|0)|(b[w>>0]|0)==0){v=47;break}else{x=s;y=l}}else{if(h){z=p;A=q}else{b[e>>0]=1;b[m+12>>0]=0;e=m+4|0;h=f[e>>2]|0;l=f[h>>2]|0;f[e>>2]=l;if(l|0)f[l+8>>2]=m;l=m+8|0;f[h+8>>2]=f[l>>2];e=f[l>>2]|0;f[((f[e>>2]|0)==(m|0)?e:e+4|0)>>2]=h;f[h>>2]=m;f[l>>2]=h;h=f[p>>2]|0;z=f[h+4>>2]|0;A=(q|0)==(h|0)?p:q}B=f[z>>2]|0;if(B|0?(b[B+12>>0]|0)==0:0){v=30;break}h=f[z+4>>2]|0;if(h|0?(b[h+12>>0]|0)==0:0){C=h;v=31;break}b[z+12>>0]=0;h=f[z+8>>2]|0;if((h|0)==(A|0)){D=A;v=29;break}if(!(b[h+12>>0]|0)){D=h;v=29;break}else{x=A;y=h}}h=f[y+8>>2]|0;p=f[((f[h>>2]|0)==(y|0)?h+4|0:h)>>2]|0;q=x}if((v|0)==29){b[D+12>>0]=1;return}else if((v|0)==30){D=f[z+4>>2]|0;if(!D)v=32;else{C=D;v=31}}else if((v|0)==47){b[w>>0]=1;return}else if((v|0)==48)if(u)v=50;else v=49;if((v|0)==31)if(!(b[C+12>>0]|0)){E=z;F=C;v=35}else v=32;else if((v|0)==49)if(!(b[t+12>>0]|0)){G=r;H=t;v=53}else v=50;if((v|0)==32){b[B+12>>0]=1;b[z+12>>0]=0;t=B+4|0;C=f[t>>2]|0;f[z>>2]=C;if(C|0)f[C+8>>2]=z;C=z+8|0;f[B+8>>2]=f[C>>2];u=f[C>>2]|0;f[((f[u>>2]|0)==(z|0)?u:u+4|0)>>2]=B;f[t>>2]=z;f[C>>2]=B;E=B;F=z;v=35}else if((v|0)==50){z=r+4|0;B=f[z>>2]|0;b[B+12>>0]=1;b[r+12>>0]=0;C=f[B>>2]|0;f[z>>2]=C;if(C|0)f[C+8>>2]=r;C=r+8|0;f[B+8>>2]=f[C>>2];z=f[C>>2]|0;f[((f[z>>2]|0)==(r|0)?z:z+4|0)>>2]=B;f[B>>2]=r;f[C>>2]=B;G=B;H=r;v=53}if((v|0)==35){r=f[E+8>>2]|0;B=r+12|0;b[E+12>>0]=b[B>>0]|0;b[B>>0]=1;b[F+12>>0]=1;F=r+4|0;B=f[F>>2]|0;E=f[B>>2]|0;f[F>>2]=E;if(E|0)f[E+8>>2]=r;E=r+8|0;f[B+8>>2]=f[E>>2];F=f[E>>2]|0;f[((f[F>>2]|0)==(r|0)?F:F+4|0)>>2]=B;f[B>>2]=r;f[E>>2]=B;return}else if((v|0)==53){v=f[G+8>>2]|0;B=v+12|0;b[G+12>>0]=b[B>>0]|0;b[B>>0]=1;b[H+12>>0]=1;H=f[v>>2]|0;B=H+4|0;G=f[B>>2]|0;f[v>>2]=G;if(G|0)f[G+8>>2]=v;G=v+8|0;f[H+8>>2]=f[G>>2];E=f[G>>2]|0;f[((f[E>>2]|0)==(v|0)?E:E+4|0)>>2]=H;f[B>>2]=v;f[G>>2]=H;return}}function ad(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;c=a+80|0;d=a+84|0;bd(f[c>>2]|0,f[d>>2]|0);e=Qg()|0;g=I;h=f[c>>2]|0;i=f[d>>2]|0;if((h|0)==(i|0))return;j=a+120|0;k=a+128|0;l=a+136|0;m=a+140|0;a=h;do{h=f[a>>2]|0;n=f[a+4>>2]|0;o=(n|0)==0;if(o)Fd(h,b)|0;else{bh(n);Fd(h,b)|0;bh(n);bh(n)}p=h;f[p+276>>2]=h;h=p+280|0;q=f[h>>2]|0;f[h>>2]=n;if(q|0)dh(q);q=p+276|0;if((j|0)!=(q|0)?(h=f[k>>2]|0,r=p+284|0,s=f[r>>2]|0,t=p+288|0,p=f[t>>2]|0,(h|0)!=(q|0)):0){if(s|0)f[s+12>>2]=p;if(p|0)f[p+8>>2]=s;if(h|0)f[h+12>>2]=q;f[k>>2]=q;f[r>>2]=h;f[t>>2]=j;if((f[l>>2]|0)==(j|0))f[l>>2]=q;if((f[m>>2]|0)==(q|0))f[m>>2]=s}if(o){o=Qg()|0;s=zi(o|0,I|0,e|0,g|0)|0;o=I;if(!((o|0)<0|(o|0)==0&s>>>0<11e6))break}else{dh(n);s=Qg()|0;o=zi(s|0,I|0,e|0,g|0)|0;s=I;dh(n);if(!((s|0)<0|(s|0)==0&o>>>0<11e6))break}a=a+8|0}while((a|0)!=(i|0));i=f[c>>2]|0;c=f[d>>2]|0;if((c|0)==(i|0))return;else u=c;while(1){c=u+-8|0;f[d>>2]=c;a=f[u+-4>>2]|0;if(!a)v=c;else{dh(a);v=f[d>>2]|0}if((v|0)==(i|0))break;else u=v}return}function bd(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0.0,w=0.0,x=0.0,y=0,z=0,A=0,B=0,C=0.0,D=0.0,E=0,F=0,G=0,H=0.0,I=0,J=0,K=0,L=0.0,M=0,N=0,O=0,P=0.0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0.0,Z=0,_=0,$=0,aa=0.0,ba=0,ca=0,da=0,ea=0,fa=0.0,ga=0,ha=0.0,ia=0,ja=0,ka=0.0,la=0,ma=0,na=0,oa=0,pa=0;c=a;a=b;a:while(1){b=a;d=a+-8|0;e=a+-4|0;g=c;while(1){h=g;b:while(1){i=h;j=b-i|0;k=j>>3;switch(k|0){case 2:{l=5;break a;break}case 3:{l=22;break a;break}case 4:{l=23;break a;break}case 5:{l=24;break a;break}case 1:case 0:{l=228;break a;break}default:{}}if((j|0)<56){l=26;break a}m=(k|0)/2|0;o=h+(m<<3)|0;if((j|0)>7992){j=(k|0)/4|0;p=ed(h,h+(j<<3)|0,o,o+(j<<3)|0,d)|0}else p=cd(h,o,d)|0;j=f[h>>2]|0;q=h+4|0;k=f[q>>2]|0;r=(k|0)==0;if(!r)bh(k);s=f[o>>2]|0;t=h+(m<<3)+4|0;m=f[t>>2]|0;u=(m|0)==0;if(!u)bh(m);if(!r)bh(k);v=+n[j+260>>2];if(u)w=+n[s+260>>2];else{bh(m);x=+n[s+260>>2];dh(m);w=x}if(!r)dh(k);if(!u)dh(m);if(!r)dh(k);if(v>w){y=d;z=p;break}else A=d;while(1){k=A;A=A+-8|0;if((h|0)==(A|0))break;r=f[A>>2]|0;B=k+-4|0;k=f[B>>2]|0;m=(k|0)==0;if(!m)bh(k);u=f[o>>2]|0;s=f[t>>2]|0;j=(s|0)==0;if(!j)bh(s);if(!m)bh(k);v=+n[r+260>>2];if(j)C=+n[u+260>>2];else{bh(s);x=+n[u+260>>2];dh(s);C=x}if(!m)dh(k);if(!j)dh(s);if(!m)dh(k);if(v>C){l=166;break b}}t=h+8|0;k=f[h>>2]|0;m=f[q>>2]|0;s=(m|0)==0;if(!s)bh(m);j=f[d>>2]|0;u=f[e>>2]|0;r=(u|0)==0;if(!r)bh(u);if(!s)bh(m);v=+n[k+260>>2];if(r)D=+n[j+260>>2];else{bh(u);x=+n[j+260>>2];dh(u);D=x}if(!s)dh(m);if(!r)dh(u);if(!s)dh(m);if(v>D)E=t;else{if((t|0)==(d|0)){l=228;break a}else F=t;while(1){t=f[h>>2]|0;m=f[q>>2]|0;s=(m|0)==0;if(!s)bh(m);u=f[F>>2]|0;G=F+4|0;r=f[G>>2]|0;j=(r|0)==0;if(!j)bh(r);if(!s)bh(m);v=+n[t+260>>2];if(j)H=+n[u+260>>2];else{bh(r);x=+n[u+260>>2];dh(r);H=x}if(!s)dh(m);if(!j)dh(r);if(!s)dh(m);if(v>H)break;m=F+8|0;if((m|0)==(d|0)){l=228;break a}else F=m}m=f[F>>2]|0;f[F>>2]=f[d>>2];f[d>>2]=m;m=f[G>>2]|0;f[G>>2]=f[e>>2];f[e>>2]=m;E=F+8|0}if((E|0)==(d|0)){l=228;break a}else{I=d;J=E}while(1){m=J;while(1){s=f[h>>2]|0;r=f[q>>2]|0;j=(r|0)==0;if(!j)bh(r);u=f[m>>2]|0;K=m+4|0;t=f[K>>2]|0;k=(t|0)==0;if(!k)bh(t);if(!j)bh(r);v=+n[s+260>>2];if(k)L=+n[u+260>>2];else{bh(t);x=+n[u+260>>2];dh(t);L=x}if(!j)dh(r);if(!k)dh(t);if(!j)dh(r);M=m+8|0;if(v>L){N=I;break}else m=M}do{r=f[h>>2]|0;j=f[q>>2]|0;t=(j|0)==0;if(!t)bh(j);k=N;N=N+-8|0;u=f[N>>2]|0;O=k+-4|0;k=f[O>>2]|0;s=(k|0)==0;if(!s)bh(k);if(!t)bh(j);v=+n[r+260>>2];if(s)P=+n[u+260>>2];else{bh(k);x=+n[u+260>>2];dh(k);P=x}if(!t)dh(j);if(!s)dh(k);if(!t)dh(j)}while(v>P);if(m>>>0>=N>>>0){h=m;continue b}j=f[m>>2]|0;f[m>>2]=f[N>>2];f[N>>2]=j;j=f[K>>2]|0;f[K>>2]=f[O>>2];f[O>>2]=j;I=N;J=M}}if((l|0)==166){l=0;j=f[h>>2]|0;f[h>>2]=f[A>>2];f[A>>2]=j;j=f[q>>2]|0;f[q>>2]=f[B>>2];f[B>>2]=j;y=A;z=p+1|0}j=h+8|0;c:do if(j>>>0<y>>>0){t=o;k=y;s=j;u=z;while(1){r=t+4|0;Q=s;while(1){R=f[Q>>2]|0;S=Q+4|0;T=f[S>>2]|0;U=(T|0)==0;if(!U)bh(T);V=f[t>>2]|0;W=f[r>>2]|0;X=(W|0)==0;if(!X)bh(W);if(!U)bh(T);v=+n[R+260>>2];if(X)Y=+n[V+260>>2];else{bh(W);x=+n[V+260>>2];dh(W);Y=x}if(!U)dh(T);if(!X)dh(W);if(!U)dh(T);Z=Q+8|0;if(v>Y)Q=Z;else{_=k;break}}do{m=_;_=_+-8|0;T=f[_>>2]|0;$=m+-4|0;m=f[$>>2]|0;U=(m|0)==0;if(!U)bh(m);W=f[t>>2]|0;X=f[r>>2]|0;V=(X|0)==0;if(!V)bh(X);if(!U)bh(m);v=+n[T+260>>2];if(V)aa=+n[W+260>>2];else{bh(X);x=+n[W+260>>2];dh(X);aa=x}if(!U)dh(m);if(!V)dh(X);if(!U)dh(m)}while(!(v>aa));if(Q>>>0>_>>>0){ba=t;ca=u;da=Q;break c}r=f[Q>>2]|0;f[Q>>2]=f[_>>2];f[_>>2]=r;r=f[S>>2]|0;f[S>>2]=f[$>>2];f[$>>2]=r;t=(t|0)==(Q|0)?_:t;k=_;s=Z;u=u+1|0}}else{ba=o;ca=z;da=j}while(0);do if((da|0)==(ba|0))ea=ca;else{j=f[ba>>2]|0;u=ba+4|0;s=f[u>>2]|0;k=(s|0)==0;if(!k)bh(s);t=f[da>>2]|0;r=da+4|0;m=f[r>>2]|0;U=(m|0)==0;if(!U)bh(m);if(!k)bh(s);v=+n[j+260>>2];if(U)fa=+n[t+260>>2];else{bh(m);x=+n[t+260>>2];dh(m);fa=x}t=v>fa;if(!k)dh(s);if(!U)dh(m);if(k){if(!t){ea=ca;break}}else{dh(s);if(!t){ea=ca;break}}t=f[da>>2]|0;f[da>>2]=f[ba>>2];f[ba>>2]=t;t=f[r>>2]|0;f[r>>2]=f[u>>2];f[u>>2]=t;ea=ca+1|0}while(0);if(!ea){ga=fd(h,da)|0;t=da+8|0;if(fd(t,a)|0){l=227;break}if(ga){g=t;continue}}t=da;if((t-i|0)>=(b-t|0)){l=226;break}bd(h,da);g=da+8|0}if((l|0)==226){l=0;bd(da+8|0,a);c=h;a=da;continue}else if((l|0)==227){l=0;if(ga){l=228;break}else{c=h;a=da;continue}}}if((l|0)==5){da=f[d>>2]|0;c=f[e>>2]|0;ga=(c|0)==0;if(!ga)bh(c);i=f[h>>2]|0;ea=h+4|0;ca=f[ea>>2]|0;ba=(ca|0)==0;if(!ba)bh(ca);if(!ga)bh(c);fa=+n[da+260>>2];if(ba)ha=+n[i+260>>2];else{bh(ca);aa=+n[i+260>>2];dh(ca);ha=aa}if(!ga)dh(c);if(!ba)dh(ca);if(!ga)dh(c);if(!(fa>ha))return;c=f[h>>2]|0;f[h>>2]=f[d>>2];f[d>>2]=c;c=f[ea>>2]|0;f[ea>>2]=f[e>>2];f[e>>2]=c;return}else if((l|0)==22){cd(h,h+8|0,d)|0;return}else if((l|0)==23){dd(h,h+8|0,h+16|0,d)|0;return}else if((l|0)==24){ed(h,h+8|0,h+16|0,h+24|0,d)|0;return}else if((l|0)==26){d=h+16|0;cd(h,h+8|0,d)|0;c=h+24|0;if((c|0)==(a|0))return;else{ia=c;ja=d}while(1){d=f[ia>>2]|0;c=ia+4|0;e=f[c>>2]|0;ea=(e|0)==0;if(!ea)bh(e);ga=f[ja>>2]|0;ca=f[ja+4>>2]|0;ba=(ca|0)==0;if(!ba)bh(ca);if(!ea)bh(e);ha=+n[d+260>>2];if(ba)ka=+n[ga+260>>2];else{bh(ca);fa=+n[ga+260>>2];dh(ca);ka=fa}if(!ea)dh(e);if(!ba)dh(ca);if(!ea)dh(e);if(ha>ka){e=f[ia>>2]|0;ea=f[c>>2]|0;f[ia>>2]=0;f[c>>2]=0;c=ea;ca=e+260|0;d:do if(!ea){ba=ja;ga=ia;while(1){d=f[ba>>2]|0;i=ba+4|0;da=f[i>>2]|0;f[ba>>2]=0;f[i>>2]=0;f[ga>>2]=d;d=ga+4|0;z=f[d>>2]|0;f[d>>2]=da;if(z|0)dh(z);if((ba|0)==(h|0)){la=i;ma=i;na=ba;break d}z=ba+-8|0;da=f[z>>2]|0;d=f[ba+-4>>2]|0;if(!d)if(+n[ca>>2]>+n[da+260>>2]){oa=ba;ba=z;ga=oa;continue}else{la=i;ma=i;na=ba;break}else{bh(d);ha=+n[ca>>2];bh(d);fa=+n[da+260>>2];dh(d);dh(d);if(ha>fa){oa=ba;ba=z;ga=oa;continue}else{la=i;ma=i;na=ba;break}}}}else{ba=ja;ga=ia;while(1){i=f[ba>>2]|0;z=ba+4|0;d=f[z>>2]|0;f[ba>>2]=0;f[z>>2]=0;f[ga>>2]=i;i=ga+4|0;da=f[i>>2]|0;f[i>>2]=d;if(da|0)dh(da);if((ba|0)==(h|0)){la=z;ma=z;na=ba;break d}bh(c);da=ba+-8|0;d=f[da>>2]|0;i=f[ba+-4>>2]|0;if(!i){bh(c);o=+n[ca>>2]>+n[d+260>>2];dh(c);dh(c);if(o){pa=ba;ba=da;ga=pa;continue}else{la=z;ma=z;na=ba;break}}else{bh(i);bh(c);fa=+n[ca>>2];bh(i);ha=+n[d+260>>2];dh(i);dh(c);dh(i);dh(c);if(fa>ha){pa=ba;ba=da;ga=pa;continue}else{la=z;ma=z;na=ba;break}}}}while(0);f[na>>2]=e;c=f[ma>>2]|0;f[la>>2]=ea;if(c|0)dh(c)}c=ia+8|0;if((c|0)==(a|0))break;else{ca=ia;ia=c;ja=ca}}return}else if((l|0)==228)return}function cd(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0.0,o=0.0,p=0.0,q=0,r=0.0,s=0,t=0,u=0,v=0,w=0.0,x=0.0,y=0,z=0.0;d=f[b>>2]|0;e=b+4|0;g=f[e>>2]|0;h=(g|0)==0;if(!h)bh(g);i=f[a>>2]|0;j=a+4|0;k=f[j>>2]|0;l=(k|0)==0;if(!l)bh(k);if(!h)bh(g);m=+n[d+260>>2];if(l)o=+n[i+260>>2];else{bh(k);p=+n[i+260>>2];dh(k);o=p}if(!h)dh(g);if(!l)dh(k);if(!h)dh(g);g=f[c>>2]|0;h=c+4|0;k=f[h>>2]|0;l=(k|0)==0;if(!(m>o)){if(!l)bh(k);i=f[b>>2]|0;d=f[e>>2]|0;q=(d|0)==0;if(!q)bh(d);if(!l)bh(k);o=+n[g+260>>2];if(q)r=+n[i+260>>2];else{bh(d);m=+n[i+260>>2];dh(d);r=m}if(!l)dh(k);if(!q)dh(d);if(!l)dh(k);if(!(o>r)){s=0;return s|0}d=f[b>>2]|0;f[b>>2]=f[c>>2];f[c>>2]=d;d=f[e>>2]|0;f[e>>2]=f[h>>2];f[h>>2]=d;d=f[b>>2]|0;q=f[e>>2]|0;i=(q|0)==0;if(!i)bh(q);t=f[a>>2]|0;u=f[j>>2]|0;v=(u|0)==0;if(!v)bh(u);if(!i)bh(q);r=+n[d+260>>2];if(v)w=+n[t+260>>2];else{bh(u);o=+n[t+260>>2];dh(u);w=o}if(!i)dh(q);if(!v)dh(u);if(!i)dh(q);if(!(r>w)){s=1;return s|0}q=f[a>>2]|0;f[a>>2]=f[b>>2];f[b>>2]=q;q=f[j>>2]|0;f[j>>2]=f[e>>2];f[e>>2]=q;s=2;return s|0}if(!l)bh(k);q=f[b>>2]|0;i=f[e>>2]|0;u=(i|0)==0;if(!u)bh(i);if(!l)bh(k);w=+n[g+260>>2];if(u)x=+n[q+260>>2];else{bh(i);r=+n[q+260>>2];dh(i);x=r}if(!l)dh(k);if(!u)dh(i);if(!l)dh(k);k=f[a>>2]|0;if(w>x){f[a>>2]=f[c>>2];f[c>>2]=k;l=f[j>>2]|0;f[j>>2]=f[h>>2];f[h>>2]=l;s=1;return s|0}f[a>>2]=f[b>>2];f[b>>2]=k;k=f[j>>2]|0;f[j>>2]=f[e>>2];f[e>>2]=k;j=f[c>>2]|0;a=f[h>>2]|0;l=(a|0)==0;if(l)y=k;else{bh(a);y=f[e>>2]|0}k=f[b>>2]|0;i=(y|0)==0;if(!i)bh(y);if(!l)bh(a);x=+n[j+260>>2];if(i)z=+n[k+260>>2];else{bh(y);w=+n[k+260>>2];dh(y);z=w}if(!l)dh(a);if(!i)dh(y);if(!l)dh(a);if(!(x>z)){s=1;return s|0}a=f[b>>2]|0;f[b>>2]=f[c>>2];f[c>>2]=a;a=f[e>>2]|0;f[e>>2]=f[h>>2];f[h>>2]=a;s=2;return s|0}function dd(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,o=0,p=0.0,q=0.0,r=0.0,s=0,t=0.0,u=0.0;e=cd(a,b,c)|0;g=f[d>>2]|0;h=d+4|0;i=f[h>>2]|0;j=(i|0)==0;if(!j)bh(i);k=f[c>>2]|0;l=c+4|0;m=f[l>>2]|0;o=(m|0)==0;if(!o)bh(m);if(!j)bh(i);p=+n[g+260>>2];if(o)q=+n[k+260>>2];else{bh(m);r=+n[k+260>>2];dh(m);q=r}if(!j)dh(i);if(!o)dh(m);if(!j)dh(i);if(!(p>q)){s=e;return s|0}i=f[c>>2]|0;f[c>>2]=f[d>>2];f[d>>2]=i;i=f[l>>2]|0;f[l>>2]=f[h>>2];f[h>>2]=i;i=f[c>>2]|0;h=f[l>>2]|0;d=(h|0)==0;if(!d)bh(h);j=f[b>>2]|0;m=b+4|0;o=f[m>>2]|0;k=(o|0)==0;if(!k)bh(o);if(!d)bh(h);q=+n[i+260>>2];if(k)t=+n[j+260>>2];else{bh(o);p=+n[j+260>>2];dh(o);t=p}if(!d)dh(h);if(!k)dh(o);if(!d)dh(h);if(!(q>t)){s=e+1|0;return s|0}h=f[b>>2]|0;f[b>>2]=f[c>>2];f[c>>2]=h;h=f[m>>2]|0;f[m>>2]=f[l>>2];f[l>>2]=h;h=f[b>>2]|0;l=f[m>>2]|0;c=(l|0)==0;if(!c)bh(l);d=f[a>>2]|0;o=a+4|0;k=f[o>>2]|0;j=(k|0)==0;if(!j)bh(k);if(!c)bh(l);t=+n[h+260>>2];if(j)u=+n[d+260>>2];else{bh(k);q=+n[d+260>>2];dh(k);u=q}if(!c)dh(l);if(!j)dh(k);if(!c)dh(l);if(!(t>u)){s=e+2|0;return s|0}l=f[a>>2]|0;f[a>>2]=f[b>>2];f[b>>2]=l;l=f[o>>2]|0;f[o>>2]=f[m>>2];f[m>>2]=l;s=e+3|0;return s|0}function ed(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0,u=0.0,v=0.0,w=0.0;g=dd(a,b,c,d)|0;h=f[e>>2]|0;i=e+4|0;j=f[i>>2]|0;k=(j|0)==0;if(!k)bh(j);l=f[d>>2]|0;m=d+4|0;o=f[m>>2]|0;p=(o|0)==0;if(!p)bh(o);if(!k)bh(j);q=+n[h+260>>2];if(p)r=+n[l+260>>2];else{bh(o);s=+n[l+260>>2];dh(o);r=s}if(!k)dh(j);if(!p)dh(o);if(!k)dh(j);if(!(q>r)){t=g;return t|0}j=f[d>>2]|0;f[d>>2]=f[e>>2];f[e>>2]=j;j=f[m>>2]|0;f[m>>2]=f[i>>2];f[i>>2]=j;j=f[d>>2]|0;i=f[m>>2]|0;e=(i|0)==0;if(!e)bh(i);k=f[c>>2]|0;o=c+4|0;p=f[o>>2]|0;l=(p|0)==0;if(!l)bh(p);if(!e)bh(i);r=+n[j+260>>2];if(l)u=+n[k+260>>2];else{bh(p);q=+n[k+260>>2];dh(p);u=q}if(!e)dh(i);if(!l)dh(p);if(!e)dh(i);if(!(r>u)){t=g+1|0;return t|0}i=f[c>>2]|0;f[c>>2]=f[d>>2];f[d>>2]=i;i=f[o>>2]|0;f[o>>2]=f[m>>2];f[m>>2]=i;i=f[c>>2]|0;m=f[o>>2]|0;d=(m|0)==0;if(!d)bh(m);e=f[b>>2]|0;p=b+4|0;l=f[p>>2]|0;k=(l|0)==0;if(!k)bh(l);if(!d)bh(m);u=+n[i+260>>2];if(k)v=+n[e+260>>2];else{bh(l);r=+n[e+260>>2];dh(l);v=r}if(!d)dh(m);if(!k)dh(l);if(!d)dh(m);if(!(u>v)){t=g+2|0;return t|0}m=f[b>>2]|0;f[b>>2]=f[c>>2];f[c>>2]=m;m=f[p>>2]|0;f[p>>2]=f[o>>2];f[o>>2]=m;m=f[b>>2]|0;o=f[p>>2]|0;c=(o|0)==0;if(!c)bh(o);d=f[a>>2]|0;l=a+4|0;k=f[l>>2]|0;e=(k|0)==0;if(!e)bh(k);if(!c)bh(o);v=+n[m+260>>2];if(e)w=+n[d+260>>2];else{bh(k);u=+n[d+260>>2];dh(k);w=u}if(!c)dh(o);if(!e)dh(k);if(!c)dh(o);if(!(v>w)){t=g+3|0;return t|0}o=f[a>>2]|0;f[a>>2]=f[b>>2];f[b>>2]=o;o=f[l>>2]|0;f[l>>2]=f[p>>2];f[p>>2]=o;t=g+4|0;return t|0}function fd(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0.0,o=0.0,p=0.0,q=0,r=0,s=0,t=0,u=0,v=0,w=0.0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;switch(b-a>>3|0){case 2:{c=b+-8|0;d=f[c>>2]|0;e=b+-4|0;g=f[e>>2]|0;h=(g|0)==0;if(!h)bh(g);i=f[a>>2]|0;j=a+4|0;k=f[j>>2]|0;l=(k|0)==0;if(!l)bh(k);if(!h)bh(g);m=+n[d+260>>2];if(l)o=+n[i+260>>2];else{bh(k);p=+n[i+260>>2];dh(k);o=p}if(!h)dh(g);if(!l)dh(k);if(!h)dh(g);if(!(m>o)){q=1;return q|0}g=f[a>>2]|0;f[a>>2]=f[c>>2];f[c>>2]=g;g=f[j>>2]|0;f[j>>2]=f[e>>2];f[e>>2]=g;q=1;return q|0}case 3:{cd(a,a+8|0,b+-8|0)|0;q=1;return q|0}case 4:{dd(a,a+8|0,a+16|0,b+-8|0)|0;q=1;return q|0}case 5:{ed(a,a+8|0,a+16|0,a+24|0,b+-8|0)|0;q=1;return q|0}case 1:case 0:{q=1;return q|0}default:{g=a+16|0;cd(a,a+8|0,g)|0;e=a+24|0;a:do if((e|0)==(b|0)){r=1;s=0}else{j=e;c=0;h=g;while(1){k=f[j>>2]|0;l=j+4|0;i=f[l>>2]|0;d=(i|0)==0;if(!d)bh(i);t=f[h>>2]|0;u=f[h+4>>2]|0;v=(u|0)==0;if(!v)bh(u);if(!d)bh(i);o=+n[k+260>>2];if(v)w=+n[t+260>>2];else{bh(u);m=+n[t+260>>2];dh(u);w=m}if(!d)dh(i);if(!v)dh(u);if(!d)dh(i);if(o>w){i=f[j>>2]|0;d=f[l>>2]|0;f[j>>2]=0;f[l>>2]=0;l=d;u=i+260|0;b:do if(!d){v=h;t=j;while(1){k=f[v>>2]|0;x=v+4|0;y=f[x>>2]|0;f[v>>2]=0;f[x>>2]=0;f[t>>2]=k;k=t+4|0;z=f[k>>2]|0;f[k>>2]=y;if(z|0)dh(z);if((v|0)==(a|0)){A=x;B=x;C=v;break b}z=v+-8|0;y=f[z>>2]|0;k=f[v+-4>>2]|0;if(!k)if(+n[u>>2]>+n[y+260>>2]){D=v;v=z;t=D;continue}else{A=x;B=x;C=v;break}else{bh(k);o=+n[u>>2];bh(k);m=+n[y+260>>2];dh(k);dh(k);if(o>m){D=v;v=z;t=D;continue}else{A=x;B=x;C=v;break}}}}else{v=h;t=j;while(1){x=f[v>>2]|0;z=v+4|0;k=f[z>>2]|0;f[v>>2]=0;f[z>>2]=0;f[t>>2]=x;x=t+4|0;y=f[x>>2]|0;f[x>>2]=k;if(y|0)dh(y);if((v|0)==(a|0)){A=z;B=z;C=v;break b}bh(l);y=v+-8|0;k=f[y>>2]|0;x=f[v+-4>>2]|0;if(!x){bh(l);E=+n[u>>2]>+n[k+260>>2];dh(l);dh(l);if(E){F=v;v=y;t=F;continue}else{A=z;B=z;C=v;break}}else{bh(x);bh(l);m=+n[u>>2];bh(x);o=+n[k+260>>2];dh(x);dh(l);dh(x);dh(l);if(m>o){F=v;v=y;t=F;continue}else{A=z;B=z;C=v;break}}}}while(0);f[C>>2]=i;l=f[B>>2]|0;f[A>>2]=d;if(l|0)dh(l);l=c+1|0;if((l|0)==8){r=0;s=(j+8|0)==(b|0);break a}else G=l}else G=c;l=j+8|0;if((l|0)==(b|0)){r=1;s=0;break}else{u=j;j=l;c=G;h=u}}}while(0);q=s|r;return q|0}}return 0}function gd(a,c,e){a=a|0;c=c|0;e=e|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;if((b[11576]|0)==0?pi(11576)|0:0)Ze(11768);_e(11768,e);g=(d[a+144>>1]|0)==1&1;h=f[e>>2]|0;i=h+12|0;j=h+16|0;while(1){k=f[i>>2]|0;if(!k){Fc(h);l=f[i>>2]|0}else l=k;m=l+4+3&-4;k=m;n=k+68|0;if((k+72|0)>>>0<=(f[j>>2]|0)>>>0){o=9;break}f[l>>2]=-1;if(!(Ic(h,8-l+n|0)|0)){p=0;break}}if((o|0)==9){f[l>>2]=13;f[i>>2]=n;f[n>>2]=-1;p=m}m=p;n=480;i=m+64|0;do{f[m>>2]=f[n>>2];m=m+4|0;n=n+4|0}while((m|0)<(i|0));f[p+64>>2]=g;g=a+68|0;p=a+72|0;hd(f[g>>2]|0,f[p>>2]|0);n=f[g>>2]|0;m=f[p>>2]|0;if((n|0)!=(m|0)){i=n;do{n=f[i>>2]|0;l=f[i+4>>2]|0;if(!l)Id(n,c,e);else{bh(l);Id(n,c,e);dh(l)}i=i+8|0}while((i|0)!=(m|0))}if(!(b[a+146>>0]|0))return;if((b[11584]|0)==0?pi(11584)|0:0)Od(11784);ce(11784,e);a=f[g>>2]|0;g=f[p>>2]|0;if((a|0)==(g|0))return;else q=a;do{a=f[q>>2]|0;p=f[q+4>>2]|0;if(!p)Jd(a,c,e);else{bh(p);Jd(a,c,e);dh(p)}q=q+8|0}while((q|0)!=(g|0));return}function hd(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0.0,w=0.0,x=0.0,y=0,z=0,A=0,B=0,C=0.0,D=0.0,E=0,F=0,G=0,H=0.0,I=0,J=0,K=0,L=0.0,M=0,N=0,O=0,P=0.0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0.0,Z=0,_=0,$=0,aa=0.0,ba=0,ca=0,da=0,ea=0,fa=0.0,ga=0,ha=0.0,ia=0,ja=0,ka=0.0,la=0,ma=0,na=0,oa=0,pa=0;c=a;a=b;a:while(1){b=a;d=a+-8|0;e=a+-4|0;g=c;while(1){h=g;b:while(1){i=h;j=b-i|0;k=j>>3;switch(k|0){case 2:{l=5;break a;break}case 3:{l=22;break a;break}case 4:{l=23;break a;break}case 5:{l=24;break a;break}case 1:case 0:{l=228;break a;break}default:{}}if((j|0)<56){l=26;break a}m=(k|0)/2|0;o=h+(m<<3)|0;if((j|0)>7992){j=(k|0)/4|0;p=nd(h,h+(j<<3)|0,o,o+(j<<3)|0,d)|0}else p=ld(h,o,d)|0;j=f[h>>2]|0;q=h+4|0;k=f[q>>2]|0;r=(k|0)==0;if(!r)bh(k);s=f[o>>2]|0;t=h+(m<<3)+4|0;m=f[t>>2]|0;u=(m|0)==0;if(!u)bh(m);if(!r)bh(k);v=+n[j+256>>2];if(u)w=+n[s+256>>2];else{bh(m);x=+n[s+256>>2];dh(m);w=x}if(!r)dh(k);if(!u)dh(m);if(!r)dh(k);if(v<w){y=d;z=p;break}else A=d;while(1){k=A;A=A+-8|0;if((h|0)==(A|0))break;r=f[A>>2]|0;B=k+-4|0;k=f[B>>2]|0;m=(k|0)==0;if(!m)bh(k);u=f[o>>2]|0;s=f[t>>2]|0;j=(s|0)==0;if(!j)bh(s);if(!m)bh(k);v=+n[r+256>>2];if(j)C=+n[u+256>>2];else{bh(s);x=+n[u+256>>2];dh(s);C=x}if(!m)dh(k);if(!j)dh(s);if(!m)dh(k);if(v<C){l=166;break b}}t=h+8|0;k=f[h>>2]|0;m=f[q>>2]|0;s=(m|0)==0;if(!s)bh(m);j=f[d>>2]|0;u=f[e>>2]|0;r=(u|0)==0;if(!r)bh(u);if(!s)bh(m);v=+n[k+256>>2];if(r)D=+n[j+256>>2];else{bh(u);x=+n[j+256>>2];dh(u);D=x}if(!s)dh(m);if(!r)dh(u);if(!s)dh(m);if(v<D)E=t;else{if((t|0)==(d|0)){l=228;break a}else F=t;while(1){t=f[h>>2]|0;m=f[q>>2]|0;s=(m|0)==0;if(!s)bh(m);u=f[F>>2]|0;G=F+4|0;r=f[G>>2]|0;j=(r|0)==0;if(!j)bh(r);if(!s)bh(m);v=+n[t+256>>2];if(j)H=+n[u+256>>2];else{bh(r);x=+n[u+256>>2];dh(r);H=x}if(!s)dh(m);if(!j)dh(r);if(!s)dh(m);if(v<H)break;m=F+8|0;if((m|0)==(d|0)){l=228;break a}else F=m}m=f[F>>2]|0;f[F>>2]=f[d>>2];f[d>>2]=m;m=f[G>>2]|0;f[G>>2]=f[e>>2];f[e>>2]=m;E=F+8|0}if((E|0)==(d|0)){l=228;break a}else{I=d;J=E}while(1){m=J;while(1){s=f[h>>2]|0;r=f[q>>2]|0;j=(r|0)==0;if(!j)bh(r);u=f[m>>2]|0;K=m+4|0;t=f[K>>2]|0;k=(t|0)==0;if(!k)bh(t);if(!j)bh(r);v=+n[s+256>>2];if(k)L=+n[u+256>>2];else{bh(t);x=+n[u+256>>2];dh(t);L=x}if(!j)dh(r);if(!k)dh(t);if(!j)dh(r);M=m+8|0;if(v<L){N=I;break}else m=M}do{r=f[h>>2]|0;j=f[q>>2]|0;t=(j|0)==0;if(!t)bh(j);k=N;N=N+-8|0;u=f[N>>2]|0;O=k+-4|0;k=f[O>>2]|0;s=(k|0)==0;if(!s)bh(k);if(!t)bh(j);v=+n[r+256>>2];if(s)P=+n[u+256>>2];else{bh(k);x=+n[u+256>>2];dh(k);P=x}if(!t)dh(j);if(!s)dh(k);if(!t)dh(j)}while(v<P);if(m>>>0>=N>>>0){h=m;continue b}j=f[m>>2]|0;f[m>>2]=f[N>>2];f[N>>2]=j;j=f[K>>2]|0;f[K>>2]=f[O>>2];f[O>>2]=j;I=N;J=M}}if((l|0)==166){l=0;j=f[h>>2]|0;f[h>>2]=f[A>>2];f[A>>2]=j;j=f[q>>2]|0;f[q>>2]=f[B>>2];f[B>>2]=j;y=A;z=p+1|0}j=h+8|0;c:do if(j>>>0<y>>>0){t=o;k=y;s=j;u=z;while(1){r=t+4|0;Q=s;while(1){R=f[Q>>2]|0;S=Q+4|0;T=f[S>>2]|0;U=(T|0)==0;if(!U)bh(T);V=f[t>>2]|0;W=f[r>>2]|0;X=(W|0)==0;if(!X)bh(W);if(!U)bh(T);v=+n[R+256>>2];if(X)Y=+n[V+256>>2];else{bh(W);x=+n[V+256>>2];dh(W);Y=x}if(!U)dh(T);if(!X)dh(W);if(!U)dh(T);Z=Q+8|0;if(v<Y)Q=Z;else{_=k;break}}do{m=_;_=_+-8|0;T=f[_>>2]|0;$=m+-4|0;m=f[$>>2]|0;U=(m|0)==0;if(!U)bh(m);W=f[t>>2]|0;X=f[r>>2]|0;V=(X|0)==0;if(!V)bh(X);if(!U)bh(m);v=+n[T+256>>2];if(V)aa=+n[W+256>>2];else{bh(X);x=+n[W+256>>2];dh(X);aa=x}if(!U)dh(m);if(!V)dh(X);if(!U)dh(m)}while(!(v<aa));if(Q>>>0>_>>>0){ba=t;ca=u;da=Q;break c}r=f[Q>>2]|0;f[Q>>2]=f[_>>2];f[_>>2]=r;r=f[S>>2]|0;f[S>>2]=f[$>>2];f[$>>2]=r;t=(t|0)==(Q|0)?_:t;k=_;s=Z;u=u+1|0}}else{ba=o;ca=z;da=j}while(0);do if((da|0)==(ba|0))ea=ca;else{j=f[ba>>2]|0;u=ba+4|0;s=f[u>>2]|0;k=(s|0)==0;if(!k)bh(s);t=f[da>>2]|0;r=da+4|0;m=f[r>>2]|0;U=(m|0)==0;if(!U)bh(m);if(!k)bh(s);v=+n[j+256>>2];if(U)fa=+n[t+256>>2];else{bh(m);x=+n[t+256>>2];dh(m);fa=x}t=v<fa;if(!k)dh(s);if(!U)dh(m);if(k){if(!t){ea=ca;break}}else{dh(s);if(!t){ea=ca;break}}t=f[da>>2]|0;f[da>>2]=f[ba>>2];f[ba>>2]=t;t=f[r>>2]|0;f[r>>2]=f[u>>2];f[u>>2]=t;ea=ca+1|0}while(0);if(!ea){ga=od(h,da)|0;t=da+8|0;if(od(t,a)|0){l=227;break}if(ga){g=t;continue}}t=da;if((t-i|0)>=(b-t|0)){l=226;break}hd(h,da);g=da+8|0}if((l|0)==226){l=0;hd(da+8|0,a);c=h;a=da;continue}else if((l|0)==227){l=0;if(ga){l=228;break}else{c=h;a=da;continue}}}if((l|0)==5){da=f[d>>2]|0;c=f[e>>2]|0;ga=(c|0)==0;if(!ga)bh(c);i=f[h>>2]|0;ea=h+4|0;ca=f[ea>>2]|0;ba=(ca|0)==0;if(!ba)bh(ca);if(!ga)bh(c);fa=+n[da+256>>2];if(ba)ha=+n[i+256>>2];else{bh(ca);aa=+n[i+256>>2];dh(ca);ha=aa}if(!ga)dh(c);if(!ba)dh(ca);if(!ga)dh(c);if(!(fa<ha))return;c=f[h>>2]|0;f[h>>2]=f[d>>2];f[d>>2]=c;c=f[ea>>2]|0;f[ea>>2]=f[e>>2];f[e>>2]=c;return}else if((l|0)==22){ld(h,h+8|0,d)|0;return}else if((l|0)==23){md(h,h+8|0,h+16|0,d)|0;return}else if((l|0)==24){nd(h,h+8|0,h+16|0,h+24|0,d)|0;return}else if((l|0)==26){d=h+16|0;ld(h,h+8|0,d)|0;c=h+24|0;if((c|0)==(a|0))return;else{ia=c;ja=d}while(1){d=f[ia>>2]|0;c=ia+4|0;e=f[c>>2]|0;ea=(e|0)==0;if(!ea)bh(e);ga=f[ja>>2]|0;ca=f[ja+4>>2]|0;ba=(ca|0)==0;if(!ba)bh(ca);if(!ea)bh(e);ha=+n[d+256>>2];if(ba)ka=+n[ga+256>>2];else{bh(ca);fa=+n[ga+256>>2];dh(ca);ka=fa}if(!ea)dh(e);if(!ba)dh(ca);if(!ea)dh(e);if(ha<ka){e=f[ia>>2]|0;ea=f[c>>2]|0;f[ia>>2]=0;f[c>>2]=0;c=ea;ca=e+256|0;d:do if(!ea){ba=ja;ga=ia;while(1){d=f[ba>>2]|0;i=ba+4|0;da=f[i>>2]|0;f[ba>>2]=0;f[i>>2]=0;f[ga>>2]=d;d=ga+4|0;z=f[d>>2]|0;f[d>>2]=da;if(z|0)dh(z);if((ba|0)==(h|0)){la=i;ma=i;na=ba;break d}z=ba+-8|0;da=f[z>>2]|0;d=f[ba+-4>>2]|0;if(!d)if(+n[ca>>2]<+n[da+256>>2]){oa=ba;ba=z;ga=oa;continue}else{la=i;ma=i;na=ba;break}else{bh(d);ha=+n[ca>>2];bh(d);fa=+n[da+256>>2];dh(d);dh(d);if(ha<fa){oa=ba;ba=z;ga=oa;continue}else{la=i;ma=i;na=ba;break}}}}else{ba=ja;ga=ia;while(1){i=f[ba>>2]|0;z=ba+4|0;d=f[z>>2]|0;f[ba>>2]=0;f[z>>2]=0;f[ga>>2]=i;i=ga+4|0;da=f[i>>2]|0;f[i>>2]=d;if(da|0)dh(da);if((ba|0)==(h|0)){la=z;ma=z;na=ba;break d}bh(c);da=ba+-8|0;d=f[da>>2]|0;i=f[ba+-4>>2]|0;if(!i){bh(c);o=+n[ca>>2]<+n[d+256>>2];dh(c);dh(c);if(o){pa=ba;ba=da;ga=pa;continue}else{la=z;ma=z;na=ba;break}}else{bh(i);bh(c);fa=+n[ca>>2];bh(i);ha=+n[d+256>>2];dh(i);dh(c);dh(i);dh(c);if(fa<ha){pa=ba;ba=da;ga=pa;continue}else{la=z;ma=z;na=ba;break}}}}while(0);f[na>>2]=e;c=f[ma>>2]|0;f[la>>2]=ea;if(c|0)dh(c)}c=ia+8|0;if((c|0)==(a|0))break;else{ca=ia;ia=c;ja=ca}}return}else if((l|0)==228)return}function id(a){a=a|0;var c=0,d=0,e=0;c=a+8|0;d=a+4|0;if(f[c>>2]|0){e=f[d>>2]|0;if(!e){f[a>>2]=0;f[d>>2]=0;f[c>>2]=0;return}if(!(f[e+4>>2]|0)){if((b[11592]|0)==0?pi(11592)|0:0){f[2950]=1;f[2952]=0;f[2953]=0;f[2951]=11808}kd(11804,c)|0}}e=f[d>>2]|0;f[a>>2]=0;f[d>>2]=0;if(!e){f[c>>2]=0;return}dh(e);f[c>>2]=0;return}function jd(a){a=a|0;sa(a|0)|0;Yh()}function kd(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0;c=a+4|0;d=f[c>>2]|0;if(!d){e=0;return e|0}g=f[b>>2]|0;b=c;h=d;a:while(1){i=h;while(1){if((f[i+16>>2]|0)>>>0>=g>>>0)break;j=f[i+4>>2]|0;if(!j){k=b;break a}else i=j}h=f[i>>2]|0;if(!h){k=i;break}else b=i}if((k|0)==(c|0)){e=0;return e|0}if(g>>>0<(f[k+16>>2]|0)>>>0){e=0;return e|0}g=f[k+4>>2]|0;if(!g){c=k+8|0;b=f[c>>2]|0;if((f[b>>2]|0)==(k|0))l=b;else{b=c;do{c=f[b>>2]|0;b=c+8|0;h=f[b>>2]|0}while((f[h>>2]|0)!=(c|0));l=h}}else{b=g;while(1){g=f[b>>2]|0;if(!g)break;else b=g}l=b}if((f[a>>2]|0)==(k|0))f[a>>2]=l;l=a+8|0;f[l>>2]=(f[l>>2]|0)+-1;$c(d,k);d=f[k+24>>2]|0;if(d|0)eh(d);hh(k);e=1;return e|0}function ld(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0.0,o=0.0,p=0.0,q=0,r=0.0,s=0,t=0,u=0,v=0,w=0.0,x=0.0,y=0,z=0.0;d=f[b>>2]|0;e=b+4|0;g=f[e>>2]|0;h=(g|0)==0;if(!h)bh(g);i=f[a>>2]|0;j=a+4|0;k=f[j>>2]|0;l=(k|0)==0;if(!l)bh(k);if(!h)bh(g);m=+n[d+256>>2];if(l)o=+n[i+256>>2];else{bh(k);p=+n[i+256>>2];dh(k);o=p}if(!h)dh(g);if(!l)dh(k);if(!h)dh(g);g=f[c>>2]|0;h=c+4|0;k=f[h>>2]|0;l=(k|0)==0;if(!(m<o)){if(!l)bh(k);i=f[b>>2]|0;d=f[e>>2]|0;q=(d|0)==0;if(!q)bh(d);if(!l)bh(k);o=+n[g+256>>2];if(q)r=+n[i+256>>2];else{bh(d);m=+n[i+256>>2];dh(d);r=m}if(!l)dh(k);if(!q)dh(d);if(!l)dh(k);if(!(o<r)){s=0;return s|0}d=f[b>>2]|0;f[b>>2]=f[c>>2];f[c>>2]=d;d=f[e>>2]|0;f[e>>2]=f[h>>2];f[h>>2]=d;d=f[b>>2]|0;q=f[e>>2]|0;i=(q|0)==0;if(!i)bh(q);t=f[a>>2]|0;u=f[j>>2]|0;v=(u|0)==0;if(!v)bh(u);if(!i)bh(q);r=+n[d+256>>2];if(v)w=+n[t+256>>2];else{bh(u);o=+n[t+256>>2];dh(u);w=o}if(!i)dh(q);if(!v)dh(u);if(!i)dh(q);if(!(r<w)){s=1;return s|0}q=f[a>>2]|0;f[a>>2]=f[b>>2];f[b>>2]=q;q=f[j>>2]|0;f[j>>2]=f[e>>2];f[e>>2]=q;s=2;return s|0}if(!l)bh(k);q=f[b>>2]|0;i=f[e>>2]|0;u=(i|0)==0;if(!u)bh(i);if(!l)bh(k);w=+n[g+256>>2];if(u)x=+n[q+256>>2];else{bh(i);r=+n[q+256>>2];dh(i);x=r}if(!l)dh(k);if(!u)dh(i);if(!l)dh(k);k=f[a>>2]|0;if(w<x){f[a>>2]=f[c>>2];f[c>>2]=k;l=f[j>>2]|0;f[j>>2]=f[h>>2];f[h>>2]=l;s=1;return s|0}f[a>>2]=f[b>>2];f[b>>2]=k;k=f[j>>2]|0;f[j>>2]=f[e>>2];f[e>>2]=k;j=f[c>>2]|0;a=f[h>>2]|0;l=(a|0)==0;if(l)y=k;else{bh(a);y=f[e>>2]|0}k=f[b>>2]|0;i=(y|0)==0;if(!i)bh(y);if(!l)bh(a);x=+n[j+256>>2];if(i)z=+n[k+256>>2];else{bh(y);w=+n[k+256>>2];dh(y);z=w}if(!l)dh(a);if(!i)dh(y);if(!l)dh(a);if(!(x<z)){s=1;return s|0}a=f[b>>2]|0;f[b>>2]=f[c>>2];f[c>>2]=a;a=f[e>>2]|0;f[e>>2]=f[h>>2];f[h>>2]=a;s=2;return s|0}function md(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,o=0,p=0.0,q=0.0,r=0.0,s=0,t=0.0,u=0.0;e=ld(a,b,c)|0;g=f[d>>2]|0;h=d+4|0;i=f[h>>2]|0;j=(i|0)==0;if(!j)bh(i);k=f[c>>2]|0;l=c+4|0;m=f[l>>2]|0;o=(m|0)==0;if(!o)bh(m);if(!j)bh(i);p=+n[g+256>>2];if(o)q=+n[k+256>>2];else{bh(m);r=+n[k+256>>2];dh(m);q=r}if(!j)dh(i);if(!o)dh(m);if(!j)dh(i);if(!(p<q)){s=e;return s|0}i=f[c>>2]|0;f[c>>2]=f[d>>2];f[d>>2]=i;i=f[l>>2]|0;f[l>>2]=f[h>>2];f[h>>2]=i;i=f[c>>2]|0;h=f[l>>2]|0;d=(h|0)==0;if(!d)bh(h);j=f[b>>2]|0;m=b+4|0;o=f[m>>2]|0;k=(o|0)==0;if(!k)bh(o);if(!d)bh(h);q=+n[i+256>>2];if(k)t=+n[j+256>>2];else{bh(o);p=+n[j+256>>2];dh(o);t=p}if(!d)dh(h);if(!k)dh(o);if(!d)dh(h);if(!(q<t)){s=e+1|0;return s|0}h=f[b>>2]|0;f[b>>2]=f[c>>2];f[c>>2]=h;h=f[m>>2]|0;f[m>>2]=f[l>>2];f[l>>2]=h;h=f[b>>2]|0;l=f[m>>2]|0;c=(l|0)==0;if(!c)bh(l);d=f[a>>2]|0;o=a+4|0;k=f[o>>2]|0;j=(k|0)==0;if(!j)bh(k);if(!c)bh(l);t=+n[h+256>>2];if(j)u=+n[d+256>>2];else{bh(k);q=+n[d+256>>2];dh(k);u=q}if(!c)dh(l);if(!j)dh(k);if(!c)dh(l);if(!(t<u)){s=e+2|0;return s|0}l=f[a>>2]|0;f[a>>2]=f[b>>2];f[b>>2]=l;l=f[o>>2]|0;f[o>>2]=f[m>>2];f[m>>2]=l;s=e+3|0;return s|0}function nd(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0,u=0.0,v=0.0,w=0.0;g=md(a,b,c,d)|0;h=f[e>>2]|0;i=e+4|0;j=f[i>>2]|0;k=(j|0)==0;if(!k)bh(j);l=f[d>>2]|0;m=d+4|0;o=f[m>>2]|0;p=(o|0)==0;if(!p)bh(o);if(!k)bh(j);q=+n[h+256>>2];if(p)r=+n[l+256>>2];else{bh(o);s=+n[l+256>>2];dh(o);r=s}if(!k)dh(j);if(!p)dh(o);if(!k)dh(j);if(!(q<r)){t=g;return t|0}j=f[d>>2]|0;f[d>>2]=f[e>>2];f[e>>2]=j;j=f[m>>2]|0;f[m>>2]=f[i>>2];f[i>>2]=j;j=f[d>>2]|0;i=f[m>>2]|0;e=(i|0)==0;if(!e)bh(i);k=f[c>>2]|0;o=c+4|0;p=f[o>>2]|0;l=(p|0)==0;if(!l)bh(p);if(!e)bh(i);r=+n[j+256>>2];if(l)u=+n[k+256>>2];else{bh(p);q=+n[k+256>>2];dh(p);u=q}if(!e)dh(i);if(!l)dh(p);if(!e)dh(i);if(!(r<u)){t=g+1|0;return t|0}i=f[c>>2]|0;f[c>>2]=f[d>>2];f[d>>2]=i;i=f[o>>2]|0;f[o>>2]=f[m>>2];f[m>>2]=i;i=f[c>>2]|0;m=f[o>>2]|0;d=(m|0)==0;if(!d)bh(m);e=f[b>>2]|0;p=b+4|0;l=f[p>>2]|0;k=(l|0)==0;if(!k)bh(l);if(!d)bh(m);u=+n[i+256>>2];if(k)v=+n[e+256>>2];else{bh(l);r=+n[e+256>>2];dh(l);v=r}if(!d)dh(m);if(!k)dh(l);if(!d)dh(m);if(!(u<v)){t=g+2|0;return t|0}m=f[b>>2]|0;f[b>>2]=f[c>>2];f[c>>2]=m;m=f[p>>2]|0;f[p>>2]=f[o>>2];f[o>>2]=m;m=f[b>>2]|0;o=f[p>>2]|0;c=(o|0)==0;if(!c)bh(o);d=f[a>>2]|0;l=a+4|0;k=f[l>>2]|0;e=(k|0)==0;if(!e)bh(k);if(!c)bh(o);v=+n[m+256>>2];if(e)w=+n[d+256>>2];else{bh(k);u=+n[d+256>>2];dh(k);w=u}if(!c)dh(o);if(!e)dh(k);if(!c)dh(o);if(!(v<w)){t=g+3|0;return t|0}o=f[a>>2]|0;f[a>>2]=f[b>>2];f[b>>2]=o;o=f[l>>2]|0;f[l>>2]=f[p>>2];f[p>>2]=o;t=g+4|0;return t|0}function od(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0.0,o=0.0,p=0.0,q=0,r=0,s=0,t=0,u=0,v=0,w=0.0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;switch(b-a>>3|0){case 2:{c=b+-8|0;d=f[c>>2]|0;e=b+-4|0;g=f[e>>2]|0;h=(g|0)==0;if(!h)bh(g);i=f[a>>2]|0;j=a+4|0;k=f[j>>2]|0;l=(k|0)==0;if(!l)bh(k);if(!h)bh(g);m=+n[d+256>>2];if(l)o=+n[i+256>>2];else{bh(k);p=+n[i+256>>2];dh(k);o=p}if(!h)dh(g);if(!l)dh(k);if(!h)dh(g);if(!(m<o)){q=1;return q|0}g=f[a>>2]|0;f[a>>2]=f[c>>2];f[c>>2]=g;g=f[j>>2]|0;f[j>>2]=f[e>>2];f[e>>2]=g;q=1;return q|0}case 3:{ld(a,a+8|0,b+-8|0)|0;q=1;return q|0}case 4:{md(a,a+8|0,a+16|0,b+-8|0)|0;q=1;return q|0}case 5:{nd(a,a+8|0,a+16|0,a+24|0,b+-8|0)|0;q=1;return q|0}case 1:case 0:{q=1;return q|0}default:{g=a+16|0;ld(a,a+8|0,g)|0;e=a+24|0;a:do if((e|0)==(b|0)){r=1;s=0}else{j=e;c=0;h=g;while(1){k=f[j>>2]|0;l=j+4|0;i=f[l>>2]|0;d=(i|0)==0;if(!d)bh(i);t=f[h>>2]|0;u=f[h+4>>2]|0;v=(u|0)==0;if(!v)bh(u);if(!d)bh(i);o=+n[k+256>>2];if(v)w=+n[t+256>>2];else{bh(u);m=+n[t+256>>2];dh(u);w=m}if(!d)dh(i);if(!v)dh(u);if(!d)dh(i);if(o<w){i=f[j>>2]|0;d=f[l>>2]|0;f[j>>2]=0;f[l>>2]=0;l=d;u=i+256|0;b:do if(!d){v=h;t=j;while(1){k=f[v>>2]|0;x=v+4|0;y=f[x>>2]|0;f[v>>2]=0;f[x>>2]=0;f[t>>2]=k;k=t+4|0;z=f[k>>2]|0;f[k>>2]=y;if(z|0)dh(z);if((v|0)==(a|0)){A=x;B=x;C=v;break b}z=v+-8|0;y=f[z>>2]|0;k=f[v+-4>>2]|0;if(!k)if(+n[u>>2]<+n[y+256>>2]){D=v;v=z;t=D;continue}else{A=x;B=x;C=v;break}else{bh(k);o=+n[u>>2];bh(k);m=+n[y+256>>2];dh(k);dh(k);if(o<m){D=v;v=z;t=D;continue}else{A=x;B=x;C=v;break}}}}else{v=h;t=j;while(1){x=f[v>>2]|0;z=v+4|0;k=f[z>>2]|0;f[v>>2]=0;f[z>>2]=0;f[t>>2]=x;x=t+4|0;y=f[x>>2]|0;f[x>>2]=k;if(y|0)dh(y);if((v|0)==(a|0)){A=z;B=z;C=v;break b}bh(l);y=v+-8|0;k=f[y>>2]|0;x=f[v+-4>>2]|0;if(!x){bh(l);E=+n[u>>2]<+n[k+256>>2];dh(l);dh(l);if(E){F=v;v=y;t=F;continue}else{A=z;B=z;C=v;break}}else{bh(x);bh(l);m=+n[u>>2];bh(x);o=+n[k+256>>2];dh(x);dh(l);dh(x);dh(l);if(m<o){F=v;v=y;t=F;continue}else{A=z;B=z;C=v;break}}}}while(0);f[C>>2]=i;l=f[B>>2]|0;f[A>>2]=d;if(l|0)dh(l);l=c+1|0;if((l|0)==8){r=0;s=(j+8|0)==(b|0);break a}else G=l}else G=c;l=j+8|0;if((l|0)==(b|0)){r=1;s=0;break}else{u=j;j=l;c=G;h=u}}}while(0);q=s|r;return q|0}}return 0}function pd(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,g=0,h=0,i=0.0,j=0.0,k=0.0,l=0,m=0,o=0,p=0,q=0,r=0,s=0,t=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0;c=u;u=u+48|0;d=c+32|0;e=c+20|0;g=c+8|0;h=c;tc(b);i=+n[b+8>>2];j=+n[b+136>>2]*i+ +n[b+124>>2];k=+n[b+144>>2]*i+ +n[b+132>>2];l=a+136|0;m=f[l>>2]|0;o=a+120|0;if((m|0)!=(o|0)?(p=m+8|0,q=f[p>>2]|0,r=a+128|0,s=f[r>>2]|0,t=a+132|0,v=f[t>>2]|0,(q|0)!=(o|0)):0){if(s|0)f[s+12>>2]=v;if(v|0)f[v+8>>2]=s;if(q|0)f[q+12>>2]=o;f[p>>2]=o;f[r>>2]=q;f[t>>2]=m;f[l>>2]=o;m=a+140|0;if((f[m>>2]|0)==(o|0))f[m>>2]=s}f[e>>2]=0;s=e+4|0;f[s>>2]=0;f[e+8>>2]=0;m=e+8|0;t=~~(j*1.9999999494757503e-05);q=g+4|0;r=~~(k*1.9999999494757503e-05);p=g+8|0;v=h+4|0;w=a+108|0;x=a+104|0;y=d+4|0;z=-1;while(1){A=z+t|0;B=-1;while(1){f[g>>2]=0;f[q>>2]=A;C=B+r|0;f[p>>2]=C;f[h>>2]=0;f[v>>2]=0;D=f[w>>2]|0;do if(D){E=w;F=D;a:while(1){G=F;while(1){if(f[G+16>>2]|0)break;H=f[G+20>>2]|0;if((H|0)==(A|0)){if((f[G+24>>2]|0)>=(C|0))break}else if((H|0)>=(A|0))break;H=f[G+4>>2]|0;if(!H){I=E;break a}else G=H}F=f[G>>2]|0;if(!F){I=G;break}else E=G}if((I|0)!=(w|0)?(f[I+16>>2]|0)==0:0){E=f[I+20>>2]|0;if((A|0)==(E|0)){if((C|0)<(f[I+24>>2]|0)){J=33;break}}else if((A|0)<(E|0)){J=33;break}E=f[I+28>>2]|0;F=f[I+32>>2]|0;H=F;if(!F){f[h>>2]=E;f[v>>2]=H;K=F;break}bh(F);L=f[v>>2]|0;f[h>>2]=E;f[v>>2]=H;if(!L)K=F;else{dh(L);J=42}}else J=33}else J=33;while(0);if((J|0)==33){J=0;C=gh(344)|0;f[C+4>>2]=0;f[C+8>>2]=0;f[C>>2]=552;D=C+16|0;ie(D,g,a,0);L=D;D=C;bh(C);f[C+292>>2]=L;F=C+296|0;C=f[F>>2]|0;f[F>>2]=D;if(C|0)dh(C);f[h>>2]=L;L=f[v>>2]|0;f[v>>2]=D;if(L|0)dh(L);qd(d,x,g,g,h);J=42}if((J|0)==42){J=0;K=f[v>>2]|0}f[d>>2]=f[h>>2];f[y>>2]=K;if(K|0)ch(K);L=f[s>>2]|0;if(L>>>0>=(f[m>>2]|0)>>>0){rd(e,d);D=f[y>>2]|0;if(D|0)eh(D)}else{f[L>>2]=f[d>>2];f[L+4>>2]=f[y>>2];f[d>>2]=0;f[y>>2]=0;f[s>>2]=L+8}L=f[v>>2]|0;if(L|0)dh(L);if((B|0)<1)B=B+1|0;else break}if((z|0)<1)z=z+1|0;else break}z=a+68|0;v=f[z>>2]|0;y=a+72|0;K=f[y>>2]|0;if((K|0)!=(v|0)){h=K;while(1){K=h+-8|0;f[y>>2]=K;J=f[h+-4>>2]|0;if(!J)M=K;else{dh(J);M=f[y>>2]|0}if((M|0)==(v|0))break;else h=M}}M=f[s>>2]|0;h=f[e>>2]|0;v=M;if((M|0)==(h|0)){N=h;O=v}else{h=a+116|0;M=d+4|0;J=a+76|0;K=d+4|0;g=a+80|0;x=d+4|0;I=a+84|0;w=a+88|0;p=a+128|0;r=a+140|0;a=d+4|0;q=d+4|0;t=d+4|0;B=d+4|0;A=v;while(1){v=A+-8|0;L=f[A+-4>>2]|0;if((L|0)!=0?(D=fh(L)|0,(D|0)!=0):0){P=f[v>>2]|0;Q=D}else{P=0;Q=0}D=f[s>>2]|0;v=D+-8|0;L=D;while(1){D=L+-8|0;f[s>>2]=D;C=f[L+-4>>2]|0;if(!C)R=D;else{eh(C);R=f[s>>2]|0}if((R|0)==(v|0))break;else L=R}L=(Q|0)==0;if(!L){bh(Q);bh(Q)}v=P;f[v+276>>2]=P;C=v+280|0;D=f[C>>2]|0;f[C>>2]=Q;if(D|0)dh(D);D=v+276|0;if((o|0)!=(D|0)?(C=f[p>>2]|0,F=v+284|0,H=f[F>>2]|0,E=v+288|0,S=f[E>>2]|0,(C|0)!=(D|0)):0){if(H|0)f[H+12>>2]=S;if(S|0)f[S+8>>2]=H;if(C|0)f[C+12>>2]=D;f[p>>2]=D;f[F>>2]=C;f[E>>2]=o;if((f[l>>2]|0)==(o|0))f[l>>2]=D;if((f[r>>2]|0)==(D|0))f[r>>2]=H}if(!L)dh(Q);je(v,b);do if(me(v)|0?Ed(v)|0:0){if(!(Dd(v)|0)){f[d>>2]=P;f[B>>2]=Q;if(!L)bh(Q);H=f[I>>2]|0;if(H>>>0>=(f[w>>2]|0)>>>0){sd(g,d);D=f[B>>2]|0;if(D|0)dh(D)}else{f[H>>2]=f[d>>2];f[H+4>>2]=f[B>>2];f[d>>2]=0;f[B>>2]=0;f[I>>2]=H+8}break}if(!(+n[v+260>>2]>+n[h>>2])){f[d>>2]=P;f[M>>2]=Q;if(!L)bh(Q);H=f[y>>2]|0;if(H>>>0>=(f[J>>2]|0)>>>0){sd(z,d);D=f[M>>2]|0;if(D|0)dh(D)}else{f[H>>2]=f[d>>2];f[H+4>>2]=f[M>>2];f[d>>2]=0;f[M>>2]=0;f[y>>2]=H+8}break}H=P;D=0;E=1;C=0;while(1){ac[f[f[H>>2]>>2]&15](d,v,C);F=f[d>>2]|0;S=f[K>>2]|0;T=(S|0)==0;if(!T){bh(S);U=f[K>>2]|0;if(U|0)dh(U);bh(S);bh(S)}U=F;f[U+276>>2]=F;V=U+280|0;W=f[V>>2]|0;f[V>>2]=S;if(W|0)dh(W);W=U+276|0;do if((o|0)!=(W|0)){V=f[p>>2]|0;X=U+284|0;Y=f[X>>2]|0;Z=U+288|0;_=f[Z>>2]|0;if((V|0)==(W|0))break;if(Y|0)f[Y+12>>2]=_;if(_|0)f[_+8>>2]=Y;if(V|0)f[V+12>>2]=W;f[p>>2]=W;f[X>>2]=V;f[Z>>2]=o;if((f[l>>2]|0)==(o|0))f[l>>2]=W;if((f[r>>2]|0)!=(W|0))break;f[r>>2]=Y}while(0);if(!T)dh(S);je(U,b);do if(Ed(U)|0){if(!(me(U)|0)){$=1;aa=E;break}if(Dd(U)|0){$=1;aa=E;break}f[d>>2]=F;f[x>>2]=S;if(!T)bh(S);W=f[I>>2]|0;do if(W>>>0<(f[w>>2]|0)>>>0){f[W>>2]=f[d>>2];f[W+4>>2]=f[x>>2];f[d>>2]=0;f[x>>2]=0;f[I>>2]=W+8}else{sd(g,d);Y=f[x>>2]|0;if(!Y)break;dh(Y)}while(0);$=1;aa=0}else{$=D;aa=E}while(0);if(!T)dh(S);C=C+1|0;if((C|0)==4)break;else{D=$;E=aa}}if(!(aa&$)){f[d>>2]=P;f[a>>2]=Q;if(!L)bh(Q);E=f[y>>2]|0;do if(E>>>0<(f[J>>2]|0)>>>0){f[E>>2]=f[d>>2];f[E+4>>2]=f[a>>2];f[d>>2]=0;f[a>>2]=0;f[y>>2]=E+8}else{sd(z,d);D=f[a>>2]|0;if(!D)break;dh(D)}while(0);break}ac[f[f[H>>2]>>2]&15](d,v,0);E=f[d>>2]|0;D=f[q>>2]|0;C=(D|0)==0;if(C){f[d>>2]=E;f[t>>2]=0}else{bh(D);F=f[q>>2]|0;if(F|0)dh(F);f[d>>2]=E;f[t>>2]=D;ch(D)}E=f[s>>2]|0;if(E>>>0>=(f[m>>2]|0)>>>0){rd(e,d);F=f[t>>2]|0;if(F|0)eh(F)}else{f[E>>2]=f[d>>2];f[E+4>>2]=f[t>>2];f[d>>2]=0;f[t>>2]=0;f[s>>2]=E+8}if(!C)dh(D);ac[f[f[H>>2]>>2]&15](d,v,1);D=f[d>>2]|0;C=f[q>>2]|0;E=(C|0)==0;if(E){f[d>>2]=D;f[t>>2]=0}else{bh(C);F=f[q>>2]|0;if(F|0)dh(F);f[d>>2]=D;f[t>>2]=C;ch(C)}D=f[s>>2]|0;do if(D>>>0<(f[m>>2]|0)>>>0){f[D>>2]=f[d>>2];f[D+4>>2]=f[t>>2];f[d>>2]=0;f[t>>2]=0;f[s>>2]=D+8}else{rd(e,d);F=f[t>>2]|0;if(!F)break;eh(F)}while(0);if(!E)dh(C);ac[f[f[H>>2]>>2]&15](d,v,2);D=f[d>>2]|0;F=f[q>>2]|0;U=(F|0)==0;if(U){f[d>>2]=D;f[t>>2]=0}else{bh(F);W=f[q>>2]|0;if(W|0)dh(W);f[d>>2]=D;f[t>>2]=F;ch(F)}D=f[s>>2]|0;do if(D>>>0<(f[m>>2]|0)>>>0){f[D>>2]=f[d>>2];f[D+4>>2]=f[t>>2];f[d>>2]=0;f[t>>2]=0;f[s>>2]=D+8}else{rd(e,d);W=f[t>>2]|0;if(!W)break;eh(W)}while(0);if(!U)dh(F);ac[f[f[H>>2]>>2]&15](d,v,3);D=f[d>>2]|0;C=f[q>>2]|0;E=(C|0)==0;if(E){f[d>>2]=D;f[t>>2]=0}else{bh(C);W=f[q>>2]|0;if(W|0)dh(W);f[d>>2]=D;f[t>>2]=C;ch(C)}D=f[s>>2]|0;do if(D>>>0<(f[m>>2]|0)>>>0){f[D>>2]=f[d>>2];f[D+4>>2]=f[t>>2];f[d>>2]=0;f[t>>2]=0;f[s>>2]=D+8}else{rd(e,d);W=f[t>>2]|0;if(!W)break;eh(W)}while(0);if(E)break;dh(C)}while(0);if(!L)dh(Q);v=f[s>>2]|0;D=f[e>>2]|0;H=v;if((v|0)==(D|0)){N=D;O=H;break}else A=H}}A=N;if(!N){u=c;return}if((O|0)==(A|0))ba=N;else{N=O;while(1){O=N+-8|0;f[s>>2]=O;Q=f[N+-4>>2]|0;if(!Q)ca=O;else{eh(Q);ca=f[s>>2]|0}if((ca|0)==(A|0))break;else N=ca}ba=f[e>>2]|0}hh(ba);u=c;return}function qd(a,c,d,e,g){a=a|0;c=c|0;d=d|0;e=e|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;h=c+4|0;i=f[h>>2]|0;do if(i){j=f[d>>2]|0;k=f[d+4>>2]|0;l=f[d+8>>2]|0;m=c+4|0;n=i;a:while(1){o=f[n+16>>2]|0;do if((j|0)==(o|0)){p=f[n+20>>2]|0;if((k|0)==(p|0)){if((l|0)<(f[n+24>>2]|0)){q=9;break}if((f[n+24>>2]|0)<(l|0)){q=14;break}else{q=16;break a}}else{if((k|0)<(p|0)){q=9;break}if((p|0)<(k|0)){q=14;break}else{q=16;break a}}}else if(j>>>0>=o>>>0)if(o>>>0<j>>>0)q=14;else{q=16;break a}else q=9;while(0);if((q|0)==9){q=0;o=f[n>>2]|0;if(!o){q=10;break}else{r=n;s=o}}else if((q|0)==14){q=0;t=n+4|0;o=f[t>>2]|0;if(!o){q=15;break}else{r=t;s=o}}m=r;n=s}if((q|0)==10){u=n;v=n;break}else if((q|0)==15){u=n;v=t;break}else if((q|0)==16){u=n;v=m;break}}else{u=h;v=h}while(0);h=f[v>>2]|0;if(h|0){w=h;x=0;y=w;f[a>>2]=y;z=a+4|0;b[z>>0]=x;return}h=gh(36)|0;q=h+16|0;f[q>>2]=f[e>>2];f[q+4>>2]=f[e+4>>2];f[q+8>>2]=f[e+8>>2];f[h+28>>2]=f[g>>2];e=f[g+4>>2]|0;f[h+32>>2]=e;if(e|0)bh(e);f[h>>2]=0;f[h+4>>2]=0;f[h+8>>2]=u;f[v>>2]=h;u=f[f[c>>2]>>2]|0;if(!u)A=h;else{f[c>>2]=u;A=f[v>>2]|0}td(f[c+4>>2]|0,A);A=c+8|0;f[A>>2]=(f[A>>2]|0)+1;w=h;x=1;y=w;f[a>>2]=y;z=a+4|0;b[z>>0]=x;return}function rd(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;c=a+4|0;d=f[c>>2]|0;e=f[a>>2]|0;g=d-e>>3;h=g+1|0;i=e;j=d;if(h>>>0>536870911)Wg(a);d=a+8|0;k=(f[d>>2]|0)-e|0;l=k>>2;m=k>>3>>>0<268435455?(l>>>0<h>>>0?h:l):536870911;do if(m)if(m>>>0>536870911){l=ra(8)|0;kh(l,2026);f[l>>2]=1656;va(l|0,320,33)}else{n=gh(m<<3)|0;break}else n=0;while(0);l=n+(g<<3)|0;h=l;k=n+(m<<3)|0;f[l>>2]=f[b>>2];m=b+4|0;f[n+(g<<3)+4>>2]=f[m>>2];f[b>>2]=0;f[m>>2]=0;m=l+8|0;if((j|0)==(i|0)){o=h;p=e}else{e=j;j=h;h=l;do{l=e;e=e+-8|0;f[h+-8>>2]=f[e>>2];b=l+-4|0;f[h+-4>>2]=f[b>>2];f[e>>2]=0;f[b>>2]=0;h=j+-8|0;j=h}while((e|0)!=(i|0));o=j;p=f[a>>2]|0}f[a>>2]=o;o=f[c>>2]|0;f[c>>2]=m;f[d>>2]=k;k=p;if((o|0)!=(k|0)){d=o;do{o=f[d+-4>>2]|0;d=d+-8|0;if(o|0)eh(o)}while((d|0)!=(k|0))}if(!p)return;hh(p);return}function sd(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;c=a+4|0;d=f[c>>2]|0;e=f[a>>2]|0;g=d-e>>3;h=g+1|0;i=e;j=d;if(h>>>0>536870911)Wg(a);d=a+8|0;k=(f[d>>2]|0)-e|0;l=k>>2;m=k>>3>>>0<268435455?(l>>>0<h>>>0?h:l):536870911;do if(m)if(m>>>0>536870911){l=ra(8)|0;kh(l,2026);f[l>>2]=1656;va(l|0,320,33)}else{n=gh(m<<3)|0;break}else n=0;while(0);l=n+(g<<3)|0;h=l;k=n+(m<<3)|0;f[l>>2]=f[b>>2];m=b+4|0;f[n+(g<<3)+4>>2]=f[m>>2];f[b>>2]=0;f[m>>2]=0;m=l+8|0;if((j|0)==(i|0)){o=h;p=e}else{e=j;j=h;h=l;do{l=e;e=e+-8|0;f[h+-8>>2]=f[e>>2];b=l+-4|0;f[h+-4>>2]=f[b>>2];f[e>>2]=0;f[b>>2]=0;h=j+-8|0;j=h}while((e|0)!=(i|0));o=j;p=f[a>>2]|0}f[a>>2]=o;o=f[c>>2]|0;f[c>>2]=m;f[d>>2]=k;k=p;if((o|0)!=(k|0)){d=o;do{o=f[d+-4>>2]|0;d=d+-8|0;if(o|0)dh(o)}while((d|0)!=(k|0))}if(!p)return;hh(p);return}function td(a,c){a=a|0;c=c|0;var d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;d=(c|0)==(a|0);b[c+12>>0]=d&1;if(d)return;else e=c;while(1){g=e+8|0;h=f[g>>2]|0;c=h+12|0;if(b[c>>0]|0){i=23;break}j=h+8|0;k=f[j>>2]|0;d=f[k>>2]|0;if((d|0)==(h|0)){l=f[k+4>>2]|0;if(!l){i=7;break}m=l+12|0;if(!(b[m>>0]|0))n=m;else{i=7;break}}else{if(!d){i=16;break}m=d+12|0;if(!(b[m>>0]|0))n=m;else{i=16;break}}b[c>>0]=1;c=(k|0)==(a|0);b[k+12>>0]=c&1;b[n>>0]=1;if(c){i=23;break}else e=k}if((i|0)==7){if((f[h>>2]|0)==(e|0)){o=h;p=k}else{n=h+4|0;a=f[n>>2]|0;c=f[a>>2]|0;f[n>>2]=c;if(!c)q=k;else{f[c+8>>2]=h;q=f[j>>2]|0}f[a+8>>2]=q;q=f[j>>2]|0;f[((f[q>>2]|0)==(h|0)?q:q+4|0)>>2]=a;f[a>>2]=h;f[j>>2]=a;o=a;p=f[a+8>>2]|0}b[o+12>>0]=1;b[p+12>>0]=0;o=f[p>>2]|0;a=o+4|0;q=f[a>>2]|0;f[p>>2]=q;if(q|0)f[q+8>>2]=p;q=p+8|0;f[o+8>>2]=f[q>>2];c=f[q>>2]|0;f[((f[c>>2]|0)==(p|0)?c:c+4|0)>>2]=o;f[a>>2]=p;f[q>>2]=o;return}else if((i|0)==16){if((f[h>>2]|0)==(e|0)){o=e+4|0;q=f[o>>2]|0;f[h>>2]=q;if(!q)r=k;else{f[q+8>>2]=h;r=f[j>>2]|0}f[g>>2]=r;r=f[j>>2]|0;f[((f[r>>2]|0)==(h|0)?r:r+4|0)>>2]=e;f[o>>2]=h;f[j>>2]=e;s=e;t=f[e+8>>2]|0}else{s=h;t=k}b[s+12>>0]=1;b[t+12>>0]=0;s=t+4|0;k=f[s>>2]|0;h=f[k>>2]|0;f[s>>2]=h;if(h|0)f[h+8>>2]=t;h=t+8|0;f[k+8>>2]=f[h>>2];s=f[h>>2]|0;f[((f[s>>2]|0)==(t|0)?s:s+4|0)>>2]=k;f[k>>2]=t;f[h>>2]=k;return}else if((i|0)==23)return}function ud(a){a=a|0;f[a>>2]=552;fe(a+16|0);Xg(a);return}function vd(a){a=a|0;f[a>>2]=552;fe(a+16|0);Xg(a);hh(a);return}function wd(a){a=a|0;var b=0;b=a+16|0;_b[f[(f[b>>2]|0)+8>>2]&63](b);return}function xd(a){a=a|0;hh(a);return}function yd(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=+d;e=e|0;De(a,c,d,e);return}function zd(a){a=a|0;var b=0;f[a>>2]=580;b=a+12|0;a=f[b>>2]|0;if(!a){f[b>>2]=0;return}_b[f[(f[a>>2]|0)+32>>2]&63](a);f[b>>2]=0;return}function Ad(a){a=a|0;Ob()}function Bd(a,c,d,e){a=a|0;c=c|0;d=d|0;e=e|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;g=u;u=u+16|0;h=g;i=g+8|0;f[a>>2]=580;f[a+4>>2]=c;f[a+8>>2]=d;f[a+12>>2]=0;j=a+16|0;k=e;l=j+64|0;do{f[j>>2]=f[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));m=a+80|0;if(!d)n=Kd(c)|0;else n=d+144|0;j=m;k=n;l=j+64|0;do{f[j>>2]=f[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));f[h>>2]=m;f[h+4>>2]=e;Cd(a+144|0,h,i);b[a+208>>0]=0;f[a+240>>2]=2147483647;u=g;return}function Cd(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;c=f[b>>2]|0;d=f[b+4>>2]|0;b=c+16|0;e=d+4|0;g=c+32|0;h=d+8|0;i=c+48|0;j=d+12|0;n[a>>2]=+n[e>>2]*+n[b>>2]+ +n[d>>2]*+n[c>>2]+ +n[h>>2]*+n[g>>2]+ +n[j>>2]*+n[i>>2];k=c+4|0;l=c+20|0;m=c+36|0;o=c+52|0;n[a+4>>2]=+n[e>>2]*+n[l>>2]+ +n[d>>2]*+n[k>>2]+ +n[h>>2]*+n[m>>2]+ +n[j>>2]*+n[o>>2];p=c+8|0;q=c+24|0;r=c+40|0;s=c+56|0;n[a+8>>2]=+n[e>>2]*+n[q>>2]+ +n[d>>2]*+n[p>>2]+ +n[h>>2]*+n[r>>2]+ +n[j>>2]*+n[s>>2];t=c+12|0;u=c+28|0;v=c+44|0;w=c+60|0;n[a+12>>2]=+n[e>>2]*+n[u>>2]+ +n[d>>2]*+n[t>>2]+ +n[h>>2]*+n[v>>2]+ +n[j>>2]*+n[w>>2];j=d+16|0;h=d+20|0;e=d+24|0;x=d+28|0;n[a+16>>2]=+n[h>>2]*+n[b>>2]+ +n[j>>2]*+n[c>>2]+ +n[e>>2]*+n[g>>2]+ +n[x>>2]*+n[i>>2];n[a+20>>2]=+n[h>>2]*+n[l>>2]+ +n[j>>2]*+n[k>>2]+ +n[e>>2]*+n[m>>2]+ +n[x>>2]*+n[o>>2];n[a+24>>2]=+n[h>>2]*+n[q>>2]+ +n[j>>2]*+n[p>>2]+ +n[e>>2]*+n[r>>2]+ +n[x>>2]*+n[s>>2];n[a+28>>2]=+n[h>>2]*+n[u>>2]+ +n[j>>2]*+n[t>>2]+ +n[e>>2]*+n[v>>2]+ +n[x>>2]*+n[w>>2];x=d+32|0;e=d+36|0;j=d+40|0;h=d+44|0;n[a+32>>2]=+n[e>>2]*+n[b>>2]+ +n[x>>2]*+n[c>>2]+ +n[j>>2]*+n[g>>2]+ +n[h>>2]*+n[i>>2];n[a+36>>2]=+n[e>>2]*+n[l>>2]+ +n[x>>2]*+n[k>>2]+ +n[j>>2]*+n[m>>2]+ +n[h>>2]*+n[o>>2];n[a+40>>2]=+n[e>>2]*+n[q>>2]+ +n[x>>2]*+n[p>>2]+ +n[j>>2]*+n[r>>2]+ +n[h>>2]*+n[s>>2];n[a+44>>2]=+n[e>>2]*+n[u>>2]+ +n[x>>2]*+n[t>>2]+ +n[j>>2]*+n[v>>2]+ +n[h>>2]*+n[w>>2];h=d+48|0;j=d+52|0;x=d+56|0;e=d+60|0;n[a+48>>2]=+n[j>>2]*+n[b>>2]+ +n[h>>2]*+n[c>>2]+ +n[x>>2]*+n[g>>2]+ +n[e>>2]*+n[i>>2];n[a+52>>2]=+n[j>>2]*+n[l>>2]+ +n[h>>2]*+n[k>>2]+ +n[x>>2]*+n[m>>2]+ +n[e>>2]*+n[o>>2];n[a+56>>2]=+n[j>>2]*+n[q>>2]+ +n[h>>2]*+n[p>>2]+ +n[x>>2]*+n[r>>2]+ +n[e>>2]*+n[s>>2];n[a+60>>2]=+n[j>>2]*+n[u>>2]+ +n[h>>2]*+n[t>>2]+ +n[x>>2]*+n[v>>2]+ +n[e>>2]*+n[w>>2];return}function Dd(a){a=a|0;var b=0,c=0;b=f[a+12>>2]|0;if(!b){c=0;return c|0}c=Wb[f[(f[b>>2]|0)+12>>2]&7](b)|0;return c|0}function Ed(a){a=a|0;var b=0,c=0;b=f[a+12>>2]|0;if(!b){c=0;return c|0}c=(Wb[f[(f[b>>2]|0)+8>>2]&7](b)|0)^1;return c|0}function Fd(a,b){a=a|0;b=b|0;var c=0,d=0;c=a+12|0;a=f[c>>2]|0;if(!a){d=0;return d|0}if(Wb[f[(f[a>>2]|0)+8>>2]&7](a)|0){d=0;return d|0}a=f[c>>2]|0;$b[f[f[a>>2]>>2]&7](a,b);d=1;return d|0}function Gd(a,b){a=a|0;b=b|0;var c=0;c=a+12|0;a=f[c>>2]|0;if(!a)return;if(Wb[f[(f[a>>2]|0)+8>>2]&7](a)|0)return;a=f[c>>2]|0;$b[f[(f[a>>2]|0)+4>>2]&7](a,b);return}function Hd(a,b){a=a|0;b=b|0;var c=0;c=a+12|0;a=f[c>>2]|0;if(!a)return;if(!(Wb[f[(f[a>>2]|0)+12>>2]&7](a)|0))return;a=f[c>>2]|0;if(!a)return;if(Wb[f[(f[a>>2]|0)+8>>2]&7](a)|0)return;a=f[c>>2]|0;$b[f[(f[a>>2]|0)+16>>2]&7](a,b);return}function Id(a,b,c){a=a|0;b=b|0;c=c|0;var d=0;d=a+12|0;a=f[d>>2]|0;if(!a)return;if(!(Wb[f[(f[a>>2]|0)+12>>2]&7](a)|0))return;a=f[d>>2]|0;if(!a)return;if(Wb[f[(f[a>>2]|0)+8>>2]&7](a)|0)return;a=f[d>>2]|0;ac[f[(f[a>>2]|0)+20>>2]&15](a,b,c);return}function Jd(a,b,c){a=a|0;b=b|0;c=c|0;var d=0;d=f[a+12>>2]|0;if(!d)return;ac[f[(f[d>>2]|0)+24>>2]&15](d,b,c);return}function Kd(a){a=a|0;return a+4|0}function Ld(a,b,c){a=a|0;b=b|0;c=c|0;$b[f[f[a>>2]>>2]&7](a,b);ac[f[(f[a>>2]|0)+4>>2]&15](a,b,c);$b[f[(f[a>>2]|0)+12>>2]&7](a,c);$b[f[(f[a>>2]|0)+16>>2]&7](a,c);return}function Md(a,b,c){a=a|0;b=b|0;c=c|0;ac[f[(f[a>>2]|0)+8>>2]&15](a,b,c);return}function Nd(){var a=0,c=0,d=0,e=0;f[2954]=0;f[2955]=0;f[2956]=0;a=gh(224)|0;f[2954]=a;f[2956]=-2147483424;f[2955]=209;Hi(a|0,2282,209)|0;b[a+209>>0]=0;f[2957]=0;f[2958]=0;f[2959]=0;a=gh(128)|0;f[2957]=a;f[2959]=-2147483520;f[2958]=118;c=a;d=2492;e=c+118|0;do{b[c>>0]=b[d>>0]|0;c=c+1|0;d=d+1|0}while((c|0)<(e|0));b[a+118>>0]=0;return}function Od(a){a=a|0;f[a>>2]=0;f[a+4>>2]=0;f[a+8>>2]=0;b[a+12>>0]=0;return}function Pd(a,c){a=a|0;c=c|0;var d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;d=u;u=u+32|0;e=d+12|0;g=d;h=a+12|0;if(b[h>>0]|0){u=d;return}b[h>>0]=1;Qd(e,gh(1)|0);Qd(g,gh(1)|0);Rd(a);h=e+8|0;i=f[h>>2]|0;j=b[11827]|0;k=j<<24>>24<0?f[2955]|0:j&255;j=f[c>>2]|0;l=j+12|0;m=j+16|0;while(1){n=f[l>>2]|0;if(!n){Fc(j);o=f[l>>2]|0}else o=n;p=o+4+3&-4;q=p+12|0;if((p+16|0)>>>0<=(f[m>>2]|0)>>>0){r=7;break}f[o>>2]=-1;if(!(Ic(j,8-o+q|0)|0)){s=0;break}}if((r|0)==7){f[o>>2]=8;f[l>>2]=q;f[q>>2]=-1;s=p}f[s>>2]=i;f[s+4>>2]=0;f[s+8>>2]=k;k=b[11827]|0;s=k<<24>>24<0;i=s?f[2954]|0:11816;p=s?f[2955]|0:k&255;k=f[c>>2]|0;s=k+12|0;q=k+16|0;while(1){l=f[s>>2]|0;if(!l){Fc(k);t=f[s>>2]|0}else t=l;v=t+4|0;w=v+p+3&-4;x=w;if((x+4|0)>>>0<=(f[q>>2]|0)>>>0){r=13;break}f[t>>2]=-1;if(!(Ic(k,8-t+w|0)|0)){y=0;break}}if((r|0)==13){f[t>>2]=-2;f[s>>2]=x;f[w>>2]=-1;y=v}Hi(y|0,i|0,p|0)|0;p=g+8|0;i=f[p>>2]|0;y=b[11839]|0;v=y<<24>>24<0?f[2958]|0:y&255;y=f[c>>2]|0;w=y+12|0;x=y+16|0;while(1){s=f[w>>2]|0;if(!s){Fc(y);z=f[w>>2]|0}else z=s;A=z+4+3&-4;B=A+12|0;if((A+16|0)>>>0<=(f[x>>2]|0)>>>0){r=19;break}f[z>>2]=-1;if(!(Ic(y,8-z+B|0)|0)){C=0;break}}if((r|0)==19){f[z>>2]=8;f[w>>2]=B;f[B>>2]=-1;C=A}f[C>>2]=i;f[C+4>>2]=1;f[C+8>>2]=v;v=b[11839]|0;C=v<<24>>24<0;i=C?f[2957]|0:11828;A=C?f[2958]|0:v&255;v=f[c>>2]|0;C=v+12|0;B=v+16|0;while(1){w=f[C>>2]|0;if(!w){Fc(v);D=f[C>>2]|0}else D=w;E=D+4|0;F=E+A+3&-4;G=F;if((G+4|0)>>>0<=(f[B>>2]|0)>>>0){r=25;break}f[D>>2]=-1;if(!(Ic(v,8-D+F|0)|0)){H=0;break}}if((r|0)==25){f[D>>2]=-2;f[C>>2]=G;f[F>>2]=-1;H=E}Hi(H|0,i|0,A|0)|0;A=f[a+8>>2]|0;a=f[c>>2]|0;i=a+12|0;H=a+16|0;while(1){E=f[i>>2]|0;if(!E){Fc(a);I=f[i>>2]|0}else I=E;J=I+4+3&-4;E=J;K=E+8|0;if((E+12|0)>>>0<=(f[H>>2]|0)>>>0)break;f[I>>2]=-1;Ic(a,8-I+K|0)|0}f[I>>2]=10;f[i>>2]=K;f[K>>2]=-1;K=J;f[K>>2]=A;f[K+4>>2]=2;K=f[h>>2]|0;A=f[p>>2]|0;J=f[c>>2]|0;i=J+12|0;I=J+16|0;while(1){a=f[i>>2]|0;if(!a){Fc(J);L=f[i>>2]|0}else L=a;M=L+4+3&-4;N=M+8|0;if((M+12|0)>>>0<=(f[I>>2]|0)>>>0){r=36;break}f[L>>2]=-1;if(!(Ic(J,8-L+N|0)|0)){O=0;break}}if((r|0)==36){f[L>>2]=-2;f[i>>2]=N;f[N>>2]=-1;O=M}f[O>>2]=K;f[O+4>>2]=A;A=f[h>>2]|0;h=f[c>>2]|0;O=h+12|0;K=h+16|0;while(1){M=f[O>>2]|0;if(!M){Fc(h);P=f[O>>2]|0}else P=M;Q=P+4+3&-4;M=Q;R=M+4|0;if((M+8|0)>>>0<=(f[K>>2]|0)>>>0)break;f[P>>2]=-1;Ic(h,8-P+R|0)|0}f[P>>2]=9;f[O>>2]=R;f[R>>2]=-1;f[Q>>2]=A;A=f[p>>2]|0;p=f[c>>2]|0;c=p+12|0;Q=p+16|0;while(1){R=f[c>>2]|0;if(!R){Fc(p);S=f[c>>2]|0}else S=R;T=S+4+3&-4;R=T;U=R+4|0;if((R+8|0)>>>0<=(f[Q>>2]|0)>>>0)break;f[S>>2]=-1;Ic(p,8-S+U|0)|0}f[S>>2]=9;f[c>>2]=U;f[U>>2]=-1;f[T>>2]=A;Sd(g);A=f[g+4>>2]|0;if(A|0)dh(A);Sd(e);A=f[e+4>>2]|0;if(A|0)dh(A);u=d;return}function Qd(a,c){a=a|0;c=c|0;var d=0,e=0,g=0,h=0,i=0;d=u;u=u+16|0;e=d;f[a>>2]=0;g=a+4|0;f[g>>2]=0;h=a+8|0;f[h>>2]=0;i=c;c=gh(16)|0;f[c+4>>2]=0;f[c+8>>2]=0;f[c>>2]=632;f[c+12>>2]=i;f[a>>2]=i;f[g>>2]=c;if((b[11600]|0)==0?pi(11600)|0:0){f[2960]=1;f[2962]=0;f[2963]=0;f[2961]=11848}c=f[2960]|0;f[2960]=c+1;f[h>>2]=c;if((b[11600]|0)==0?pi(11600)|0:0){f[2960]=1;f[2962]=0;f[2963]=0;f[2961]=11848}Zd(e,11844,h,h,a);u=d;return}function Rd(a){a=a|0;var c=0,d=0,e=0,g=0,h=0;c=u;u=u+16|0;d=c;id(a);e=gh(16)|0;f[e+4>>2]=0;f[e+8>>2]=0;f[e>>2]=604;f[a>>2]=e+12;g=a+4|0;h=f[g>>2]|0;f[g>>2]=e;if(h|0)dh(h);if((b[11592]|0)==0?pi(11592)|0:0){f[2950]=1;f[2952]=0;f[2953]=0;f[2951]=11808}h=f[2950]|0;f[2950]=h+1;e=a+8|0;f[e>>2]=h;if((b[11592]|0)==0?pi(11592)|0:0){f[2950]=1;f[2952]=0;f[2953]=0;f[2951]=11808}Vd(d,11804,e,e,a);u=c;return}function Sd(a){a=a|0;var c=0,d=0,e=0;c=a+8|0;d=a+4|0;if(f[c>>2]|0){e=f[d>>2]|0;if(!e){f[a>>2]=0;f[d>>2]=0;f[c>>2]=0;return}if(!(f[e+4>>2]|0)){if((b[11600]|0)==0?pi(11600)|0:0){f[2960]=1;f[2962]=0;f[2963]=0;f[2961]=11848}Ud(11844,c)|0}}e=f[d>>2]|0;f[a>>2]=0;f[d>>2]=0;if(!e){f[c>>2]=0;return}dh(e);f[c>>2]=0;return}function Td(a){a=a|0;var b=0;b=f[a+4>>2]|0;if(!b)return;dh(b);return}function Ud(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0;c=a+4|0;d=f[c>>2]|0;if(!d){e=0;return e|0}g=f[b>>2]|0;b=c;h=d;a:while(1){i=h;while(1){if((f[i+16>>2]|0)>>>0>=g>>>0)break;j=f[i+4>>2]|0;if(!j){k=b;break a}else i=j}h=f[i>>2]|0;if(!h){k=i;break}else b=i}if((k|0)==(c|0)){e=0;return e|0}if(g>>>0<(f[k+16>>2]|0)>>>0){e=0;return e|0}g=f[k+4>>2]|0;if(!g){c=k+8|0;b=f[c>>2]|0;if((f[b>>2]|0)==(k|0))l=b;else{b=c;do{c=f[b>>2]|0;b=c+8|0;h=f[b>>2]|0}while((f[h>>2]|0)!=(c|0));l=h}}else{b=g;while(1){g=f[b>>2]|0;if(!g)break;else b=g}l=b}if((f[a>>2]|0)==(k|0))f[a>>2]=l;l=a+8|0;f[l>>2]=(f[l>>2]|0)+-1;$c(d,k);d=f[k+24>>2]|0;if(d|0)eh(d);hh(k);e=1;return e|0}function Vd(a,c,d,e,g){a=a|0;c=c|0;d=d|0;e=e|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;h=c+4|0;i=f[h>>2]|0;do if(i){j=f[d>>2]|0;k=c+4|0;l=i;while(1){m=f[l+16>>2]|0;if(j>>>0<m>>>0){n=f[l>>2]|0;if(!n){o=6;break}else{p=l;q=n}}else{if(m>>>0>=j>>>0){o=10;break}r=l+4|0;m=f[r>>2]|0;if(!m){o=9;break}else{p=r;q=m}}k=p;l=q}if((o|0)==6){s=l;t=l;break}else if((o|0)==9){s=l;t=r;break}else if((o|0)==10){s=l;t=k;break}}else{s=h;t=h}while(0);h=f[t>>2]|0;if(h|0){u=h;v=0;w=u;f[a>>2]=w;x=a+4|0;b[x>>0]=v;return}h=gh(28)|0;f[h+16>>2]=f[e>>2];f[h+20>>2]=f[g>>2];e=f[g+4>>2]|0;f[h+24>>2]=e;if(e|0)ch(e);f[h>>2]=0;f[h+4>>2]=0;f[h+8>>2]=s;f[t>>2]=h;s=f[f[c>>2]>>2]|0;if(!s)y=h;else{f[c>>2]=s;y=f[t>>2]|0}td(f[c+4>>2]|0,y);y=c+8|0;f[y>>2]=(f[y>>2]|0)+1;u=h;v=1;w=u;f[a>>2]=w;x=a+4|0;b[x>>0]=v;return}function Wd(a){a=a|0;Xg(a);hh(a);return}function Xd(a){a=a|0;return}function Yd(a){a=a|0;hh(a);return}function Zd(a,c,d,e,g){a=a|0;c=c|0;d=d|0;e=e|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;h=c+4|0;i=f[h>>2]|0;do if(i){j=f[d>>2]|0;k=c+4|0;l=i;while(1){m=f[l+16>>2]|0;if(j>>>0<m>>>0){n=f[l>>2]|0;if(!n){o=6;break}else{p=l;q=n}}else{if(m>>>0>=j>>>0){o=10;break}r=l+4|0;m=f[r>>2]|0;if(!m){o=9;break}else{p=r;q=m}}k=p;l=q}if((o|0)==6){s=l;t=l;break}else if((o|0)==9){s=l;t=r;break}else if((o|0)==10){s=l;t=k;break}}else{s=h;t=h}while(0);h=f[t>>2]|0;if(h|0){u=h;v=0;w=u;f[a>>2]=w;x=a+4|0;b[x>>0]=v;return}h=gh(28)|0;f[h+16>>2]=f[e>>2];f[h+20>>2]=f[g>>2];e=f[g+4>>2]|0;f[h+24>>2]=e;if(e|0)ch(e);f[h>>2]=0;f[h+4>>2]=0;f[h+8>>2]=s;f[t>>2]=h;s=f[f[c>>2]>>2]|0;if(!s)y=h;else{f[c>>2]=s;y=f[t>>2]|0}td(f[c+4>>2]|0,y);y=c+8|0;f[y>>2]=(f[y>>2]|0)+1;u=h;v=1;w=u;f[a>>2]=w;x=a+4|0;b[x>>0]=v;return}function _d(a){a=a|0;Xg(a);hh(a);return}function $d(a){a=a|0;var b=0;b=f[a+12>>2]|0;if(!b)return;hh(b);return}function ae(a,b){a=a|0;b=b|0;return ((f[b+4>>2]|0)==2699?a+12|0:0)|0}function be(a){a=a|0;hh(a);return}function ce(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,g=0,h=0,i=0;c=f[a+8>>2]|0;a=f[b>>2]|0;b=a+12|0;d=a+16|0;while(1){e=f[b>>2]|0;if(!e){Fc(a);g=f[b>>2]|0}else g=e;h=g+4+3&-4;e=h;i=e+4|0;if((e+8|0)>>>0<=(f[d>>2]|0)>>>0)break;f[g>>2]=-1;Ic(a,8-g+i|0)|0}f[g>>2]=12;f[b>>2]=i;f[i>>2]=-1;f[h>>2]=c;return}function de(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0;d=u;u=u+16|0;e=d;he(e,b,c);f[a>>2]=f[e>>2];f[a+4>>2]=f[e+4>>2];u=d;return}function ee(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0;d=f[b+292+(c<<3)>>2]|0;e=f[b+292+(c<<3)+4>>2]|0;if(e|0)bh(e);f[a>>2]=d;f[a+4>>2]=e;return}function fe(a){a=a|0;var b=0,c=0;f[a>>2]=660;f[a+292>>2]=0;b=a+296|0;c=f[b>>2]|0;f[b>>2]=0;if(c|0)dh(c);f[a+300>>2]=0;c=a+304|0;b=f[c>>2]|0;f[c>>2]=0;if(b|0)dh(b);f[a+308>>2]=0;b=a+312|0;c=f[b>>2]|0;f[b>>2]=0;if(c|0)dh(c);f[a+316>>2]=0;c=a+320|0;b=f[c>>2]|0;f[c>>2]=0;if(b|0?(dh(b),b=f[a+320>>2]|0,b|0):0)dh(b);b=f[a+312>>2]|0;if(b|0)dh(b);b=f[a+304>>2]|0;if(b|0)dh(b);b=f[a+296>>2]|0;if(b|0)dh(b);b=f[a+280>>2]|0;if(!b){zd(a);return}dh(b);zd(a);return}function ge(a){a=a|0;fe(a);hh(a);return}function he(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;d=u;u=u+16|0;e=d;g=b+292+(c<<3)|0;h=f[g>>2]|0;if(!h){f[e>>2]=(f[b+244>>2]|0)+1;f[e+4>>2]=f[b+248>>2]<<1|c>>>1&1;f[e+8>>2]=f[b+252>>2]<<1|c&1;i=gh(344)|0;f[i+4>>2]=0;f[i+8>>2]=0;f[i>>2]=552;j=i+16|0;ie(j,e,f[b+4>>2]|0,b);e=j;j=i;bh(i);f[i+292>>2]=e;k=i+296|0;i=f[k>>2]|0;f[k>>2]=j;if(i|0)dh(i);f[g>>2]=e;i=b+292+(c<<3)+4|0;k=f[i>>2]|0;f[i>>2]=j;if(!k)l=e;else{dh(k);l=f[g>>2]|0}m=i;n=l}else{m=b+292+(c<<3)+4|0;n=h}f[a>>2]=n;n=f[m>>2]|0;f[a+4>>2]=n;if(!n){u=d;return}bh(n);u=d;return}function ie(a,c,d,e){a=a|0;c=c|0;d=d|0;e=e|0;var g=0,h=0,i=0,j=0.0,k=0.0,l=0.0;g=u;u=u+64|0;h=g;f[h>>2]=1065353216;i=h+4|0;f[i>>2]=0;f[i+4>>2]=0;f[i+8>>2]=0;f[i+12>>2]=0;f[h+20>>2]=1065353216;i=h+24|0;f[i>>2]=0;f[i+4>>2]=0;f[i+8>>2]=0;f[i+12>>2]=0;f[h+40>>2]=1065353216;i=h+44|0;f[i>>2]=0;f[i+4>>2]=0;f[i+8>>2]=0;f[i+12>>2]=0;f[h+60>>2]=1065353216;Bd(a,d,e,h);f[a>>2]=660;h=a+244|0;f[h>>2]=f[c>>2];f[h+4>>2]=f[c+4>>2];f[h+8>>2]=f[c+8>>2];c=a+264|0;f[c>>2]=-1;f[c+4>>2]=-1;b[a+272>>0]=0;c=a+276|0;h=d+136|0;d=c;e=d+48|0;do{f[d>>2]=0;d=d+4|0}while((d|0)<(e|0));Oc(h,c);c=f[a+244>>2]|0;j=+M(.5,+(+(c>>>0)))*5.0e4;k=j*+(f[a+248>>2]|0)+-25.0e3;l=j*+(f[a+252>>2]|0)+-25.0e3;n[a+212>>2]=k;f[a+216>>2]=-960278528;n[a+220>>2]=l;n[a+224>>2]=k+j;f[a+228>>2]=1187205120;n[a+232>>2]=l+j;b[a+208>>0]=1;j=+af(c);n[a+236>>2]=j;c=gh(108)|0;$e(c,a);f[a+12>>2]=c;u=g;return}function je(a,c){a=a|0;c=c|0;var d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0;d=u;u=u+32|0;e=d+8|0;g=d+4|0;h=d;i=a+264|0;j=i;k=c+312|0;l=f[k>>2]|0;m=f[k+4>>2]|0;if((f[j>>2]|0)==(l|0)?(f[j+4>>2]|0)==(m|0):0){u=d;return}j=i;f[j>>2]=l;f[j+4>>2]=m;m=a+12|0;j=f[m>>2]|0;$b[f[(f[j>>2]|0)+16>>2]&7](j,c);if((Dd(a)|0?Ed(a)|0:0)?(j=f[m>>2]|0,(b[j+4>>0]|0)!=0):0){m=j+8|0;f[e>>2]=f[m>>2];f[e+4>>2]=f[m+4>>2];f[e+8>>2]=f[m+8>>2];f[e+12>>2]=f[m+12>>2];f[e+16>>2]=f[m+16>>2];f[e+20>>2]=f[m+20>>2]}else{m=a+212|0;f[e>>2]=f[m>>2];f[e+4>>2]=f[m+4>>2];f[e+8>>2]=f[m+8>>2];f[e+12>>2]=f[m+12>>2];f[e+16>>2]=f[m+16>>2];f[e+20>>2]=f[m+20>>2]}m=f[a+8>>2]|0;if(!m)o=2147483647;else o=f[m+240>>2]|0;m=ke(c+28|0,e,o)|0;f[a+240>>2]=m;p=+n[e+12>>2];q=+n[e>>2];r=(p-q)*.5;s=+n[e+16>>2];t=+n[e+4>>2];v=(s-t)*.5;w=+n[e+20>>2];x=+n[e+8>>2];y=(w-x)*.5;tc(c);z=+n[c+8>>2];A=+n[c+136>>2]*z+ +n[c+124>>2]-(q+p)*.5;p=+n[c+140>>2]*z+ +n[c+128>>2]-(t+s)*.5;s=+n[c+144>>2]*z+ +n[c+132>>2]-(x+w)*.5;if(!(A<-r))if(A>r)B=A-r;else B=0.0;else B=A+r;if(!(p<-v))if(p>v)C=p-v;else C=0.0;else C=p+v;if(!(s<-y))if(s>y)D=s-y;else D=0.0;else D=s+r;n[g>>2]=1.0000000116860974e-07;r=C*C+B*B+D*D;n[h>>2]=r;e=a+256|0;f[e>>2]=f[(r>1.0000000116860974e-07?h:g)>>2];r=+af(f[a+244>>2]|0);n[a+236>>2]=r;D=+P(+(+n[c+16>>2]*.5))*2.0;n[a+260>>2]=r*+((f[c+308>>2]|0)>>>0)/(D*+n[e>>2]);u=d;return}function ke(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0.0,f=0.0,g=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,o=0.0,p=0.0,q=0,r=0,s=0,t=0,u=0,v=0;if((c+1|0)>>>0<2){d=c;return d|0}e=+n[b+12>>2];f=+n[b>>2];g=f+e;h=+n[b+16>>2];i=+n[b+4>>2];j=i+h;k=+n[b+20>>2];l=+n[b+8>>2];m=l+k;o=e-f;f=h-i;i=k-l;if((c&1|0)!=0?(l=+n[a>>2],k=+n[a+4>>2],h=+n[a+8>>2],e=(+K(+k)*f+ +K(+l)*o+ +K(+h)*i)*.5,p=(k*j+l*g+h*m)*.5+ +n[a+12>>2],!(p-e>0.0)):0)if(p+e<0.0){d=-1;return d|0}else q=1;else q=0;if((c&2|0)!=0?(e=+n[a+16>>2],p=+n[a+20>>2],h=+n[a+24>>2],l=(+K(+p)*f+ +K(+e)*o+ +K(+h)*i)*.5,k=(p*j+e*g+h*m)*.5+ +n[a+28>>2],!(k-l>0.0)):0)if(k+l<0.0){d=-1;return d|0}else r=q|2;else r=q;if((c&4|0)!=0?(l=+n[a+32>>2],k=+n[a+36>>2],h=+n[a+40>>2],e=(+K(+k)*f+ +K(+l)*o+ +K(+h)*i)*.5,p=(k*j+l*g+h*m)*.5+ +n[a+44>>2],!(p-e>0.0)):0)if(p+e<0.0){d=-1;return d|0}else s=r|4;else s=r;if((c&8|0)!=0?(e=+n[a+48>>2],p=+n[a+52>>2],h=+n[a+56>>2],l=(+K(+p)*f+ +K(+e)*o+ +K(+h)*i)*.5,k=(p*j+e*g+h*m)*.5+ +n[a+60>>2],!(k-l>0.0)):0)if(k+l<0.0){d=-1;return d|0}else t=s|8;else t=s;if((c&16|0)!=0?(l=+n[a+64>>2],k=+n[a+68>>2],h=+n[a+72>>2],e=(+K(+k)*f+ +K(+l)*o+ +K(+h)*i)*.5,p=(k*j+l*g+h*m)*.5+ +n[a+76>>2],!(p-e>0.0)):0)if(p+e<0.0){d=-1;return d|0}else u=t|16;else u=t;if((c&32|0)!=0?(e=+n[a+80>>2],p=+n[a+84>>2],h=+n[a+88>>2],l=(+K(+p)*f+ +K(+e)*o+ +K(+h)*i)*.5,i=(p*j+e*g+h*m)*.5+ +n[a+92>>2],!(i-l>0.0)):0)if(i+l<0.0){d=-1;return d|0}else v=u|32;else v=u;d=v;return d|0}function le(a,c){a=a|0;c=c|0;var d=0,e=0;if((Dd(c)|0?Ed(c)|0:0)?(d=f[c+12>>2]|0,b[d+4>>0]|0):0){e=d+8|0;f[a>>2]=f[e>>2];f[a+4>>2]=f[e+4>>2];f[a+8>>2]=f[e+8>>2];f[a+12>>2]=f[e+12>>2];f[a+16>>2]=f[e+16>>2];f[a+20>>2]=f[e+20>>2];return}e=c+212|0;f[a>>2]=f[e>>2];f[a+4>>2]=f[e+4>>2];f[a+8>>2]=f[e+8>>2];f[a+12>>2]=f[e+12>>2];f[a+16>>2]=f[e+16>>2];f[a+20>>2]=f[e+20>>2];return}function me(a){a=a|0;return (f[a+240>>2]|0)!=-1|0}function ne(a,b){a=a|0;b=b|0;Fe(a,b);return}function oe(a,c){a=a|0;c=c|0;var d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0;d=a+40|0;if(!(b[d>>0]|0))return;e=f[a+36>>2]|0;if(!(b[e+13>>0]|0)){a=f[e+8>>2]|0;g=f[c>>2]|0;c=g+12|0;h=g+16|0;while(1){i=f[c>>2]|0;if(!i){Fc(g);j=f[c>>2]|0}else j=i;k=j+4+3&-4;i=k;l=i+4|0;if((i+8|0)>>>0<=(f[h>>2]|0)>>>0)break;f[j>>2]=-1;Ic(g,8-j+l|0)|0}f[j>>2]=3;f[c>>2]=l;f[l>>2]=-1;f[k>>2]=a;we(e);b[e+12>>0]=0}b[d>>0]=0;return}function pe(a){a=a|0;var b=0,c=0;b=a+32|0;a=f[(f[b>>2]|0)+8>>2]|0;if(!a){c=0;return c|0}if(!(Dd(a)|0)){c=1;return c|0}c=(Ed(f[(f[b>>2]|0)+8>>2]|0)|0)^1;return c|0}function qe(a){a=a|0;return (b[a+40>>0]|0)!=0|0}function re(a,b){a=a|0;b=b|0;Ce(a,0);return}function se(a,b,c){a=a|0;b=b|0;c=c|0;Ae(a,0,c);return}function te(a,b,c){a=a|0;b=b|0;c=c|0;ze(a,b,c);return}function ue(a){a=a|0;var b=0;f[a>>2]=684;if((d[(f[(f[a+32>>2]|0)+4>>2]|0)+144>>1]|0)==1)return;b=f[a+36>>2]|0;if(!b)return;we(b);a=f[b+4>>2]|0;if(a|0)dh(a);hh(b);return}function ve(a){a=a|0;var b=0,c=0;f[a>>2]=684;if((d[(f[(f[a+32>>2]|0)+4>>2]|0)+144>>1]|0)==1){hh(a);return}b=f[a+36>>2]|0;if(!b){hh(a);return}we(b);c=f[b+4>>2]|0;if(c|0)dh(c);hh(b);hh(a);return}function we(a){a=a|0;var c=0,d=0,e=0;c=a+8|0;d=a+4|0;if(f[c>>2]|0){e=f[d>>2]|0;if(!e){f[a>>2]=0;f[d>>2]=0;f[c>>2]=0;return}if(!(f[e+4>>2]|0)){if((b[11608]|0)==0?pi(11608)|0:0){f[2964]=1;f[2966]=0;f[2967]=0;f[2965]=11864}ye(11860,c)|0}}e=f[d>>2]|0;f[a>>2]=0;f[d>>2]=0;if(!e){f[c>>2]=0;return}dh(e);f[c>>2]=0;return}function xe(a){a=a|0;var b=0;b=f[a+4>>2]|0;if(!b)return;dh(b);return}function ye(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0;c=a+4|0;d=f[c>>2]|0;if(!d){e=0;return e|0}g=f[b>>2]|0;b=c;h=d;a:while(1){i=h;while(1){if((f[i+16>>2]|0)>>>0>=g>>>0)break;j=f[i+4>>2]|0;if(!j){k=b;break a}else i=j}h=f[i>>2]|0;if(!h){k=i;break}else b=i}if((k|0)==(c|0)){e=0;return e|0}if(g>>>0<(f[k+16>>2]|0)>>>0){e=0;return e|0}g=f[k+4>>2]|0;if(!g){c=k+8|0;b=f[c>>2]|0;if((f[b>>2]|0)==(k|0))l=b;else{b=c;do{c=f[b>>2]|0;b=c+8|0;h=f[b>>2]|0}while((f[h>>2]|0)!=(c|0));l=h}}else{b=g;while(1){g=f[b>>2]|0;if(!g)break;else b=g}l=b}if((f[a>>2]|0)==(k|0))f[a>>2]=l;l=a+8|0;f[l>>2]=(f[l>>2]|0)+-1;$c(d,k);d=f[k+24>>2]|0;if(d|0)eh(d);hh(k);e=1;return e|0}function ze(a,c,d){a=a|0;c=c|0;d=d|0;var e=0,g=0,h=0,i=0,j=0.0,k=0,l=0,m=0,o=0,p=0,q=0,r=0,s=0,t=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;e=u;u=u+96|0;g=e+64|0;h=e;i=e+88|0;le(g,f[a+32>>2]|0);j=+n[g>>2];n[h>>2]=+n[g+12>>2]-j;f[h+16>>2]=0;f[h+32>>2]=0;n[h+48>>2]=j;f[h+4>>2]=0;j=+n[g+4>>2];n[h+20>>2]=+n[g+16>>2]-j;f[h+36>>2]=0;n[h+52>>2]=j;f[h+8>>2]=0;f[h+24>>2]=0;j=+n[g+8>>2];n[h+40>>2]=+n[g+20>>2]-j;n[h+56>>2]=j;f[h+12>>2]=0;f[h+28>>2]=0;f[h+44>>2]=0;f[h+60>>2]=1065353216;g=f[d>>2]|0;a=g+12|0;k=g+16|0;while(1){l=f[a>>2]|0;if(!l){Fc(g);m=f[a>>2]|0}else m=l;o=m+4+3&-4;l=o;p=l+72|0;if((l+76|0)>>>0<=(f[k>>2]|0)>>>0){q=6;break}f[m>>2]=-1;if(!(Ic(g,8-m+p|0)|0)){r=0;break}}if((q|0)==6){f[m>>2]=15;f[a>>2]=p;f[p>>2]=-1;r=o}o=r;p=720;a=o+64|0;do{f[o>>2]=f[p>>2];o=o+4|0;p=p+4|0}while((o|0)<(a|0));f[r+64>>2]=1;b[r+68>>0]=0;m=r+69|0;b[m>>0]=b[i>>0]|0;b[m+1>>0]=b[i+1>>0]|0;b[m+2>>0]=b[i+2>>0]|0;i=f[d>>2]|0;m=i+12|0;r=i+16|0;while(1){g=f[m>>2]|0;if(!g){Fc(i);s=f[m>>2]|0}else s=g;t=s+4+3&-4;v=t+64|0;if((t+68|0)>>>0<=(f[r>>2]|0)>>>0){q=12;break}f[s>>2]=-1;if(!(Ic(i,8-s+v|0)|0)){w=0;break}}if((q|0)==12){f[s>>2]=-2;f[m>>2]=v;f[v>>2]=-1;w=t}o=w;p=h;a=o+64|0;do{f[o>>2]=f[p>>2];o=o+4|0;p=p+4|0}while((o|0)<(a|0));h=f[d>>2]|0;w=h+12|0;t=h+16|0;while(1){v=f[w>>2]|0;if(!v){Fc(h);x=f[w>>2]|0}else x=v;y=x+4+3&-4;v=y;z=v+68|0;if((v+72|0)>>>0<=(f[t>>2]|0)>>>0){q=18;break}f[x>>2]=-1;if(!(Ic(h,8-x+z|0)|0)){A=0;break}}if((q|0)==18){f[x>>2]=16;f[w>>2]=z;f[z>>2]=-1;A=y}o=A;p=784;a=o+64|0;do{f[o>>2]=f[p>>2];o=o+4|0;p=p+4|0}while((o|0)<(a|0));f[A+64>>2]=1;A=f[d>>2]|0;p=A+12|0;o=A+16|0;while(1){a=f[p>>2]|0;if(!a){Fc(A);B=f[p>>2]|0}else B=a;C=B+4+3&-4;D=C+16|0;if((C+20|0)>>>0<=(f[o>>2]|0)>>>0){q=24;break}f[B>>2]=-1;if(!(Ic(A,8-B+D|0)|0)){E=0;break}}if((q|0)==24){f[B>>2]=-2;f[p>>2]=D;f[D>>2]=-1;E=C};f[E>>2]=f[212];f[E+4>>2]=f[213];f[E+8>>2]=f[214];f[E+12>>2]=f[215];if(b[11616]|0){df(11872,c,d);u=e;return}if(!(pi(11616)|0)){df(11872,c,d);u=e;return}bf(11872);df(11872,c,d);u=e;return}function Ae(a,c,e){a=a|0;c=c|0;e=e|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;c=u;u=u+16|0;g=c;if(Wb[f[(f[a>>2]|0)+8>>2]&7](a)|0){u=c;return}if(!(Wb[f[(f[a>>2]|0)+12>>2]&7](a)|0)){u=c;return}h=a+32|0;i=f[(f[h>>2]|0)+244>>2]|0;j=f[e>>2]|0;k=j+12|0;l=j+16|0;while(1){m=f[k>>2]|0;if(!m){Fc(j);n=f[k>>2]|0}else n=m;o=n+4+3&-4;m=o;p=m+68|0;if((m+72|0)>>>0<=(f[l>>2]|0)>>>0){q=8;break}f[n>>2]=-1;if(!(Ic(j,8-n+p|0)|0)){r=0;break}}if((q|0)==8){f[n>>2]=13;f[k>>2]=p;f[p>>2]=-1;r=o}o=r;p=864;k=o+64|0;do{f[o>>2]=f[p>>2];o=o+4|0;p=p+4|0}while((o|0)<(k|0));f[r+64>>2]=i;i=f[(f[h>>2]|0)+260>>2]|0;r=f[e>>2]|0;n=r+12|0;j=r+16|0;while(1){l=f[n>>2]|0;if(!l){Fc(r);s=f[n>>2]|0}else s=l;t=s+4+3&-4;l=t;v=l+68|0;if((l+72|0)>>>0<=(f[j>>2]|0)>>>0){q=14;break}f[s>>2]=-1;if(!(Ic(r,8-s+v|0)|0)){w=0;break}}if((q|0)==14){f[s>>2]=14;f[n>>2]=v;f[v>>2]=-1;w=t}o=w;p=928;k=o+64|0;do{f[o>>2]=f[p>>2];o=o+4|0;p=p+4|0}while((o|0)<(k|0));f[w+64>>2]=i;if((d[(f[(f[h>>2]|0)+4>>2]|0)+144>>1]|0)==1){h=f[e>>2]|0;i=h+12|0;w=h+16|0;while(1){t=f[i>>2]|0;if(!t){Fc(h);x=f[i>>2]|0}else x=t;y=x+4+3&-4;t=y;z=t+72|0;if((t+76|0)>>>0<=(f[w>>2]|0)>>>0){q=21;break}f[x>>2]=-1;if(!(Ic(h,8-x+z|0)|0)){A=0;break}}if((q|0)==21){f[x>>2]=15;f[i>>2]=z;f[z>>2]=-1;A=y}o=A;p=720;k=o+64|0;do{f[o>>2]=f[p>>2];o=o+4|0;p=p+4|0}while((o|0)<(k|0));f[A+64>>2]=1;b[A+68>>0]=0;y=A+69|0;b[y>>0]=b[g>>0]|0;b[y+1>>0]=b[g+1>>0]|0;b[y+2>>0]=b[g+2>>0]|0;g=a+44|0;y=f[e>>2]|0;A=y+12|0;z=y+16|0;while(1){i=f[A>>2]|0;if(!i){Fc(y);B=f[A>>2]|0}else B=i;C=B+4+3&-4;D=C+64|0;if((C+68|0)>>>0<=(f[z>>2]|0)>>>0){q=27;break}f[B>>2]=-1;if(!(Ic(y,8-B+D|0)|0)){E=0;break}}if((q|0)==27){f[B>>2]=-2;f[A>>2]=D;f[D>>2]=-1;E=C}o=E;p=g;k=o+64|0;do{f[o>>2]=f[p>>2];o=o+4|0;p=p+4|0}while((o|0)<(k|0))}Be(f[a+36>>2]|0,0,e);u=c;return}function Be(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;b=f[a+8>>2]|0;a=f[c>>2]|0;d=a+12|0;e=a+16|0;while(1){g=f[d>>2]|0;if(!g){Fc(a);h=f[d>>2]|0}else h=g;i=h+4+3&-4;g=i;j=g+4|0;if((g+8|0)>>>0<=(f[e>>2]|0)>>>0)break;f[h>>2]=-1;Ic(a,8-h+j|0)|0}f[h>>2]=2;f[d>>2]=j;f[j>>2]=-1;f[i>>2]=b;b=f[c>>2]|0;c=b+12|0;i=b+16|0;while(1){j=f[c>>2]|0;if(!j){Fc(b);k=f[c>>2]|0}else k=j;l=k+4+3&-4;m=l+16|0;if((l+20|0)>>>0<=(f[i>>2]|0)>>>0)break;f[k>>2]=-1;if(!(Ic(b,8-k+m|0)|0)){n=0;o=12;break}}if((o|0)==12){f[n>>2]=2;p=n+4|0;f[p>>2]=6144;q=n+8|0;f[q>>2]=2;r=n+12|0;f[r>>2]=0;return}f[k>>2]=21;f[c>>2]=m;f[m>>2]=-1;n=l;f[n>>2]=2;p=n+4|0;f[p>>2]=6144;q=n+8|0;f[q>>2]=2;r=n+12|0;f[r>>2]=0;return}function Ce(a,c){a=a|0;c=c|0;var e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,o=0,p=0,q=0,r=0,t=0,v=0,w=0,x=0,y=0.0,z=0,A=0,B=0,C=0.0,D=0.0,E=0.0,F=0.0;c=u;u=u+16|0;e=c;g=a+32|0;h=f[g>>2]|0;if((d[(f[h+4>>2]|0)+144>>1]|0)!=1){u=c;return}i=h+212|0;j=h+224|0;k=h+220|0;l=h+232|0;m=a+4|0;o=a+12|0;p=a+16|0;q=a+20|0;r=a+24|0;t=a+28|0;v=a+8|0;w=0;x=h;while(1){y=+n[i>>2];h=f[2977]|0;z=h+1|0;A=(h^61^h>>>16)*9|0;B=X(A>>>4^A,668265261)|0;C=(+n[j>>2]-y)*2.3283064365386963e-10*+((B>>>15^B)>>>0)+y;y=+n[k>>2];D=+n[l>>2]-y;f[2977]=h+2;h=(z^61^z>>>16)*9|0;z=X(h>>>4^h,668265261)|0;E=D*2.3283064365386963e-10*+((z>>>15^z)>>>0)+y;De(e,C,E,f[x+244>>2]|0);z=f[e>>2]|0;if(!(b[m>>0]|0)){n[v>>2]=C;f[o>>2]=z;n[p>>2]=E;n[q>>2]=C;f[r>>2]=z;n[t>>2]=E;b[m>>0]=1}else{y=+n[v>>2];D=+(C<y&1);n[v>>2]=(1.0-D)*y+C*D;D=(f[s>>2]=z,+n[s>>2]);y=+n[o>>2];F=+(y>D&1);n[o>>2]=(1.0-F)*y+F*D;F=+n[p>>2];y=+(E<F&1);n[p>>2]=(1.0-y)*F+E*y;y=+n[q>>2];F=+(y<C&1);n[q>>2]=(1.0-F)*y+C*F;F=+n[r>>2];C=+(F<D&1);n[r>>2]=(1.0-C)*F+C*D;D=+n[t>>2];C=+(D<E&1);n[t>>2]=(1.0-C)*D+E*C}z=w+1|0;if((z|0)==5)break;w=z;x=f[g>>2]|0}if((b[11624]|0)==0?pi(11624)|0:0){f[2972]=0;f[2973]=0;f[2974]=0;b[11900]=0;b[11901]=1;f[2976]=0}b[a+40>>0]=b[11900]|0;u=c;return}function De(a,b,c,d){a=a|0;b=+b;c=+c;d=d|0;var e=0,g=0,h=0,i=0,j=0,k=0,l=0.0,m=0.0,o=0.0,p=0.0,q=0.0,r=0,t=0.0,v=0,w=0,x=0;e=u;u=u+48|0;g=e+32|0;h=e+24|0;i=e+16|0;j=e;k=(d*5|0)+5|0;l=b*1.9999999494757503e-04;n[h>>2]=l;b=c*1.9999999494757503e-04;n[h+4>>2]=b;Ee(g,.550000011920929,.5,h,k>>>0<6?k:6);n[i>>2]=l;n[i+4>>2]=b;Ee(j,.4000000059604645,1.0,i,k);b=+n[g+8>>2];if(!(b<-.07999999821186066))if(b>-.009999999776482582){m=0.0;o=.05000000074505806}else{l=(b+.07999999821186066)*14.285714149475098;b=l;m=b*85.71428489685059*(1.0-b)*.05000000074505806;o=(3.0-b*2.0)*(l*l)*.05000000074505806}else{m=0.0;o=0.0}k=j+8|0;l=+n[k>>2]+o;o=+n[g>>2]*m+ +n[j>>2];n[j>>2]=o;i=j+4|0;b=+n[g+4>>2]*m+ +n[i>>2];n[i>>2]=b;m=l*5.0e3;n[k>>2]=m;l=-o;c=-b;p=o*o+1.0+b*b;if(!(p>0.0)){q=l;r=1065353216;t=c;n[a>>2]=m;v=a+4|0;n[v>>2]=q;w=a+8|0;f[w>>2]=r;x=a+12|0;n[x>>2]=t;u=e;return}b=+L(+p);q=l/b;r=(n[s>>2]=1.0/b,f[s>>2]|0);t=c/b;n[a>>2]=m;v=a+4|0;n[v>>2]=q;w=a+8|0;f[w>>2]=r;x=a+12|0;n[x>>2]=t;u=e;return}function Ee(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=e|0;var g=0.0,h=0.0,i=0.0,j=0.0,k=0,l=0,m=0,o=0,p=0.0,q=0.0,r=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0,I=0,K=0,L=0,M=0.0,N=0.0,O=0.0;g=1.0-b;if(!e){h=0.0;i=0.0;j=0.0;n[a>>2]=j;k=a+4|0;n[k>>2]=i;l=a+8|0;n[l>>2]=h;return}m=d+4|0;o=0;p=c;c=0.0;q=1.0;r=0.0;t=0.0;u=1.0;v=0.0;w=0.0;x=+n[m>>2];y=+n[d>>2];while(1){z=+J(+y);A=+J(+x);B=y-z;C=x-A;D=B*B;E=D*B*((B*6.0+-15.0)*B+10.0);F=C*C;G=F*C*((C*6.0+-15.0)*C+10.0);H=(n[s>>2]=z,f[s>>2]|0);I=(n[s>>2]=A,f[s>>2]|0);K=X(H,1664525)|0;H=K+I|0;L=(H^61^H>>>16)*9|0;H=X(L>>>4^L,668265261)|0;M=+((H>>>15^H)>>>0);H=X((n[s>>2]=z+1.0,f[s>>2]|0),1664525)|0;L=H+I|0;I=(L^61^L>>>16)*9|0;L=X(I>>>4^I,668265261)|0;z=+((L>>>15^L)>>>0);L=(n[s>>2]=A+1.0,f[s>>2]|0);I=K+L|0;K=(I^61^I>>>16)*9|0;I=X(K>>>4^K,668265261)|0;A=+((I>>>15^I)>>>0);I=H+L|0;L=(I^61^I>>>16)*9|0;I=X(L>>>4^L,668265261)|0;N=(z-M)*2.3283064365386963e-10;O=(M-z-A+ +((I>>>15^I)>>>0))*2.3283064365386963e-10;z=O*E+(A-M)*2.3283064365386963e-10;A=D*60.0*((B+-2.0)*B+1.0)*(O*G+N);O=F*60.0*((C+-2.0)*C+1.0)*z;C=p*g;c=C*((N*E+M*2.3283064365386963e-10+z*G)*2.0+-1.0)+c;v=(O*r+A*q)*C+v;w=(u*O+t*A)*C+w;C=y;y=(x*.6000000238418579+y*.800000011920929)*1.899999976158142;x=(x*.800000011920929+C*-.6000000238418579)*1.899999976158142;C=(t*.800000011920929+q*.6000000238418579)*1.899999976158142;A=(u*.800000011920929+r*.6000000238418579)*1.899999976158142;o=o+1|0;if((o|0)==(e|0))break;else{p=p*b;q=(t*-.6000000238418579+q*.800000011920929)*1.899999976158142;r=(u*-.6000000238418579+r*.800000011920929)*1.899999976158142;t=C;u=A}}n[d>>2]=y;n[m>>2]=x;h=c;i=w;j=v;n[a>>2]=j;k=a+4|0;n[k>>2]=i;l=a+8|0;n[l>>2]=h;return}function Fe(a,c){a=a|0;c=c|0;if((b[11576]|0)==0?pi(11576)|0:0){f[2942]=0;f[2943]=0;f[2944]=0;b[11780]=0}Ge(11768,c);if((b[11584]|0)==0?pi(11584)|0:0)Od(11784);Pd(11784,c);if((b[11616]|0)==0?pi(11616)|0:0)bf(11872);cf(11872,c);He(f[a+36>>2]|0,c);b[a+40>>0]=1;return}function Ge(a,c){a=a|0;c=c|0;var d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;d=u;u=u+32|0;e=d+12|0;g=d;h=a+12|0;if(b[h>>0]|0){u=d;return}b[h>>0]=1;Qd(e,gh(1)|0);Qd(g,gh(1)|0);Rd(a);h=e+8|0;i=f[h>>2]|0;j=b[11939]|0;k=j<<24>>24<0?f[2983]|0:j&255;j=f[c>>2]|0;l=j+12|0;m=j+16|0;while(1){n=f[l>>2]|0;if(!n){Fc(j);o=f[l>>2]|0}else o=n;p=o+4+3&-4;q=p+12|0;if((p+16|0)>>>0<=(f[m>>2]|0)>>>0){r=7;break}f[o>>2]=-1;if(!(Ic(j,8-o+q|0)|0)){s=0;break}}if((r|0)==7){f[o>>2]=8;f[l>>2]=q;f[q>>2]=-1;s=p}f[s>>2]=i;f[s+4>>2]=0;f[s+8>>2]=k;k=b[11939]|0;s=k<<24>>24<0;i=s?f[2982]|0:11928;p=s?f[2983]|0:k&255;k=f[c>>2]|0;s=k+12|0;q=k+16|0;while(1){l=f[s>>2]|0;if(!l){Fc(k);t=f[s>>2]|0}else t=l;v=t+4|0;w=v+p+3&-4;x=w;if((x+4|0)>>>0<=(f[q>>2]|0)>>>0){r=13;break}f[t>>2]=-1;if(!(Ic(k,8-t+w|0)|0)){y=0;break}}if((r|0)==13){f[t>>2]=-2;f[s>>2]=x;f[w>>2]=-1;y=v}Hi(y|0,i|0,p|0)|0;p=g+8|0;i=f[p>>2]|0;y=b[11951]|0;v=y<<24>>24<0?f[2986]|0:y&255;y=f[c>>2]|0;w=y+12|0;x=y+16|0;while(1){s=f[w>>2]|0;if(!s){Fc(y);z=f[w>>2]|0}else z=s;A=z+4+3&-4;B=A+12|0;if((A+16|0)>>>0<=(f[x>>2]|0)>>>0){r=19;break}f[z>>2]=-1;if(!(Ic(y,8-z+B|0)|0)){C=0;break}}if((r|0)==19){f[z>>2]=8;f[w>>2]=B;f[B>>2]=-1;C=A}f[C>>2]=i;f[C+4>>2]=1;f[C+8>>2]=v;v=b[11951]|0;C=v<<24>>24<0;i=C?f[2985]|0:11940;A=C?f[2986]|0:v&255;v=f[c>>2]|0;C=v+12|0;B=v+16|0;while(1){w=f[C>>2]|0;if(!w){Fc(v);D=f[C>>2]|0}else D=w;E=D+4|0;F=E+A+3&-4;G=F;if((G+4|0)>>>0<=(f[B>>2]|0)>>>0){r=25;break}f[D>>2]=-1;if(!(Ic(v,8-D+F|0)|0)){H=0;break}}if((r|0)==25){f[D>>2]=-2;f[C>>2]=G;f[F>>2]=-1;H=E}Hi(H|0,i|0,A|0)|0;A=f[a+8>>2]|0;a=f[c>>2]|0;i=a+12|0;H=a+16|0;while(1){E=f[i>>2]|0;if(!E){Fc(a);I=f[i>>2]|0}else I=E;J=I+4+3&-4;E=J;K=E+8|0;if((E+12|0)>>>0<=(f[H>>2]|0)>>>0)break;f[I>>2]=-1;Ic(a,8-I+K|0)|0}f[I>>2]=10;f[i>>2]=K;f[K>>2]=-1;K=J;f[K>>2]=A;f[K+4>>2]=2;K=f[h>>2]|0;A=f[p>>2]|0;J=f[c>>2]|0;i=J+12|0;I=J+16|0;while(1){a=f[i>>2]|0;if(!a){Fc(J);L=f[i>>2]|0}else L=a;M=L+4+3&-4;N=M+8|0;if((M+12|0)>>>0<=(f[I>>2]|0)>>>0){r=36;break}f[L>>2]=-1;if(!(Ic(J,8-L+N|0)|0)){O=0;break}}if((r|0)==36){f[L>>2]=-2;f[i>>2]=N;f[N>>2]=-1;O=M}f[O>>2]=K;f[O+4>>2]=A;A=f[h>>2]|0;h=f[c>>2]|0;O=h+12|0;K=h+16|0;while(1){M=f[O>>2]|0;if(!M){Fc(h);P=f[O>>2]|0}else P=M;Q=P+4+3&-4;M=Q;R=M+4|0;if((M+8|0)>>>0<=(f[K>>2]|0)>>>0)break;f[P>>2]=-1;Ic(h,8-P+R|0)|0}f[P>>2]=9;f[O>>2]=R;f[R>>2]=-1;f[Q>>2]=A;A=f[p>>2]|0;p=f[c>>2]|0;c=p+12|0;Q=p+16|0;while(1){R=f[c>>2]|0;if(!R){Fc(p);S=f[c>>2]|0}else S=R;T=S+4+3&-4;R=T;U=R+4|0;if((R+8|0)>>>0<=(f[Q>>2]|0)>>>0)break;f[S>>2]=-1;Ic(p,8-S+U|0)|0}f[S>>2]=9;f[c>>2]=U;f[U>>2]=-1;f[T>>2]=A;Sd(g);A=f[g+4>>2]|0;if(A|0)dh(A);Sd(e);A=f[e+4>>2]|0;if(A|0)dh(A);u=d;return}function He(a,c){a=a|0;c=c|0;var d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,o=0,p=0,q=0.0,r=0,t=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0;d=u;u=u+48|0;e=d+24|0;g=d+12|0;h=d;i=d+40|0;j=a+12|0;if(b[j>>0]|0){u=d;return}b[j>>0]=1;if(b[a+13>>0]|0){j=gh(24576)|0;Ji(j|0,0,24576)|0;k=gh(13068)|0;l=k;m=1089;o=l;p=k;do{f[p>>2]=0;f[p+4>>2]=0;f[p+8>>2]=0;p=o+12|0;o=p;m=m+-1|0}while((m|0)!=0);m=0;do{p=m*33|0;q=+(m>>>0)*.03125;r=0;do{t=r+p|0;n[k+(t*12|0)>>2]=+(r>>>0)*.03125;n[k+(t*12|0)+4>>2]=0.0;n[k+(t*12|0)+8>>2]=q;r=r+1|0}while((r|0)!=33);m=m+1|0}while((m|0)!=33);m=0;do{r=m*33|0;p=m<<5;t=0;do{v=t+r|0;w=(t+p|0)*6|0;f[j+(w<<2)>>2]=v;f[j+((w|1)<<2)>>2]=v+1;x=v+34|0;f[j+(w+2<<2)>>2]=x;f[j+(w+3<<2)>>2]=v;f[j+(w+4<<2)>>2]=x;f[j+(w+5<<2)>>2]=v+33;t=t+1|0}while((t|0)!=32);m=m+1|0}while((m|0)!=32);m=gh(16)|0;f[m>>2]=0;f[m+4>>2]=1;f[m+8>>2]=j;f[m+12>>2]=6144;Ie(e,m);m=gh(16)|0;f[m>>2]=0;f[m+4>>2]=0;f[m+8>>2]=k;f[m+12>>2]=((o-l|0)/12|0)*3;Ie(g,m);Je(a);m=a+8|0;l=f[m>>2]|0;o=f[c>>2]|0;t=o+12|0;p=o+16|0;while(1){r=f[t>>2]|0;if(!r){Fc(o);y=f[t>>2]|0}else y=r;z=y+4+3&-4;r=z;A=r+4|0;if((r+8|0)>>>0<=(f[p>>2]|0)>>>0)break;f[y>>2]=-1;Ic(o,8-y+A|0)|0}f[y>>2]=1;f[t>>2]=A;f[A>>2]=-1;f[z>>2]=l;l=f[m>>2]|0;m=f[c>>2]|0;z=m+12|0;A=m+16|0;while(1){t=f[z>>2]|0;if(!t){Fc(m);B=f[z>>2]|0}else B=t;C=B+4+3&-4;t=C;D=t+4|0;if((t+8|0)>>>0<=(f[A>>2]|0)>>>0)break;f[B>>2]=-1;Ic(m,8-B+D|0)|0}f[B>>2]=2;f[z>>2]=D;f[D>>2]=-1;f[C>>2]=l;l=e+8|0;Ke(f[e>>2]|0,c,f[l>>2]|0);C=g+8|0;Le(f[g>>2]|0,c,f[C>>2]|0);D=f[c>>2]|0;z=D+12|0;B=D+16|0;while(1){m=f[z>>2]|0;if(!m){Fc(D);E=f[z>>2]|0}else E=m;F=E+4+3&-4;G=F+24|0;if((F+28|0)>>>0<=(f[B>>2]|0)>>>0){H=28;break}f[E>>2]=-1;if(!(Ic(D,8-E+G|0)|0)){I=0;break}}if((H|0)==28){f[E>>2]=19;f[z>>2]=G;f[G>>2]=-1;I=F}f[I>>2]=0;f[I+4>>2]=3;f[I+8>>2]=0;b[I+12>>0]=0;F=I+13|0;b[F>>0]=b[h>>0]|0;b[F+1>>0]=b[h+1>>0]|0;b[F+2>>0]=b[h+2>>0]|0;f[I+16>>2]=0;f[I+20>>2]=0;I=f[c>>2]|0;F=I+12|0;G=I+16|0;while(1){z=f[F>>2]|0;if(!z){Fc(I);J=f[F>>2]|0}else J=z;K=J+4+3&-4;z=K;L=z+4|0;if((z+8|0)>>>0<=(f[G>>2]|0)>>>0)break;f[J>>2]=-1;Ic(I,8-J+L|0)|0}f[J>>2]=17;f[F>>2]=L;f[L>>2]=-1;f[K>>2]=0;K=f[c>>2]|0;L=K+12|0;F=K+16|0;while(1){J=f[L>>2]|0;if(!J){Fc(K);M=f[L>>2]|0}else M=J;N=M+4+3&-4;J=N;O=J+4|0;if((J+8|0)>>>0<=(f[F>>2]|0)>>>0)break;f[M>>2]=-1;Ic(K,8-M+O|0)|0}f[M>>2]=2;f[L>>2]=O;f[O>>2]=-1;f[N>>2]=0;N=f[l>>2]|0;l=f[c>>2]|0;O=l+12|0;L=l+16|0;while(1){M=f[O>>2]|0;if(!M){Fc(l);P=f[O>>2]|0}else P=M;Q=P+4+3&-4;M=Q;R=M+4|0;if((M+8|0)>>>0<=(f[L>>2]|0)>>>0)break;f[P>>2]=-1;Ic(l,8-P+R|0)|0}f[P>>2]=7;f[O>>2]=R;f[R>>2]=-1;f[Q>>2]=N;N=f[C>>2]|0;C=f[c>>2]|0;Q=C+12|0;R=C+16|0;while(1){O=f[Q>>2]|0;if(!O){Fc(C);S=f[Q>>2]|0}else S=O;T=S+4+3&-4;O=T;U=O+4|0;if((O+8|0)>>>0<=(f[R>>2]|0)>>>0)break;f[S>>2]=-1;Ic(C,8-S+U|0)|0}f[S>>2]=7;f[Q>>2]=U;f[U>>2]=-1;f[T>>2]=N;Me(g);N=f[g+4>>2]|0;if(N|0)dh(N);Me(e);N=f[e+4>>2]|0;if(N|0)dh(N);hh(k);hh(j);u=d;return}j=a+16|0;k=f[(f[j>>2]|0)+32>>2]|0;N=k+212|0;T=k+224|0;U=gh(24672)|0;Ji(U|0,0,24672)|0;Q=gh(13068)|0;S=Q;C=1089;R=S;O=Q;do{f[O>>2]=0;f[O+4>>2]=0;f[O+8>>2]=0;O=R+12|0;R=O;C=C+-1|0}while((C|0)!=0);C=gh(13068)|0;O=C;P=1089;l=O;L=C;do{f[L>>2]=0;f[L+4>>2]=0;f[L+8>>2]=0;L=l+12|0;l=L;P=P+-1|0}while((P|0)!=0);P=k+220|0;L=k+232|0;M=k+244|0;k=e+4|0;K=e+8|0;F=e+12|0;J=0;do{I=J*33|0;q=+(J>>>0)*.03125;G=0;do{z=G+I|0;V=+n[N>>2];W=+(G>>>0)*.03125*(+n[T>>2]-V)+V;E=Q+(z*12|0)|0;n[E>>2]=W;V=+n[P>>2];X=q*(+n[L>>2]-V)+V;D=Q+(z*12|0)+8|0;n[D>>2]=X;De(e,W,X,f[M>>2]|0);B=f[e>>2]|0;f[Q+(z*12|0)+4>>2]=B;m=f[E>>2]|0;E=f[D>>2]|0;D=f[j>>2]|0;A=D+4|0;t=D+8|0;if(!(b[A>>0]|0)){f[t>>2]=m;f[D+12>>2]=B;f[D+16>>2]=E;f[D+20>>2]=m;f[D+24>>2]=B;f[D+28>>2]=E;b[A>>0]=1}else{A=D+20|0;X=(f[s>>2]=m,+n[s>>2]);W=+n[t>>2];V=+(W>X&1);n[t>>2]=(1.0-V)*W+V*X;t=D+12|0;V=(f[s>>2]=B,+n[s>>2]);W=+n[t>>2];Y=+(W>V&1);n[t>>2]=(1.0-Y)*W+Y*V;t=D+16|0;Y=(f[s>>2]=E,+n[s>>2]);W=+n[t>>2];Z=+(W>Y&1);n[t>>2]=(1.0-Z)*W+Z*Y;Z=+n[A>>2];W=+(Z<X&1);n[A>>2]=(1.0-W)*Z+W*X;A=D+24|0;X=+n[A>>2];W=+(X<V&1);n[A>>2]=(1.0-W)*X+W*V;A=D+28|0;V=+n[A>>2];W=+(V<Y&1);n[A>>2]=(1.0-W)*V+W*Y}f[C+(z*12|0)>>2]=f[k>>2];f[C+(z*12|0)+4>>2]=f[K>>2];f[C+(z*12|0)+8>>2]=f[F>>2];G=G+1|0}while(G>>>0<33);J=J+1|0}while(J>>>0<33);J=0;do{F=J*33|0;K=J<<5;k=0;do{j=k+F|0;M=(k+K|0)*6|0;f[U+(M<<2)>>2]=j;f[U+((M|1)<<2)>>2]=j+1;L=j+34|0;f[U+(M+2<<2)>>2]=L;f[U+(M+3<<2)>>2]=j;f[U+(M+4<<2)>>2]=L;f[U+(M+5<<2)>>2]=j+33;k=k+1|0}while((k|0)!=32);J=J+1|0}while((J|0)!=32);J=gh(16)|0;f[J>>2]=0;f[J+4>>2]=1;f[J+8>>2]=U;f[J+12>>2]=6168;Ie(e,J);J=gh(16)|0;f[J>>2]=0;f[J+4>>2]=0;f[J+8>>2]=Q;f[J+12>>2]=((R-S|0)/12|0)*3;Ie(g,J);J=gh(16)|0;f[J>>2]=0;f[J+4>>2]=0;f[J+8>>2]=C;f[J+12>>2]=((l-O|0)/12|0)*3;Ie(h,J);Je(a);J=a+8|0;a=f[J>>2]|0;O=f[c>>2]|0;l=O+12|0;S=O+16|0;while(1){R=f[l>>2]|0;if(!R){Fc(O);_=f[l>>2]|0}else _=R;$=_+4+3&-4;R=$;aa=R+4|0;if((R+8|0)>>>0<=(f[S>>2]|0)>>>0)break;f[_>>2]=-1;Ic(O,8-_+aa|0)|0}f[_>>2]=1;f[l>>2]=aa;f[aa>>2]=-1;f[$>>2]=a;a=f[J>>2]|0;J=f[c>>2]|0;$=J+12|0;aa=J+16|0;while(1){l=f[$>>2]|0;if(!l){Fc(J);ba=f[$>>2]|0}else ba=l;ca=ba+4+3&-4;l=ca;da=l+4|0;if((l+8|0)>>>0<=(f[aa>>2]|0)>>>0)break;f[ba>>2]=-1;Ic(J,8-ba+da|0)|0}f[ba>>2]=2;f[$>>2]=da;f[da>>2]=-1;f[ca>>2]=a;a=e+8|0;Ke(f[e>>2]|0,c,f[a>>2]|0);ca=g+8|0;Le(f[g>>2]|0,c,f[ca>>2]|0);da=f[c>>2]|0;$=da+12|0;ba=da+16|0;while(1){J=f[$>>2]|0;if(!J){Fc(da);ea=f[$>>2]|0}else ea=J;fa=ea+4+3&-4;ga=fa+24|0;if((fa+28|0)>>>0<=(f[ba>>2]|0)>>>0){H=84;break}f[ea>>2]=-1;if(!(Ic(da,8-ea+ga|0)|0)){ha=0;break}}if((H|0)==84){f[ea>>2]=19;f[$>>2]=ga;f[ga>>2]=-1;ha=fa}f[ha>>2]=0;f[ha+4>>2]=3;f[ha+8>>2]=0;b[ha+12>>0]=0;fa=ha+13|0;b[fa>>0]=b[i>>0]|0;b[fa+1>>0]=b[i+1>>0]|0;b[fa+2>>0]=b[i+2>>0]|0;f[ha+16>>2]=0;f[ha+20>>2]=0;ha=f[c>>2]|0;fa=ha+12|0;ga=ha+16|0;while(1){$=f[fa>>2]|0;if(!$){Fc(ha);ia=f[fa>>2]|0}else ia=$;ja=ia+4+3&-4;$=ja;ka=$+4|0;if(($+8|0)>>>0<=(f[ga>>2]|0)>>>0)break;f[ia>>2]=-1;Ic(ha,8-ia+ka|0)|0}f[ia>>2]=17;f[fa>>2]=ka;f[ka>>2]=-1;f[ja>>2]=0;ja=h+8|0;Le(f[h>>2]|0,c,f[ja>>2]|0);ka=f[c>>2]|0;fa=ka+12|0;ia=ka+16|0;while(1){ha=f[fa>>2]|0;if(!ha){Fc(ka);la=f[fa>>2]|0}else la=ha;ma=la+4+3&-4;na=ma+24|0;if((ma+28|0)>>>0<=(f[ia>>2]|0)>>>0){H=95;break}f[la>>2]=-1;if(!(Ic(ka,8-la+na|0)|0)){oa=0;break}}if((H|0)==95){f[la>>2]=19;f[fa>>2]=na;f[na>>2]=-1;oa=ma}f[oa>>2]=1;f[oa+4>>2]=3;f[oa+8>>2]=0;b[oa+12>>0]=0;ma=oa+13|0;b[ma>>0]=b[i>>0]|0;b[ma+1>>0]=b[i+1>>0]|0;b[ma+2>>0]=b[i+2>>0]|0;f[oa+16>>2]=0;f[oa+20>>2]=0;oa=f[c>>2]|0;i=oa+12|0;ma=oa+16|0;while(1){na=f[i>>2]|0;if(!na){Fc(oa);pa=f[i>>2]|0}else pa=na;qa=pa+4+3&-4;na=qa;ra=na+4|0;if((na+8|0)>>>0<=(f[ma>>2]|0)>>>0)break;f[pa>>2]=-1;Ic(oa,8-pa+ra|0)|0}f[pa>>2]=17;f[i>>2]=ra;f[ra>>2]=-1;f[qa>>2]=1;qa=f[c>>2]|0;ra=qa+12|0;i=qa+16|0;while(1){pa=f[ra>>2]|0;if(!pa){Fc(qa);sa=f[ra>>2]|0}else sa=pa;ta=sa+4+3&-4;pa=ta;ua=pa+4|0;if((pa+8|0)>>>0<=(f[i>>2]|0)>>>0)break;f[sa>>2]=-1;Ic(qa,8-sa+ua|0)|0}f[sa>>2]=2;f[ra>>2]=ua;f[ua>>2]=-1;f[ta>>2]=0;ta=f[a>>2]|0;a=f[c>>2]|0;ua=a+12|0;ra=a+16|0;while(1){sa=f[ua>>2]|0;if(!sa){Fc(a);va=f[ua>>2]|0}else va=sa;wa=va+4+3&-4;sa=wa;xa=sa+4|0;if((sa+8|0)>>>0<=(f[ra>>2]|0)>>>0)break;f[va>>2]=-1;Ic(a,8-va+xa|0)|0}f[va>>2]=7;f[ua>>2]=xa;f[xa>>2]=-1;f[wa>>2]=ta;ta=f[ca>>2]|0;ca=f[c>>2]|0;wa=ca+12|0;xa=ca+16|0;while(1){ua=f[wa>>2]|0;if(!ua){Fc(ca);ya=f[wa>>2]|0}else ya=ua;za=ya+4+3&-4;ua=za;Aa=ua+4|0;if((ua+8|0)>>>0<=(f[xa>>2]|0)>>>0)break;f[ya>>2]=-1;Ic(ca,8-ya+Aa|0)|0}f[ya>>2]=7;f[wa>>2]=Aa;f[Aa>>2]=-1;f[za>>2]=ta;ta=f[ja>>2]|0;ja=f[c>>2]|0;c=ja+12|0;za=ja+16|0;while(1){Aa=f[c>>2]|0;if(!Aa){Fc(ja);Ba=f[c>>2]|0}else Ba=Aa;Ca=Ba+4+3&-4;Aa=Ca;Da=Aa+4|0;if((Aa+8|0)>>>0<=(f[za>>2]|0)>>>0)break;f[Ba>>2]=-1;Ic(ja,8-Ba+Da|0)|0}f[Ba>>2]=7;f[c>>2]=Da;f[Da>>2]=-1;f[Ca>>2]=ta;Me(h);ta=f[h+4>>2]|0;if(ta|0)dh(ta);Me(g);ta=f[g+4>>2]|0;if(ta|0)dh(ta);Me(e);ta=f[e+4>>2]|0;if(ta|0)dh(ta);hh(C);hh(Q);hh(U);u=d;return}function Ie(a,c){a=a|0;c=c|0;var d=0,e=0,g=0,h=0,i=0;d=u;u=u+16|0;e=d;f[a>>2]=0;g=a+4|0;f[g>>2]=0;h=a+8|0;f[h>>2]=0;i=c;c=gh(16)|0;f[c+4>>2]=0;f[c+8>>2]=0;f[c>>2]=1028;f[c+12>>2]=i;f[a>>2]=i;f[g>>2]=c;if((b[11632]|0)==0?pi(11632)|0:0){f[2978]=1;f[2980]=0;f[2981]=0;f[2979]=11920}c=f[2978]|0;f[2978]=c+1;f[h>>2]=c;if((b[11632]|0)==0?pi(11632)|0:0){f[2978]=1;f[2980]=0;f[2981]=0;f[2979]=11920}Te(e,11916,h,h,a);u=d;return}function Je(a){a=a|0;var c=0,d=0,e=0,g=0,h=0;c=u;u=u+16|0;d=c;we(a);e=gh(16)|0;f[e+4>>2]=0;f[e+8>>2]=0;f[e>>2]=1e3;f[a>>2]=e+12;g=a+4|0;h=f[g>>2]|0;f[g>>2]=e;if(h|0)dh(h);if((b[11608]|0)==0?pi(11608)|0:0){f[2964]=1;f[2966]=0;f[2967]=0;f[2965]=11864}h=f[2964]|0;f[2964]=h+1;e=a+8|0;f[e>>2]=h;if((b[11608]|0)==0?pi(11608)|0:0){f[2964]=1;f[2966]=0;f[2967]=0;f[2965]=11864}Pe(d,11860,e,e,a);u=c;return}function Ke(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;d=f[b>>2]|0;e=d+12|0;g=d+16|0;while(1){h=f[e>>2]|0;if(!h){Fc(d);i=f[e>>2]|0}else i=h;j=i+4+3&-4;h=j;k=h+4|0;if((h+8|0)>>>0<=(f[g>>2]|0)>>>0)break;f[i>>2]=-1;Ic(d,8-i+k|0)|0}f[i>>2]=4;f[e>>2]=k;f[k>>2]=-1;f[j>>2]=c;j=a+4|0;k=f[j>>2]|0;e=f[b>>2]|0;i=e+12|0;d=e+16|0;while(1){g=f[i>>2]|0;if(!g){Fc(e);l=f[i>>2]|0}else l=g;m=l+4+3&-4;g=m;n=g+8|0;if((g+12|0)>>>0<=(f[d>>2]|0)>>>0)break;f[l>>2]=-1;Ic(e,8-l+n|0)|0}f[l>>2]=5;f[i>>2]=n;f[n>>2]=-1;n=m;f[n>>2]=c;f[n+4>>2]=k;k=f[j>>2]|0;j=f[a>>2]|0;n=a+12|0;c=f[n>>2]<<2;m=f[b>>2]|0;i=m+12|0;l=m+16|0;while(1){e=f[i>>2]|0;if(!e){Fc(m);o=f[i>>2]|0}else o=e;p=o+4+3&-4;q=p+12|0;if((p+16|0)>>>0<=(f[l>>2]|0)>>>0){r=16;break}f[o>>2]=-1;if(!(Ic(m,8-o+q|0)|0)){s=0;break}}if((r|0)==16){f[o>>2]=6;f[i>>2]=q;f[q>>2]=-1;s=p}f[s>>2]=k;f[s+4>>2]=j;f[s+8>>2]=c;c=f[a+8>>2]|0;a=f[b>>2]|0;b=a+12|0;s=f[n>>2]<<2;n=a+16|0;while(1){j=f[b>>2]|0;if(!j){Fc(a);t=f[b>>2]|0}else t=j;u=t+4+3&-4;v=u+s|0;if((v+4|0)>>>0<=(f[n>>2]|0)>>>0)break;f[t>>2]=-1;if(!(Ic(a,8-t+v|0)|0)){w=0;r=23;break}}if((r|0)==23){Hi(w|0,c|0,s|0)|0;return}f[t>>2]=-2;f[b>>2]=v;f[v>>2]=-1;w=u;Hi(w|0,c|0,s|0)|0;return}function Le(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;d=f[b>>2]|0;e=d+12|0;g=d+16|0;while(1){h=f[e>>2]|0;if(!h){Fc(d);i=f[e>>2]|0}else i=h;j=i+4+3&-4;h=j;k=h+4|0;if((h+8|0)>>>0<=(f[g>>2]|0)>>>0)break;f[i>>2]=-1;Ic(d,8-i+k|0)|0}f[i>>2]=4;f[e>>2]=k;f[k>>2]=-1;f[j>>2]=c;j=a+4|0;k=f[j>>2]|0;e=f[b>>2]|0;i=e+12|0;d=e+16|0;while(1){g=f[i>>2]|0;if(!g){Fc(e);l=f[i>>2]|0}else l=g;m=l+4+3&-4;g=m;n=g+8|0;if((g+12|0)>>>0<=(f[d>>2]|0)>>>0)break;f[l>>2]=-1;Ic(e,8-l+n|0)|0}f[l>>2]=5;f[i>>2]=n;f[n>>2]=-1;n=m;f[n>>2]=c;f[n+4>>2]=k;k=f[j>>2]|0;j=f[a>>2]|0;n=a+12|0;c=f[n>>2]<<2;m=f[b>>2]|0;i=m+12|0;l=m+16|0;while(1){e=f[i>>2]|0;if(!e){Fc(m);o=f[i>>2]|0}else o=e;p=o+4+3&-4;q=p+12|0;if((p+16|0)>>>0<=(f[l>>2]|0)>>>0){r=16;break}f[o>>2]=-1;if(!(Ic(m,8-o+q|0)|0)){s=0;break}}if((r|0)==16){f[o>>2]=6;f[i>>2]=q;f[q>>2]=-1;s=p}f[s>>2]=k;f[s+4>>2]=j;f[s+8>>2]=c;c=f[a+8>>2]|0;a=f[b>>2]|0;b=a+12|0;s=f[n>>2]<<2;n=a+16|0;while(1){j=f[b>>2]|0;if(!j){Fc(a);t=f[b>>2]|0}else t=j;u=t+4+3&-4;v=u+s|0;if((v+4|0)>>>0<=(f[n>>2]|0)>>>0)break;f[t>>2]=-1;if(!(Ic(a,8-t+v|0)|0)){w=0;r=23;break}}if((r|0)==23){Hi(w|0,c|0,s|0)|0;return}f[t>>2]=-2;f[b>>2]=v;f[v>>2]=-1;w=u;Hi(w|0,c|0,s|0)|0;return}function Me(a){a=a|0;var c=0,d=0,e=0;c=a+8|0;d=a+4|0;if(f[c>>2]|0){e=f[d>>2]|0;if(!e){f[a>>2]=0;f[d>>2]=0;f[c>>2]=0;return}if(!(f[e+4>>2]|0)){if((b[11632]|0)==0?pi(11632)|0:0){f[2978]=1;f[2980]=0;f[2981]=0;f[2979]=11920}Oe(11916,c)|0}}e=f[d>>2]|0;f[a>>2]=0;f[d>>2]=0;if(!e){f[c>>2]=0;return}dh(e);f[c>>2]=0;return}function Ne(a){a=a|0;var b=0;b=f[a+4>>2]|0;if(!b)return;dh(b);return}function Oe(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0;c=a+4|0;d=f[c>>2]|0;if(!d){e=0;return e|0}g=f[b>>2]|0;b=c;h=d;a:while(1){i=h;while(1){if((f[i+16>>2]|0)>>>0>=g>>>0)break;j=f[i+4>>2]|0;if(!j){k=b;break a}else i=j}h=f[i>>2]|0;if(!h){k=i;break}else b=i}if((k|0)==(c|0)){e=0;return e|0}if(g>>>0<(f[k+16>>2]|0)>>>0){e=0;return e|0}g=f[k+4>>2]|0;if(!g){c=k+8|0;b=f[c>>2]|0;if((f[b>>2]|0)==(k|0))l=b;else{b=c;do{c=f[b>>2]|0;b=c+8|0;h=f[b>>2]|0}while((f[h>>2]|0)!=(c|0));l=h}}else{b=g;while(1){g=f[b>>2]|0;if(!g)break;else b=g}l=b}if((f[a>>2]|0)==(k|0))f[a>>2]=l;l=a+8|0;f[l>>2]=(f[l>>2]|0)+-1;$c(d,k);d=f[k+24>>2]|0;if(d|0)eh(d);hh(k);e=1;return e|0}function Pe(a,c,d,e,g){a=a|0;c=c|0;d=d|0;e=e|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;h=c+4|0;i=f[h>>2]|0;do if(i){j=f[d>>2]|0;k=c+4|0;l=i;while(1){m=f[l+16>>2]|0;if(j>>>0<m>>>0){n=f[l>>2]|0;if(!n){o=6;break}else{p=l;q=n}}else{if(m>>>0>=j>>>0){o=10;break}r=l+4|0;m=f[r>>2]|0;if(!m){o=9;break}else{p=r;q=m}}k=p;l=q}if((o|0)==6){s=l;t=l;break}else if((o|0)==9){s=l;t=r;break}else if((o|0)==10){s=l;t=k;break}}else{s=h;t=h}while(0);h=f[t>>2]|0;if(h|0){u=h;v=0;w=u;f[a>>2]=w;x=a+4|0;b[x>>0]=v;return}h=gh(28)|0;f[h+16>>2]=f[e>>2];f[h+20>>2]=f[g>>2];e=f[g+4>>2]|0;f[h+24>>2]=e;if(e|0)ch(e);f[h>>2]=0;f[h+4>>2]=0;f[h+8>>2]=s;f[t>>2]=h;s=f[f[c>>2]>>2]|0;if(!s)y=h;else{f[c>>2]=s;y=f[t>>2]|0}td(f[c+4>>2]|0,y);y=c+8|0;f[y>>2]=(f[y>>2]|0)+1;u=h;v=1;w=u;f[a>>2]=w;x=a+4|0;b[x>>0]=v;return}function Qe(a){a=a|0;Xg(a);hh(a);return}function Re(a){a=a|0;return}function Se(a){a=a|0;hh(a);return}function Te(a,c,d,e,g){a=a|0;c=c|0;d=d|0;e=e|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;h=c+4|0;i=f[h>>2]|0;do if(i){j=f[d>>2]|0;k=c+4|0;l=i;while(1){m=f[l+16>>2]|0;if(j>>>0<m>>>0){n=f[l>>2]|0;if(!n){o=6;break}else{p=l;q=n}}else{if(m>>>0>=j>>>0){o=10;break}r=l+4|0;m=f[r>>2]|0;if(!m){o=9;break}else{p=r;q=m}}k=p;l=q}if((o|0)==6){s=l;t=l;break}else if((o|0)==9){s=l;t=r;break}else if((o|0)==10){s=l;t=k;break}}else{s=h;t=h}while(0);h=f[t>>2]|0;if(h|0){u=h;v=0;w=u;f[a>>2]=w;x=a+4|0;b[x>>0]=v;return}h=gh(28)|0;f[h+16>>2]=f[e>>2];f[h+20>>2]=f[g>>2];e=f[g+4>>2]|0;f[h+24>>2]=e;if(e|0)ch(e);f[h>>2]=0;f[h+4>>2]=0;f[h+8>>2]=s;f[t>>2]=h;s=f[f[c>>2]>>2]|0;if(!s)y=h;else{f[c>>2]=s;y=f[t>>2]|0}td(f[c+4>>2]|0,y);y=c+8|0;f[y>>2]=(f[y>>2]|0)+1;u=h;v=1;w=u;f[a>>2]=w;x=a+4|0;b[x>>0]=v;return}function Ue(a){a=a|0;Xg(a);hh(a);return}function Ve(a){a=a|0;var b=0;b=f[a+12>>2]|0;if(!b)return;hh(b);return}function We(a,b){a=a|0;b=b|0;return ((f[b+4>>2]|0)==3018?a+12|0:0)|0}function Xe(a){a=a|0;hh(a);return}function Ye(){var a=0,c=0,d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,v=0;a=u;u=u+128|0;c=a+108|0;d=a+96|0;e=a+84|0;g=a+72|0;h=a+60|0;i=a+48|0;j=a+36|0;k=a+24|0;l=a+12|0;m=a;f[j>>2]=0;f[j+4>>2]=0;f[j+8>>2]=0;n=th(j,3307)|0;f[i>>2]=f[n>>2];f[i+4>>2]=f[n+4>>2];f[i+8>>2]=f[n+8>>2];f[n>>2]=0;f[n+4>>2]=0;f[n+8>>2]=0;xh(k,1.9999999494757503e-04);n=k+11|0;o=b[n>>0]|0;p=o<<24>>24<0;q=sh(i,p?f[k>>2]|0:k,p?f[k+4>>2]|0:o&255)|0;f[h>>2]=f[q>>2];f[h+4>>2]=f[q+4>>2];f[h+8>>2]=f[q+8>>2];f[q>>2]=0;f[q+4>>2]=0;f[q+8>>2]=0;q=th(h,5384)|0;f[g>>2]=f[q>>2];f[g+4>>2]=f[q+4>>2];f[g+8>>2]=f[q+8>>2];f[q>>2]=0;f[q+4>>2]=0;f[q+8>>2]=0;uh(l,5);q=l+11|0;o=b[q>>0]|0;p=o<<24>>24<0;r=sh(g,p?f[l>>2]|0:l,p?f[l+4>>2]|0:o&255)|0;f[e>>2]=f[r>>2];f[e+4>>2]=f[r+4>>2];f[e+8>>2]=f[r+8>>2];f[r>>2]=0;f[r+4>>2]=0;f[r+8>>2]=0;r=th(e,5420)|0;f[d>>2]=f[r>>2];f[d+4>>2]=f[r+4>>2];f[d+8>>2]=f[r+8>>2];f[r>>2]=0;f[r+4>>2]=0;f[r+8>>2]=0;xh(m,5.0e3);r=m+11|0;o=b[r>>0]|0;p=o<<24>>24<0;s=sh(d,p?f[m>>2]|0:m,p?f[m+4>>2]|0:o&255)|0;f[c>>2]=f[s>>2];f[c+4>>2]=f[s+4>>2];f[c+8>>2]=f[s+8>>2];f[s>>2]=0;f[s+4>>2]=0;f[s+8>>2]=0;s=th(c,5458)|0;f[2982]=f[s>>2];f[2983]=f[s+4>>2];f[2984]=f[s+8>>2];f[s>>2]=0;f[s+4>>2]=0;f[s+8>>2]=0;if((b[c+11>>0]|0)<0)hh(f[c>>2]|0);if((b[r>>0]|0)<0)hh(f[m>>2]|0);if((b[d+11>>0]|0)<0)hh(f[d>>2]|0);if((b[e+11>>0]|0)<0)hh(f[e>>2]|0);if((b[q>>0]|0)<0)hh(f[l>>2]|0);if((b[g+11>>0]|0)<0)hh(f[g>>2]|0);if((b[h+11>>0]|0)<0)hh(f[h>>2]|0);if((b[n>>0]|0)<0)hh(f[k>>2]|0);if((b[i+11>>0]|0)<0)hh(f[i>>2]|0);if((b[j+11>>0]|0)>=0){f[2985]=0;f[2986]=0;f[2987]=0;t=gh(1408)|0;f[2985]=t;f[2987]=-2147482240;f[2986]=1406;Hi(t|0,6500,1406)|0;v=t+1406|0;b[v>>0]=0;u=a;return}hh(f[j>>2]|0);f[2985]=0;f[2986]=0;f[2987]=0;t=gh(1408)|0;f[2985]=t;f[2987]=-2147482240;f[2986]=1406;Hi(t|0,6500,1406)|0;v=t+1406|0;b[v>>0]=0;u=a;return}function Ze(a){a=a|0;f[a>>2]=0;f[a+4>>2]=0;f[a+8>>2]=0;b[a+12>>0]=0;return}function _e(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,g=0,h=0,i=0;c=f[a+8>>2]|0;a=f[b>>2]|0;b=a+12|0;d=a+16|0;while(1){e=f[b>>2]|0;if(!e){Fc(a);g=f[b>>2]|0}else g=e;h=g+4+3&-4;e=h;i=e+4|0;if((e+8|0)>>>0<=(f[d>>2]|0)>>>0)break;f[g>>2]=-1;Ic(a,8-g+i|0)|0}f[g>>2]=12;f[b>>2]=i;f[i>>2]=-1;f[h>>2]=c;return}function $e(a,c){a=a|0;c=c|0;var e=0,g=0,h=0,i=0;b[a+4>>0]=0;f[a>>2]=684;e=a+32|0;f[e>>2]=c;g=a+36|0;if((d[(f[c+4>>2]|0)+144>>1]|0)==1)if((b[11624]|0)==0?(pi(11624)|0)!=0:0){f[2972]=0;f[2973]=0;f[2974]=0;b[11900]=0;b[11901]=1;f[2976]=0;h=11888}else h=11888;else{i=gh(20)|0;f[i>>2]=0;f[i+4>>2]=0;f[i+8>>2]=0;d[i+12>>1]=0;f[i+16>>2]=a;h=i}f[g>>2]=h;b[a+40>>0]=0;if((d[(f[(f[e>>2]|0)+4>>2]|0)+144>>1]|0)!=1)return;e=c+212|0;n[a+44>>2]=+n[c+224>>2]-+n[e>>2];f[a+60>>2]=0;f[a+76>>2]=0;f[a+92>>2]=f[e>>2];f[a+48>>2]=0;e=c+216|0;n[a+64>>2]=+n[c+228>>2]-+n[e>>2];f[a+80>>2]=0;f[a+96>>2]=f[e>>2];f[a+52>>2]=0;f[a+68>>2]=0;e=c+220|0;n[a+84>>2]=+n[c+232>>2]-+n[e>>2];f[a+100>>2]=f[e>>2];f[a+56>>2]=0;f[a+72>>2]=0;f[a+88>>2]=0;f[a+104>>2]=1065353216;return}function af(a){a=a|0;var b=0.0,c=0.0,d=0,e=0.0,f=0,g=0.0;if(!a){b=7.652279853820801;c=5.0e4}else{d=a;e=1.0;while(1){d=d+-1|0;if(!d){f=a;g=1.0;break}else e=e*.4000000059604645}while(1){f=f+-1|0;if(!f)break;else g=g*.5}b=e*3.0609121322631836;c=g*25.0e3}return +(c*c*b)}function bf(a){a=a|0;b[a>>0]=0;f[a+4>>2]=0;f[a+8>>2]=0;f[a+12>>2]=0;return}function cf(a,c){a=a|0;c=c|0;var d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,o=0,p=0,q=0,r=0,s=0,t=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0;d=u;u=u+32|0;e=d+12|0;g=d;h=d+24|0;if(b[a>>0]|0){u=d;return}b[a>>0]=1;i=gh(96)|0;j=i;k=j+96|0;do{f[j>>2]=0;j=j+4|0}while((j|0)<(k|0));j=gh(96)|0;f[j>>2]=0;f[j+4>>2]=0;f[j+8>>2]=0;f[j+12>>2]=0;f[j+16>>2]=0;n[j+20>>2]=1.0;n[j+24>>2]=0.0;n[j+28>>2]=1.0;n[j+32>>2]=0.0;n[j+36>>2]=0.0;n[j+40>>2]=1.0;n[j+44>>2]=1.0;n[j+48>>2]=1.0;n[j+52>>2]=0.0;n[j+56>>2]=0.0;n[j+60>>2]=1.0;n[j+64>>2]=0.0;n[j+68>>2]=1.0;n[j+72>>2]=1.0;n[j+76>>2]=1.0;n[j+80>>2]=0.0;n[j+84>>2]=1.0;n[j+88>>2]=1.0;n[j+92>>2]=1.0;f[i>>2]=0;f[i+4>>2]=1;f[i+8>>2]=2;f[i+12>>2]=3;f[i+16>>2]=4;f[i+20>>2]=5;f[i+24>>2]=6;f[i+28>>2]=7;f[i+32>>2]=0;f[i+36>>2]=2;f[i+40>>2]=1;f[i+44>>2]=3;f[i+48>>2]=4;f[i+52>>2]=6;f[i+56>>2]=5;f[i+60>>2]=7;f[i+64>>2]=0;f[i+68>>2]=4;f[i+72>>2]=1;f[i+76>>2]=5;f[i+80>>2]=2;f[i+84>>2]=6;f[i+88>>2]=3;f[i+92>>2]=7;k=gh(16)|0;f[k>>2]=0;f[k+4>>2]=1;f[k+8>>2]=i;f[k+12>>2]=24;Ie(e,k);k=gh(16)|0;f[k>>2]=0;f[k+4>>2]=0;f[k+8>>2]=j;f[k+12>>2]=24;Ie(g,k);Je(a+4|0);k=a+12|0;a=f[k>>2]|0;l=f[c>>2]|0;m=l+12|0;o=l+16|0;while(1){p=f[m>>2]|0;if(!p){Fc(l);q=f[m>>2]|0}else q=p;r=q+4+3&-4;p=r;s=p+4|0;if((p+8|0)>>>0<=(f[o>>2]|0)>>>0)break;f[q>>2]=-1;Ic(l,8-q+s|0)|0}f[q>>2]=1;f[m>>2]=s;f[s>>2]=-1;f[r>>2]=a;a=f[k>>2]|0;k=f[c>>2]|0;r=k+12|0;s=k+16|0;while(1){m=f[r>>2]|0;if(!m){Fc(k);t=f[r>>2]|0}else t=m;v=t+4+3&-4;m=v;w=m+4|0;if((m+8|0)>>>0<=(f[s>>2]|0)>>>0)break;f[t>>2]=-1;Ic(k,8-t+w|0)|0}f[t>>2]=2;f[r>>2]=w;f[w>>2]=-1;f[v>>2]=a;a=e+8|0;Ke(f[e>>2]|0,c,f[a>>2]|0);Le(f[g>>2]|0,c,f[g+8>>2]|0);v=f[c>>2]|0;w=v+12|0;r=v+16|0;while(1){t=f[w>>2]|0;if(!t){Fc(v);x=f[w>>2]|0}else x=t;y=x+4+3&-4;z=y+24|0;if((y+28|0)>>>0<=(f[r>>2]|0)>>>0){A=17;break}f[x>>2]=-1;if(!(Ic(v,8-x+z|0)|0)){B=0;break}}if((A|0)==17){f[x>>2]=19;f[w>>2]=z;f[z>>2]=-1;B=y}f[B>>2]=0;f[B+4>>2]=3;f[B+8>>2]=0;b[B+12>>0]=0;y=B+13|0;b[y>>0]=b[h>>0]|0;b[y+1>>0]=b[h+1>>0]|0;b[y+2>>0]=b[h+2>>0]|0;f[B+16>>2]=0;f[B+20>>2]=0;B=f[c>>2]|0;h=B+12|0;y=B+16|0;while(1){z=f[h>>2]|0;if(!z){Fc(B);C=f[h>>2]|0}else C=z;D=C+4+3&-4;z=D;E=z+4|0;if((z+8|0)>>>0<=(f[y>>2]|0)>>>0)break;f[C>>2]=-1;Ic(B,8-C+E|0)|0}f[C>>2]=17;f[h>>2]=E;f[E>>2]=-1;f[D>>2]=0;D=f[c>>2]|0;E=D+12|0;h=D+16|0;while(1){C=f[E>>2]|0;if(!C){Fc(D);F=f[E>>2]|0}else F=C;G=F+4+3&-4;C=G;H=C+4|0;if((C+8|0)>>>0<=(f[h>>2]|0)>>>0)break;f[F>>2]=-1;Ic(D,8-F+H|0)|0}f[F>>2]=2;f[E>>2]=H;f[H>>2]=-1;f[G>>2]=0;G=f[a>>2]|0;a=f[c>>2]|0;c=a+12|0;H=a+16|0;while(1){E=f[c>>2]|0;if(!E){Fc(a);I=f[c>>2]|0}else I=E;J=I+4+3&-4;E=J;K=E+4|0;if((E+8|0)>>>0<=(f[H>>2]|0)>>>0)break;f[I>>2]=-1;Ic(a,8-I+K|0)|0}f[I>>2]=7;f[c>>2]=K;f[K>>2]=-1;f[J>>2]=G;Me(g);G=f[g+4>>2]|0;if(G|0)dh(G);Me(e);G=f[e+4>>2]|0;if(G|0)dh(G);hh(j);hh(i);u=d;return}function df(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;b=f[a+12>>2]|0;a=f[c>>2]|0;d=a+12|0;e=a+16|0;while(1){g=f[d>>2]|0;if(!g){Fc(a);h=f[d>>2]|0}else h=g;i=h+4+3&-4;g=i;j=g+4|0;if((g+8|0)>>>0<=(f[e>>2]|0)>>>0)break;f[h>>2]=-1;Ic(a,8-h+j|0)|0}f[h>>2]=2;f[d>>2]=j;f[j>>2]=-1;f[i>>2]=b;b=f[c>>2]|0;c=b+12|0;i=b+16|0;while(1){j=f[c>>2]|0;if(!j){Fc(b);k=f[c>>2]|0}else k=j;l=k+4+3&-4;m=l+16|0;if((l+20|0)>>>0<=(f[i>>2]|0)>>>0)break;f[k>>2]=-1;if(!(Ic(b,8-k+m|0)|0)){n=0;o=12;break}}if((o|0)==12){f[n>>2]=1;p=n+4|0;f[p>>2]=24;q=n+8|0;f[q>>2]=2;r=n+12|0;f[r>>2]=0;return}f[k>>2]=21;f[c>>2]=m;f[m>>2]=-1;n=l;f[n>>2]=1;p=n+4|0;f[p>>2]=24;q=n+8|0;f[q>>2]=2;r=n+12|0;f[r>>2]=0;return}function ef(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;f[a>>2]=b;f[a+4>>2]=0;b=a+8|0;f[a+12>>2]=0;c=a+16|0;f[c>>2]=0;d=a+12|0;f[b>>2]=d;e=a+20|0;g=a+24|0;f[g>>2]=0;h=a+28|0;f[h>>2]=0;i=a+24|0;f[e>>2]=i;f[a+36>>2]=0;f[a+40>>2]=0;f[a+32>>2]=a+36;f[a+48>>2]=0;f[a+52>>2]=0;f[a+44>>2]=a+48;f[a+60>>2]=0;f[a+64>>2]=0;f[a+56>>2]=a+60;a=gh(24)|0;f[a+16>>2]=0;f[a+20>>2]=0;if(!(f[d>>2]|0)){f[a>>2]=0;f[a+4>>2]=0;f[a+8>>2]=d;f[d>>2]=a;f[b>>2]=a;td(a,a);f[c>>2]=(f[c>>2]|0)+1}else hh(a);a=gh(24)|0;f[a+16>>2]=0;f[a+20>>2]=0;c=f[i>>2]|0;a:do if(!c){j=i;k=i}else{b:do if(!(f[c+16>>2]|0)){l=g;m=c}else{b=c;while(1){d=f[b>>2]|0;if(!d)break;if(!(f[d+16>>2]|0)){l=b;m=d;break b}else b=d}j=b;k=b;break a}while(0);j=l;k=m}while(0);if(f[j>>2]|0){hh(a);return}f[a>>2]=0;f[a+4>>2]=0;f[a+8>>2]=k;f[j>>2]=a;k=f[f[e>>2]>>2]|0;if(!k)n=a;else{f[e>>2]=k;n=f[j>>2]|0}td(f[g>>2]|0,n);f[h>>2]=(f[h>>2]|0)+1;return}function ff(a,b){a=a|0;b=b|0;if(!b)return;else{ff(a,f[b>>2]|0);ff(a,f[b+4>>2]|0);kf(b+20|0,f[b+24>>2]|0);hh(b);return}}function gf(a,b){a=a|0;b=b|0;if(!b)return;else{gf(a,f[b>>2]|0);gf(a,f[b+4>>2]|0);Ef(b+20|0);hh(b);return}}function hf(a,b){a=a|0;b=b|0;if(!b)return;else{hf(a,f[b>>2]|0);hf(a,f[b+4>>2]|0);zf(b+20|0);hh(b);return}}function jf(a,b){a=a|0;b=b|0;if(!b)return;else{jf(a,f[b>>2]|0);jf(a,f[b+4>>2]|0);hh(b);return}}function kf(a,c){a=a|0;c=c|0;if(!c)return;kf(a,f[c>>2]|0);kf(a,f[c+4>>2]|0);a=c+16|0;if((b[a+11>>0]|0)<0)hh(f[a>>2]|0);hh(c);return}function lf(a,c){a=a|0;c=c|0;var d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,v=0,w=0,x=0,y=0,z=0,A=0;d=u;u=u+32|0;e=d+16|0;g=d+12|0;h=d;f[g>>2]=c;i=a+4|0;j=f[a+60>>2]|0;if(!j){k=ra(8)|0;kh(k,7907);f[k>>2]=1676;va(k|0,336,33)}l=f[i>>2]|0;m=j;n=j;while(1){j=f[m+16>>2]|0;if(l>>>0<j>>>0){o=f[m>>2]|0;if(!o){p=9;break}else q=o}else{if(j>>>0>=l>>>0){p=8;break}j=f[m+4>>2]|0;if(!j){p=9;break}else q=j}m=q;n=q}if((p|0)==8){if(!n){k=ra(8)|0;kh(k,7907);f[k>>2]=1676;va(k|0,336,33)}q=n+20|0;f[e>>2]=0;f[e+4>>2]=0;f[e+8>>2]=0;n=_f(c)|0;if(n>>>0>4294967279)mh(e);if(n>>>0<11){b[e+11>>0]=n;if(!n)r=e;else{s=e;p=15}}else{m=n+16&-16;l=gh(m)|0;f[e>>2]=l;f[e+8>>2]=m|-2147483648;f[e+4>>2]=n;s=l;p=15}if((p|0)==15){Hi(s|0,c|0,n|0)|0;r=s}b[r+n>>0]=0;n=mf(q,e)|0;if((b[e+11>>0]|0)<0)hh(f[e>>2]|0);r=q+4|0;if((n|0)==(r|0)){n=f[a+48>>2]|0;if(!n){t=ra(8)|0;kh(t,7907);f[t>>2]=1676;va(t|0,336,33)}a=f[i>>2]|0;i=n;s=n;while(1){n=f[i+16>>2]|0;if(a>>>0<n>>>0){c=f[i>>2]|0;if(!c){p=27;break}else v=c}else{if(n>>>0>=a>>>0){p=26;break}n=f[i+4>>2]|0;if(!n){p=27;break}else v=n}i=v;s=v}if((p|0)==26){if(!s){t=ra(8)|0;kh(t,7907);f[t>>2]=1676;va(t|0,336,33)}v=Ff(s+20|0)|0;s=pb(v|0,f[g>>2]|0)|0;f[h>>2]=s;nf(e,q,g,h);w=f[h>>2]|0;u=d;return w|0}else if((p|0)==27){t=ra(8)|0;kh(t,7907);f[t>>2]=1676;va(t|0,336,33)}}else{t=f[g>>2]|0;f[h>>2]=0;f[h+4>>2]=0;f[h+8>>2]=0;g=_f(t)|0;if(g>>>0>4294967279)mh(h);if(g>>>0<11){b[h+11>>0]=g;if(!g)x=h;else{y=h;p=34}}else{s=g+16&-16;v=gh(s)|0;f[h>>2]=v;f[h+8>>2]=s|-2147483648;f[h+4>>2]=g;y=v;p=34}if((p|0)==34){Hi(y|0,t|0,g|0)|0;x=y}b[x+g>>0]=0;g=of(q,e,h)|0;x=f[g>>2]|0;if(!x){y=gh(32)|0;t=y+16|0;f[t>>2]=f[h>>2];f[t+4>>2]=f[h+4>>2];f[t+8>>2]=f[h+8>>2];f[h>>2]=0;f[h+4>>2]=0;f[h+8>>2]=0;f[y+28>>2]=0;t=f[e>>2]|0;f[y>>2]=0;f[y+4>>2]=0;f[y+8>>2]=t;f[g>>2]=y;t=f[f[q>>2]>>2]|0;if(!t)z=y;else{f[q>>2]=t;z=f[g>>2]|0}td(f[r>>2]|0,z);z=q+8|0;f[z>>2]=(f[z>>2]|0)+1;A=y}else A=x;x=f[A+28>>2]|0;if((b[h+11>>0]|0)<0)hh(f[h>>2]|0);w=x;u=d;return w|0}}else if((p|0)==9){k=ra(8)|0;kh(k,7907);f[k>>2]=1676;va(k|0,336,33)}return 0}function mf(a,c){a=a|0;c=c|0;var d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;d=a+4|0;a=f[d>>2]|0;do if(a|0){e=b[c+11>>0]|0;g=e<<24>>24<0;h=g?f[c+4>>2]|0:e&255;e=g?f[c>>2]|0:c;g=d;i=a;a:while(1){j=i;while(1){k=j+16|0;l=b[k+11>>0]|0;m=l<<24>>24<0;n=m?f[j+20>>2]|0:l&255;l=h>>>0<n>>>0?h:n;if((l|0)!=0?(o=Kg(m?f[k>>2]|0:k,e,l)|0,(o|0)!=0):0){if((o|0)>=0)break}else p=6;if((p|0)==6?(p=0,n>>>0>=h>>>0):0)break;n=f[j+4>>2]|0;if(!n){q=g;break a}else j=n}i=f[j>>2]|0;if(!i){q=j;break}else g=j}if((q|0)!=(d|0)){g=q+16|0;i=b[g+11>>0]|0;n=i<<24>>24<0;o=n?f[q+20>>2]|0:i&255;i=o>>>0<h>>>0?o:h;if(i|0?(l=Kg(e,n?f[g>>2]|0:g,i)|0,l|0):0){if((l|0)<0)break;else r=q;return r|0}if(h>>>0>=o>>>0){r=q;return r|0}}}while(0);r=d;return r|0}function nf(a,c,d,e){a=a|0;c=c|0;d=d|0;e=e|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;g=u;u=u+16|0;h=g+4|0;i=g;pf(h,c,d,e);e=qf(c,i,(f[h>>2]|0)+16|0)|0;d=f[e>>2]|0;if(!d){j=f[i>>2]|0;i=f[h>>2]|0;f[i>>2]=0;f[i+4>>2]=0;f[i+8>>2]=j;f[e>>2]=i;j=f[f[c>>2]>>2]|0;if(!j)k=i;else{f[c>>2]=j;k=f[e>>2]|0}td(f[c+4>>2]|0,k);k=c+8|0;f[k>>2]=(f[k>>2]|0)+1;k=f[h>>2]|0;f[h>>2]=0;l=k;m=1;n=0;o=0}else{k=f[h>>2]|0;l=d;m=0;n=k;o=k}f[a>>2]=l;b[a+4>>0]=m;f[h>>2]=0;if(!n){u=g;return}if(b[h+8>>0]|0?(h=n+16|0,(b[h+11>>0]|0)<0):0)hh(f[h>>2]|0);hh(o);u=g;return}function of(a,c,d){a=a|0;c=c|0;d=d|0;var e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=a+4|0;g=f[e>>2]|0;if(!g){f[c>>2]=e;h=e;return h|0}e=b[d+11>>0]|0;i=e<<24>>24<0;j=i?f[d+4>>2]|0:e&255;e=i?f[d>>2]|0:d;d=a+4|0;a=g;while(1){g=a+16|0;i=b[g+11>>0]|0;k=i<<24>>24<0;l=k?f[a+20>>2]|0:i&255;i=l>>>0<j>>>0;m=i?l:j;if((m|0)!=0?(n=Kg(e,k?f[g>>2]|0:g,m)|0,(n|0)!=0):0)if((n|0)<0)o=8;else o=10;else if(j>>>0<l>>>0)o=8;else o=10;if((o|0)==8){o=0;n=f[a>>2]|0;if(!n){o=9;break}else{p=a;q=n}}else if((o|0)==10){o=0;n=j>>>0<l>>>0?j:l;if((n|0)!=0?(l=Kg(k?f[g>>2]|0:g,e,n)|0,(l|0)!=0):0){if((l|0)>=0){o=16;break}}else o=12;if((o|0)==12?(o=0,!i):0){o=16;break}r=a+4|0;i=f[r>>2]|0;if(!i){o=15;break}else{p=r;q=i}}d=p;a=q}if((o|0)==9){f[c>>2]=a;h=a;return h|0}else if((o|0)==15){f[c>>2]=a;h=r;return h|0}else if((o|0)==16){f[c>>2]=a;h=d;return h|0}return 0}function pf(a,c,d,e){a=a|0;c=c|0;d=d|0;e=e|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;g=gh(32)|0;f[a>>2]=g;f[a+4>>2]=c+4;c=a+8|0;b[c>>0]=0;a=g+16|0;h=f[d>>2]|0;f[a>>2]=0;f[a+4>>2]=0;f[a+8>>2]=0;d=_f(h)|0;if(d>>>0>4294967279)mh(a);if(d>>>0<11){b[g+27>>0]=d;if(!d){i=a;j=i+d|0;b[j>>0]=0;k=g+28|0;l=f[e>>2]|0;f[k>>2]=l;b[c>>0]=1;return}else m=a}else{n=d+16&-16;o=gh(n)|0;f[a>>2]=o;f[g+24>>2]=n|-2147483648;f[g+20>>2]=d;m=o}Hi(m|0,h|0,d|0)|0;i=m;j=i+d|0;b[j>>0]=0;k=g+28|0;l=f[e>>2]|0;f[k>>2]=l;b[c>>0]=1;return}function qf(a,c,d){a=a|0;c=c|0;d=d|0;var e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=a+4|0;g=f[e>>2]|0;if(!g){f[c>>2]=e;h=e;return h|0}e=b[d+11>>0]|0;i=e<<24>>24<0;j=i?f[d+4>>2]|0:e&255;e=i?f[d>>2]|0:d;d=a+4|0;a=g;while(1){g=a+16|0;i=b[g+11>>0]|0;k=i<<24>>24<0;l=k?f[a+20>>2]|0:i&255;i=l>>>0<j>>>0;m=i?l:j;if((m|0)!=0?(n=Kg(e,k?f[g>>2]|0:g,m)|0,(n|0)!=0):0)if((n|0)<0)o=8;else o=10;else if(j>>>0<l>>>0)o=8;else o=10;if((o|0)==8){o=0;n=f[a>>2]|0;if(!n){o=9;break}else{p=a;q=n}}else if((o|0)==10){o=0;n=j>>>0<l>>>0?j:l;if((n|0)!=0?(l=Kg(k?f[g>>2]|0:g,e,n)|0,(l|0)!=0):0){if((l|0)>=0){o=16;break}}else o=12;if((o|0)==12?(o=0,!i):0){o=16;break}r=a+4|0;i=f[r>>2]|0;if(!i){o=15;break}else{p=r;q=i}}d=p;a=q}if((o|0)==9){f[c>>2]=a;h=a;return h|0}else if((o|0)==15){f[c>>2]=a;h=r;return h|0}else if((o|0)==16){f[c>>2]=a;h=d;return h|0}return 0}
function rf(a,c){a=a|0;c=c|0;var d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,o=0,p=0,q=0,r=0,s=0,t=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,sa=0,ta=0,ua=0,wa=0,xa=0,ya=0,za=0,Aa=0.0,Ba=0,Ca=0,Da=0;d=u;u=u+112|0;e=d+100|0;g=d+88|0;h=d+72|0;i=d+64|0;j=d;Pf(h,c);c=h+8|0;k=a+8|0;l=a+12|0;m=a+12|0;o=a+16|0;p=a+20|0;q=a+24|0;r=a+24|0;s=a+28|0;t=a+32|0;v=g+4|0;w=g+8|0;x=g+8|0;y=a+44|0;z=e+4|0;A=e+8|0;B=e+4|0;C=a+56|0;D=a+60|0;E=a+60|0;F=a+64|0;G=a+36|0;H=a+4|0;I=a+48|0;J=e+4|0;K=e+4|0;L=e+8|0;a:while(1){if(!(Qf(h,i)|0)){M=176;break}do switch(f[i>>2]|0){case 0:{N=(f[c>>2]|0)+3&-4;f[c>>2]=N+4;O=f[N>>2]|0;Xa(O<<14&16384|O<<7&256|O<<8&1024|0);continue a;break}case 1:{O=(f[c>>2]|0)+3&-4;f[c>>2]=O+4;kb(1,e|0);N=O;O=f[l>>2]|0;do if(O){P=f[N>>2]|0;Q=m;R=O;while(1){S=f[R+16>>2]|0;if(P>>>0<S>>>0){T=f[R>>2]|0;if(!T){M=10;break}else{U=R;V=T}}else{if(S>>>0>=P>>>0){M=14;break}W=R+4|0;S=f[W>>2]|0;if(!S){M=13;break}else{U=W;V=S}}Q=U;R=V}if((M|0)==10){M=0;X=R;Y=R;break}else if((M|0)==13){M=0;X=R;Y=W;break}else if((M|0)==14){M=0;X=R;Y=Q;break}}else{X=l;Y=l}while(0);if(!(f[Y>>2]|0)){O=gh(24)|0;f[O+16>>2]=f[N>>2];f[O+20>>2]=f[e>>2];f[O>>2]=0;f[O+4>>2]=0;f[O+8>>2]=X;f[Y>>2]=O;P=f[f[k>>2]>>2]|0;if(!P)Z=O;else{f[k>>2]=P;Z=f[Y>>2]|0}td(f[m>>2]|0,Z);f[o>>2]=(f[o>>2]|0)+1}continue a;break}case 2:{P=(f[c>>2]|0)+3&-4;f[c>>2]=P+4;O=f[l>>2]|0;if(!O){M=28;break a}S=f[P>>2]|0;P=O;T=O;while(1){O=f[P+16>>2]|0;if(S>>>0<O>>>0){_=f[P>>2]|0;if(!_){M=28;break a}else $=_}else{if(O>>>0>=S>>>0)break;O=f[P+4>>2]|0;if(!O){M=28;break a}else $=O}P=$;T=$}if(!T){M=28;break a}Va(f[T+20>>2]|0);continue a;break}case 3:{P=(f[c>>2]|0)+3&-4;f[c>>2]=P+4;S=f[l>>2]|0;if(!S){M=38;break a}N=f[P>>2]|0;P=S;O=S;while(1){S=f[P+16>>2]|0;if(N>>>0<S>>>0){_=f[P>>2]|0;if(!_){M=38;break a}else aa=_}else{if(S>>>0>=N>>>0)break;S=f[P+4>>2]|0;if(!S){M=38;break a}else aa=S}P=aa;O=aa}if(!O){M=38;break a}f[e>>2]=f[O+20>>2];db(1,e|0);continue a;break}case 4:{P=(f[c>>2]|0)+3&-4;f[c>>2]=P+4;jb(1,e|0);N=P;P=f[q>>2]|0;do if(P){T=f[N>>2]|0;S=r;_=P;while(1){ba=f[_+16>>2]|0;if(T>>>0<ba>>>0){ca=f[_>>2]|0;if(!ca){M=45;break}else{da=_;ea=ca}}else{if(ba>>>0>=T>>>0){M=49;break}fa=_+4|0;ba=f[fa>>2]|0;if(!ba){M=48;break}else{da=fa;ea=ba}}S=da;_=ea}if((M|0)==45){M=0;ga=_;ha=_;break}else if((M|0)==48){M=0;ga=_;ha=fa;break}else if((M|0)==49){M=0;ga=_;ha=S;break}}else{ga=q;ha=q}while(0);if(!(f[ha>>2]|0)){P=gh(24)|0;f[P+16>>2]=f[N>>2];f[P+20>>2]=f[e>>2];f[P>>2]=0;f[P+4>>2]=0;f[P+8>>2]=ga;f[ha>>2]=P;O=f[f[p>>2]>>2]|0;if(!O)ia=P;else{f[p>>2]=O;ia=f[ha>>2]|0}td(f[r>>2]|0,ia);f[s>>2]=(f[s>>2]|0)+1}continue a;break}case 5:{O=(f[c>>2]|0)+3&-4;f[c>>2]=O+8;P=O;O=f[P+4>>2]|0;T=(O|0)==0?34962:(O|0)==1?34963:0;O=f[q>>2]|0;if(!O){M=63;break a}Q=f[P>>2]|0;P=O;R=O;while(1){O=f[P+16>>2]|0;if(Q>>>0<O>>>0){ba=f[P>>2]|0;if(!ba){M=63;break a}else ja=ba}else{if(O>>>0>=Q>>>0)break;O=f[P+4>>2]|0;if(!O){M=63;break a}else ja=O}P=ja;R=ja}if(!R){M=63;break a}Ua(T|0,f[R+20>>2]|0);continue a;break}case 6:{P=(f[c>>2]|0)+3&-4;f[c>>2]=P+12;Q=P;P=Q+8|0;N=f[P>>2]|0;Qf(h,e)|0;O=f[c>>2]|0;f[c>>2]=O+N;N=f[Q>>2]|0;Wa(((N|0)==0?34962:(N|0)==1?34963:0)|0,f[P>>2]|0,O|0,((f[Q+4>>2]|0)==0?35044:0)|0);continue a;break}case 7:{Q=(f[c>>2]|0)+3&-4;f[c>>2]=Q+4;O=Q;Q=f[q>>2]|0;if(!Q){M=74;break a}P=f[O>>2]|0;N=Q;ba=Q;while(1){Q=f[N+16>>2]|0;if(P>>>0<Q>>>0){ca=f[N>>2]|0;if(!ca){M=74;break a}else ka=ca}else{if(Q>>>0>=P>>>0)break;Q=f[N+4>>2]|0;if(!Q){M=74;break a}else ka=Q}N=ka;ba=ka}if(!ba){M=74;break a}f[e>>2]=f[ba+20>>2];ab(1,e|0);N=f[q>>2]|0;if(N|0){P=f[O>>2]|0;R=q;T=N;b:while(1){Q=T;while(1){if((f[Q+16>>2]|0)>>>0>=P>>>0)break;ca=f[Q+4>>2]|0;if(!ca){la=R;break b}else Q=ca}T=f[Q>>2]|0;if(!T){la=Q;break}else R=Q}if((la|0)!=(q|0)?P>>>0>=(f[la+16>>2]|0)>>>0:0){R=f[la+4>>2]|0;if(!R){T=la+8|0;O=f[T>>2]|0;if((f[O>>2]|0)==(la|0))ma=O;else{O=T;do{T=f[O>>2]|0;O=T+8|0;ba=f[O>>2]|0}while((f[ba>>2]|0)!=(T|0));ma=ba}}else{O=R;while(1){P=f[O>>2]|0;if(!P)break;else O=P}ma=O}if((f[p>>2]|0)==(la|0))f[p>>2]=ma;f[s>>2]=(f[s>>2]|0)+-1;$c(N,la);hh(la)}}continue a;break}case 8:{R=(f[c>>2]|0)+3&-4;f[c>>2]=R+12;P=R;R=P+8|0;ba=f[R>>2]|0;Qf(h,e)|0;T=f[c>>2]|0;f[c>>2]=T+ba;xf(g);ba=f[P+4>>2]|0;if(Af(g,T,(ba|0)==0?35633:(ba|0)==1?35632:0,f[R>>2]|0)|0)sf(e,t,P,P,g);zf(g);continue a;break}case 9:{P=(f[c>>2]|0)+3&-4;f[c>>2]=P+4;tf(t,P)|0;continue a;break}case 10:{P=(f[c>>2]|0)+3&-4;f[c>>2]=P+8;R=P;P=R+4|0;ba=f[P>>2]|0;Qf(h,e)|0;T=(f[c>>2]|0)+3&-4;f[c>>2]=T+(ba<<2);ba=T;T=f[P>>2]|0;f[g>>2]=0;f[v>>2]=0;f[w>>2]=0;if(T|0){if(T>>>0>1073741823){M=98;break a}S=gh(T<<2)|0;f[v>>2]=S;f[g>>2]=S;f[x>>2]=S+(T<<2);_=T;T=S;do{f[T>>2]=0;T=(f[v>>2]|0)+4|0;f[v>>2]=T;_=_+-1|0}while((_|0)!=0);_=f[P>>2]|0;if(_|0){T=0;do{N=f[G>>2]|0;if(!N){M=111;break a}O=f[ba+(T<<2)>>2]|0;S=N;ca=N;while(1){N=f[S+16>>2]|0;if(O>>>0<N>>>0){na=f[S>>2]|0;if(!na){M=111;break a}else oa=na}else{if(N>>>0>=O>>>0)break;N=f[S+4>>2]|0;if(!N){M=111;break a}else oa=N}S=oa;ca=oa}if(!ca){M=111;break a}f[(f[g>>2]|0)+(T<<2)>>2]=ca+20;T=T+1|0}while(T>>>0<_>>>0)}}Cf(j);if(Gf(j,f[g>>2]|0,f[P>>2]|0)|0){uf(e,y,R,R,j);f[z>>2]=0;f[A>>2]=0;f[e>>2]=B;_=f[D>>2]|0;do if(_){T=f[R>>2]|0;ba=E;S=_;while(1){O=f[S+16>>2]|0;if(T>>>0<O>>>0){Q=f[S>>2]|0;if(!Q){M=118;break}else{pa=S;qa=Q}}else{if(O>>>0>=T>>>0){M=122;break}sa=S+4|0;O=f[sa>>2]|0;if(!O){M=121;break}else{pa=sa;qa=O}}ba=pa;S=qa}if((M|0)==118){M=0;ta=S;ua=S;break}else if((M|0)==121){M=0;ta=S;ua=sa;break}else if((M|0)==122){M=0;ta=S;ua=ba;break}}else{ta=D;ua=D}while(0);if(!(f[ua>>2]|0)){_=gh(32)|0;f[_+16>>2]=f[R>>2];P=_+24|0;f[P>>2]=0;f[_+28>>2]=0;f[_+20>>2]=P;f[_>>2]=0;f[_+4>>2]=0;f[_+8>>2]=ta;f[ua>>2]=_;P=f[f[C>>2]>>2]|0;if(!P)wa=_;else{f[C>>2]=P;wa=f[ua>>2]|0}td(f[E>>2]|0,wa);f[F>>2]=(f[F>>2]|0)+1;xa=f[B>>2]|0}else xa=0;kf(e,xa)}Ef(j);P=f[g>>2]|0;if(P|0){_=f[v>>2]|0;if((_|0)!=(P|0))f[v>>2]=_+(~((_+-4-P|0)>>>2)<<2);hh(P)}continue a;break}case 11:{P=(f[c>>2]|0)+3&-4;f[c>>2]=P+4;_=P;vf(y,_)|0;wf(C,_)|0;continue a;break}case 12:{_=(f[c>>2]|0)+3&-4;f[c>>2]=_+4;P=f[_>>2]|0;f[H>>2]=P;_=f[I>>2]|0;if(!_){M=142;break a}T=_;ca=_;while(1){_=f[T+16>>2]|0;if(P>>>0<_>>>0){O=f[T>>2]|0;if(!O){M=142;break a}else ya=O}else{if(_>>>0>=P>>>0)break;_=f[T+4>>2]|0;if(!_){M=142;break a}else ya=_}T=ya;ca=ya}if(!ca){M=142;break a}xb(Ff(ca+20|0)|0);T=f[D>>2]|0;if(!T){M=151;break a}P=f[H>>2]|0;R=T;_=T;while(1){T=f[R+16>>2]|0;if(P>>>0<T>>>0){O=f[R>>2]|0;if(!O){M=151;break a}else za=O}else{if(T>>>0>=P>>>0)break;T=f[R+4>>2]|0;if(!T){M=151;break a}else za=T}R=za;_=za}if(!_){M=151;break a}R=lf(a,7931)|0;if((R|0)>-1){P=f[a>>2]|0;tc(P);tc(P);f[e>>2]=P+236;f[J>>2]=P+172;Cd(j,e,g);wb(R|0,1,0,j|0)}R=lf(a,7940)|0;if((R|0)<=-1)continue a;P=f[a>>2]|0;tc(P);Aa=+n[P+8>>2];n[e>>2]=+n[P+136>>2]*Aa+ +n[P+124>>2];n[K>>2]=+n[P+140>>2]*Aa+ +n[P+128>>2];n[L>>2]=+n[P+144>>2]*Aa+ +n[P+132>>2];ub(R|0,1,e|0);continue a;break}case 13:{R=(f[c>>2]|0)+3&-4;f[c>>2]=R+68;P=R;R=lf(a,P)|0;tb(R|0,f[P+64>>2]|0);continue a;break}case 14:{P=(f[c>>2]|0)+3&-4;f[c>>2]=P+68;R=P;P=lf(a,R)|0;sb(P|0,+(+n[R+64>>2]));continue a;break}case 15:{R=(f[c>>2]|0)+3&-4;f[c>>2]=R+72;P=R;R=P+64|0;ca=f[R>>2]|0;Qf(h,e)|0;T=(f[c>>2]|0)+3&-4;f[c>>2]=T+(ca<<6);ca=lf(a,P)|0;wb(ca|0,f[R>>2]|0,b[P+68>>0]|0,T|0);continue a;break}case 16:{T=(f[c>>2]|0)+3&-4;f[c>>2]=T+68;P=T;T=P+64|0;R=f[T>>2]|0;Qf(h,e)|0;ca=(f[c>>2]|0)+3&-4;f[c>>2]=ca+(R<<4);R=lf(a,P)|0;vb(R|0,f[T>>2]|0,ca|0);continue a;break}case 17:{ca=(f[c>>2]|0)+3&-4;f[c>>2]=ca+4;ib(f[ca>>2]|0);continue a;break}case 18:{ca=(f[c>>2]|0)+3&-4;f[c>>2]=ca+4;eb(f[ca>>2]|0);continue a;break}case 19:{ca=(f[c>>2]|0)+3&-4;f[c>>2]=ca+24;T=ca;zb(f[T>>2]|0,f[T+4>>2]|0,((f[T+8>>2]|0)==0?5126:0)|0,b[T+12>>0]|0,f[T+16>>2]|0,f[T+20>>2]|0);continue a;break}case 20:{T=(f[c>>2]|0)+3&-4;f[c>>2]=T+8;ca=T;yb(f[ca>>2]|0,f[ca+4>>2]|0);continue a;break}case 21:{ca=(f[c>>2]|0)+3&-4;f[c>>2]=ca+16;T=ca;ca=f[T>>2]|0;switch(ca|0){case 1:case 0:{Ba=ca;break}case 2:{Ba=4;break}default:Ba=0}ca=f[T+4>>2]|0;switch(f[T+8>>2]|0){case 0:{Ca=5121;break}case 1:{Ca=5123;break}case 2:{Ca=5125;break}default:Ca=0}gb(Ba|0,ca|0,Ca|0,f[T+12>>2]|0);continue a;break}case 22:{T=(f[c>>2]|0)+3&-4;f[c>>2]=T+12;ca=T;T=f[ca>>2]|0;switch(T|0){case 1:case 0:{Da=T;break}case 2:{Da=4;break}default:Da=0}fb(Da|0,f[ca+8>>2]|0,f[ca+4>>2]|0);continue a;break}default:continue a}while(0)}if((M|0)==28){Da=ra(8)|0;kh(Da,7907);f[Da>>2]=1676;va(Da|0,336,33)}else if((M|0)==38){Da=ra(8)|0;kh(Da,7907);f[Da>>2]=1676;va(Da|0,336,33)}else if((M|0)==63){Da=ra(8)|0;kh(Da,7907);f[Da>>2]=1676;va(Da|0,336,33)}else if((M|0)==74){Da=ra(8)|0;kh(Da,7907);f[Da>>2]=1676;va(Da|0,336,33)}else if((M|0)==98)Wg(g);else if((M|0)==111){g=ra(8)|0;kh(g,7907);f[g>>2]=1676;va(g|0,336,33)}else if((M|0)==142){g=ra(8)|0;kh(g,7907);f[g>>2]=1676;va(g|0,336,33)}else if((M|0)==151){g=ra(8)|0;kh(g,7907);f[g>>2]=1676;va(g|0,336,33)}else if((M|0)==176){Of(h);u=d;return}}function sf(a,c,d,e,g){a=a|0;c=c|0;d=d|0;e=e|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;h=c+4|0;i=f[h>>2]|0;do if(i){j=f[d>>2]|0;k=c+4|0;l=i;while(1){m=f[l+16>>2]|0;if(j>>>0<m>>>0){n=f[l>>2]|0;if(!n){o=6;break}else{p=l;q=n}}else{if(m>>>0>=j>>>0){o=10;break}r=l+4|0;m=f[r>>2]|0;if(!m){o=9;break}else{p=r;q=m}}k=p;l=q}if((o|0)==6){s=l;t=l;break}else if((o|0)==9){s=l;t=r;break}else if((o|0)==10){s=l;t=k;break}}else{s=h;t=h}while(0);h=f[t>>2]|0;if(h|0){u=h;v=0;w=u;f[a>>2]=w;x=a+4|0;b[x>>0]=v;return}h=gh(24)|0;f[h+16>>2]=f[e>>2];yf(h+20|0,g);f[h>>2]=0;f[h+4>>2]=0;f[h+8>>2]=s;f[t>>2]=h;s=f[f[c>>2]>>2]|0;if(!s)y=h;else{f[c>>2]=s;y=f[t>>2]|0}td(f[c+4>>2]|0,y);y=c+8|0;f[y>>2]=(f[y>>2]|0)+1;u=h;v=1;w=u;f[a>>2]=w;x=a+4|0;b[x>>0]=v;return}function tf(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0;c=a+4|0;d=f[c>>2]|0;if(!d){e=0;return e|0}g=f[b>>2]|0;b=c;h=d;a:while(1){i=h;while(1){if((f[i+16>>2]|0)>>>0>=g>>>0)break;j=f[i+4>>2]|0;if(!j){k=b;break a}else i=j}h=f[i>>2]|0;if(!h){k=i;break}else b=i}if((k|0)==(c|0)){e=0;return e|0}if(g>>>0<(f[k+16>>2]|0)>>>0){e=0;return e|0}g=f[k+4>>2]|0;if(!g){c=k+8|0;b=f[c>>2]|0;if((f[b>>2]|0)==(k|0))l=b;else{b=c;do{c=f[b>>2]|0;b=c+8|0;h=f[b>>2]|0}while((f[h>>2]|0)!=(c|0));l=h}}else{b=g;while(1){g=f[b>>2]|0;if(!g)break;else b=g}l=b}if((f[a>>2]|0)==(k|0))f[a>>2]=l;l=a+8|0;f[l>>2]=(f[l>>2]|0)+-1;$c(d,k);zf(k+20|0);hh(k);e=1;return e|0}function uf(a,c,d,e,g){a=a|0;c=c|0;d=d|0;e=e|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;h=c+4|0;i=f[h>>2]|0;do if(i){j=f[d>>2]|0;k=c+4|0;l=i;while(1){m=f[l+16>>2]|0;if(j>>>0<m>>>0){n=f[l>>2]|0;if(!n){o=6;break}else{p=l;q=n}}else{if(m>>>0>=j>>>0){o=10;break}r=l+4|0;m=f[r>>2]|0;if(!m){o=9;break}else{p=r;q=m}}k=p;l=q}if((o|0)==6){s=l;t=l;break}else if((o|0)==9){s=l;t=r;break}else if((o|0)==10){s=l;t=k;break}}else{s=h;t=h}while(0);h=f[t>>2]|0;if(h|0){u=h;v=0;w=u;f[a>>2]=w;x=a+4|0;b[x>>0]=v;return}h=gh(24)|0;f[h+16>>2]=f[e>>2];Df(h+20|0,g);f[h>>2]=0;f[h+4>>2]=0;f[h+8>>2]=s;f[t>>2]=h;s=f[f[c>>2]>>2]|0;if(!s)y=h;else{f[c>>2]=s;y=f[t>>2]|0}td(f[c+4>>2]|0,y);y=c+8|0;f[y>>2]=(f[y>>2]|0)+1;u=h;v=1;w=u;f[a>>2]=w;x=a+4|0;b[x>>0]=v;return}function vf(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0;c=a+4|0;d=f[c>>2]|0;if(!d){e=0;return e|0}g=f[b>>2]|0;b=c;h=d;a:while(1){i=h;while(1){if((f[i+16>>2]|0)>>>0>=g>>>0)break;j=f[i+4>>2]|0;if(!j){k=b;break a}else i=j}h=f[i>>2]|0;if(!h){k=i;break}else b=i}if((k|0)==(c|0)){e=0;return e|0}if(g>>>0<(f[k+16>>2]|0)>>>0){e=0;return e|0}g=f[k+4>>2]|0;if(!g){c=k+8|0;b=f[c>>2]|0;if((f[b>>2]|0)==(k|0))l=b;else{b=c;do{c=f[b>>2]|0;b=c+8|0;h=f[b>>2]|0}while((f[h>>2]|0)!=(c|0));l=h}}else{b=g;while(1){g=f[b>>2]|0;if(!g)break;else b=g}l=b}if((f[a>>2]|0)==(k|0))f[a>>2]=l;l=a+8|0;f[l>>2]=(f[l>>2]|0)+-1;$c(d,k);Ef(k+20|0);hh(k);e=1;return e|0}function wf(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0;c=a+4|0;d=f[c>>2]|0;if(!d){e=0;return e|0}g=f[b>>2]|0;b=c;h=d;a:while(1){i=h;while(1){if((f[i+16>>2]|0)>>>0>=g>>>0)break;j=f[i+4>>2]|0;if(!j){k=b;break a}else i=j}h=f[i>>2]|0;if(!h){k=i;break}else b=i}if((k|0)==(c|0)){e=0;return e|0}if(g>>>0<(f[k+16>>2]|0)>>>0){e=0;return e|0}g=f[k+4>>2]|0;if(!g){c=k+8|0;b=f[c>>2]|0;if((f[b>>2]|0)==(k|0))l=b;else{b=c;do{c=f[b>>2]|0;b=c+8|0;h=f[b>>2]|0}while((f[h>>2]|0)!=(c|0));l=h}}else{b=g;while(1){g=f[b>>2]|0;if(!g)break;else b=g}l=b}if((f[a>>2]|0)==(k|0))f[a>>2]=l;l=a+8|0;f[l>>2]=(f[l>>2]|0)+-1;$c(d,k);kf(k+20|0,f[k+24>>2]|0);hh(k);e=1;return e|0}function xf(a){a=a|0;f[a>>2]=0;return}function yf(a,b){a=a|0;b=b|0;f[a>>2]=0;f[a>>2]=f[b>>2];f[b>>2]=0;return}function zf(a){a=a|0;var b=0;b=f[a>>2]|0;if(b|0)cb(b|0);f[a>>2]=0;return}function Af(a,c,d,e){a=a|0;c=c|0;d=d|0;e=e|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;g=u;u=u+32|0;h=g;i=g+24|0;j=g+28|0;k=g+20|0;l=g+16|0;m=g+4|0;f[i>>2]=c;c=f[a>>2]|0;if(c|0)cb(c|0);f[a>>2]=0;c=$a(d|0)|0;f[a>>2]=c;if(!c){n=0;u=g;return n|0}f[j>>2]=e;rb(c|0,1,i|0,((e|0)==0?0:j)|0);Za(f[a>>2]|0);ob(f[a>>2]|0,35713,k|0);if(!(f[k>>2]|0)){f[l>>2]=0;ob(f[a>>2]|0,35716,l|0);k=f[l>>2]|0;if((k|0)>1?(f[m>>2]=0,f[m+4>>2]=0,f[m+8>>2]=0,ph(m,k,0),k=m+11|0,nb(f[a>>2]|0,f[l>>2]|0,0,((b[k>>0]|0)<0?f[m>>2]|0:m)|0),l=f[262]|0,f[h>>2]=(b[k>>0]|0)<0?f[m>>2]|0:m,Lg(l,7955,h)|0,(b[k>>0]|0)<0):0)hh(f[m>>2]|0);cb(f[a>>2]|0);f[a>>2]=0;o=0}else o=1;n=o;u=g;return n|0}function Bf(a){a=a|0;return f[a>>2]|0}function Cf(a){a=a|0;f[a>>2]=0;return}function Df(a,b){a=a|0;b=b|0;f[a>>2]=f[b>>2];f[b>>2]=0;return}function Ef(a){a=a|0;var b=0;b=f[a>>2]|0;if(b|0)bb(b|0);f[a>>2]=0;return}function Ff(a){a=a|0;return f[a>>2]|0}function Gf(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,g=0;d=f[a>>2]|0;if(d|0)bb(d|0);f[a>>2]=0;d=_a()|0;f[a>>2]=d;if(!d){e=0;return e|0}if(c|0?(Ta(d|0,Bf(f[b>>2]|0)|0),(c|0)!=1):0){d=1;do{g=f[a>>2]|0;Ta(g|0,Bf(f[b+(d<<2)>>2]|0)|0);d=d+1|0}while((d|0)!=(c|0))}e=Hf(a)|0;return e|0}function Hf(a){a=a|0;var c=0,d=0,e=0,g=0,h=0,i=0;c=u;u=u+32|0;d=c;e=c+20|0;g=c+16|0;h=c+4|0;qb(f[a>>2]|0);mb(f[a>>2]|0,35714,e|0);if(f[e>>2]|0){i=1;u=c;return i|0}f[g>>2]=0;mb(f[a>>2]|0,35716,g|0);e=f[g>>2]|0;if((e|0)>1?(f[h>>2]=0,f[h+4>>2]=0,f[h+8>>2]=0,ph(h,e,0),e=h+11|0,lb(f[a>>2]|0,f[g>>2]|0,0,((b[e>>0]|0)<0?f[h>>2]|0:h)|0),g=f[262]|0,f[d>>2]=(b[e>>0]|0)<0?f[h>>2]|0:h,Lg(g,7983,d)|0,(b[e>>0]|0)<0):0)hh(f[h>>2]|0);bb(f[a>>2]|0);f[a>>2]=0;i=0;u=c;return i|0}function If(a,c,d,e){a=a|0;c=c|0;d=d|0;e=e|0;var g=0,h=0;f[a>>2]=0;g=a+8|0;f[g>>2]=0;f[g+4>>2]=0;b[a+16>>0]=0;Gb(7)|0;if(!(Db()|0)){Mg(8010,25,1,f[262]|0)|0;Rf(1)}Kb(139266,3);Kb(139267,0);g=Bb(d|0,e|0,c|0,0,0)|0;f[a>>2]=g;if(g|0){h=g;Eb(h|0);return}Mg(8036,28,1,f[262]|0)|0;Jb();Rf(1);h=f[a>>2]|0;Eb(h|0);return}function Jf(a,b){a=a|0;b=b|0;var c=0,d=0;a=u;u=u+16|0;c=a;d=f[262]|0;f[c>>2]=b;Lg(d,8065,c)|0;u=a;return}function Kf(a){a=a|0;var b=0;b=f[a>>2]|0;if(b|0)Cb(b|0);Jb();return}function Lf(a){a=a|0;var b=0,c=0;Ib(f[a>>2]|0);b=a+8|0;a=b;c=yi(f[a>>2]|0,f[a+4>>2]|0,1,0)|0;a=b;f[a>>2]=c;f[a+4>>2]=I;return}function Mf(a){a=a|0;return f[a>>2]|0}function Nf(a,b){a=a|0;b=b|0;Na(b|0,a|0,0,0);return}function Of(a){a=a|0;var c=0;if(!(b[a+12>>0]|0))return;c=f[a>>2]|0;if(!c)return;Jc(c);hh(c);return}function Pf(a,c){a=a|0;c=c|0;var d=0,e=0;f[a>>2]=c;d=a+8|0;f[d>>2]=0;b[a+12>>0]=0;f[a+4>>2]=c;if(!c){e=0;f[d>>2]=e;return}e=f[c+4>>2]|0;f[d>>2]=e;return}function Qf(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0;c=a+8|0;d=f[c>>2]|0;if(!d){e=0;return e|0}g=a+4|0;h=d;while(1){i=h+3&-4;d=f[i>>2]|0;f[b>>2]=d;if((d|0)!=-1){j=8;break}d=f[(f[g>>2]|0)+8>>2]|0;f[g>>2]=d;if(!d){j=5;break}h=f[d+4>>2]|0;f[c>>2]=h;if(!h){e=0;j=10;break}}if((j|0)==5){h=f[a>>2]|0;f[g>>2]=h;if(!h){k=0;l=0}else{k=0;l=f[h+4>>2]|0}}else if((j|0)==8){k=1;l=i+4|0}else if((j|0)==10)return e|0;f[c>>2]=l;e=k;return e|0}function Rf(a){a=a|0;Ia(a|0);return}function Sf(a){a=a|0;var b=0,c=0,d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0;b=u;u=u+16|0;c=b;do if(a>>>0<245){d=a>>>0<11?16:a+11&-8;e=d>>>3;g=f[2988]|0;h=g>>>e;if(h&3|0){i=(h&1^1)+e|0;j=11992+(i<<1<<2)|0;k=j+8|0;l=f[k>>2]|0;m=l+8|0;n=f[m>>2]|0;if((n|0)==(j|0))f[2988]=g&~(1<<i);else{f[n+12>>2]=j;f[k>>2]=n}n=i<<3;f[l+4>>2]=n|3;i=l+n+4|0;f[i>>2]=f[i>>2]|1;o=m;u=b;return o|0}m=f[2990]|0;if(d>>>0>m>>>0){if(h|0){i=2<<e;n=h<<e&(i|0-i);i=(n&0-n)+-1|0;n=i>>>12&16;e=i>>>n;i=e>>>5&8;h=e>>>i;e=h>>>2&4;l=h>>>e;h=l>>>1&2;k=l>>>h;l=k>>>1&1;j=(i|n|e|h|l)+(k>>>l)|0;l=11992+(j<<1<<2)|0;k=l+8|0;h=f[k>>2]|0;e=h+8|0;n=f[e>>2]|0;if((n|0)==(l|0)){i=g&~(1<<j);f[2988]=i;p=i}else{f[n+12>>2]=l;f[k>>2]=n;p=g}n=j<<3;j=n-d|0;f[h+4>>2]=d|3;k=h+d|0;f[k+4>>2]=j|1;f[h+n>>2]=j;if(m|0){n=f[2993]|0;h=m>>>3;l=11992+(h<<1<<2)|0;i=1<<h;if(!(p&i)){f[2988]=p|i;q=l;r=l+8|0}else{i=l+8|0;q=f[i>>2]|0;r=i}f[r>>2]=n;f[q+12>>2]=n;f[n+8>>2]=q;f[n+12>>2]=l}f[2990]=j;f[2993]=k;o=e;u=b;return o|0}e=f[2989]|0;if(e){k=(e&0-e)+-1|0;j=k>>>12&16;l=k>>>j;k=l>>>5&8;n=l>>>k;l=n>>>2&4;i=n>>>l;n=i>>>1&2;h=i>>>n;i=h>>>1&1;s=f[12256+((k|j|l|n|i)+(h>>>i)<<2)>>2]|0;i=(f[s+4>>2]&-8)-d|0;h=f[s+16+(((f[s+16>>2]|0)==0&1)<<2)>>2]|0;if(!h){t=s;v=i}else{n=s;s=i;i=h;while(1){h=(f[i+4>>2]&-8)-d|0;l=h>>>0<s>>>0;j=l?h:s;h=l?i:n;i=f[i+16+(((f[i+16>>2]|0)==0&1)<<2)>>2]|0;if(!i){t=h;v=j;break}else{n=h;s=j}}}s=t+d|0;if(s>>>0>t>>>0){n=f[t+24>>2]|0;i=f[t+12>>2]|0;do if((i|0)==(t|0)){j=t+20|0;h=f[j>>2]|0;if(!h){l=t+16|0;k=f[l>>2]|0;if(!k){w=0;break}else{x=k;y=l}}else{x=h;y=j}while(1){j=x+20|0;h=f[j>>2]|0;if(h|0){x=h;y=j;continue}j=x+16|0;h=f[j>>2]|0;if(!h)break;else{x=h;y=j}}f[y>>2]=0;w=x}else{j=f[t+8>>2]|0;f[j+12>>2]=i;f[i+8>>2]=j;w=i}while(0);do if(n|0){i=f[t+28>>2]|0;j=12256+(i<<2)|0;if((t|0)==(f[j>>2]|0)){f[j>>2]=w;if(!w){f[2989]=e&~(1<<i);break}}else{f[n+16+(((f[n+16>>2]|0)!=(t|0)&1)<<2)>>2]=w;if(!w)break}f[w+24>>2]=n;i=f[t+16>>2]|0;if(i|0){f[w+16>>2]=i;f[i+24>>2]=w}i=f[t+20>>2]|0;if(i|0){f[w+20>>2]=i;f[i+24>>2]=w}}while(0);if(v>>>0<16){n=v+d|0;f[t+4>>2]=n|3;e=t+n+4|0;f[e>>2]=f[e>>2]|1}else{f[t+4>>2]=d|3;f[s+4>>2]=v|1;f[s+v>>2]=v;if(m|0){e=f[2993]|0;n=m>>>3;i=11992+(n<<1<<2)|0;j=1<<n;if(!(g&j)){f[2988]=g|j;z=i;A=i+8|0}else{j=i+8|0;z=f[j>>2]|0;A=j}f[A>>2]=e;f[z+12>>2]=e;f[e+8>>2]=z;f[e+12>>2]=i}f[2990]=v;f[2993]=s}o=t+8|0;u=b;return o|0}else B=d}else B=d}else B=d}else if(a>>>0<=4294967231){i=a+11|0;e=i&-8;j=f[2989]|0;if(j){n=0-e|0;h=i>>>8;if(h)if(e>>>0>16777215)C=31;else{i=(h+1048320|0)>>>16&8;l=h<<i;h=(l+520192|0)>>>16&4;k=l<<h;l=(k+245760|0)>>>16&2;D=14-(h|i|l)+(k<<l>>>15)|0;C=e>>>(D+7|0)&1|D<<1}else C=0;D=f[12256+(C<<2)>>2]|0;a:do if(!D){E=0;F=0;G=n;H=57}else{l=0;k=n;i=D;h=e<<((C|0)==31?0:25-(C>>>1)|0);I=0;while(1){J=(f[i+4>>2]&-8)-e|0;if(J>>>0<k>>>0)if(!J){K=0;L=i;M=i;H=61;break a}else{N=i;O=J}else{N=l;O=k}J=f[i+20>>2]|0;i=f[i+16+(h>>>31<<2)>>2]|0;P=(J|0)==0|(J|0)==(i|0)?I:J;J=(i|0)==0;if(J){E=P;F=N;G=O;H=57;break}else{l=N;k=O;h=h<<((J^1)&1);I=P}}}while(0);if((H|0)==57){if((E|0)==0&(F|0)==0){D=2<<C;n=j&(D|0-D);if(!n){B=e;break}D=(n&0-n)+-1|0;n=D>>>12&16;d=D>>>n;D=d>>>5&8;s=d>>>D;d=s>>>2&4;g=s>>>d;s=g>>>1&2;m=g>>>s;g=m>>>1&1;Q=0;R=f[12256+((D|n|d|s|g)+(m>>>g)<<2)>>2]|0}else{Q=F;R=E}if(!R){S=Q;T=G}else{K=G;L=R;M=Q;H=61}}if((H|0)==61)while(1){H=0;g=(f[L+4>>2]&-8)-e|0;m=g>>>0<K>>>0;s=m?g:K;g=m?L:M;L=f[L+16+(((f[L+16>>2]|0)==0&1)<<2)>>2]|0;if(!L){S=g;T=s;break}else{K=s;M=g;H=61}}if((S|0)!=0?T>>>0<((f[2990]|0)-e|0)>>>0:0){g=S+e|0;if(g>>>0<=S>>>0){o=0;u=b;return o|0}s=f[S+24>>2]|0;m=f[S+12>>2]|0;do if((m|0)==(S|0)){d=S+20|0;n=f[d>>2]|0;if(!n){D=S+16|0;I=f[D>>2]|0;if(!I){U=0;break}else{V=I;W=D}}else{V=n;W=d}while(1){d=V+20|0;n=f[d>>2]|0;if(n|0){V=n;W=d;continue}d=V+16|0;n=f[d>>2]|0;if(!n)break;else{V=n;W=d}}f[W>>2]=0;U=V}else{d=f[S+8>>2]|0;f[d+12>>2]=m;f[m+8>>2]=d;U=m}while(0);do if(s){m=f[S+28>>2]|0;d=12256+(m<<2)|0;if((S|0)==(f[d>>2]|0)){f[d>>2]=U;if(!U){d=j&~(1<<m);f[2989]=d;X=d;break}}else{f[s+16+(((f[s+16>>2]|0)!=(S|0)&1)<<2)>>2]=U;if(!U){X=j;break}}f[U+24>>2]=s;d=f[S+16>>2]|0;if(d|0){f[U+16>>2]=d;f[d+24>>2]=U}d=f[S+20>>2]|0;if(d){f[U+20>>2]=d;f[d+24>>2]=U;X=j}else X=j}else X=j;while(0);do if(T>>>0>=16){f[S+4>>2]=e|3;f[g+4>>2]=T|1;f[g+T>>2]=T;j=T>>>3;if(T>>>0<256){s=11992+(j<<1<<2)|0;d=f[2988]|0;m=1<<j;if(!(d&m)){f[2988]=d|m;Y=s;Z=s+8|0}else{m=s+8|0;Y=f[m>>2]|0;Z=m}f[Z>>2]=g;f[Y+12>>2]=g;f[g+8>>2]=Y;f[g+12>>2]=s;break}s=T>>>8;if(s)if(T>>>0>16777215)_=31;else{m=(s+1048320|0)>>>16&8;d=s<<m;s=(d+520192|0)>>>16&4;j=d<<s;d=(j+245760|0)>>>16&2;n=14-(s|m|d)+(j<<d>>>15)|0;_=T>>>(n+7|0)&1|n<<1}else _=0;n=12256+(_<<2)|0;f[g+28>>2]=_;d=g+16|0;f[d+4>>2]=0;f[d>>2]=0;d=1<<_;if(!(X&d)){f[2989]=X|d;f[n>>2]=g;f[g+24>>2]=n;f[g+12>>2]=g;f[g+8>>2]=g;break}d=T<<((_|0)==31?0:25-(_>>>1)|0);j=f[n>>2]|0;while(1){if((f[j+4>>2]&-8|0)==(T|0)){H=97;break}$=j+16+(d>>>31<<2)|0;n=f[$>>2]|0;if(!n){H=96;break}else{d=d<<1;j=n}}if((H|0)==96){f[$>>2]=g;f[g+24>>2]=j;f[g+12>>2]=g;f[g+8>>2]=g;break}else if((H|0)==97){d=j+8|0;n=f[d>>2]|0;f[n+12>>2]=g;f[d>>2]=g;f[g+8>>2]=n;f[g+12>>2]=j;f[g+24>>2]=0;break}}else{n=T+e|0;f[S+4>>2]=n|3;d=S+n+4|0;f[d>>2]=f[d>>2]|1}while(0);o=S+8|0;u=b;return o|0}else B=e}else B=e}else B=-1;while(0);S=f[2990]|0;if(S>>>0>=B>>>0){T=S-B|0;$=f[2993]|0;if(T>>>0>15){_=$+B|0;f[2993]=_;f[2990]=T;f[_+4>>2]=T|1;f[$+S>>2]=T;f[$+4>>2]=B|3}else{f[2990]=0;f[2993]=0;f[$+4>>2]=S|3;T=$+S+4|0;f[T>>2]=f[T>>2]|1}o=$+8|0;u=b;return o|0}$=f[2991]|0;if($>>>0>B>>>0){T=$-B|0;f[2991]=T;S=f[2994]|0;_=S+B|0;f[2994]=_;f[_+4>>2]=T|1;f[S+4>>2]=B|3;o=S+8|0;u=b;return o|0}if(!(f[3106]|0)){f[3108]=4096;f[3107]=4096;f[3109]=-1;f[3110]=-1;f[3111]=0;f[3099]=0;f[3106]=c&-16^1431655768;aa=4096}else aa=f[3108]|0;c=B+48|0;S=B+47|0;T=aa+S|0;_=0-aa|0;aa=T&_;if(aa>>>0<=B>>>0){o=0;u=b;return o|0}X=f[3098]|0;if(X|0?(Y=f[3096]|0,Z=Y+aa|0,Z>>>0<=Y>>>0|Z>>>0>X>>>0):0){o=0;u=b;return o|0}b:do if(!(f[3099]&4)){X=f[2994]|0;c:do if(X){Z=12400;while(1){Y=f[Z>>2]|0;if(Y>>>0<=X>>>0?(ba=Z+4|0,(Y+(f[ba>>2]|0)|0)>>>0>X>>>0):0)break;Y=f[Z+8>>2]|0;if(!Y){H=118;break c}else Z=Y}j=T-$&_;if(j>>>0<2147483647){Y=Ki(j|0)|0;if((Y|0)==((f[Z>>2]|0)+(f[ba>>2]|0)|0))if((Y|0)==(-1|0))ca=j;else{da=j;ea=Y;H=135;break b}else{fa=Y;ga=j;H=126}}else ca=0}else H=118;while(0);do if((H|0)==118){X=Ki(0)|0;if((X|0)!=(-1|0)?(e=X,j=f[3107]|0,Y=j+-1|0,U=((Y&e|0)==0?0:(Y+e&0-j)-e|0)+aa|0,e=f[3096]|0,j=U+e|0,U>>>0>B>>>0&U>>>0<2147483647):0){Y=f[3098]|0;if(Y|0?j>>>0<=e>>>0|j>>>0>Y>>>0:0){ca=0;break}Y=Ki(U|0)|0;if((Y|0)==(X|0)){da=U;ea=X;H=135;break b}else{fa=Y;ga=U;H=126}}else ca=0}while(0);do if((H|0)==126){U=0-ga|0;if(!(c>>>0>ga>>>0&(ga>>>0<2147483647&(fa|0)!=(-1|0))))if((fa|0)==(-1|0)){ca=0;break}else{da=ga;ea=fa;H=135;break b}Y=f[3108]|0;X=S-ga+Y&0-Y;if(X>>>0>=2147483647){da=ga;ea=fa;H=135;break b}if((Ki(X|0)|0)==(-1|0)){Ki(U|0)|0;ca=0;break}else{da=X+ga|0;ea=fa;H=135;break b}}while(0);f[3099]=f[3099]|4;ha=ca;H=133}else{ha=0;H=133}while(0);if(((H|0)==133?aa>>>0<2147483647:0)?(ca=Ki(aa|0)|0,aa=Ki(0)|0,fa=aa-ca|0,ga=fa>>>0>(B+40|0)>>>0,!((ca|0)==(-1|0)|ga^1|ca>>>0<aa>>>0&((ca|0)!=(-1|0)&(aa|0)!=(-1|0))^1)):0){da=ga?fa:ha;ea=ca;H=135}if((H|0)==135){ca=(f[3096]|0)+da|0;f[3096]=ca;if(ca>>>0>(f[3097]|0)>>>0)f[3097]=ca;ca=f[2994]|0;do if(ca){ha=12400;while(1){ia=f[ha>>2]|0;ja=ha+4|0;ka=f[ja>>2]|0;if((ea|0)==(ia+ka|0)){H=143;break}fa=f[ha+8>>2]|0;if(!fa)break;else ha=fa}if(((H|0)==143?(f[ha+12>>2]&8|0)==0:0)?ea>>>0>ca>>>0&ia>>>0<=ca>>>0:0){f[ja>>2]=ka+da;fa=(f[2991]|0)+da|0;ga=ca+8|0;aa=(ga&7|0)==0?0:0-ga&7;ga=ca+aa|0;S=fa-aa|0;f[2994]=ga;f[2991]=S;f[ga+4>>2]=S|1;f[ca+fa+4>>2]=40;f[2995]=f[3110];break}if(ea>>>0<(f[2992]|0)>>>0)f[2992]=ea;fa=ea+da|0;S=12400;while(1){if((f[S>>2]|0)==(fa|0)){H=151;break}ga=f[S+8>>2]|0;if(!ga){la=12400;break}else S=ga}if((H|0)==151)if(!(f[S+12>>2]&8)){f[S>>2]=ea;ha=S+4|0;f[ha>>2]=(f[ha>>2]|0)+da;ha=ea+8|0;ga=ea+((ha&7|0)==0?0:0-ha&7)|0;ha=fa+8|0;aa=fa+((ha&7|0)==0?0:0-ha&7)|0;ha=ga+B|0;c=aa-ga-B|0;f[ga+4>>2]=B|3;do if((ca|0)!=(aa|0)){if((f[2993]|0)==(aa|0)){ba=(f[2990]|0)+c|0;f[2990]=ba;f[2993]=ha;f[ha+4>>2]=ba|1;f[ha+ba>>2]=ba;break}ba=f[aa+4>>2]|0;if((ba&3|0)==1){_=ba&-8;$=ba>>>3;d:do if(ba>>>0<256){T=f[aa+8>>2]|0;X=f[aa+12>>2]|0;if((X|0)==(T|0)){f[2988]=f[2988]&~(1<<$);break}else{f[T+12>>2]=X;f[X+8>>2]=T;break}}else{T=f[aa+24>>2]|0;X=f[aa+12>>2]|0;do if((X|0)==(aa|0)){U=aa+16|0;Y=U+4|0;j=f[Y>>2]|0;if(!j){e=f[U>>2]|0;if(!e){ma=0;break}else{na=e;oa=U}}else{na=j;oa=Y}while(1){Y=na+20|0;j=f[Y>>2]|0;if(j|0){na=j;oa=Y;continue}Y=na+16|0;j=f[Y>>2]|0;if(!j)break;else{na=j;oa=Y}}f[oa>>2]=0;ma=na}else{Y=f[aa+8>>2]|0;f[Y+12>>2]=X;f[X+8>>2]=Y;ma=X}while(0);if(!T)break;X=f[aa+28>>2]|0;Y=12256+(X<<2)|0;do if((f[Y>>2]|0)!=(aa|0)){f[T+16+(((f[T+16>>2]|0)!=(aa|0)&1)<<2)>>2]=ma;if(!ma)break d}else{f[Y>>2]=ma;if(ma|0)break;f[2989]=f[2989]&~(1<<X);break d}while(0);f[ma+24>>2]=T;X=aa+16|0;Y=f[X>>2]|0;if(Y|0){f[ma+16>>2]=Y;f[Y+24>>2]=ma}Y=f[X+4>>2]|0;if(!Y)break;f[ma+20>>2]=Y;f[Y+24>>2]=ma}while(0);pa=aa+_|0;qa=_+c|0}else{pa=aa;qa=c}$=pa+4|0;f[$>>2]=f[$>>2]&-2;f[ha+4>>2]=qa|1;f[ha+qa>>2]=qa;$=qa>>>3;if(qa>>>0<256){ba=11992+($<<1<<2)|0;Z=f[2988]|0;Y=1<<$;if(!(Z&Y)){f[2988]=Z|Y;ra=ba;sa=ba+8|0}else{Y=ba+8|0;ra=f[Y>>2]|0;sa=Y}f[sa>>2]=ha;f[ra+12>>2]=ha;f[ha+8>>2]=ra;f[ha+12>>2]=ba;break}ba=qa>>>8;do if(!ba)ta=0;else{if(qa>>>0>16777215){ta=31;break}Y=(ba+1048320|0)>>>16&8;Z=ba<<Y;$=(Z+520192|0)>>>16&4;X=Z<<$;Z=(X+245760|0)>>>16&2;j=14-($|Y|Z)+(X<<Z>>>15)|0;ta=qa>>>(j+7|0)&1|j<<1}while(0);ba=12256+(ta<<2)|0;f[ha+28>>2]=ta;_=ha+16|0;f[_+4>>2]=0;f[_>>2]=0;_=f[2989]|0;j=1<<ta;if(!(_&j)){f[2989]=_|j;f[ba>>2]=ha;f[ha+24>>2]=ba;f[ha+12>>2]=ha;f[ha+8>>2]=ha;break}j=qa<<((ta|0)==31?0:25-(ta>>>1)|0);_=f[ba>>2]|0;while(1){if((f[_+4>>2]&-8|0)==(qa|0)){H=192;break}ua=_+16+(j>>>31<<2)|0;ba=f[ua>>2]|0;if(!ba){H=191;break}else{j=j<<1;_=ba}}if((H|0)==191){f[ua>>2]=ha;f[ha+24>>2]=_;f[ha+12>>2]=ha;f[ha+8>>2]=ha;break}else if((H|0)==192){j=_+8|0;ba=f[j>>2]|0;f[ba+12>>2]=ha;f[j>>2]=ha;f[ha+8>>2]=ba;f[ha+12>>2]=_;f[ha+24>>2]=0;break}}else{ba=(f[2991]|0)+c|0;f[2991]=ba;f[2994]=ha;f[ha+4>>2]=ba|1}while(0);o=ga+8|0;u=b;return o|0}else la=12400;while(1){ha=f[la>>2]|0;if(ha>>>0<=ca>>>0?(va=ha+(f[la+4>>2]|0)|0,va>>>0>ca>>>0):0)break;la=f[la+8>>2]|0}ga=va+-47|0;ha=ga+8|0;c=ga+((ha&7|0)==0?0:0-ha&7)|0;ha=ca+16|0;ga=c>>>0<ha>>>0?ca:c;c=ga+8|0;aa=da+-40|0;fa=ea+8|0;S=(fa&7|0)==0?0:0-fa&7;fa=ea+S|0;ba=aa-S|0;f[2994]=fa;f[2991]=ba;f[fa+4>>2]=ba|1;f[ea+aa+4>>2]=40;f[2995]=f[3110];aa=ga+4|0;f[aa>>2]=27;f[c>>2]=f[3100];f[c+4>>2]=f[3101];f[c+8>>2]=f[3102];f[c+12>>2]=f[3103];f[3100]=ea;f[3101]=da;f[3103]=0;f[3102]=c;c=ga+24|0;do{ba=c;c=c+4|0;f[c>>2]=7}while((ba+8|0)>>>0<va>>>0);if((ga|0)!=(ca|0)){c=ga-ca|0;f[aa>>2]=f[aa>>2]&-2;f[ca+4>>2]=c|1;f[ga>>2]=c;ba=c>>>3;if(c>>>0<256){fa=11992+(ba<<1<<2)|0;S=f[2988]|0;j=1<<ba;if(!(S&j)){f[2988]=S|j;wa=fa;xa=fa+8|0}else{j=fa+8|0;wa=f[j>>2]|0;xa=j}f[xa>>2]=ca;f[wa+12>>2]=ca;f[ca+8>>2]=wa;f[ca+12>>2]=fa;break}fa=c>>>8;if(fa)if(c>>>0>16777215)ya=31;else{j=(fa+1048320|0)>>>16&8;S=fa<<j;fa=(S+520192|0)>>>16&4;ba=S<<fa;S=(ba+245760|0)>>>16&2;Z=14-(fa|j|S)+(ba<<S>>>15)|0;ya=c>>>(Z+7|0)&1|Z<<1}else ya=0;Z=12256+(ya<<2)|0;f[ca+28>>2]=ya;f[ca+20>>2]=0;f[ha>>2]=0;S=f[2989]|0;ba=1<<ya;if(!(S&ba)){f[2989]=S|ba;f[Z>>2]=ca;f[ca+24>>2]=Z;f[ca+12>>2]=ca;f[ca+8>>2]=ca;break}ba=c<<((ya|0)==31?0:25-(ya>>>1)|0);S=f[Z>>2]|0;while(1){if((f[S+4>>2]&-8|0)==(c|0)){H=213;break}za=S+16+(ba>>>31<<2)|0;Z=f[za>>2]|0;if(!Z){H=212;break}else{ba=ba<<1;S=Z}}if((H|0)==212){f[za>>2]=ca;f[ca+24>>2]=S;f[ca+12>>2]=ca;f[ca+8>>2]=ca;break}else if((H|0)==213){ba=S+8|0;c=f[ba>>2]|0;f[c+12>>2]=ca;f[ba>>2]=ca;f[ca+8>>2]=c;f[ca+12>>2]=S;f[ca+24>>2]=0;break}}}else{c=f[2992]|0;if((c|0)==0|ea>>>0<c>>>0)f[2992]=ea;f[3100]=ea;f[3101]=da;f[3103]=0;f[2997]=f[3106];f[2996]=-1;f[3001]=11992;f[3e3]=11992;f[3003]=12e3;f[3002]=12e3;f[3005]=12008;f[3004]=12008;f[3007]=12016;f[3006]=12016;f[3009]=12024;f[3008]=12024;f[3011]=12032;f[3010]=12032;f[3013]=12040;f[3012]=12040;f[3015]=12048;f[3014]=12048;f[3017]=12056;f[3016]=12056;f[3019]=12064;f[3018]=12064;f[3021]=12072;f[3020]=12072;f[3023]=12080;f[3022]=12080;f[3025]=12088;f[3024]=12088;f[3027]=12096;f[3026]=12096;f[3029]=12104;f[3028]=12104;f[3031]=12112;f[3030]=12112;f[3033]=12120;f[3032]=12120;f[3035]=12128;f[3034]=12128;f[3037]=12136;f[3036]=12136;f[3039]=12144;f[3038]=12144;f[3041]=12152;f[3040]=12152;f[3043]=12160;f[3042]=12160;f[3045]=12168;f[3044]=12168;f[3047]=12176;f[3046]=12176;f[3049]=12184;f[3048]=12184;f[3051]=12192;f[3050]=12192;f[3053]=12200;f[3052]=12200;f[3055]=12208;f[3054]=12208;f[3057]=12216;f[3056]=12216;f[3059]=12224;f[3058]=12224;f[3061]=12232;f[3060]=12232;f[3063]=12240;f[3062]=12240;c=da+-40|0;ba=ea+8|0;ha=(ba&7|0)==0?0:0-ba&7;ba=ea+ha|0;ga=c-ha|0;f[2994]=ba;f[2991]=ga;f[ba+4>>2]=ga|1;f[ea+c+4>>2]=40;f[2995]=f[3110]}while(0);ea=f[2991]|0;if(ea>>>0>B>>>0){da=ea-B|0;f[2991]=da;ea=f[2994]|0;ca=ea+B|0;f[2994]=ca;f[ca+4>>2]=da|1;f[ea+4>>2]=B|3;o=ea+8|0;u=b;return o|0}}ea=Xf()|0;f[ea>>2]=12;o=0;u=b;return o|0}function Tf(a){a=a|0;var b=0,c=0,d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;if(!a)return;b=a+-8|0;c=f[2992]|0;d=f[a+-4>>2]|0;a=d&-8;e=b+a|0;do if(!(d&1)){g=f[b>>2]|0;if(!(d&3))return;h=b+(0-g)|0;i=g+a|0;if(h>>>0<c>>>0)return;if((f[2993]|0)==(h|0)){j=e+4|0;k=f[j>>2]|0;if((k&3|0)!=3){l=h;m=i;n=h;break}f[2990]=i;f[j>>2]=k&-2;f[h+4>>2]=i|1;f[h+i>>2]=i;return}k=g>>>3;if(g>>>0<256){g=f[h+8>>2]|0;j=f[h+12>>2]|0;if((j|0)==(g|0)){f[2988]=f[2988]&~(1<<k);l=h;m=i;n=h;break}else{f[g+12>>2]=j;f[j+8>>2]=g;l=h;m=i;n=h;break}}g=f[h+24>>2]|0;j=f[h+12>>2]|0;do if((j|0)==(h|0)){k=h+16|0;o=k+4|0;p=f[o>>2]|0;if(!p){q=f[k>>2]|0;if(!q){r=0;break}else{s=q;t=k}}else{s=p;t=o}while(1){o=s+20|0;p=f[o>>2]|0;if(p|0){s=p;t=o;continue}o=s+16|0;p=f[o>>2]|0;if(!p)break;else{s=p;t=o}}f[t>>2]=0;r=s}else{o=f[h+8>>2]|0;f[o+12>>2]=j;f[j+8>>2]=o;r=j}while(0);if(g){j=f[h+28>>2]|0;o=12256+(j<<2)|0;if((f[o>>2]|0)==(h|0)){f[o>>2]=r;if(!r){f[2989]=f[2989]&~(1<<j);l=h;m=i;n=h;break}}else{f[g+16+(((f[g+16>>2]|0)!=(h|0)&1)<<2)>>2]=r;if(!r){l=h;m=i;n=h;break}}f[r+24>>2]=g;j=h+16|0;o=f[j>>2]|0;if(o|0){f[r+16>>2]=o;f[o+24>>2]=r}o=f[j+4>>2]|0;if(o){f[r+20>>2]=o;f[o+24>>2]=r;l=h;m=i;n=h}else{l=h;m=i;n=h}}else{l=h;m=i;n=h}}else{l=b;m=a;n=b}while(0);if(n>>>0>=e>>>0)return;b=e+4|0;a=f[b>>2]|0;if(!(a&1))return;if(!(a&2)){if((f[2994]|0)==(e|0)){r=(f[2991]|0)+m|0;f[2991]=r;f[2994]=l;f[l+4>>2]=r|1;if((l|0)!=(f[2993]|0))return;f[2993]=0;f[2990]=0;return}if((f[2993]|0)==(e|0)){r=(f[2990]|0)+m|0;f[2990]=r;f[2993]=n;f[l+4>>2]=r|1;f[n+r>>2]=r;return}r=(a&-8)+m|0;s=a>>>3;do if(a>>>0<256){t=f[e+8>>2]|0;c=f[e+12>>2]|0;if((c|0)==(t|0)){f[2988]=f[2988]&~(1<<s);break}else{f[t+12>>2]=c;f[c+8>>2]=t;break}}else{t=f[e+24>>2]|0;c=f[e+12>>2]|0;do if((c|0)==(e|0)){d=e+16|0;o=d+4|0;j=f[o>>2]|0;if(!j){p=f[d>>2]|0;if(!p){u=0;break}else{v=p;w=d}}else{v=j;w=o}while(1){o=v+20|0;j=f[o>>2]|0;if(j|0){v=j;w=o;continue}o=v+16|0;j=f[o>>2]|0;if(!j)break;else{v=j;w=o}}f[w>>2]=0;u=v}else{o=f[e+8>>2]|0;f[o+12>>2]=c;f[c+8>>2]=o;u=c}while(0);if(t|0){c=f[e+28>>2]|0;h=12256+(c<<2)|0;if((f[h>>2]|0)==(e|0)){f[h>>2]=u;if(!u){f[2989]=f[2989]&~(1<<c);break}}else{f[t+16+(((f[t+16>>2]|0)!=(e|0)&1)<<2)>>2]=u;if(!u)break}f[u+24>>2]=t;c=e+16|0;h=f[c>>2]|0;if(h|0){f[u+16>>2]=h;f[h+24>>2]=u}h=f[c+4>>2]|0;if(h|0){f[u+20>>2]=h;f[h+24>>2]=u}}}while(0);f[l+4>>2]=r|1;f[n+r>>2]=r;if((l|0)==(f[2993]|0)){f[2990]=r;return}else x=r}else{f[b>>2]=a&-2;f[l+4>>2]=m|1;f[n+m>>2]=m;x=m}m=x>>>3;if(x>>>0<256){n=11992+(m<<1<<2)|0;a=f[2988]|0;b=1<<m;if(!(a&b)){f[2988]=a|b;y=n;z=n+8|0}else{b=n+8|0;y=f[b>>2]|0;z=b}f[z>>2]=l;f[y+12>>2]=l;f[l+8>>2]=y;f[l+12>>2]=n;return}n=x>>>8;if(n)if(x>>>0>16777215)A=31;else{y=(n+1048320|0)>>>16&8;z=n<<y;n=(z+520192|0)>>>16&4;b=z<<n;z=(b+245760|0)>>>16&2;a=14-(n|y|z)+(b<<z>>>15)|0;A=x>>>(a+7|0)&1|a<<1}else A=0;a=12256+(A<<2)|0;f[l+28>>2]=A;f[l+20>>2]=0;f[l+16>>2]=0;z=f[2989]|0;b=1<<A;do if(z&b){y=x<<((A|0)==31?0:25-(A>>>1)|0);n=f[a>>2]|0;while(1){if((f[n+4>>2]&-8|0)==(x|0)){B=73;break}C=n+16+(y>>>31<<2)|0;m=f[C>>2]|0;if(!m){B=72;break}else{y=y<<1;n=m}}if((B|0)==72){f[C>>2]=l;f[l+24>>2]=n;f[l+12>>2]=l;f[l+8>>2]=l;break}else if((B|0)==73){y=n+8|0;t=f[y>>2]|0;f[t+12>>2]=l;f[y>>2]=l;f[l+8>>2]=t;f[l+12>>2]=n;f[l+24>>2]=0;break}}else{f[2989]=z|b;f[a>>2]=l;f[l+24>>2]=a;f[l+12>>2]=l;f[l+8>>2]=l}while(0);l=(f[2996]|0)+-1|0;f[2996]=l;if(!l)D=12408;else return;while(1){l=f[D>>2]|0;if(!l)break;else D=l+8|0}f[2996]=-1;return}function Uf(a){a=a|0;var b=0,c=0,d=0;b=u;u=u+16|0;c=b;d=Yf(f[a+60>>2]|0)|0;f[c>>2]=d;d=Wf(Ba(6,c|0)|0)|0;u=b;return d|0}function Vf(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,g=0,h=0;d=u;u=u+32|0;e=d;g=d+20|0;f[e>>2]=f[a+60>>2];f[e+4>>2]=0;f[e+8>>2]=b;f[e+12>>2]=g;f[e+16>>2]=c;if((Wf(za(140,e|0)|0)|0)<0){f[g>>2]=-1;h=-1}else h=f[g>>2]|0;u=d;return h|0}function Wf(a){a=a|0;var b=0,c=0;if(a>>>0>4294963200){b=Xf()|0;f[b>>2]=0-a;c=-1}else c=a;return c|0}function Xf(){return 12448}function Yf(a){a=a|0;return a|0}function Zf(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,v=0,w=0;d=u;u=u+48|0;e=d+16|0;g=d;h=d+32|0;i=a+28|0;j=f[i>>2]|0;f[h>>2]=j;k=a+20|0;l=(f[k>>2]|0)-j|0;f[h+4>>2]=l;f[h+8>>2]=b;f[h+12>>2]=c;b=l+c|0;l=a+60|0;f[g>>2]=f[l>>2];f[g+4>>2]=h;f[g+8>>2]=2;j=Wf(Aa(146,g|0)|0)|0;a:do if((b|0)!=(j|0)){g=2;m=b;n=h;o=j;while(1){if((o|0)<0)break;m=m-o|0;p=f[n+4>>2]|0;q=o>>>0>p>>>0;r=q?n+8|0:n;s=g+(q<<31>>31)|0;t=o-(q?p:0)|0;f[r>>2]=(f[r>>2]|0)+t;p=r+4|0;f[p>>2]=(f[p>>2]|0)-t;f[e>>2]=f[l>>2];f[e+4>>2]=r;f[e+8>>2]=s;o=Wf(Aa(146,e|0)|0)|0;if((m|0)==(o|0)){v=3;break a}else{g=s;n=r}}f[a+16>>2]=0;f[i>>2]=0;f[k>>2]=0;f[a>>2]=f[a>>2]|32;if((g|0)==2)w=0;else w=c-(f[n+4>>2]|0)|0}else v=3;while(0);if((v|0)==3){v=f[a+44>>2]|0;f[a+16>>2]=v+(f[a+48>>2]|0);a=v;f[i>>2]=a;f[k>>2]=a;w=c}u=d;return w|0}function _f(a){a=a|0;var c=0,d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0;c=a;a:do if(!(c&3)){d=a;e=4}else{g=a;h=c;while(1){if(!(b[g>>0]|0)){i=h;break a}j=g+1|0;h=j;if(!(h&3)){d=j;e=4;break}else g=j}}while(0);if((e|0)==4){e=d;while(1){k=f[e>>2]|0;if(!((k&-2139062144^-2139062144)&k+-16843009))e=e+4|0;else break}if(!((k&255)<<24>>24))l=e;else{k=e;while(1){e=k+1|0;if(!(b[e>>0]|0)){l=e;break}else k=e}}i=l}return i-c|0}function $f(a,c){a=a|0;c=c|0;var d=0,e=0,g=0,i=0,j=0,k=0;d=0;while(1){if((h[8076+d>>0]|0)==(a|0)){e=2;break}g=d+1|0;if((g|0)==87){i=8164;j=87;e=5;break}else d=g}if((e|0)==2)if(!d)k=8164;else{i=8164;j=d;e=5}if((e|0)==5)while(1){e=0;d=i;do{a=d;d=d+1|0}while((b[a>>0]|0)!=0);j=j+-1|0;if(!j){k=d;break}else{i=d;e=5}}return ag(k,f[c+20>>2]|0)|0}function ag(a,b){a=a|0;b=b|0;return bg(a,b)|0}function bg(a,b){a=a|0;b=b|0;var c=0;if(!b)c=0;else c=cg(f[b>>2]|0,f[b+4>>2]|0,a)|0;return (c|0?c:a)|0}function cg(a,c,d){a=a|0;c=c|0;d=d|0;var e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;e=(f[a>>2]|0)+1794895138|0;g=dg(f[a+8>>2]|0,e)|0;h=dg(f[a+12>>2]|0,e)|0;i=dg(f[a+16>>2]|0,e)|0;a:do if((g>>>0<c>>>2>>>0?(j=c-(g<<2)|0,h>>>0<j>>>0&i>>>0<j>>>0):0)?((i|h)&3|0)==0:0){j=h>>>2;k=i>>>2;l=0;m=g;while(1){n=m>>>1;o=l+n|0;p=o<<1;q=p+j|0;r=dg(f[a+(q<<2)>>2]|0,e)|0;s=dg(f[a+(q+1<<2)>>2]|0,e)|0;if(!(s>>>0<c>>>0&r>>>0<(c-s|0)>>>0)){t=0;break a}if(b[a+(s+r)>>0]|0){t=0;break a}r=eg(d,a+s|0)|0;if(!r)break;s=(r|0)<0;if((m|0)==1){t=0;break a}else{l=s?l:o;m=s?n:m-n|0}}m=p+k|0;l=dg(f[a+(m<<2)>>2]|0,e)|0;j=dg(f[a+(m+1<<2)>>2]|0,e)|0;if(j>>>0<c>>>0&l>>>0<(c-j|0)>>>0)t=(b[a+(j+l)>>0]|0)==0?a+j|0:0;else t=0}else t=0;while(0);return t|0}function dg(a,b){a=a|0;b=b|0;var c=0;c=Gi(a|0)|0;return ((b|0)==0?a:c)|0}function eg(a,c){a=a|0;c=c|0;var d=0,e=0,f=0,g=0;d=b[a>>0]|0;e=b[c>>0]|0;if(d<<24>>24==0?1:d<<24>>24!=e<<24>>24){f=e;g=d}else{d=c;c=a;do{c=c+1|0;d=d+1|0;a=b[c>>0]|0;e=b[d>>0]|0}while(!(a<<24>>24==0?1:a<<24>>24!=e<<24>>24));f=e;g=a}return (g&255)-(f&255)|0}function fg(a){a=a|0;var b=0;b=(gg()|0)+188|0;return $f(a,f[b>>2]|0)|0}function gg(){return hg()|0}function hg(){return 1176}function ig(a,b){a=+a;b=b|0;var c=0,d=0,e=0,g=0.0,h=0.0,i=0,j=0.0;p[s>>3]=a;c=f[s>>2]|0;d=f[s+4>>2]|0;e=Ei(c|0,d|0,52)|0;switch(e&2047){case 0:{if(a!=0.0){g=+ig(a*18446744073709551616.0,b);h=g;i=(f[b>>2]|0)+-64|0}else{h=a;i=0}f[b>>2]=i;j=h;break}case 2047:{j=a;break}default:{f[b>>2]=(e&2047)+-1022;f[s>>2]=c;f[s+4>>2]=d&-2146435073|1071644672;j=+p[s>>3]}}return +j}function jg(a,b){a=+a;b=+b;var c=0,d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,q=0,r=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0.0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0.0;p[s>>3]=a;c=f[s>>2]|0;d=f[s+4>>2]|0;p[s>>3]=b;e=f[s>>2]|0;g=f[s+4>>2]|0;h=Ei(c|0,d|0,52)|0;i=h&2047;h=Ei(e|0,g|0,52)|0;j=h&2047;h=d&-2147483648;k=Fi(e|0,g|0,1)|0;l=I;a:do if(!((k|0)==0&(l|0)==0)?(m=kg(b)|0,n=I&2147483647,!((i|0)==2047|(n>>>0>2146435072|(n|0)==2146435072&m>>>0>0))):0){m=Fi(c|0,d|0,1)|0;n=I;if(!(n>>>0>l>>>0|(n|0)==(l|0)&m>>>0>k>>>0))return +((m|0)==(k|0)&(n|0)==(l|0)?a*0.0:a);if(!i){n=Fi(c|0,d|0,12)|0;m=I;if((m|0)>-1|(m|0)==-1&n>>>0>4294967295){o=0;q=n;n=m;while(1){m=o+-1|0;q=Fi(q|0,n|0,1)|0;n=I;if(!((n|0)>-1|(n|0)==-1&q>>>0>4294967295)){r=m;break}else o=m}}else r=0;o=Fi(c|0,d|0,1-r|0)|0;t=r;u=o;v=I}else{t=i;u=c;v=d&1048575|1048576}if(!j){o=Fi(e|0,g|0,12)|0;q=I;if((q|0)>-1|(q|0)==-1&o>>>0>4294967295){n=0;m=o;o=q;while(1){q=n+-1|0;m=Fi(m|0,o|0,1)|0;o=I;if(!((o|0)>-1|(o|0)==-1&m>>>0>4294967295)){w=q;break}else n=q}}else w=0;n=Fi(e|0,g|0,1-w|0)|0;x=w;y=n;z=I}else{x=j;y=e;z=g&1048575|1048576}n=zi(u|0,v|0,y|0,z|0)|0;m=I;o=(m|0)>-1|(m|0)==-1&n>>>0>4294967295;b:do if((t|0)>(x|0)){q=t;A=m;B=o;C=u;D=v;E=n;while(1){if(B)if((E|0)==0&(A|0)==0)break;else{F=E;G=A}else{F=C;G=D}H=Fi(F|0,G|0,1)|0;J=I;K=q+-1|0;L=zi(H|0,J|0,y|0,z|0)|0;M=I;N=(M|0)>-1|(M|0)==-1&L>>>0>4294967295;if((K|0)>(x|0)){q=K;A=M;B=N;C=H;D=J;E=L}else{O=K;P=N;Q=L;R=M;S=H;T=J;break b}}U=a*0.0;break a}else{O=t;P=o;Q=n;R=m;S=u;T=v}while(0);if(P)if((Q|0)==0&(R|0)==0){U=a*0.0;break}else{V=R;W=Q}else{V=T;W=S}if(V>>>0<1048576|(V|0)==1048576&W>>>0<0){m=O;n=W;o=V;while(1){E=Fi(n|0,o|0,1)|0;D=I;C=m+-1|0;if(D>>>0<1048576|(D|0)==1048576&E>>>0<0){m=C;n=E;o=D}else{X=C;Y=E;Z=D;break}}}else{X=O;Y=W;Z=V}if((X|0)>0){o=yi(Y|0,Z|0,0,-1048576)|0;n=I;m=Fi(X|0,0,52)|0;_=n|I;$=o|m}else{m=Ei(Y|0,Z|0,1-X|0)|0;_=I;$=m}f[s>>2]=$;f[s+4>>2]=_|h;U=+p[s>>3]}else aa=3;while(0);if((aa|0)==3){ba=a*b;U=ba/ba}return +U}function kg(a){a=+a;var b=0;p[s>>3]=a;b=f[s>>2]|0;I=f[s+4>>2]|0;return b|0}function lg(a,b){a=+a;b=b|0;return +(+ig(a,b))}function mg(a){a=a|0;return ((a|0)==32|(a+-9|0)>>>0<5)&1|0}function ng(a,c,d){a=a|0;c=c|0;d=d|0;var e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;e=c&255;g=(d|0)!=0;a:do if(g&(a&3|0)!=0){h=c&255;i=a;j=d;while(1){if((b[i>>0]|0)==h<<24>>24){k=i;l=j;m=6;break a}n=i+1|0;o=j+-1|0;p=(o|0)!=0;if(p&(n&3|0)!=0){i=n;j=o}else{q=n;r=o;s=p;m=5;break}}}else{q=a;r=d;s=g;m=5}while(0);if((m|0)==5)if(s){k=q;l=r;m=6}else{t=q;u=0}b:do if((m|0)==6){q=c&255;if((b[k>>0]|0)==q<<24>>24){t=k;u=l}else{r=X(e,16843009)|0;c:do if(l>>>0>3){s=k;g=l;while(1){d=f[s>>2]^r;if((d&-2139062144^-2139062144)&d+-16843009|0)break;d=s+4|0;a=g+-4|0;if(a>>>0>3){s=d;g=a}else{v=d;w=a;m=11;break c}}x=s;y=g}else{v=k;w=l;m=11}while(0);if((m|0)==11)if(!w){t=v;u=0;break}else{x=v;y=w}while(1){if((b[x>>0]|0)==q<<24>>24){t=x;u=y;break b}r=x+1|0;y=y+-1|0;if(!y){t=r;u=0;break}else x=r}}}while(0);return (u|0?t:0)|0}function og(a){a=a|0;return (a+-48|0)>>>0<10|0}function pg(a,b){a=a|0;b=b|0;var c=0;if(!a)c=0;else c=qg(a,b,0)|0;return c|0}function qg(a,c,d){a=a|0;c=c|0;d=d|0;var e=0;do if(a){if(c>>>0<128){b[a>>0]=c;e=1;break}d=(rg()|0)+188|0;if(!(f[f[d>>2]>>2]|0))if((c&-128|0)==57216){b[a>>0]=c;e=1;break}else{d=Xf()|0;f[d>>2]=84;e=-1;break}if(c>>>0<2048){b[a>>0]=c>>>6|192;b[a+1>>0]=c&63|128;e=2;break}if(c>>>0<55296|(c&-8192|0)==57344){b[a>>0]=c>>>12|224;b[a+1>>0]=c>>>6&63|128;b[a+2>>0]=c&63|128;e=3;break}if((c+-65536|0)>>>0<1048576){b[a>>0]=c>>>18|240;b[a+1>>0]=c>>>12&63|128;b[a+2>>0]=c>>>6&63|128;b[a+3>>0]=c&63|128;e=4;break}else{d=Xf()|0;f[d>>2]=84;e=-1;break}}else e=1;while(0);return e|0}function rg(){return hg()|0}function sg(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,g=0;e=u;u=u+16|0;g=e;f[g>>2]=d;d=tg(a,b,c,g)|0;u=e;return d|0}function tg(a,c,d,e){a=a|0;c=c|0;d=d|0;e=e|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=u;u=u+128|0;h=g+124|0;i=g;j=i;k=1420;l=j+124|0;do{f[j>>2]=f[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));if((c+-1|0)>>>0>2147483646)if(!c){m=h;n=1;o=4}else{h=Xf()|0;f[h>>2]=75;p=-1}else{m=a;n=c;o=4}if((o|0)==4){o=-2-m|0;c=n>>>0>o>>>0?o:n;f[i+48>>2]=c;n=i+20|0;f[n>>2]=m;f[i+44>>2]=m;o=m+c|0;m=i+16|0;f[m>>2]=o;f[i+28>>2]=o;o=ug(i,d,e)|0;if(!c)p=o;else{c=f[n>>2]|0;b[c+(((c|0)==(f[m>>2]|0))<<31>>31)>>0]=0;p=o}}u=g;return p|0}function ug(a,c,d){a=a|0;c=c|0;d=d|0;var e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;e=u;u=u+224|0;g=e+120|0;h=e+80|0;i=e;j=e+136|0;k=h;l=k+40|0;do{f[k>>2]=0;k=k+4|0}while((k|0)<(l|0));f[g>>2]=f[d>>2];if((vg(0,c,g,i,h)|0)<0)m=-1;else{if((f[a+76>>2]|0)>-1)n=wg(a)|0;else n=0;d=f[a>>2]|0;k=d&32;if((b[a+74>>0]|0)<1)f[a>>2]=d&-33;d=a+48|0;if(!(f[d>>2]|0)){l=a+44|0;o=f[l>>2]|0;f[l>>2]=j;p=a+28|0;f[p>>2]=j;q=a+20|0;f[q>>2]=j;f[d>>2]=80;r=a+16|0;f[r>>2]=j+80;j=vg(a,c,g,i,h)|0;if(!o)s=j;else{Yb[f[a+36>>2]&7](a,0,0)|0;t=(f[q>>2]|0)==0?-1:j;f[l>>2]=o;f[d>>2]=0;f[r>>2]=0;f[p>>2]=0;f[q>>2]=0;s=t}}else s=vg(a,c,g,i,h)|0;h=f[a>>2]|0;f[a>>2]=h|k;if(n|0)xg(a);m=(h&32|0)==0?s:-1}u=e;return m|0}function vg(a,c,e,g,h){a=a|0;c=c|0;e=e|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,q=0,r=0,s=0,t=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0;i=u;u=u+64|0;j=i+16|0;k=i;l=i+24|0;m=i+8|0;n=i+20|0;f[j>>2]=c;c=(a|0)!=0;o=l+40|0;q=o;r=l+39|0;l=m+4|0;s=0;t=0;v=0;a:while(1){do if((t|0)>-1)if((s|0)>(2147483647-t|0)){w=Xf()|0;f[w>>2]=75;x=-1;break}else{x=s+t|0;break}else x=t;while(0);w=f[j>>2]|0;y=b[w>>0]|0;if(!(y<<24>>24)){z=88;break}else{A=y;B=w}b:while(1){switch(A<<24>>24){case 37:{C=B;D=B;z=9;break b;break}case 0:{E=B;break b;break}default:{}}y=B+1|0;f[j>>2]=y;A=b[y>>0]|0;B=y}c:do if((z|0)==9)while(1){z=0;if((b[D+1>>0]|0)!=37){E=C;break c}y=C+1|0;D=D+2|0;f[j>>2]=D;if((b[D>>0]|0)!=37){E=y;break}else{C=y;z=9}}while(0);y=E-w|0;if(c)yg(a,w,y);if(y|0){s=y;t=x;continue}y=(og(b[(f[j>>2]|0)+1>>0]|0)|0)==0;F=f[j>>2]|0;if(!y?(b[F+2>>0]|0)==36:0){G=(b[F+1>>0]|0)+-48|0;H=1;J=3}else{G=-1;H=v;J=1}y=F+J|0;f[j>>2]=y;F=b[y>>0]|0;K=(F<<24>>24)+-32|0;if(K>>>0>31|(1<<K&75913|0)==0){L=0;M=F;N=y}else{K=0;O=F;F=y;while(1){y=1<<(O<<24>>24)+-32|K;P=F+1|0;f[j>>2]=P;Q=b[P>>0]|0;R=(Q<<24>>24)+-32|0;if(R>>>0>31|(1<<R&75913|0)==0){L=y;M=Q;N=P;break}else{K=y;O=Q;F=P}}}if(M<<24>>24==42){if((og(b[N+1>>0]|0)|0)!=0?(F=f[j>>2]|0,(b[F+2>>0]|0)==36):0){O=F+1|0;f[h+((b[O>>0]|0)+-48<<2)>>2]=10;S=f[g+((b[O>>0]|0)+-48<<3)>>2]|0;T=1;U=F+3|0}else{if(H|0){V=-1;break}if(c){F=(f[e>>2]|0)+(4-1)&~(4-1);O=f[F>>2]|0;f[e>>2]=F+4;W=O}else W=0;S=W;T=0;U=(f[j>>2]|0)+1|0}f[j>>2]=U;O=(S|0)<0;X=O?0-S|0:S;Y=O?L|8192:L;Z=T;_=U}else{O=zg(j)|0;if((O|0)<0){V=-1;break}X=O;Y=L;Z=H;_=f[j>>2]|0}do if((b[_>>0]|0)==46){if((b[_+1>>0]|0)!=42){f[j>>2]=_+1;O=zg(j)|0;$=O;aa=f[j>>2]|0;break}if(og(b[_+2>>0]|0)|0?(O=f[j>>2]|0,(b[O+3>>0]|0)==36):0){F=O+2|0;f[h+((b[F>>0]|0)+-48<<2)>>2]=10;K=f[g+((b[F>>0]|0)+-48<<3)>>2]|0;F=O+4|0;f[j>>2]=F;$=K;aa=F;break}if(Z|0){V=-1;break a}if(c){F=(f[e>>2]|0)+(4-1)&~(4-1);K=f[F>>2]|0;f[e>>2]=F+4;ba=K}else ba=0;K=(f[j>>2]|0)+2|0;f[j>>2]=K;$=ba;aa=K}else{$=-1;aa=_}while(0);K=0;F=aa;while(1){if(((b[F>>0]|0)+-65|0)>>>0>57){V=-1;break a}O=F;F=F+1|0;f[j>>2]=F;ca=b[(b[O>>0]|0)+-65+(9968+(K*58|0))>>0]|0;da=ca&255;if((da+-1|0)>>>0>=8)break;else K=da}if(!(ca<<24>>24)){V=-1;break}O=(G|0)>-1;do if(ca<<24>>24==19)if(O){V=-1;break a}else z=50;else{if(O){f[h+(G<<2)>>2]=da;P=g+(G<<3)|0;Q=f[P+4>>2]|0;y=k;f[y>>2]=f[P>>2];f[y+4>>2]=Q;z=50;break}if(!c){V=0;break a}Ag(k,da,e);ea=f[j>>2]|0}while(0);if((z|0)==50){z=0;if(c)ea=F;else{s=0;t=x;v=Z;continue}}O=b[ea+-1>>0]|0;Q=(K|0)!=0&(O&15|0)==3?O&-33:O;O=Y&-65537;y=(Y&8192|0)==0?Y:O;d:do switch(Q|0){case 110:{switch((K&255)<<24>>24){case 0:{f[f[k>>2]>>2]=x;s=0;t=x;v=Z;continue a;break}case 1:{f[f[k>>2]>>2]=x;s=0;t=x;v=Z;continue a;break}case 2:{P=f[k>>2]|0;f[P>>2]=x;f[P+4>>2]=((x|0)<0)<<31>>31;s=0;t=x;v=Z;continue a;break}case 3:{d[f[k>>2]>>1]=x;s=0;t=x;v=Z;continue a;break}case 4:{b[f[k>>2]>>0]=x;s=0;t=x;v=Z;continue a;break}case 6:{f[f[k>>2]>>2]=x;s=0;t=x;v=Z;continue a;break}case 7:{P=f[k>>2]|0;f[P>>2]=x;f[P+4>>2]=((x|0)<0)<<31>>31;s=0;t=x;v=Z;continue a;break}default:{s=0;t=x;v=Z;continue a}}break}case 112:{fa=120;ga=$>>>0>8?$:8;ha=y|8;z=62;break}case 88:case 120:{fa=Q;ga=$;ha=y;z=62;break}case 111:{P=k;R=f[P>>2]|0;ia=f[P+4>>2]|0;P=Cg(R,ia,o)|0;ja=q-P|0;ka=P;la=0;ma=10432;na=(y&8|0)==0|($|0)>(ja|0)?$:ja+1|0;oa=y;pa=R;qa=ia;z=68;break}case 105:case 100:{ia=k;R=f[ia>>2]|0;ja=f[ia+4>>2]|0;if((ja|0)<0){ia=zi(0,0,R|0,ja|0)|0;P=I;ra=k;f[ra>>2]=ia;f[ra+4>>2]=P;sa=1;ta=10432;ua=ia;va=P;z=67;break d}else{sa=(y&2049|0)!=0&1;ta=(y&2048|0)==0?((y&1|0)==0?10432:10434):10433;ua=R;va=ja;z=67;break d}break}case 117:{ja=k;sa=0;ta=10432;ua=f[ja>>2]|0;va=f[ja+4>>2]|0;z=67;break}case 99:{b[r>>0]=f[k>>2];wa=r;xa=0;ya=10432;za=o;Aa=1;Ba=O;break}case 109:{ja=Xf()|0;Ca=fg(f[ja>>2]|0)|0;z=72;break}case 115:{ja=f[k>>2]|0;Ca=ja|0?ja:10442;z=72;break}case 67:{f[m>>2]=f[k>>2];f[l>>2]=0;f[k>>2]=m;Da=-1;Ea=m;z=76;break}case 83:{ja=f[k>>2]|0;if(!$){Eg(a,32,X,0,y);Fa=0;z=85}else{Da=$;Ea=ja;z=76}break}case 65:case 71:case 70:case 69:case 97:case 103:case 102:case 101:{s=Fg(a,+p[k>>3],X,$,y,Q)|0;t=x;v=Z;continue a;break}default:{wa=w;xa=0;ya=10432;za=o;Aa=$;Ba=y}}while(0);e:do if((z|0)==62){z=0;w=k;Q=f[w>>2]|0;K=f[w+4>>2]|0;w=Bg(Q,K,o,fa&32)|0;F=(ha&8|0)==0|(Q|0)==0&(K|0)==0;ka=w;la=F?0:2;ma=F?10432:10432+(fa>>4)|0;na=ga;oa=ha;pa=Q;qa=K;z=68}else if((z|0)==67){z=0;ka=Dg(ua,va,o)|0;la=sa;ma=ta;na=$;oa=y;pa=ua;qa=va;z=68}else if((z|0)==72){z=0;K=ng(Ca,0,$)|0;Q=(K|0)==0;wa=Ca;xa=0;ya=10432;za=Q?Ca+$|0:K;Aa=Q?$:K-Ca|0;Ba=O}else if((z|0)==76){z=0;K=Ea;Q=0;F=0;while(1){w=f[K>>2]|0;if(!w){Ga=Q;Ha=F;break}ja=pg(n,w)|0;if((ja|0)<0|ja>>>0>(Da-Q|0)>>>0){Ga=Q;Ha=ja;break}w=ja+Q|0;if(Da>>>0>w>>>0){K=K+4|0;Q=w;F=ja}else{Ga=w;Ha=ja;break}}if((Ha|0)<0){V=-1;break a}Eg(a,32,X,Ga,y);if(!Ga){Fa=0;z=85}else{F=Ea;Q=0;while(1){K=f[F>>2]|0;if(!K){Fa=Ga;z=85;break e}ja=pg(n,K)|0;Q=ja+Q|0;if((Q|0)>(Ga|0)){Fa=Ga;z=85;break e}yg(a,n,ja);if(Q>>>0>=Ga>>>0){Fa=Ga;z=85;break}else F=F+4|0}}}while(0);if((z|0)==68){z=0;O=(pa|0)!=0|(qa|0)!=0;F=(na|0)!=0|O;Q=q-ka+((O^1)&1)|0;wa=F?ka:o;xa=la;ya=ma;za=o;Aa=F?((na|0)>(Q|0)?na:Q):na;Ba=(na|0)>-1?oa&-65537:oa}else if((z|0)==85){z=0;Eg(a,32,X,Fa,y^8192);s=(X|0)>(Fa|0)?X:Fa;t=x;v=Z;continue}Q=za-wa|0;F=(Aa|0)<(Q|0)?Q:Aa;O=F+xa|0;ja=(X|0)<(O|0)?O:X;Eg(a,32,ja,O,Ba);yg(a,ya,xa);Eg(a,48,ja,O,Ba^65536);Eg(a,48,F,Q,0);yg(a,wa,Q);Eg(a,32,ja,O,Ba^8192);s=ja;t=x;v=Z}f:do if((z|0)==88)if(!a)if(v){Z=1;while(1){t=f[h+(Z<<2)>>2]|0;if(!t){Ia=Z;break}Ag(g+(Z<<3)|0,t,e);t=Z+1|0;if((Z|0)<9)Z=t;else{Ia=t;break}}if((Ia|0)<10){Z=Ia;while(1){if(f[h+(Z<<2)>>2]|0){V=-1;break f}if((Z|0)<9)Z=Z+1|0;else{V=1;break}}}else V=1}else V=0;else V=x;while(0);u=i;return V|0}function wg(a){a=a|0;return 0}function xg(a){a=a|0;return}function yg(a,b,c){a=a|0;b=b|0;c=c|0;if(!(f[a>>2]&32))Hg(b,c,a)|0;return}function zg(a){a=a|0;var c=0,d=0,e=0,g=0,h=0;if(!(og(b[f[a>>2]>>0]|0)|0))c=0;else{d=0;while(1){e=f[a>>2]|0;g=(d*10|0)+-48+(b[e>>0]|0)|0;h=e+1|0;f[a>>2]=h;if(!(og(b[h>>0]|0)|0)){c=g;break}else d=g}}return c|0}function Ag(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,g=0,h=0,i=0.0;a:do if(b>>>0<=20)do switch(b|0){case 9:{d=(f[c>>2]|0)+(4-1)&~(4-1);e=f[d>>2]|0;f[c>>2]=d+4;f[a>>2]=e;break a;break}case 10:{e=(f[c>>2]|0)+(4-1)&~(4-1);d=f[e>>2]|0;f[c>>2]=e+4;e=a;f[e>>2]=d;f[e+4>>2]=((d|0)<0)<<31>>31;break a;break}case 11:{d=(f[c>>2]|0)+(4-1)&~(4-1);e=f[d>>2]|0;f[c>>2]=d+4;d=a;f[d>>2]=e;f[d+4>>2]=0;break a;break}case 12:{d=(f[c>>2]|0)+(8-1)&~(8-1);e=d;g=f[e>>2]|0;h=f[e+4>>2]|0;f[c>>2]=d+8;d=a;f[d>>2]=g;f[d+4>>2]=h;break a;break}case 13:{h=(f[c>>2]|0)+(4-1)&~(4-1);d=f[h>>2]|0;f[c>>2]=h+4;h=(d&65535)<<16>>16;d=a;f[d>>2]=h;f[d+4>>2]=((h|0)<0)<<31>>31;break a;break}case 14:{h=(f[c>>2]|0)+(4-1)&~(4-1);d=f[h>>2]|0;f[c>>2]=h+4;h=a;f[h>>2]=d&65535;f[h+4>>2]=0;break a;break}case 15:{h=(f[c>>2]|0)+(4-1)&~(4-1);d=f[h>>2]|0;f[c>>2]=h+4;h=(d&255)<<24>>24;d=a;f[d>>2]=h;f[d+4>>2]=((h|0)<0)<<31>>31;break a;break}case 16:{h=(f[c>>2]|0)+(4-1)&~(4-1);d=f[h>>2]|0;f[c>>2]=h+4;h=a;f[h>>2]=d&255;f[h+4>>2]=0;break a;break}case 17:{h=(f[c>>2]|0)+(8-1)&~(8-1);i=+p[h>>3];f[c>>2]=h+8;p[a>>3]=i;break a;break}case 18:{h=(f[c>>2]|0)+(8-1)&~(8-1);i=+p[h>>3];f[c>>2]=h+8;p[a>>3]=i;break a;break}default:break a}while(0);while(0);return}function Bg(a,c,d,e){a=a|0;c=c|0;d=d|0;e=e|0;var f=0,g=0;if((a|0)==0&(c|0)==0)f=d;else{g=d;d=c;c=a;while(1){a=g+-1|0;b[a>>0]=h[10484+(c&15)>>0]|0|e;c=Ei(c|0,d|0,4)|0;d=I;if((c|0)==0&(d|0)==0){f=a;break}else g=a}}return f|0}function Cg(a,c,d){a=a|0;c=c|0;d=d|0;var e=0,f=0;if((a|0)==0&(c|0)==0)e=d;else{f=d;d=c;c=a;while(1){a=f+-1|0;b[a>>0]=c&7|48;c=Ei(c|0,d|0,3)|0;d=I;if((c|0)==0&(d|0)==0){e=a;break}else f=a}}return e|0}function Dg(a,c,d){a=a|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;if(c>>>0>0|(c|0)==0&a>>>0>4294967295){e=d;f=a;g=c;while(1){c=Di(f|0,g|0,10,0)|0;e=e+-1|0;b[e>>0]=c&255|48;c=f;f=Ci(f|0,g|0,10,0)|0;if(!(g>>>0>9|(g|0)==9&c>>>0>4294967295))break;else g=I}h=f;i=e}else{h=a;i=d}if(!h)j=i;else{d=h;h=i;while(1){i=h+-1|0;b[i>>0]=(d>>>0)%10|0|48;if(d>>>0<10){j=i;break}else{d=(d>>>0)/10|0;h=i}}}return j|0}function Eg(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=u;u=u+256|0;g=f;if((c|0)>(d|0)&(e&73728|0)==0){e=c-d|0;Ji(g|0,b<<24>>24|0,(e>>>0<256?e:256)|0)|0;if(e>>>0>255){b=c-d|0;d=e;do{yg(a,g,256);d=d+-256|0}while(d>>>0>255);h=b&255}else h=e;yg(a,g,h)}u=f;return}function Fg(a,c,d,e,g,i){a=a|0;c=+c;d=d|0;e=e|0;g=g|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0,s=0,t=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0.0,C=0,D=0.0,E=0,F=0,G=0,H=0.0,J=0,K=0,L=0,M=0,N=0,O=0.0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0.0,ga=0.0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0;j=u;u=u+560|0;k=j+8|0;l=j;m=j+524|0;n=m;o=j+512|0;f[l>>2]=0;p=o+12|0;Gg(c)|0;if((I|0)<0){q=-c;r=1;s=10449}else{q=c;r=(g&2049|0)!=0&1;s=(g&2048|0)==0?((g&1|0)==0?10450:10455):10452}Gg(q)|0;do if(0==0&(I&2146435072|0)==2146435072){t=(i&32|0)!=0;v=r+3|0;Eg(a,32,d,v,g&-65537);yg(a,s,r);yg(a,q!=q|0.0!=0.0?(t?10476:10480):t?10468:10472,3);Eg(a,32,d,v,g^8192);w=v}else{c=+lg(q,l)*2.0;v=c!=0.0;if(v)f[l>>2]=(f[l>>2]|0)+-1;t=i|32;if((t|0)==97){x=i&32;y=(x|0)==0?s:s+9|0;z=r|2;A=12-e|0;do if(!(e>>>0>11|(A|0)==0)){B=8.0;C=A;do{C=C+-1|0;B=B*16.0}while((C|0)!=0);if((b[y>>0]|0)==45){D=-(B+(-c-B));break}else{D=c+B-B;break}}else D=c;while(0);A=f[l>>2]|0;C=(A|0)<0?0-A|0:A;E=Dg(C,((C|0)<0)<<31>>31,p)|0;if((E|0)==(p|0)){C=o+11|0;b[C>>0]=48;F=C}else F=E;b[F+-1>>0]=(A>>31&2)+43;A=F+-2|0;b[A>>0]=i+15;E=(e|0)<1;C=(g&8|0)==0;G=m;H=D;while(1){J=~~H;K=G+1|0;b[G>>0]=x|h[10484+J>>0];H=(H-+(J|0))*16.0;if((K-n|0)==1?!(C&(E&H==0.0)):0){b[K>>0]=46;L=G+2|0}else L=K;if(!(H!=0.0))break;else G=L}G=L;if((e|0)!=0?(-2-n+G|0)<(e|0):0){M=G-n|0;N=e+2|0}else{E=G-n|0;M=E;N=E}E=p-A|0;G=E+z+N|0;Eg(a,32,d,G,g);yg(a,y,z);Eg(a,48,d,G,g^65536);yg(a,m,M);Eg(a,48,N-M|0,0,0);yg(a,A,E);Eg(a,32,d,G,g^8192);w=G;break}G=(e|0)<0?6:e;if(v){E=(f[l>>2]|0)+-28|0;f[l>>2]=E;O=c*268435456.0;P=E}else{O=c;P=f[l>>2]|0}E=(P|0)<0?k:k+288|0;C=E;H=O;do{x=~~H>>>0;f[C>>2]=x;C=C+4|0;H=(H-+(x>>>0))*1.0e9}while(H!=0.0);if((P|0)>0){v=E;A=C;z=P;while(1){y=(z|0)<29?z:29;x=A+-4|0;if(x>>>0>=v>>>0){K=x;x=0;do{J=Fi(f[K>>2]|0,0,y|0)|0;Q=yi(J|0,I|0,x|0,0)|0;J=I;R=Di(Q|0,J|0,1e9,0)|0;f[K>>2]=R;x=Ci(Q|0,J|0,1e9,0)|0;K=K+-4|0}while(K>>>0>=v>>>0);if(x){K=v+-4|0;f[K>>2]=x;S=K}else S=v}else S=v;K=A;while(1){if(K>>>0<=S>>>0)break;J=K+-4|0;if(!(f[J>>2]|0))K=J;else break}x=(f[l>>2]|0)-y|0;f[l>>2]=x;if((x|0)>0){v=S;A=K;z=x}else{T=S;U=K;V=x;break}}}else{T=E;U=C;V=P}if((V|0)<0){z=((G+25|0)/9|0)+1|0;A=(t|0)==102;v=T;x=U;J=V;while(1){Q=0-J|0;R=(Q|0)<9?Q:9;if(v>>>0<x>>>0){Q=(1<<R)+-1|0;W=1e9>>>R;Y=0;Z=v;do{_=f[Z>>2]|0;f[Z>>2]=(_>>>R)+Y;Y=X(_&Q,W)|0;Z=Z+4|0}while(Z>>>0<x>>>0);Z=(f[v>>2]|0)==0?v+4|0:v;if(!Y){$=Z;aa=x}else{f[x>>2]=Y;$=Z;aa=x+4|0}}else{$=(f[v>>2]|0)==0?v+4|0:v;aa=x}Z=A?E:$;W=(aa-Z>>2|0)>(z|0)?Z+(z<<2)|0:aa;J=(f[l>>2]|0)+R|0;f[l>>2]=J;if((J|0)>=0){ba=$;ca=W;break}else{v=$;x=W}}}else{ba=T;ca=U}x=E;if(ba>>>0<ca>>>0){v=(x-ba>>2)*9|0;J=f[ba>>2]|0;if(J>>>0<10)da=v;else{z=v;v=10;while(1){v=v*10|0;A=z+1|0;if(J>>>0<v>>>0){da=A;break}else z=A}}}else da=0;z=(t|0)==103;v=(G|0)!=0;J=G-((t|0)!=102?da:0)+((v&z)<<31>>31)|0;if((J|0)<(((ca-x>>2)*9|0)+-9|0)){A=J+9216|0;J=E+4+(((A|0)/9|0)+-1024<<2)|0;C=(A|0)%9|0;if((C|0)<8){A=C;C=10;while(1){W=C*10|0;if((A|0)<7){A=A+1|0;C=W}else{ea=W;break}}}else ea=10;C=f[J>>2]|0;A=(C>>>0)%(ea>>>0)|0;t=(J+4|0)==(ca|0);if(!(t&(A|0)==0)){B=(((C>>>0)/(ea>>>0)|0)&1|0)==0?9007199254740992.0:9007199254740994.0;W=(ea|0)/2|0;H=A>>>0<W>>>0?.5:t&(A|0)==(W|0)?1.0:1.5;if(!r){fa=H;ga=B}else{W=(b[s>>0]|0)==45;fa=W?-H:H;ga=W?-B:B}W=C-A|0;f[J>>2]=W;if(ga+fa!=ga){A=W+ea|0;f[J>>2]=A;if(A>>>0>999999999){A=ba;W=J;while(1){C=W+-4|0;f[W>>2]=0;if(C>>>0<A>>>0){t=A+-4|0;f[t>>2]=0;ha=t}else ha=A;t=(f[C>>2]|0)+1|0;f[C>>2]=t;if(t>>>0>999999999){A=ha;W=C}else{ia=ha;ja=C;break}}}else{ia=ba;ja=J}W=(x-ia>>2)*9|0;A=f[ia>>2]|0;if(A>>>0<10){ka=ja;la=W;ma=ia}else{C=W;W=10;while(1){W=W*10|0;t=C+1|0;if(A>>>0<W>>>0){ka=ja;la=t;ma=ia;break}else C=t}}}else{ka=J;la=da;ma=ba}}else{ka=J;la=da;ma=ba}C=ka+4|0;na=la;oa=ca>>>0>C>>>0?C:ca;pa=ma}else{na=da;oa=ca;pa=ba}C=oa;while(1){if(C>>>0<=pa>>>0){qa=0;break}W=C+-4|0;if(!(f[W>>2]|0))C=W;else{qa=1;break}}J=0-na|0;do if(z){W=G+((v^1)&1)|0;if((W|0)>(na|0)&(na|0)>-5){ra=i+-1|0;sa=W+-1-na|0}else{ra=i+-2|0;sa=W+-1|0}W=g&8;if(!W){if(qa?(A=f[C+-4>>2]|0,(A|0)!=0):0)if(!((A>>>0)%10|0)){t=0;Z=10;while(1){Z=Z*10|0;Q=t+1|0;if((A>>>0)%(Z>>>0)|0|0){ta=Q;break}else t=Q}}else ta=0;else ta=9;t=((C-x>>2)*9|0)+-9|0;if((ra|32|0)==102){Z=t-ta|0;A=(Z|0)>0?Z:0;ua=ra;va=(sa|0)<(A|0)?sa:A;wa=0;break}else{A=t+na-ta|0;t=(A|0)>0?A:0;ua=ra;va=(sa|0)<(t|0)?sa:t;wa=0;break}}else{ua=ra;va=sa;wa=W}}else{ua=i;va=G;wa=g&8}while(0);G=va|wa;x=(G|0)!=0&1;v=(ua|32|0)==102;if(v){xa=0;ya=(na|0)>0?na:0}else{z=(na|0)<0?J:na;t=Dg(z,((z|0)<0)<<31>>31,p)|0;z=p;if((z-t|0)<2){A=t;while(1){Z=A+-1|0;b[Z>>0]=48;if((z-Z|0)<2)A=Z;else{za=Z;break}}}else za=t;b[za+-1>>0]=(na>>31&2)+43;A=za+-2|0;b[A>>0]=ua;xa=A;ya=z-A|0}A=r+1+va+x+ya|0;Eg(a,32,d,A,g);yg(a,s,r);Eg(a,48,d,A,g^65536);if(v){J=pa>>>0>E>>>0?E:pa;Z=m+9|0;R=Z;Y=m+8|0;Q=J;do{K=Dg(f[Q>>2]|0,0,Z)|0;if((Q|0)==(J|0))if((K|0)==(Z|0)){b[Y>>0]=48;Aa=Y}else Aa=K;else if(K>>>0>m>>>0){Ji(m|0,48,K-n|0)|0;y=K;while(1){_=y+-1|0;if(_>>>0>m>>>0)y=_;else{Aa=_;break}}}else Aa=K;yg(a,Aa,R-Aa|0);Q=Q+4|0}while(Q>>>0<=E>>>0);if(G|0)yg(a,10500,1);if(Q>>>0<C>>>0&(va|0)>0){E=va;R=Q;while(1){Y=Dg(f[R>>2]|0,0,Z)|0;if(Y>>>0>m>>>0){Ji(m|0,48,Y-n|0)|0;J=Y;while(1){v=J+-1|0;if(v>>>0>m>>>0)J=v;else{Ba=v;break}}}else Ba=Y;yg(a,Ba,(E|0)<9?E:9);R=R+4|0;J=E+-9|0;if(!(R>>>0<C>>>0&(E|0)>9)){Ca=J;break}else E=J}}else Ca=va;Eg(a,48,Ca+9|0,9,0)}else{E=qa?C:pa+4|0;if((va|0)>-1){R=m+9|0;Z=(wa|0)==0;Q=R;G=0-n|0;J=m+8|0;K=va;v=pa;while(1){x=Dg(f[v>>2]|0,0,R)|0;if((x|0)==(R|0)){b[J>>0]=48;Da=J}else Da=x;do if((v|0)==(pa|0)){x=Da+1|0;yg(a,Da,1);if(Z&(K|0)<1){Ea=x;break}yg(a,10500,1);Ea=x}else{if(Da>>>0<=m>>>0){Ea=Da;break}Ji(m|0,48,Da+G|0)|0;x=Da;while(1){z=x+-1|0;if(z>>>0>m>>>0)x=z;else{Ea=z;break}}}while(0);Y=Q-Ea|0;yg(a,Ea,(K|0)>(Y|0)?Y:K);x=K-Y|0;v=v+4|0;if(!(v>>>0<E>>>0&(x|0)>-1)){Fa=x;break}else K=x}}else Fa=va;Eg(a,48,Fa+18|0,18,0);yg(a,xa,p-xa|0)}Eg(a,32,d,A,g^8192);w=A}while(0);u=j;return ((w|0)<(d|0)?d:w)|0}function Gg(a){a=+a;var b=0;p[s>>3]=a;b=f[s>>2]|0;I=f[s+4>>2]|0;return b|0}function Hg(a,c,d){a=a|0;c=c|0;d=d|0;var e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;e=d+16|0;g=f[e>>2]|0;if(!g)if(!(Ig(d)|0)){h=f[e>>2]|0;i=5}else j=0;else{h=g;i=5}a:do if((i|0)==5){g=d+20|0;e=f[g>>2]|0;k=e;if((h-e|0)>>>0<c>>>0){j=Yb[f[d+36>>2]&7](d,a,c)|0;break}b:do if((b[d+75>>0]|0)>-1){e=c;while(1){if(!e){l=0;m=a;n=c;o=k;break b}p=e+-1|0;if((b[a+p>>0]|0)==10)break;else e=p}p=Yb[f[d+36>>2]&7](d,a,e)|0;if(p>>>0<e>>>0){j=p;break a}l=e;m=a+e|0;n=c-e|0;o=f[g>>2]|0}else{l=0;m=a;n=c;o=k}while(0);Hi(o|0,m|0,n|0)|0;f[g>>2]=(f[g>>2]|0)+n;j=l+n|0}while(0);return j|0}function Ig(a){a=a|0;var c=0,d=0,e=0;c=a+74|0;d=b[c>>0]|0;b[c>>0]=d+255|d;d=f[a>>2]|0;if(!(d&8)){f[a+8>>2]=0;f[a+4>>2]=0;c=f[a+44>>2]|0;f[a+28>>2]=c;f[a+20>>2]=c;f[a+16>>2]=c+(f[a+48>>2]|0);e=0}else{f[a>>2]=d|32;e=-1}return e|0}function Jg(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,g=0;d=a+20|0;e=f[d>>2]|0;g=(f[a+16>>2]|0)-e|0;a=g>>>0>c>>>0?c:g;Hi(e|0,b|0,a|0)|0;f[d>>2]=(f[d>>2]|0)+a;return c|0}function Kg(a,c,d){a=a|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;a:do if(!d)e=0;else{f=a;g=d;h=c;while(1){i=b[f>>0]|0;j=b[h>>0]|0;if(i<<24>>24!=j<<24>>24)break;g=g+-1|0;if(!g){e=0;break a}else{f=f+1|0;h=h+1|0}}e=(i&255)-(j&255)|0}while(0);return e|0}function Lg(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0;d=u;u=u+16|0;e=d;f[e>>2]=c;c=ug(a,b,e)|0;u=d;return c|0}function Mg(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,g=0,h=0,i=0,j=0;e=X(c,b)|0;g=(b|0)==0?0:c;if((f[d+76>>2]|0)>-1){c=(wg(d)|0)==0;h=Hg(a,e,d)|0;if(c)i=h;else{xg(d);i=h}}else i=Hg(a,e,d)|0;if((i|0)==(e|0))j=g;else j=(i>>>0)/(b>>>0)|0;return j|0}function Ng(a,c){a=a|0;c=c|0;var d=0,e=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0;d=u;u=u+16|0;e=d;g=c&255;b[e>>0]=g;i=a+16|0;j=f[i>>2]|0;if(!j)if(!(Ig(a)|0)){k=f[i>>2]|0;l=4}else m=-1;else{k=j;l=4}do if((l|0)==4){j=a+20|0;i=f[j>>2]|0;if(i>>>0<k>>>0?(n=c&255,(n|0)!=(b[a+75>>0]|0)):0){f[j>>2]=i+1;b[i>>0]=g;m=n;break}if((Yb[f[a+36>>2]&7](a,e,1)|0)==1)m=h[e>>0]|0;else m=-1}while(0);u=d;return m|0}function Og(a){a=a|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0;c=a;while(1){d=c+1|0;if(!(mg(b[c>>0]|0)|0))break;else c=d}a=b[c>>0]|0;switch(a<<24>>24|0){case 45:{e=1;f=5;break}case 43:{e=0;f=5;break}default:{g=0;h=c;i=a}}if((f|0)==5){g=e;h=d;i=b[d>>0]|0}if(!(og(i<<24>>24)|0))j=0;else{i=0;d=h;while(1){h=(i*10|0)+48-(b[d>>0]|0)|0;d=d+1|0;if(!(og(b[d>>0]|0)|0)){j=h;break}else i=h}}return (g|0?j:0-j|0)|0}function Pg(a,c){a=a|0;c=c|0;var d=0,e=0,g=0,h=0,i=0,j=0,k=0;if((f[c+76>>2]|0)>=0?(wg(c)|0)!=0:0){d=a&255;e=a&255;if((e|0)!=(b[c+75>>0]|0)?(g=c+20|0,h=f[g>>2]|0,h>>>0<(f[c+16>>2]|0)>>>0):0){f[g>>2]=h+1;b[h>>0]=d;i=e}else i=Ng(c,a)|0;xg(c);j=i}else k=3;do if((k|0)==3){i=a&255;e=a&255;if((e|0)!=(b[c+75>>0]|0)?(d=c+20|0,h=f[d>>2]|0,h>>>0<(f[c+16>>2]|0)>>>0):0){f[d>>2]=h+1;b[h>>0]=i;j=e;break}j=Ng(c,a)|0}while(0);return j|0}function Qg(){var a=0,b=0,c=0,d=0;a=u;u=u+16|0;b=a;if(!(Da(1,b|0)|0)){c=f[b>>2]|0;d=f[b+4>>2]|0;b=xi(c|0,((c|0)<0)<<31>>31|0,1e9,0)|0;c=yi(b|0,I|0,d|0,((d|0)<0)<<31>>31|0)|0;u=a;return c|0}else{c=Xf()|0;Ah(f[c>>2]|0,10502)}return 0}function Rg(a,c){a=a|0;c=c|0;b[a>>0]=b[c>>0]|0;return}function Sg(a){a=a|0;return a&255|0}function Tg(a,b,c){a=a|0;b=b|0;c=c|0;if(b|0)Ji(a|0,(Sg(c)|0)&255|0,b|0)|0;return a|0}function Ug(a){a=a|0;return _f(a)|0}function Vg(a,b,c){a=a|0;b=b|0;c=c|0;if(c|0)Hi(a|0,b|0,c|0)|0;return a|0}function Wg(a){a=a|0;Ca()}function Xg(a){a=a|0;return}function Yg(a,b){a=a|0;b=b|0;return 0}function Zg(a){a=a|0;_g(a+4|0);return}function _g(a){a=a|0;f[a>>2]=(f[a>>2]|0)+1;return}function $g(a){a=a|0;var b=0;if((ah(a+4|0)|0)==-1){_b[f[(f[a>>2]|0)+8>>2]&63](a);b=1}else b=0;return b|0}function ah(a){a=a|0;var b=0;b=f[a>>2]|0;f[a>>2]=b+-1;return b+-1|0}function bh(a){a=a|0;Zg(a);return}function ch(a){a=a|0;_g(a+8|0);return}function dh(a){a=a|0;if($g(a)|0)eh(a);return}function eh(a){a=a|0;var b=0;b=a+8|0;if(!((f[b>>2]|0)!=0?(ah(b)|0)!=-1:0))_b[f[(f[a>>2]|0)+16>>2]&63](a);return}function fh(a){a=a|0;var b=0,c=0,d=0,e=0;b=a+4|0;c=f[b>>2]|0;while(1){if((c|0)==-1){d=0;break}e=f[b>>2]|0;if((e|0)==(c|0))f[b>>2]=c+1;if((e|0)==(c|0)){d=a;break}c=e}return d|0}function gh(a){a=a|0;var b=0,c=0;b=(a|0)==0?1:a;while(1){a=Sf(b)|0;if(a|0){c=a;break}a=si()|0;if(!a){c=0;break}Zb[a&3]()}return c|0}function hh(a){a=a|0;Tf(a);return}function ih(a,b){a=a|0;b=b|0;var c=0,d=0,e=0;c=_f(b)|0;d=gh(c+13|0)|0;f[d>>2]=c;f[d+4>>2]=c;f[d+8>>2]=0;e=jh(d)|0;Hi(e|0,b|0,c+1|0)|0;f[a>>2]=e;return}function jh(a){a=a|0;return a+12|0}function kh(a,b){a=a|0;b=b|0;f[a>>2]=1636;ih(a+4|0,b);return}function lh(a){a=a|0;return 1}function mh(a){a=a|0;Ca()}function nh(a){a=a|0;if((b[a+11>>0]|0)<0)hh(f[a>>2]|0);return}function oh(a,c,d,e,g,h,i,j){a=a|0;c=c|0;d=d|0;e=e|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0;k=u;u=u+16|0;l=k;if((-18-c|0)>>>0<d>>>0)mh(a);if((b[a+11>>0]|0)<0)m=f[a>>2]|0;else m=a;if(c>>>0<2147483623){n=d+c|0;d=c<<1;o=n>>>0<d>>>0?d:n;p=o>>>0<11?11:o+16&-16}else p=-17;o=gh(p)|0;if(g|0)Vg(o,m,g)|0;if(i|0)Vg(o+g|0,j,i)|0;j=e-h|0;e=j-g|0;if(e|0)Vg(o+g+i|0,m+g+h|0,e)|0;if((c|0)!=10)hh(m);f[a>>2]=o;f[a+8>>2]=p|-2147483648;p=j+i|0;f[a+4>>2]=p;b[l>>0]=0;Rg(o+p|0,l);u=k;return}function ph(a,c,d){a=a|0;c=c|0;d=d|0;var e=0,g=0,h=0,i=0,j=0,k=0;e=u;u=u+16|0;g=e;h=a+11|0;i=b[h>>0]|0;j=i<<24>>24<0;if(j)k=f[a+4>>2]|0;else k=i&255;do if(k>>>0>=c>>>0)if(j){i=(f[a>>2]|0)+c|0;b[g>>0]=0;Rg(i,g);f[a+4>>2]=c;break}else{b[g>>0]=0;Rg(a+c|0,g);b[h>>0]=c;break}else qh(a,c-k|0,d)|0;while(0);u=e;return}function qh(a,c,d){a=a|0;c=c|0;d=d|0;var e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;e=u;u=u+16|0;g=e;if(c|0){h=a+11|0;i=b[h>>0]|0;if(i<<24>>24<0){j=f[a+4>>2]|0;k=(f[a+8>>2]&2147483647)+-1|0}else{j=i&255;k=10}if((k-j|0)>>>0<c>>>0){rh(a,k,c-k+j|0,j,j,0,0);l=b[h>>0]|0}else l=i;if(l<<24>>24<0)m=f[a>>2]|0;else m=a;Tg(m+j|0,c,d)|0;d=j+c|0;if((b[h>>0]|0)<0)f[a+4>>2]=d;else b[h>>0]=d;b[g>>0]=0;Rg(m+d|0,g)}u=e;return a|0}function rh(a,c,d,e,g,h,i){a=a|0;c=c|0;d=d|0;e=e|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0;if((-17-c|0)>>>0<d>>>0)mh(a);if((b[a+11>>0]|0)<0)j=f[a>>2]|0;else j=a;if(c>>>0<2147483623){k=d+c|0;d=c<<1;l=k>>>0<d>>>0?d:k;m=l>>>0<11?11:l+16&-16}else m=-17;l=gh(m)|0;if(g|0)Vg(l,j,g)|0;k=e-h-g|0;if(k|0)Vg(l+g+i|0,j+g+h|0,k)|0;if((c|0)!=10)hh(j);f[a>>2]=l;f[a+8>>2]=m|-2147483648;return}function sh(a,c,d){a=a|0;c=c|0;d=d|0;var e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;e=u;u=u+16|0;g=e;h=a+11|0;i=b[h>>0]|0;j=i<<24>>24<0;if(j){k=f[a+4>>2]|0;l=(f[a+8>>2]&2147483647)+-1|0}else{k=i&255;l=10}if((l-k|0)>>>0>=d>>>0){if(d|0){if(j)m=f[a>>2]|0;else m=a;Vg(m+k|0,c,d)|0;j=k+d|0;if((b[h>>0]|0)<0)f[a+4>>2]=j;else b[h>>0]=j;b[g>>0]=0;Rg(m+j|0,g)}}else oh(a,l,d-l+k|0,k,k,0,d,c);u=e;return a|0}function th(a,b){a=a|0;b=b|0;return sh(a,b,Ug(b)|0)|0}function uh(a,b){a=a|0;b=b|0;var c=0,d=0;c=u;u=u+16|0;d=c;vh(d);wh(a,d,b);nh(d);u=c;return}function vh(a){a=a|0;var c=0,d=0;f[a>>2]=0;f[a+4>>2]=0;f[a+8>>2]=0;c=0;while(1){if((c|0)==3)break;f[a+(c<<2)>>2]=0;c=c+1|0}if((b[a+11>>0]|0)<0)d=(f[a+8>>2]&2147483647)+-1|0;else d=10;ph(a,d,0);return}function wh(a,c,d){a=a|0;c=c|0;d=d|0;var e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;e=u;u=u+16|0;g=e;h=c+11|0;i=b[h>>0]|0;if(i<<24>>24<0)j=f[c+4>>2]|0;else j=i&255;k=j;j=i;while(1){if(j<<24>>24<0)l=f[c>>2]|0;else l=c;f[g>>2]=d;m=sg(l,k+1|0,10595,g)|0;if((m|0)>-1)if(m>>>0>k>>>0)n=m;else break;else n=k<<1|1;ph(c,n,0);k=n;j=b[h>>0]|0}ph(c,m,0);f[a>>2]=f[c>>2];f[a+4>>2]=f[c+4>>2];f[a+8>>2]=f[c+8>>2];a=0;while(1){if((a|0)==3)break;f[c+(a<<2)>>2]=0;a=a+1|0}u=e;return}function xh(a,b){a=a|0;b=+b;var c=0,d=0;c=u;u=u+16|0;d=c;yh(d);zh(a,d,b);nh(d);u=c;return}function yh(a){a=a|0;var c=0,d=0;f[a>>2]=0;f[a+4>>2]=0;f[a+8>>2]=0;c=0;while(1){if((c|0)==3)break;f[a+(c<<2)>>2]=0;c=c+1|0}if((b[a+11>>0]|0)<0)d=(f[a+8>>2]&2147483647)+-1|0;else d=10;ph(a,d,0);return}function zh(a,c,d){a=a|0;c=c|0;d=+d;var e=0,g=0,h=0,i=0,j=0,k=0.0,l=0,m=0,n=0,o=0;e=u;u=u+16|0;g=e;h=c+11|0;i=b[h>>0]|0;if(i<<24>>24<0)j=f[c+4>>2]|0;else j=i&255;k=d;l=j;j=i;while(1){if(j<<24>>24<0)m=f[c>>2]|0;else m=c;p[g>>3]=k;n=sg(m,l+1|0,10598,g)|0;if((n|0)>-1)if(n>>>0>l>>>0)o=n;else break;else o=l<<1|1;ph(c,o,0);l=o;j=b[h>>0]|0}ph(c,n,0);f[a>>2]=f[c>>2];f[a+4>>2]=f[c+4>>2];f[a+8>>2]=f[c+8>>2];a=0;while(1){if((a|0)==3)break;f[c+(a<<2)>>2]=0;a=a+1|0}u=e;return}function Ah(a,b){a=a|0;b=b|0;Ca()}function Bh(){var a=0,b=0,c=0,d=0,e=0,g=0,h=0,i=0,j=0,k=0;a=u;u=u+48|0;b=a+32|0;c=a+24|0;d=a+16|0;e=a;g=a+36|0;a=Ch()|0;if(a|0?(h=f[a>>2]|0,h|0):0){a=h+48|0;i=f[a>>2]|0;j=f[a+4>>2]|0;if(!((i&-256|0)==1126902528&(j|0)==1129074247)){f[c>>2]=10737;Dh(10687,c)}if((i|0)==1126902529&(j|0)==1129074247)k=f[h+44>>2]|0;else k=h+80|0;f[g>>2]=k;k=f[h>>2]|0;h=f[k+4>>2]|0;if(Yb[f[(f[60]|0)+16>>2]&7](240,k,g)|0){k=f[g>>2]|0;g=Wb[f[(f[k>>2]|0)+8>>2]&7](k)|0;f[e>>2]=10737;f[e+4>>2]=h;f[e+8>>2]=g;Dh(10601,e)}else{f[d>>2]=10737;f[d+4>>2]=h;Dh(10646,d)}}Dh(10725,b)}function Ch(){var a=0,b=0;a=u;u=u+16|0;if(!(Rb(12516,3)|0)){b=Pb(f[3130]|0)|0;u=a;return b|0}else Dh(10876,a);return 0}function Dh(a,b){a=a|0;b=b|0;var c=0,d=0;c=u;u=u+16|0;d=c;f[d>>2]=b;b=f[262]|0;ug(b,a,d)|0;Pg(10,b)|0;Ca()}function Eh(a){a=a|0;return}function Fh(a){a=a|0;Eh(a);hh(a);return}function Gh(a){a=a|0;return}function Hh(a){a=a|0;return}function Ih(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,g=0,h=0,i=0,j=0;d=u;u=u+64|0;e=d;if(!(Mh(a,b,0)|0))if((b|0)!=0?(g=Qh(b,264,248,0)|0,(g|0)!=0):0){b=e+4|0;h=b+52|0;do{f[b>>2]=0;b=b+4|0}while((b|0)<(h|0));f[e>>2]=g;f[e+8>>2]=a;f[e+12>>2]=-1;f[e+48>>2]=1;bc[f[(f[g>>2]|0)+28>>2]&3](g,e,f[c>>2]|0,1);if((f[e+24>>2]|0)==1){f[c>>2]=f[e+16>>2];i=1}else i=0;j=i}else j=0;else j=1;u=d;return j|0}function Jh(a,b,c,d,e,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;g=g|0;if(Mh(a,f[b+8>>2]|0,g)|0)Ph(0,b,c,d,e);return}function Kh(a,c,d,e,g){a=a|0;c=c|0;d=d|0;e=e|0;g=g|0;var h=0;do if(!(Mh(a,f[c+8>>2]|0,g)|0)){if(Mh(a,f[c>>2]|0,g)|0){if((f[c+16>>2]|0)!=(d|0)?(h=c+20|0,(f[h>>2]|0)!=(d|0)):0){f[c+32>>2]=e;f[h>>2]=d;h=c+40|0;f[h>>2]=(f[h>>2]|0)+1;if((f[c+36>>2]|0)==1?(f[c+24>>2]|0)==2:0)b[c+54>>0]=1;f[c+44>>2]=4;break}if((e|0)==1)f[c+32>>2]=1}}else Oh(0,c,d,e);while(0);return}function Lh(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;if(Mh(a,f[b+8>>2]|0,0)|0)Nh(0,b,c,d);return}function Mh(a,b,c){a=a|0;b=b|0;c=c|0;return (a|0)==(b|0)|0}function Nh(a,c,d,e){a=a|0;c=c|0;d=d|0;e=e|0;var g=0,h=0;a=c+16|0;g=f[a>>2]|0;do if(g){if((g|0)!=(d|0)){h=c+36|0;f[h>>2]=(f[h>>2]|0)+1;f[c+24>>2]=2;b[c+54>>0]=1;break}h=c+24|0;if((f[h>>2]|0)==2)f[h>>2]=e}else{f[a>>2]=d;f[c+24>>2]=e;f[c+36>>2]=1}while(0);return}function Oh(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;if((f[b+4>>2]|0)==(c|0)?(c=b+28|0,(f[c>>2]|0)!=1):0)f[c>>2]=d;return}function Ph(a,c,d,e,g){a=a|0;c=c|0;d=d|0;e=e|0;g=g|0;var h=0,i=0;b[c+53>>0]=1;do if((f[c+4>>2]|0)==(e|0)){b[c+52>>0]=1;a=c+16|0;h=f[a>>2]|0;if(!h){f[a>>2]=d;f[c+24>>2]=g;f[c+36>>2]=1;if(!((g|0)==1?(f[c+48>>2]|0)==1:0))break;b[c+54>>0]=1;break}if((h|0)!=(d|0)){h=c+36|0;f[h>>2]=(f[h>>2]|0)+1;b[c+54>>0]=1;break}h=c+24|0;a=f[h>>2]|0;if((a|0)==2){f[h>>2]=g;i=g}else i=a;if((i|0)==1?(f[c+48>>2]|0)==1:0)b[c+54>>0]=1}while(0);return}function Qh(a,c,e,g){a=a|0;c=c|0;e=e|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;h=u;u=u+64|0;i=h;j=f[a>>2]|0;k=a+(f[j+-8>>2]|0)|0;l=f[j+-4>>2]|0;f[i>>2]=e;f[i+4>>2]=a;f[i+8>>2]=c;f[i+12>>2]=g;g=i+16|0;c=i+20|0;a=i+24|0;j=i+28|0;m=i+32|0;n=i+40|0;o=g;p=o+36|0;do{f[o>>2]=0;o=o+4|0}while((o|0)<(p|0));d[g+36>>1]=0;b[g+38>>0]=0;a:do if(Mh(l,e,0)|0){f[i+48>>2]=1;dc[f[(f[l>>2]|0)+20>>2]&3](l,i,k,k,1,0);q=(f[a>>2]|0)==1?k:0}else{cc[f[(f[l>>2]|0)+24>>2]&3](l,i,k,1,0);switch(f[i+36>>2]|0){case 0:{q=(f[n>>2]|0)==1&(f[j>>2]|0)==1&(f[m>>2]|0)==1?f[c>>2]|0:0;break a;break}case 1:break;default:{q=0;break a}}if((f[a>>2]|0)!=1?!((f[n>>2]|0)==0&(f[j>>2]|0)==1&(f[m>>2]|0)==1):0){q=0;break}q=f[g>>2]|0}while(0);u=h;return q|0}function Rh(a){a=a|0;Eh(a);hh(a);return}function Sh(a,b,c,d,e,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;g=g|0;var h=0;if(Mh(a,f[b+8>>2]|0,g)|0)Ph(0,b,c,d,e);else{h=f[a+8>>2]|0;dc[f[(f[h>>2]|0)+20>>2]&3](h,b,c,d,e,g)}return}function Th(a,c,d,e,g){a=a|0;c=c|0;d=d|0;e=e|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;do if(!(Mh(a,f[c+8>>2]|0,g)|0)){if(!(Mh(a,f[c>>2]|0,g)|0)){h=f[a+8>>2]|0;cc[f[(f[h>>2]|0)+24>>2]&3](h,c,d,e,g);break}if((f[c+16>>2]|0)!=(d|0)?(h=c+20|0,(f[h>>2]|0)!=(d|0)):0){f[c+32>>2]=e;i=c+44|0;if((f[i>>2]|0)==4)break;j=c+52|0;b[j>>0]=0;k=c+53|0;b[k>>0]=0;l=f[a+8>>2]|0;dc[f[(f[l>>2]|0)+20>>2]&3](l,c,d,d,1,g);if(b[k>>0]|0)if(!(b[j>>0]|0)){m=3;n=11}else o=3;else{m=4;n=11}if((n|0)==11){f[h>>2]=d;h=c+40|0;f[h>>2]=(f[h>>2]|0)+1;if((f[c+36>>2]|0)==1?(f[c+24>>2]|0)==2:0){b[c+54>>0]=1;o=m}else o=m}f[i>>2]=o;break}if((e|0)==1)f[c+32>>2]=1}else Oh(0,c,d,e);while(0);return}function Uh(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;if(Mh(a,f[b+8>>2]|0,0)|0)Nh(0,b,c,d);else{e=f[a+8>>2]|0;bc[f[(f[e>>2]|0)+28>>2]&3](e,b,c,d)}return}function Vh(a){a=a|0;return}function Wh(){var a=0;a=u;u=u+16|0;if(!(Qb(12520,39)|0)){u=a;return}else Dh(10925,a)}function Xh(a){a=a|0;var b=0;b=u;u=u+16|0;Tf(a);if(!(Sb(f[3130]|0,0)|0)){u=b;return}else Dh(10975,b)}function Yh(){var a=0,b=0;a=Ch()|0;if((a|0?(b=f[a>>2]|0,b|0):0)?(a=b+48|0,(f[a>>2]&-256|0)==1126902528?(f[a+4>>2]|0)==1129074247:0):0)Zh(f[b+12>>2]|0);Zh(_h()|0)}function Zh(a){a=a|0;var b=0;b=u;u=u+16|0;Zb[a&3]();Dh(11028,b)}function _h(){var a=0;a=f[386]|0;f[386]=a+0;return a|0}function $h(a){a=a|0;return}function ai(a){a=a|0;f[a>>2]=1636;ei(a+4|0);return}function bi(a){a=a|0;ai(a);hh(a);return}function ci(a){a=a|0;return di(a+4|0)|0}function di(a){a=a|0;return f[a>>2]|0}function ei(a){a=a|0;var b=0,c=0;if(lh(a)|0?(b=fi(f[a>>2]|0)|0,a=b+8|0,c=f[a>>2]|0,f[a>>2]=c+-1,(c+-1|0)<0):0)hh(b);return}function fi(a){a=a|0;return a+-12|0}function gi(a){a=a|0;ai(a);hh(a);return}function hi(a){a=a|0;ai(a);hh(a);return}function ii(a){a=a|0;Eh(a);hh(a);return}function ji(a,c,d,e,g,h){a=a|0;c=c|0;d=d|0;e=e|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;if(Mh(a,f[c+8>>2]|0,h)|0)Ph(0,c,d,e,g);else{i=c+52|0;j=b[i>>0]|0;k=c+53|0;l=b[k>>0]|0;m=f[a+12>>2]|0;n=a+16+(m<<3)|0;b[i>>0]=0;b[k>>0]=0;ni(a+16|0,c,d,e,g,h);a:do if((m|0)>1){o=c+24|0;p=a+8|0;q=c+54|0;r=a+24|0;do{if(b[q>>0]|0)break a;if(!(b[i>>0]|0)){if(b[k>>0]|0?(f[p>>2]&1|0)==0:0)break a}else{if((f[o>>2]|0)==1)break a;if(!(f[p>>2]&2))break a}b[i>>0]=0;b[k>>0]=0;ni(r,c,d,e,g,h);r=r+8|0}while(r>>>0<n>>>0)}while(0);b[i>>0]=j;b[k>>0]=l}return}function ki(a,c,d,e,g){a=a|0;c=c|0;d=d|0;e=e|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;a:do if(!(Mh(a,f[c+8>>2]|0,g)|0)){if(!(Mh(a,f[c>>2]|0,g)|0)){h=f[a+12>>2]|0;i=a+16+(h<<3)|0;oi(a+16|0,c,d,e,g);j=a+24|0;if((h|0)<=1)break;h=f[a+8>>2]|0;if((h&2|0)==0?(k=c+36|0,(f[k>>2]|0)!=1):0){if(!(h&1)){h=c+54|0;l=j;while(1){if(b[h>>0]|0)break a;if((f[k>>2]|0)==1)break a;oi(l,c,d,e,g);l=l+8|0;if(l>>>0>=i>>>0)break a}}l=c+24|0;h=c+54|0;m=j;while(1){if(b[h>>0]|0)break a;if((f[k>>2]|0)==1?(f[l>>2]|0)==1:0)break a;oi(m,c,d,e,g);m=m+8|0;if(m>>>0>=i>>>0)break a}}m=c+54|0;l=j;while(1){if(b[m>>0]|0)break a;oi(l,c,d,e,g);l=l+8|0;if(l>>>0>=i>>>0)break a}}if((f[c+16>>2]|0)!=(d|0)?(i=c+20|0,(f[i>>2]|0)!=(d|0)):0){f[c+32>>2]=e;l=c+44|0;if((f[l>>2]|0)==4)break;m=a+16+(f[a+12>>2]<<3)|0;j=c+52|0;k=c+53|0;h=c+54|0;n=a+8|0;o=c+24|0;p=0;q=a+16|0;r=0;b:while(1){if(q>>>0>=m>>>0){s=p;t=18;break}b[j>>0]=0;b[k>>0]=0;ni(q,c,d,d,1,g);if(b[h>>0]|0){s=p;t=18;break}do if(b[k>>0]|0){if(!(b[j>>0]|0))if(!(f[n>>2]&1)){s=1;t=18;break b}else{u=1;v=r;break}if((f[o>>2]|0)==1){t=23;break b}if(!(f[n>>2]&2)){t=23;break b}else{u=1;v=1}}else{u=p;v=r}while(0);p=u;q=q+8|0;r=v}do if((t|0)==18){if((!r?(f[i>>2]=d,q=c+40|0,f[q>>2]=(f[q>>2]|0)+1,(f[c+36>>2]|0)==1):0)?(f[o>>2]|0)==2:0){b[h>>0]=1;if(s){t=23;break}else{w=4;break}}if(s)t=23;else w=4}while(0);if((t|0)==23)w=3;f[l>>2]=w;break}if((e|0)==1)f[c+32>>2]=1}else Oh(0,c,d,e);while(0);return}function li(a,c,d,e){a=a|0;c=c|0;d=d|0;e=e|0;var g=0,h=0,i=0;a:do if(!(Mh(a,f[c+8>>2]|0,0)|0)){g=f[a+12>>2]|0;h=a+16+(g<<3)|0;mi(a+16|0,c,d,e);if((g|0)>1){g=c+54|0;i=a+24|0;do{mi(i,c,d,e);if(b[g>>0]|0)break a;i=i+8|0}while(i>>>0<h>>>0)}}else Nh(0,c,d,e);while(0);return}function mi(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,g=0,h=0;e=f[a+4>>2]|0;g=e>>8;if(!(e&1))h=g;else h=f[(f[c>>2]|0)+g>>2]|0;g=f[a>>2]|0;bc[f[(f[g>>2]|0)+28>>2]&3](g,b,c+h|0,e&2|0?d:2);return}function ni(a,b,c,d,e,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;g=g|0;var h=0,i=0,j=0;h=f[a+4>>2]|0;i=h>>8;if(!(h&1))j=i;else j=f[(f[d>>2]|0)+i>>2]|0;i=f[a>>2]|0;dc[f[(f[i>>2]|0)+20>>2]&3](i,b,c,d+j|0,h&2|0?e:2,g);return}function oi(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var g=0,h=0,i=0;g=f[a+4>>2]|0;h=g>>8;if(!(g&1))i=h;else i=f[(f[c>>2]|0)+h>>2]|0;h=f[a>>2]|0;cc[f[(f[h>>2]|0)+24>>2]&3](h,b,c+i|0,g&2|0?d:2,e);return}function pi(a){a=a|0;var c=0;if((b[a>>0]|0)==1)c=0;else{b[a>>0]=1;c=1}return c|0}function qi(a){a=a|0;return}function ri(a){a=a|0;return}function si(){var a=0;a=f[3131]|0;f[3131]=a+0;return a|0}function ti(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,g=0;d=u;u=u+16|0;e=d;f[e>>2]=f[c>>2];g=Yb[f[(f[a>>2]|0)+16>>2]&7](a,b,e)|0;if(g)f[c>>2]=f[e>>2];u=d;return g&1|0}function ui(a){a=a|0;var b=0;if(!a)b=0;else b=(Qh(a,264,368,0)|0)!=0&1;return b|0}function vi(){}function wi(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;c=a&65535;d=b&65535;e=X(d,c)|0;f=a>>>16;a=(e>>>16)+(X(d,f)|0)|0;d=b>>>16;b=X(d,c)|0;return (I=(a>>>16)+(X(d,f)|0)+(((a&65535)+b|0)>>>16)|0,a+b<<16|e&65535|0)|0}function xi(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=a;a=c;c=wi(e,a)|0;f=I;return (I=(X(b,a)|0)+(X(d,e)|0)+f|f&0,c|0|0)|0}function yi(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=a+c>>>0;return (I=b+d+(e>>>0<a>>>0|0)>>>0,e|0)|0}function zi(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=b-d>>>0;e=b-d-(c>>>0>a>>>0|0)>>>0;return (I=e,a-c>>>0|0)|0}function Ai(a){a=a|0;var c=0;c=b[w+(a&255)>>0]|0;if((c|0)<8)return c|0;c=b[w+(a>>8&255)>>0]|0;if((c|0)<8)return c+8|0;c=b[w+(a>>16&255)>>0]|0;if((c|0)<8)return c+16|0;return (b[w+(a>>>24)>>0]|0)+24|0}function Bi(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;g=a;h=b;i=h;j=c;k=d;l=k;if(!i){m=(e|0)!=0;if(!l){if(m){f[e>>2]=(g>>>0)%(j>>>0);f[e+4>>2]=0}n=0;o=(g>>>0)/(j>>>0)>>>0;return (I=n,o)|0}else{if(!m){n=0;o=0;return (I=n,o)|0}f[e>>2]=a|0;f[e+4>>2]=b&0;n=0;o=0;return (I=n,o)|0}}m=(l|0)==0;do if(j){if(!m){p=(_(l|0)|0)-(_(i|0)|0)|0;if(p>>>0<=31){q=p+1|0;r=31-p|0;s=p-31>>31;t=q;u=g>>>(q>>>0)&s|i<<r;v=i>>>(q>>>0)&s;w=0;x=g<<r;break}if(!e){n=0;o=0;return (I=n,o)|0}f[e>>2]=a|0;f[e+4>>2]=h|b&0;n=0;o=0;return (I=n,o)|0}r=j-1|0;if(r&j|0){s=(_(j|0)|0)+33-(_(i|0)|0)|0;q=64-s|0;p=32-s|0;y=p>>31;z=s-32|0;A=z>>31;t=s;u=p-1>>31&i>>>(z>>>0)|(i<<p|g>>>(s>>>0))&A;v=A&i>>>(s>>>0);w=g<<q&y;x=(i<<q|g>>>(z>>>0))&y|g<<p&s-33>>31;break}if(e|0){f[e>>2]=r&g;f[e+4>>2]=0}if((j|0)==1){n=h|b&0;o=a|0|0;return (I=n,o)|0}else{r=Ai(j|0)|0;n=i>>>(r>>>0)|0;o=i<<32-r|g>>>(r>>>0)|0;return (I=n,o)|0}}else{if(m){if(e|0){f[e>>2]=(i>>>0)%(j>>>0);f[e+4>>2]=0}n=0;o=(i>>>0)/(j>>>0)>>>0;return (I=n,o)|0}if(!g){if(e|0){f[e>>2]=0;f[e+4>>2]=(i>>>0)%(l>>>0)}n=0;o=(i>>>0)/(l>>>0)>>>0;return (I=n,o)|0}r=l-1|0;if(!(r&l)){if(e|0){f[e>>2]=a|0;f[e+4>>2]=r&i|b&0}n=0;o=i>>>((Ai(l|0)|0)>>>0);return (I=n,o)|0}r=(_(l|0)|0)-(_(i|0)|0)|0;if(r>>>0<=30){s=r+1|0;p=31-r|0;t=s;u=i<<p|g>>>(s>>>0);v=i>>>(s>>>0);w=0;x=g<<p;break}if(!e){n=0;o=0;return (I=n,o)|0}f[e>>2]=a|0;f[e+4>>2]=h|b&0;n=0;o=0;return (I=n,o)|0}while(0);if(!t){B=x;C=w;D=v;E=u;F=0;G=0}else{b=c|0|0;c=k|d&0;d=yi(b|0,c|0,-1,-1)|0;k=I;h=x;x=w;w=v;v=u;u=t;t=0;do{a=h;h=x>>>31|h<<1;x=t|x<<1;g=v<<1|a>>>31|0;a=v>>>31|w<<1|0;zi(d|0,k|0,g|0,a|0)|0;i=I;l=i>>31|((i|0)<0?-1:0)<<1;t=l&1;v=zi(g|0,a|0,l&b|0,(((i|0)<0?-1:0)>>31|((i|0)<0?-1:0)<<1)&c|0)|0;w=I;u=u-1|0}while((u|0)!=0);B=h;C=x;D=w;E=v;F=0;G=t}t=C;C=0;if(e|0){f[e>>2]=E;f[e+4>>2]=D}n=(t|0)>>>31|(B|C)<<1|(C<<1|t>>>31)&0|F;o=(t<<1|0>>>31)&-2|G;return (I=n,o)|0}function Ci(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return Bi(a,b,c,d,0)|0}function Di(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,g=0;e=u;u=u+16|0;g=e|0;Bi(a,b,c,d,g)|0;u=e;return (I=f[g+4>>2]|0,f[g>>2]|0)|0}function Ei(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){I=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}I=0;return b>>>c-32|0}function Fi(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){I=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}I=a<<c-32;return 0}function Gi(a){a=a|0;return (a&255)<<24|(a>>8&255)<<16|(a>>16&255)<<8|a>>>24|0}function Hi(a,c,d){a=a|0;c=c|0;d=d|0;var e=0,g=0,h=0;if((d|0)>=8192)return La(a|0,c|0,d|0)|0;e=a|0;g=a+d|0;if((a&3)==(c&3)){while(a&3){if(!d)return e|0;b[a>>0]=b[c>>0]|0;a=a+1|0;c=c+1|0;d=d-1|0}h=g&-4|0;d=h-64|0;while((a|0)<=(d|0)){f[a>>2]=f[c>>2];f[a+4>>2]=f[c+4>>2];f[a+8>>2]=f[c+8>>2];f[a+12>>2]=f[c+12>>2];f[a+16>>2]=f[c+16>>2];f[a+20>>2]=f[c+20>>2];f[a+24>>2]=f[c+24>>2];f[a+28>>2]=f[c+28>>2];f[a+32>>2]=f[c+32>>2];f[a+36>>2]=f[c+36>>2];f[a+40>>2]=f[c+40>>2];f[a+44>>2]=f[c+44>>2];f[a+48>>2]=f[c+48>>2];f[a+52>>2]=f[c+52>>2];f[a+56>>2]=f[c+56>>2];f[a+60>>2]=f[c+60>>2];a=a+64|0;c=c+64|0}while((a|0)<(h|0)){f[a>>2]=f[c>>2];a=a+4|0;c=c+4|0}}else{h=g-4|0;while((a|0)<(h|0)){b[a>>0]=b[c>>0]|0;b[a+1>>0]=b[c+1>>0]|0;b[a+2>>0]=b[c+2>>0]|0;b[a+3>>0]=b[c+3>>0]|0;a=a+4|0;c=c+4|0}}while((a|0)<(g|0)){b[a>>0]=b[c>>0]|0;a=a+1|0;c=c+1|0}return e|0}function Ii(a,c,d){a=a|0;c=c|0;d=d|0;var e=0;if((c|0)<(a|0)&(a|0)<(c+d|0)){e=a;c=c+d|0;a=a+d|0;while((d|0)>0){a=a-1|0;c=c-1|0;d=d-1|0;b[a>>0]=b[c>>0]|0}a=e}else Hi(a,c,d)|0;return a|0}function Ji(a,c,d){a=a|0;c=c|0;d=d|0;var e=0,g=0,h=0,i=0;e=a+d|0;c=c&255;if((d|0)>=67){while(a&3){b[a>>0]=c;a=a+1|0}g=e&-4|0;h=g-64|0;i=c|c<<8|c<<16|c<<24;while((a|0)<=(h|0)){f[a>>2]=i;f[a+4>>2]=i;f[a+8>>2]=i;f[a+12>>2]=i;f[a+16>>2]=i;f[a+20>>2]=i;f[a+24>>2]=i;f[a+28>>2]=i;f[a+32>>2]=i;f[a+36>>2]=i;f[a+40>>2]=i;f[a+44>>2]=i;f[a+48>>2]=i;f[a+52>>2]=i;f[a+56>>2]=i;f[a+60>>2]=i;a=a+64|0}while((a|0)<(g|0)){f[a>>2]=i;a=a+4|0}}while((a|0)<(e|0)){b[a>>0]=c;a=a+1|0}return e-d|0}function Ki(a){a=a|0;var b=0,c=0;b=f[r>>2]|0;c=b+a|0;if((a|0)>0&(c|0)<(b|0)|(c|0)<0){da()|0;ya(12);return -1}f[r>>2]=c;if((c|0)>(ca()|0)?(ba()|0)==0:0){f[r>>2]=b;ya(12);return -1}return b|0}function Li(a,b){a=a|0;b=b|0;return Wb[a&7](b|0)|0}function Mi(a,b,c){a=a|0;b=b|0;c=c|0;return Xb[a&3](b|0,c|0)|0}function Ni(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return Yb[a&7](b|0,c|0,d|0)|0}function Oi(a){a=a|0;Zb[a&3]()}function Pi(a,b){a=a|0;b=b|0;_b[a&63](b|0)}function Qi(a,b,c){a=a|0;b=b|0;c=c|0;$b[a&7](b|0,c|0)}function Ri(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ac[a&15](b|0,c|0,d|0)}function Si(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;bc[a&3](b|0,c|0,d|0,e|0)}function Ti(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;cc[a&3](b|0,c|0,d|0,e|0,f|0)}function Ui(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;dc[a&3](b|0,c|0,d|0,e|0,f|0,g|0)}function Vi(a){a=a|0;$(0);return 0}function Wi(a,b){a=a|0;b=b|0;$(1);return 0}function Xi(a,b,c){a=a|0;b=b|0;c=c|0;$(2);return 0}function Yi(){$(3)}function Zi(){ua()}function _i(a){a=a|0;$(4)}function $i(a,b){a=a|0;b=b|0;$(5)}function aj(a,b,c){a=a|0;b=b|0;c=c|0;$(6)}function bj(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;$(7)}function cj(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;$(8)}function dj(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;$(9)}

// EMSCRIPTEN_END_FUNCS
var Wb=[Vi,pe,qe,Uf,ci,Vi,Vi,Vi];var Xb=[Wi,Yg,ae,We];var Yb=[Xi,Zf,Vf,Jg,Ih,zc,Ac,Bc];var Zb=[Yi,Zi,Bh,Wh];var _b=[_i,Vc,Wc,Yc,Zc,ud,vd,wd,xd,zd,Ad,Xg,Wd,Xd,Yd,_d,$d,be,fe,ge,ue,ve,Qe,Re,Se,Ue,Ve,Xe,Eh,Fh,Gh,Hh,Rh,ai,bi,gi,hi,ii,pc,Xh,_i,_i,_i,_i,_i,_i,_i,_i,_i,_i,_i,_i,_i,_i,_i,_i,_i,_i,_i,_i,_i,_i,_i,_i];var $b=[$i,Qc,Tc,Uc,ne,oe,re,Jf];var ac=[aj,Rc,Sc,de,ee,se,te,oc,vc,uc,xc,wc,aj,aj,aj,aj];var bc=[bj,Lh,Uh,li];var cc=[cj,Kh,Th,ki];var dc=[dj,Jh,Sh,ji];return{_TerrainGenerator__Update:lc,_TerrainGenerator__UpdateShowBoundingBoxes:mc,__GLOBAL__sub_I_TerrainTileContent_cc:Ye,__GLOBAL__sub_I_WireProgram_cc:Nd,__GLOBAL__sub_I_main_cpp:Cc,___cxa_can_catch:ti,___cxa_is_pointer_type:ui,___errno_location:Xf,___muldi3:xi,___udivdi3:Ci,___uremdi3:Di,_bitshift64Lshr:Ei,_bitshift64Shl:Fi,_emscripten_replace_memory:Vb,_free:Tf,_i64Add:yi,_i64Subtract:zi,_llvm_bswap_i32:Gi,_main:nc,_malloc:Sf,_memcpy:Hi,_memmove:Ii,_memset:Ji,_sbrk:Ki,_updateShowBoundingBoxes:qc,_updateTraverseMainThread:rc,dynCall_ii:Li,dynCall_iii:Mi,dynCall_iiii:Ni,dynCall_v:Oi,dynCall_vi:Pi,dynCall_vii:Qi,dynCall_viii:Ri,dynCall_viiii:Si,dynCall_viiiii:Ti,dynCall_viiiiii:Ui,establishStackSpace:hc,getTempRet0:kc,runPostSets:vi,setTempRet0:jc,setThrew:ic,stackAlloc:ec,stackRestore:gc,stackSave:fc}})


// EMSCRIPTEN_END_ASM
(Module.asmGlobalArg,Module.asmLibraryArg,buffer);var _TerrainGenerator__Update=Module["_TerrainGenerator__Update"]=asm["_TerrainGenerator__Update"];var _TerrainGenerator__UpdateShowBoundingBoxes=Module["_TerrainGenerator__UpdateShowBoundingBoxes"]=asm["_TerrainGenerator__UpdateShowBoundingBoxes"];var __GLOBAL__sub_I_TerrainTileContent_cc=Module["__GLOBAL__sub_I_TerrainTileContent_cc"]=asm["__GLOBAL__sub_I_TerrainTileContent_cc"];var __GLOBAL__sub_I_WireProgram_cc=Module["__GLOBAL__sub_I_WireProgram_cc"]=asm["__GLOBAL__sub_I_WireProgram_cc"];var __GLOBAL__sub_I_main_cpp=Module["__GLOBAL__sub_I_main_cpp"]=asm["__GLOBAL__sub_I_main_cpp"];var ___cxa_can_catch=Module["___cxa_can_catch"]=asm["___cxa_can_catch"];var ___cxa_is_pointer_type=Module["___cxa_is_pointer_type"]=asm["___cxa_is_pointer_type"];var ___errno_location=Module["___errno_location"]=asm["___errno_location"];var ___muldi3=Module["___muldi3"]=asm["___muldi3"];var ___udivdi3=Module["___udivdi3"]=asm["___udivdi3"];var ___uremdi3=Module["___uremdi3"]=asm["___uremdi3"];var _bitshift64Lshr=Module["_bitshift64Lshr"]=asm["_bitshift64Lshr"];var _bitshift64Shl=Module["_bitshift64Shl"]=asm["_bitshift64Shl"];var _emscripten_replace_memory=Module["_emscripten_replace_memory"]=asm["_emscripten_replace_memory"];var _free=Module["_free"]=asm["_free"];var _i64Add=Module["_i64Add"]=asm["_i64Add"];var _i64Subtract=Module["_i64Subtract"]=asm["_i64Subtract"];var _llvm_bswap_i32=Module["_llvm_bswap_i32"]=asm["_llvm_bswap_i32"];var _main=Module["_main"]=asm["_main"];var _malloc=Module["_malloc"]=asm["_malloc"];var _memcpy=Module["_memcpy"]=asm["_memcpy"];var _memmove=Module["_memmove"]=asm["_memmove"];var _memset=Module["_memset"]=asm["_memset"];var _sbrk=Module["_sbrk"]=asm["_sbrk"];var _updateShowBoundingBoxes=Module["_updateShowBoundingBoxes"]=asm["_updateShowBoundingBoxes"];var _updateTraverseMainThread=Module["_updateTraverseMainThread"]=asm["_updateTraverseMainThread"];var establishStackSpace=Module["establishStackSpace"]=asm["establishStackSpace"];var getTempRet0=Module["getTempRet0"]=asm["getTempRet0"];var runPostSets=Module["runPostSets"]=asm["runPostSets"];var setTempRet0=Module["setTempRet0"]=asm["setTempRet0"];var setThrew=Module["setThrew"]=asm["setThrew"];var stackAlloc=Module["stackAlloc"]=asm["stackAlloc"];var stackRestore=Module["stackRestore"]=asm["stackRestore"];var stackSave=Module["stackSave"]=asm["stackSave"];var dynCall_ii=Module["dynCall_ii"]=asm["dynCall_ii"];var dynCall_iii=Module["dynCall_iii"]=asm["dynCall_iii"];var dynCall_iiii=Module["dynCall_iiii"]=asm["dynCall_iiii"];var dynCall_v=Module["dynCall_v"]=asm["dynCall_v"];var dynCall_vi=Module["dynCall_vi"]=asm["dynCall_vi"];var dynCall_vii=Module["dynCall_vii"]=asm["dynCall_vii"];var dynCall_viii=Module["dynCall_viii"]=asm["dynCall_viii"];var dynCall_viiii=Module["dynCall_viiii"]=asm["dynCall_viiii"];var dynCall_viiiii=Module["dynCall_viiiii"]=asm["dynCall_viiiii"];var dynCall_viiiiii=Module["dynCall_viiiiii"]=asm["dynCall_viiiiii"];Module["asm"]=asm;Module["cwrap"]=cwrap;Module["UTF8ToString"]=UTF8ToString;Module["stringToUTF8"]=stringToUTF8;if(memoryInitializer){if(!isDataURI(memoryInitializer)){if(typeof Module["locateFile"]==="function"){memoryInitializer=Module["locateFile"](memoryInitializer)}else if(Module["memoryInitializerPrefixURL"]){memoryInitializer=Module["memoryInitializerPrefixURL"]+memoryInitializer}}if(ENVIRONMENT_IS_NODE||ENVIRONMENT_IS_SHELL){var data=Module["readBinary"](memoryInitializer);HEAPU8.set(data,GLOBAL_BASE)}else{addRunDependency("memory initializer");var applyMemoryInitializer=(function(data){if(data.byteLength)data=new Uint8Array(data);HEAPU8.set(data,GLOBAL_BASE);if(Module["memoryInitializerRequest"])delete Module["memoryInitializerRequest"].response;removeRunDependency("memory initializer")});function doBrowserLoad(){Module["readAsync"](memoryInitializer,applyMemoryInitializer,(function(){throw"could not load memory initializer "+memoryInitializer}))}if(Module["memoryInitializerRequest"]){function useRequest(){var request=Module["memoryInitializerRequest"];var response=request.response;if(request.status!==200&&request.status!==0){console.warn("a problem seems to have happened with Module.memoryInitializerRequest, status: "+request.status+", retrying "+memoryInitializer);doBrowserLoad();return}applyMemoryInitializer(response)}if(Module["memoryInitializerRequest"].response){setTimeout(useRequest,0)}else{Module["memoryInitializerRequest"].addEventListener("load",useRequest)}}else{doBrowserLoad()}}}Module["then"]=(function(func){if(Module["calledRun"]){func(Module)}else{var old=Module["onRuntimeInitialized"];Module["onRuntimeInitialized"]=(function(){if(old)old();func(Module)})}return Module});function ExitStatus(status){this.name="ExitStatus";this.message="Program terminated with exit("+status+")";this.status=status}ExitStatus.prototype=new Error;ExitStatus.prototype.constructor=ExitStatus;var initialStackTop;var calledMain=false;dependenciesFulfilled=function runCaller(){if(!Module["calledRun"])run();if(!Module["calledRun"])dependenciesFulfilled=runCaller};Module["callMain"]=function callMain(args){args=args||[];ensureInitRuntime();var argc=args.length+1;var argv=stackAlloc((argc+1)*4);HEAP32[argv>>2]=allocateUTF8OnStack(Module["thisProgram"]);for(var i=1;i<argc;i++){HEAP32[(argv>>2)+i]=allocateUTF8OnStack(args[i-1])}HEAP32[(argv>>2)+argc]=0;try{var ret=Module["_main"](argc,argv,0);exit(ret,true)}catch(e){if(e instanceof ExitStatus){return}else if(e=="SimulateInfiniteLoop"){Module["noExitRuntime"]=true;return}else{var toLog=e;if(e&&typeof e==="object"&&e.stack){toLog=[e,e.stack]}Module.printErr("exception thrown: "+toLog);Module["quit"](1,e)}}finally{calledMain=true}};function run(args){args=args||Module["arguments"];if(runDependencies>0){return}preRun();if(runDependencies>0)return;if(Module["calledRun"])return;function doRun(){if(Module["calledRun"])return;Module["calledRun"]=true;if(ABORT)return;ensureInitRuntime();preMain();if(Module["onRuntimeInitialized"])Module["onRuntimeInitialized"]();if(Module["_main"]&&shouldRunNow)Module["callMain"](args);postRun()}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout((function(){setTimeout((function(){Module["setStatus"]("")}),1);doRun()}),1)}else{doRun()}}Module["run"]=run;function exit(status,implicit){if(implicit&&Module["noExitRuntime"]&&status===0){return}if(Module["noExitRuntime"]){}else{ABORT=true;EXITSTATUS=status;STACKTOP=initialStackTop;exitRuntime();if(Module["onExit"])Module["onExit"](status)}if(ENVIRONMENT_IS_NODE){process["exit"](status)}Module["quit"](status,new ExitStatus(status))}Module["exit"]=exit;function abort(what){if(Module["onAbort"]){Module["onAbort"](what)}if(what!==undefined){Module.print(what);Module.printErr(what);what=JSON.stringify(what)}else{what=""}ABORT=true;EXITSTATUS=1;throw"abort("+what+"). Build with -s ASSERTIONS=1 for more info."}Module["abort"]=abort;if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].pop()()}}var shouldRunNow=true;if(Module["noInitialRun"]){shouldRunNow=false}Module["noExitRuntime"]=true;run()






  return Module;
};
if (true)
  module.exports = Module;
else if (typeof define === 'function' && define['amd'])
  define([], function() { return Module; });
else if (typeof exports === 'object')
  exports["Module"] = Module;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0), __webpack_require__(1).setImmediate))

/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = ".././workers/terrainGeneratorCPU.js";

/***/ })
/******/ ]);