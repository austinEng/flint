// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = (typeof Module !== 'undefined' ? Module : null) || {};

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_WEB = false;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;

// Three configurations we can be running in:
// 1) We could be the application main() thread running in the main JS UI thread. (ENVIRONMENT_IS_WORKER == false and ENVIRONMENT_IS_PTHREAD == false)
// 2) We could be the application main() thread proxied to worker. (with Emscripten -s PROXY_TO_WORKER=1) (ENVIRONMENT_IS_WORKER == true, ENVIRONMENT_IS_PTHREAD == false)
// 3) We could be an application pthread running in a worker. (ENVIRONMENT_IS_WORKER == true and ENVIRONMENT_IS_PTHREAD == true)

if (Module['ENVIRONMENT']) {
  if (Module['ENVIRONMENT'] === 'WEB') {
    ENVIRONMENT_IS_WEB = true;
  } else if (Module['ENVIRONMENT'] === 'WORKER') {
    ENVIRONMENT_IS_WORKER = true;
  } else if (Module['ENVIRONMENT'] === 'NODE') {
    ENVIRONMENT_IS_NODE = true;
  } else if (Module['ENVIRONMENT'] === 'SHELL') {
    ENVIRONMENT_IS_SHELL = true;
  } else {
    throw new Error('The provided Module[\'ENVIRONMENT\'] value is not valid. It must be one of: WEB|WORKER|NODE|SHELL.');
  }
} else {
  ENVIRONMENT_IS_WEB = typeof window === 'object';
  ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
  ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function' && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER;
  ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
}


if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = console.log;
  if (!Module['printErr']) Module['printErr'] = console.warn;

  var nodeFS;
  var nodePath;

  Module['read'] = function shell_read(filename, binary) {
    if (!nodeFS) nodeFS = undefined;
    if (!nodePath) nodePath = undefined;
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    return binary ? ret : ret.toString();
  };

  Module['readBinary'] = function readBinary(filename) {
    var ret = Module['read'](filename, true);
    if (!ret.buffer) {
      ret = new Uint8Array(ret);
    }
    assert(ret.buffer);
    return ret;
  };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  if (!Module['thisProgram']) {
    if (process['argv'].length > 1) {
      Module['thisProgram'] = process['argv'][1].replace(/\\/g, '/');
    } else {
      Module['thisProgram'] = 'unknown-program';
    }
  }

  Module['arguments'] = process['argv'].slice(2);

  if (typeof module !== 'undefined') {
    module['exports'] = Module;
  }

  process['on']('uncaughtException', function(ex) {
    // suppress ExitStatus exceptions from showing an error
    if (!(ex instanceof ExitStatus)) {
      throw ex;
    }
  });

  Module['inspect'] = function () { return '[Emscripten Module object]'; };
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function shell_read() { throw 'no read() available' };
  }

  Module['readBinary'] = function readBinary(f) {
    if (typeof readbuffer === 'function') {
      return new Uint8Array(readbuffer(f));
    }
    var data = read(f, 'binary');
    assert(typeof data === 'object');
    return data;
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof quit === 'function') {
    Module['quit'] = function(status, toThrow) {
      quit(status);
    }
  }

}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function shell_read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (ENVIRONMENT_IS_WORKER) {
    Module['readBinary'] = function readBinary(url) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.responseType = 'arraybuffer';
      xhr.send(null);
      return new Uint8Array(xhr.response);
    };
  }

  Module['readAsync'] = function readAsync(url, onload, onerror) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function xhr_onload() {
      if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
        onload(xhr.response);
      } else {
        onerror();
      }
    };
    xhr.onerror = onerror;
    xhr.send(null);
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function shell_print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function shell_printErr(x) {
      console.warn(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WORKER) {
    Module['load'] = importScripts;
  }

  if (typeof Module['setWindowTitle'] === 'undefined') {
    Module['setWindowTitle'] = function(title) { document.title = title };
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
if (!Module['thisProgram']) {
  Module['thisProgram'] = './this.program';
}
if (!Module['quit']) {
  Module['quit'] = function(status, toThrow) {
    throw toThrow;
  }
}

// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
// Free the object hierarchy contained in the overrides, this lets the GC
// reclaim data used e.g. in memoryInitializerRequest, which is a large typed array.
moduleOverrides = undefined;



// {{PREAMBLE_ADDITIONS}}

// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  setTempRet0: function (value) {
    tempRet0 = value;
    return value;
  },
  getTempRet0: function () {
    return tempRet0;
  },
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  STACK_ALIGN: 16,
  prepVararg: function (ptr, type) {
    if (type === 'double' || type === 'i64') {
      // move so the load is aligned
      if (ptr & 7) {
        assert((ptr & 7) === 4);
        ptr += 4;
      }
    } else {
      assert((ptr & 3) === 0);
    }
    return ptr;
  },
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      assert(args.length == sig.length-1);
      assert(('dynCall_' + sig) in Module, 'bad function pointer type - no table for sig \' + sig + '\');
      return Module['dynCall_' + sig].apply(null, [ptr].concat(args));
    } else {
      assert(sig.length == 1);
      assert(('dynCall_' + sig) in Module, 'bad function pointer type - no table for sig \' + sig + '\');
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[sig]) {
      Runtime.funcWrappers[sig] = {};
    }
    var sigCache = Runtime.funcWrappers[sig];
    if (!sigCache[func]) {
      // optimize away arguments usage in common cases
      if (sig.length === 1) {
        sigCache[func] = function dynCall_wrapper() {
          return Runtime.dynCall(sig, func);
        };
      } else if (sig.length === 2) {
        sigCache[func] = function dynCall_wrapper(arg) {
          return Runtime.dynCall(sig, func, [arg]);
        };
      } else {
        // general case
        sigCache[func] = function dynCall_wrapper() {
          return Runtime.dynCall(sig, func, Array.prototype.slice.call(arguments));
        };
      }
    }
    return sigCache[func];
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+15)&-16);(assert((((STACKTOP|0) < (STACK_MAX|0))|0))|0); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + (assert(!staticSealed),size))|0;STATICTOP = (((STATICTOP)+15)&-16); return ret; },
  dynamicAlloc: function (size) { assert(DYNAMICTOP_PTR);var ret = HEAP32[DYNAMICTOP_PTR>>2];var end = (((ret + size + 15)|0) & -16);HEAP32[DYNAMICTOP_PTR>>2] = end;if (end >= TOTAL_MEMORY) {var success = enlargeMemory();if (!success) {HEAP32[DYNAMICTOP_PTR>>2] = ret;return 0;}}return ret;},
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 16))*(quantum ? quantum : 16); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*(+4294967296))) : ((+((low>>>0)))+((+((high|0)))*(+4294967296)))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}



Module["Runtime"] = Runtime;


function getSafeHeapType(bytes, isFloat) {
  switch (bytes) {
    case 1: return 'i8';
    case 2: return 'i16';
    case 4: return isFloat ? 'float' : 'i32';
    case 8: return 'double';
    default: assert(0);
  }
}


function SAFE_HEAP_STORE(dest, value, bytes, isFloat) {
  if (dest <= 0) abort('segmentation fault storing ' + bytes + ' bytes to address ' + dest);
  if (dest % bytes !== 0) abort('alignment error storing to address ' + dest + ', which was expected to be aligned to a multiple of ' + bytes);
  if (staticSealed) {
    if (dest + bytes > HEAP32[DYNAMICTOP_PTR>>2]) abort('segmentation fault, exceeded the top of the available dynamic heap when storing ' + bytes + ' bytes to address ' + dest + '. STATICTOP=' + STATICTOP + ', DYNAMICTOP=' + HEAP32[DYNAMICTOP_PTR>>2]);
    assert(DYNAMICTOP_PTR);
    assert(HEAP32[DYNAMICTOP_PTR>>2] <= TOTAL_MEMORY);
  } else {
    if (dest + bytes > STATICTOP) abort('segmentation fault, exceeded the top of the available static heap when storing ' + bytes + ' bytes to address ' + dest + '. STATICTOP=' + STATICTOP);
  }
  setValue(dest, value, getSafeHeapType(bytes, isFloat), 1);
}
function SAFE_HEAP_STORE_D(dest, value, bytes) {
  SAFE_HEAP_STORE(dest, value, bytes, true);
}

function SAFE_HEAP_LOAD(dest, bytes, unsigned, isFloat) {
  if (dest <= 0) abort('segmentation fault loading ' + bytes + ' bytes from address ' + dest);
  if (dest % bytes !== 0) abort('alignment error loading from address ' + dest + ', which was expected to be aligned to a multiple of ' + bytes);
  if (staticSealed) {
    if (dest + bytes > HEAP32[DYNAMICTOP_PTR>>2]) abort('segmentation fault, exceeded the top of the available dynamic heap when loading ' + bytes + ' bytes from address ' + dest + '. STATICTOP=' + STATICTOP + ', DYNAMICTOP=' + HEAP32[DYNAMICTOP_PTR>>2]);
    assert(DYNAMICTOP_PTR);
    assert(HEAP32[DYNAMICTOP_PTR>>2] <= TOTAL_MEMORY);
  } else {
    if (dest + bytes > STATICTOP) abort('segmentation fault, exceeded the top of the available static heap when loading ' + bytes + ' bytes from address ' + dest + '. STATICTOP=' + STATICTOP);
  }
  var type = getSafeHeapType(bytes, isFloat);
  var ret = getValue(dest, type, 1);
  if (unsigned) ret = unSign(ret, parseInt(type.substr(1)), 1);
  return ret;
}
function SAFE_HEAP_LOAD_D(dest, bytes, unsigned) {
  return SAFE_HEAP_LOAD(dest, bytes, unsigned, true);
}

function SAFE_FT_MASK(value, mask) {
  var ret = value & mask;
  if (ret !== value) {
    abort('Function table mask error: function pointer is ' + value + ' which is masked by ' + mask + ', the likely cause of this is that the function pointer is being called by the wrong type.');
  }
  return ret;
}

function segfault() {
  abort('segmentation fault');
}
function alignfault() {
  abort('alignment fault');
}
function ftfault() {
  abort('Function table mask error');
}

//========================================
// Runtime essentials
//========================================

var ABORT = 0; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  var func = Module['_' + ident]; // closure exported function
  if (!func) {
    try { func = eval('_' + ident); } catch(e) {}
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

var cwrap, ccall;
(function(){
  var JSfuncs = {
    // Helpers for cwrap -- it can't refer to Runtime directly because it might
    // be renamed by closure, instead it calls JSfuncs['stackSave'].body to find
    // out what the minified function name is.
    'stackSave': function() {
      Runtime.stackSave()
    },
    'stackRestore': function() {
      Runtime.stackRestore()
    },
    // type conversion from js to c
    'arrayToC' : function(arr) {
      var ret = Runtime.stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    },
    'stringToC' : function(str) {
      var ret = 0;
      if (str !== null && str !== undefined && str !== 0) { // null string
        // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
        var len = (str.length << 2) + 1;
        ret = Runtime.stackAlloc(len);
        stringToUTF8(str, ret, len);
      }
      return ret;
    }
  };
  // For fast lookup of conversion functions
  var toC = {'string' : JSfuncs['stringToC'], 'array' : JSfuncs['arrayToC']};

  // C calling interface.
  ccall = function ccallFunc(ident, returnType, argTypes, args, opts) {
    var func = getCFunc(ident);
    var cArgs = [];
    var stack = 0;
    assert(returnType !== 'array', 'Return type should not be "array".');
    if (args) {
      for (var i = 0; i < args.length; i++) {
        var converter = toC[argTypes[i]];
        if (converter) {
          if (stack === 0) stack = Runtime.stackSave();
          cArgs[i] = converter(args[i]);
        } else {
          cArgs[i] = args[i];
        }
      }
    }
    var ret = func.apply(null, cArgs);
    if ((!opts || !opts.async) && typeof EmterpreterAsync === 'object') {
      assert(!EmterpreterAsync.state, 'cannot start async op with normal JS calling ccall');
    }
    if (opts && opts.async) assert(!returnType, 'async ccalls cannot return values');
    if (returnType === 'string') ret = Pointer_stringify(ret);
    if (stack !== 0) {
      if (opts && opts.async) {
        EmterpreterAsync.asyncFinalizers.push(function() {
          Runtime.stackRestore(stack);
        });
        return;
      }
      Runtime.stackRestore(stack);
    }
    return ret;
  }

  var sourceRegex = /^function\s*[a-zA-Z$_0-9]*\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;
  function parseJSFunc(jsfunc) {
    // Match the body and the return value of a javascript function source
    var parsed = jsfunc.toString().match(sourceRegex).slice(1);
    return {arguments : parsed[0], body : parsed[1], returnValue: parsed[2]}
  }

  // sources of useful functions. we create this lazily as it can trigger a source decompression on this entire file
  var JSsource = null;
  function ensureJSsource() {
    if (!JSsource) {
      JSsource = {};
      for (var fun in JSfuncs) {
        if (JSfuncs.hasOwnProperty(fun)) {
          // Elements of toCsource are arrays of three items:
          // the code, and the return value
          JSsource[fun] = parseJSFunc(JSfuncs[fun]);
        }
      }
    }
  }

  cwrap = function cwrap(ident, returnType, argTypes) {
    argTypes = argTypes || [];
    var cfunc = getCFunc(ident);
    // When the function takes numbers and returns a number, we can just return
    // the original function
    var numericArgs = argTypes.every(function(type){ return type === 'number'});
    var numericRet = (returnType !== 'string');
    if ( numericRet && numericArgs) {
      return cfunc;
    }
    // Creation of the arguments list (["$1","$2",...,"$nargs"])
    var argNames = argTypes.map(function(x,i){return '$'+i});
    var funcstr = "(function(" + argNames.join(',') + ") {";
    var nargs = argTypes.length;
    if (!numericArgs) {
      // Generate the code needed to convert the arguments from javascript
      // values to pointers
      ensureJSsource();
      funcstr += 'var stack = ' + JSsource['stackSave'].body + ';';
      for (var i = 0; i < nargs; i++) {
        var arg = argNames[i], type = argTypes[i];
        if (type === 'number') continue;
        var convertCode = JSsource[type + 'ToC']; // [code, return]
        funcstr += 'var ' + convertCode.arguments + ' = ' + arg + ';';
        funcstr += convertCode.body + ';';
        funcstr += arg + '=(' + convertCode.returnValue + ');';
      }
    }

    // When the code is compressed, the name of cfunc is not literally 'cfunc' anymore
    var cfuncname = parseJSFunc(function(){return cfunc}).returnValue;
    // Call the function
    funcstr += 'var ret = ' + cfuncname + '(' + argNames.join(',') + ');';
    if (!numericRet) { // Return type can only by 'string' or 'number'
      // Convert the result to a string
      var strgfy = parseJSFunc(function(){return Pointer_stringify}).returnValue;
      funcstr += 'ret = ' + strgfy + '(ret);';
    }
    funcstr += "if (typeof EmterpreterAsync === 'object') { assert(!EmterpreterAsync.state, 'cannot start async op with normal JS calling cwrap') }";
    if (!numericArgs) {
      // If we had a stack, restore it
      ensureJSsource();
      funcstr += JSsource['stackRestore'].body.replace('()', '(stack)') + ';';
    }
    funcstr += 'return ret})';
    return eval(funcstr);
  };
})();
Module["ccall"] = ccall;
Module["cwrap"] = cwrap;

/** @type {function(number, number, string, boolean=)} */
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
  if (noSafe) {
    switch(type) {
      case 'i1': HEAP8[((ptr)>>0)]=value; break;
      case 'i8': HEAP8[((ptr)>>0)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
  } else {
    switch(type) {
      case 'i1': SAFE_HEAP_STORE(((ptr)|0), ((value)|0), 1); break;
      case 'i8': SAFE_HEAP_STORE(((ptr)|0), ((value)|0), 1); break;
      case 'i16': SAFE_HEAP_STORE(((ptr)|0), ((value)|0), 2); break;
      case 'i32': SAFE_HEAP_STORE(((ptr)|0), ((value)|0), 4); break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],SAFE_HEAP_STORE(((ptr)|0), ((tempI64[0])|0), 4),SAFE_HEAP_STORE((((ptr)+(4))|0), ((tempI64[1])|0), 4)); break;
      case 'float': SAFE_HEAP_STORE_D(((ptr)|0), (+(value)), 4); break;
      case 'double': SAFE_HEAP_STORE_D(((ptr)|0), (+(value)), 8); break;
      default: abort('invalid type for setValue: ' + type);
    }
  }
}
Module["setValue"] = setValue;

/** @type {function(number, string, boolean=)} */
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
  if (noSafe) {
    switch(type) {
      case 'i1': return HEAP8[((ptr)>>0)];
      case 'i8': return HEAP8[((ptr)>>0)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  } else {
    switch(type) {
      case 'i1': return ((SAFE_HEAP_LOAD(((ptr)|0), 1, 0))|0);
      case 'i8': return ((SAFE_HEAP_LOAD(((ptr)|0), 1, 0))|0);
      case 'i16': return ((SAFE_HEAP_LOAD(((ptr)|0), 2, 0))|0);
      case 'i32': return ((SAFE_HEAP_LOAD(((ptr)|0), 4, 0))|0);
      case 'i64': return ((SAFE_HEAP_LOAD(((ptr)|0), 8, 0))|0);
      case 'float': return (+(SAFE_HEAP_LOAD_D(((ptr)|0), 4, 0)));
      case 'double': return (+(SAFE_HEAP_LOAD_D(((ptr)|0), 8, 0)));
      default: abort('invalid type for setValue: ' + type);
    }
  }
  return null;
}
Module["getValue"] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module["ALLOC_NORMAL"] = ALLOC_NORMAL;
Module["ALLOC_STACK"] = ALLOC_STACK;
Module["ALLOC_STATIC"] = ALLOC_STATIC;
Module["ALLOC_DYNAMIC"] = ALLOC_DYNAMIC;
Module["ALLOC_NONE"] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
/** @type {function((TypedArray|Array<number>|number), string, number, number=)} */
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [typeof _malloc === 'function' ? _malloc : Runtime.staticAlloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)>>0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(/** @type {!Uint8Array} */ (slab), ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    assert(type, 'Must know what type to store in allocate!');

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module["allocate"] = allocate;

// Allocate memory during any stage of startup - static memory early on, dynamic memory later, malloc when ready
function getMemory(size) {
  if (!staticSealed) return Runtime.staticAlloc(size);
  if (!runtimeInitialized) return Runtime.dynamicAlloc(size);
  return _malloc(size);
}
Module["getMemory"] = getMemory;

/** @type {function(number, number=)} */
function Pointer_stringify(ptr, length) {
  if (length === 0 || !ptr) return ';
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = 0;
  var t;
  var i = 0;
  while (1) {
    assert(ptr + i < TOTAL_MEMORY);
    t = ((SAFE_HEAP_LOAD((((ptr)+(i))|0), 1, 1))|0);
    hasUtf |= t;
    if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = ';

  if (hasUtf < 128) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  return Module['UTF8ToString'](ptr);
}
Module["Pointer_stringify"] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated ASCII-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

function AsciiToString(ptr) {
  var str = ';
  while (1) {
    var ch = ((SAFE_HEAP_LOAD(((ptr++)|0), 1, 0))|0);
    if (!ch) return str;
    str += String.fromCharCode(ch);
  }
}
Module["AsciiToString"] = AsciiToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in ASCII form. The copy will require at most str.length+1 bytes of space in the HEAP.

function stringToAscii(str, outPtr) {
  return writeAsciiToMemory(str, outPtr, false);
}
Module["stringToAscii"] = stringToAscii;

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the given array that contains uint8 values, returns
// a copy of that string as a Javascript String object.

var UTF8Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf8') : undefined;
function UTF8ArrayToString(u8Array, idx) {
  var endPtr = idx;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  while (u8Array[endPtr]) ++endPtr;

  if (endPtr - idx > 16 && u8Array.subarray && UTF8Decoder) {
    return UTF8Decoder.decode(u8Array.subarray(idx, endPtr));
  } else {
    var u0, u1, u2, u3, u4, u5;

    var str = ';
    while (1) {
      // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
      u0 = u8Array[idx++];
      if (!u0) return str;
      if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
      u1 = u8Array[idx++] & 63;
      if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
      u2 = u8Array[idx++] & 63;
      if ((u0 & 0xF0) == 0xE0) {
        u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
      } else {
        u3 = u8Array[idx++] & 63;
        if ((u0 & 0xF8) == 0xF0) {
          u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | u3;
        } else {
          u4 = u8Array[idx++] & 63;
          if ((u0 & 0xFC) == 0xF8) {
            u0 = ((u0 & 3) << 24) | (u1 << 18) | (u2 << 12) | (u3 << 6) | u4;
          } else {
            u5 = u8Array[idx++] & 63;
            u0 = ((u0 & 1) << 30) | (u1 << 24) | (u2 << 18) | (u3 << 12) | (u4 << 6) | u5;
          }
        }
      }
      if (u0 < 0x10000) {
        str += String.fromCharCode(u0);
      } else {
        var ch = u0 - 0x10000;
        str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
      }
    }
  }
}
Module["UTF8ArrayToString"] = UTF8ArrayToString;

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

function UTF8ToString(ptr) {
  return UTF8ArrayToString(HEAPU8,ptr);
}
Module["UTF8ToString"] = UTF8ToString;

// Copies the given Javascript String object 'str' to the given byte array at address 'outIdx',
// encoded in UTF8 form and null-terminated. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outU8Array: the array to copy to. Each index in this array is assumed to be one 8-byte element.
//   outIdx: The starting offset in the array to begin the copying.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=1, only the null terminator will be written and nothing else.
//                    maxBytesToWrite=0 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
  if (!(maxBytesToWrite > 0)) // Parameter maxBytesToWrite is not optional. Negative values, 0, null, undefined and false each don't write out any bytes.
    return 0;

  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) u = 0x10000 + ((u & 0x3FF) << 10) | (str.charCodeAt(++i) & 0x3FF);
    if (u <= 0x7F) {
      if (outIdx >= endIdx) break;
      outU8Array[outIdx++] = u;
    } else if (u <= 0x7FF) {
      if (outIdx + 1 >= endIdx) break;
      outU8Array[outIdx++] = 0xC0 | (u >> 6);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0xFFFF) {
      if (outIdx + 2 >= endIdx) break;
      outU8Array[outIdx++] = 0xE0 | (u >> 12);
      outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0x1FFFFF) {
      if (outIdx + 3 >= endIdx) break;
      outU8Array[outIdx++] = 0xF0 | (u >> 18);
      outU8Array[outIdx++] = 0x80 | ((u >> 12) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0x3FFFFFF) {
      if (outIdx + 4 >= endIdx) break;
      outU8Array[outIdx++] = 0xF8 | (u >> 24);
      outU8Array[outIdx++] = 0x80 | ((u >> 18) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 12) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    } else {
      if (outIdx + 5 >= endIdx) break;
      outU8Array[outIdx++] = 0xFC | (u >> 30);
      outU8Array[outIdx++] = 0x80 | ((u >> 24) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 18) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 12) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    }
  }
  // Null-terminate the pointer to the buffer.
  outU8Array[outIdx] = 0;
  return outIdx - startIdx;
}
Module["stringToUTF8Array"] = stringToUTF8Array;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF8 form. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8(str, outPtr, maxBytesToWrite) {
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  return stringToUTF8Array(str, HEAPU8,outPtr, maxBytesToWrite);
}
Module["stringToUTF8"] = stringToUTF8;

// Returns the number of bytes the given Javascript string takes if encoded as a UTF8 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF8(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) u = 0x10000 + ((u & 0x3FF) << 10) | (str.charCodeAt(++i) & 0x3FF);
    if (u <= 0x7F) {
      ++len;
    } else if (u <= 0x7FF) {
      len += 2;
    } else if (u <= 0xFFFF) {
      len += 3;
    } else if (u <= 0x1FFFFF) {
      len += 4;
    } else if (u <= 0x3FFFFFF) {
      len += 5;
    } else {
      len += 6;
    }
  }
  return len;
}
Module["lengthBytesUTF8"] = lengthBytesUTF8;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

var UTF16Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-16le') : undefined;
function UTF16ToString(ptr) {
  assert(ptr % 2 == 0, 'Pointer passed to UTF16ToString must be aligned to two bytes!');
  var endPtr = ptr;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  var idx = endPtr >> 1;
  while (HEAP16[idx]) ++idx;
  endPtr = idx << 1;

  if (endPtr - ptr > 32 && UTF16Decoder) {
    return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
  } else {
    var i = 0;

    var str = ';
    while (1) {
      var codeUnit = ((SAFE_HEAP_LOAD((((ptr)+(i*2))|0), 2, 0))|0);
      if (codeUnit == 0) return str;
      ++i;
      // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
      str += String.fromCharCode(codeUnit);
    }
  }
}


// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16 form. The copy will require at most str.length*4+2 bytes of space in the HEAP.
// Use the function lengthBytesUTF16() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=2, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<2 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF16(str, outPtr, maxBytesToWrite) {
  assert(outPtr % 2 == 0, 'Pointer passed to stringToUTF16 must be aligned to two bytes!');
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 2) return 0;
  maxBytesToWrite -= 2; // Null terminator.
  var startPtr = outPtr;
  var numCharsToWrite = (maxBytesToWrite < str.length*2) ? (maxBytesToWrite / 2) : str.length;
  for (var i = 0; i < numCharsToWrite; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    SAFE_HEAP_STORE(((outPtr)|0), ((codeUnit)|0), 2);
    outPtr += 2;
  }
  // Null-terminate the pointer to the HEAP.
  SAFE_HEAP_STORE(((outPtr)|0), ((0)|0), 2);
  return outPtr - startPtr;
}


// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF16(str) {
  return str.length*2;
}


function UTF32ToString(ptr) {
  assert(ptr % 4 == 0, 'Pointer passed to UTF32ToString must be aligned to four bytes!');
  var i = 0;

  var str = ';
  while (1) {
    var utf32 = ((SAFE_HEAP_LOAD((((ptr)+(i*4))|0), 4, 0))|0);
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}


// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32 form. The copy will require at most str.length*4+4 bytes of space in the HEAP.
// Use the function lengthBytesUTF32() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=4, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<4 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF32(str, outPtr, maxBytesToWrite) {
  assert(outPtr % 4 == 0, 'Pointer passed to stringToUTF32 must be aligned to four bytes!');
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 4) return 0;
  var startPtr = outPtr;
  var endPtr = startPtr + maxBytesToWrite - 4;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++i);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    SAFE_HEAP_STORE(((outPtr)|0), ((codeUnit)|0), 4);
    outPtr += 4;
    if (outPtr + 4 > endPtr) break;
  }
  // Null-terminate the pointer to the HEAP.
  SAFE_HEAP_STORE(((outPtr)|0), ((0)|0), 4);
  return outPtr - startPtr;
}


// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF32(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i);
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) ++i; // possibly a lead surrogate, so skip over the tail surrogate.
    len += 4;
  }

  return len;
}


function demangle(func) {
  var __cxa_demangle_func = Module['___cxa_demangle'] || Module['__cxa_demangle'];
  if (__cxa_demangle_func) {
    try {
      var s =
        func.substr(1);
      var len = lengthBytesUTF8(s)+1;
      var buf = _malloc(len);
      stringToUTF8(s, buf, len);
      var status = _malloc(4);
      var ret = __cxa_demangle_func(buf, 0, 0, status);
      if (getValue(status, 'i32') === 0 && ret) {
        return Pointer_stringify(ret);
      }
      // otherwise, libcxxabi failed
    } catch(e) {
      // ignore problems here
    } finally {
      if (buf) _free(buf);
      if (status) _free(status);
      if (ret) _free(ret);
    }
    // failure when using libcxxabi, don't demangle
    return func;
  }
  Runtime.warnOnce('warning: build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling');
  return func;
}

function demangleAll(text) {
  var regex =
    /__Z[\w\d_]+/g;
  return text.replace(regex,
    function(x) {
      var y = demangle(x);
      return x === y ? x : (x + ' [' + y + ']');
    });
}

function jsStackTrace() {
  var err = new Error();
  if (!err.stack) {
    // IE10+ special cases: It does have callstack info, but it is only populated if an Error object is thrown,
    // so try that as a special-case.
    try {
      throw new Error(0);
    } catch(e) {
      err = e;
    }
    if (!err.stack) {
      return '(no stack trace available)';
    }
  }
  return err.stack.toString();
}

function stackTrace() {
  var js = jsStackTrace();
  if (Module['extraStackTrace']) js += '\n' + Module['extraStackTrace']();
  return demangleAll(js);
}
Module["stackTrace"] = stackTrace;

// Memory management

var PAGE_SIZE = 16384;
var WASM_PAGE_SIZE = 65536;
var ASMJS_PAGE_SIZE = 16777216;
var MIN_TOTAL_MEMORY = 16777216;

function alignUp(x, multiple) {
  if (x % multiple > 0) {
    x += multiple - (x % multiple);
  }
  return x;
}

var HEAP,
/** @type {ArrayBuffer} */
  buffer,
/** @type {Int8Array} */
  HEAP8,
/** @type {Uint8Array} */
  HEAPU8,
/** @type {Int16Array} */
  HEAP16,
/** @type {Uint16Array} */
  HEAPU16,
/** @type {Int32Array} */
  HEAP32,
/** @type {Uint32Array} */
  HEAPU32,
/** @type {Float32Array} */
  HEAPF32,
/** @type {Float64Array} */
  HEAPF64;

function updateGlobalBuffer(buf) {
  Module['buffer'] = buffer = buf;
}

function updateGlobalBufferViews() {
  Module['HEAP8'] = HEAP8 = new Int8Array(buffer);
  Module['HEAP16'] = HEAP16 = new Int16Array(buffer);
  Module['HEAP32'] = HEAP32 = new Int32Array(buffer);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(buffer);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(buffer);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(buffer);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(buffer);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(buffer);
}

var STATIC_BASE, STATICTOP, staticSealed; // static area
var STACK_BASE, STACKTOP, STACK_MAX; // stack area
var DYNAMIC_BASE, DYNAMICTOP_PTR; // dynamic area handled by sbrk

  STATIC_BASE = STATICTOP = STACK_BASE = STACKTOP = STACK_MAX = DYNAMIC_BASE = DYNAMICTOP_PTR = 0;
  staticSealed = false;


// Initializes the stack cookie. Called at the startup of main and at the startup of each thread in pthreads mode.
function writeStackCookie() {
  assert((STACK_MAX & 3) == 0);
  HEAPU32[(STACK_MAX >> 2)-1] = 0x02135467;
  HEAPU32[(STACK_MAX >> 2)-2] = 0x89BACDFE;
}

function checkStackCookie() {
  if (HEAPU32[(STACK_MAX >> 2)-1] != 0x02135467 || HEAPU32[(STACK_MAX >> 2)-2] != 0x89BACDFE) {
    abort('Stack overflow! Stack cookie has been overwritten, expected hex dwords 0x89BACDFE and 0x02135467, but received 0x' + HEAPU32[(STACK_MAX >> 2)-2].toString(16) + ' ' + HEAPU32[(STACK_MAX >> 2)-1].toString(16));
  }
  // Also test the global address 0 for integrity. This check is not compatible with SAFE_SPLIT_MEMORY though, since that mode already tests all address 0 accesses on its own.
  if (HEAP32[0] !== 0x63736d65 /* 'emsc' */) throw 'Runtime error: The application has corrupted its heap memory area (address zero)!';
}

function abortStackOverflow(allocSize) {
  abort('Stack overflow! Attempted to allocate ' + allocSize + ' bytes on the stack, but stack has only ' + (STACK_MAX - Module['asm'].stackSave() + allocSize) + ' bytes available!');
}

function abortOnCannotGrowMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or (4) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ');
}

if (!Module['reallocBuffer']) Module['reallocBuffer'] = function(size) {
  var ret;
  try {
    if (ArrayBuffer.transfer) {
      ret = ArrayBuffer.transfer(buffer, size);
    } else {
      var oldHEAP8 = HEAP8;
      ret = new ArrayBuffer(size);
      var temp = new Int8Array(ret);
      temp.set(oldHEAP8);
    }
  } catch(e) {
    return false;
  }
  var success = _emscripten_replace_memory(ret);
  if (!success) return false;
  return ret;
};

function enlargeMemory() {
  // TOTAL_MEMORY is the current size of the actual array, and DYNAMICTOP is the new top.
  assert(HEAP32[DYNAMICTOP_PTR>>2] > TOTAL_MEMORY); // This function should only ever be called after the ceiling of the dynamic heap has already been bumped to exceed the current total size of the asm.js heap.


  var PAGE_MULTIPLE = Module["usingWasm"] ? WASM_PAGE_SIZE : ASMJS_PAGE_SIZE; // In wasm, heap size must be a multiple of 64KB. In asm.js, they need to be multiples of 16MB.
  var LIMIT = 2147483648 - PAGE_MULTIPLE; // We can do one page short of 2GB as theoretical maximum.

  if (HEAP32[DYNAMICTOP_PTR>>2] > LIMIT) {
    Module.printErr('Cannot enlarge memory, asked to go up to ' + HEAP32[DYNAMICTOP_PTR>>2] + ' bytes, but the limit is ' + LIMIT + ' bytes!');
    return false;
  }

  var OLD_TOTAL_MEMORY = TOTAL_MEMORY;
  TOTAL_MEMORY = Math.max(TOTAL_MEMORY, MIN_TOTAL_MEMORY); // So the loop below will not be infinite, and minimum asm.js memory size is 16MB.

  while (TOTAL_MEMORY < HEAP32[DYNAMICTOP_PTR>>2]) { // Keep incrementing the heap size as long as it's less than what is requested.
    if (TOTAL_MEMORY <= 536870912) {
      TOTAL_MEMORY = alignUp(2 * TOTAL_MEMORY, PAGE_MULTIPLE); // Simple heuristic: double until 1GB...
    } else {
      TOTAL_MEMORY = Math.min(alignUp((3 * TOTAL_MEMORY + 2147483648) / 4, PAGE_MULTIPLE), LIMIT); // ..., but after that, add smaller increments towards 2GB, which we cannot reach
    }
  }

  var start = Date.now();

  var replacement = Module['reallocBuffer'](TOTAL_MEMORY);
  if (!replacement || replacement.byteLength != TOTAL_MEMORY) {
    Module.printErr('Failed to grow the heap from ' + OLD_TOTAL_MEMORY + ' bytes to ' + TOTAL_MEMORY + ' bytes, not enough memory!');
    if (replacement) {
      Module.printErr('Expected to get back a buffer of size ' + TOTAL_MEMORY + ' bytes, but instead got back a buffer of size ' + replacement.byteLength);
    }
    // restore the state to before this call, we failed
    TOTAL_MEMORY = OLD_TOTAL_MEMORY;
    return false;
  }

  // everything worked

  updateGlobalBuffer(replacement);
  updateGlobalBufferViews();

  Module.printErr('enlarged memory arrays from ' + OLD_TOTAL_MEMORY + ' to ' + TOTAL_MEMORY + ', took ' + (Date.now() - start) + ' ms (has ArrayBuffer.transfer? ' + (!!ArrayBuffer.transfer) + ')');

  if (!Module["usingWasm"]) {
    Module.printErr('Warning: Enlarging memory arrays, this is not fast! ' + [OLD_TOTAL_MEMORY, TOTAL_MEMORY]);
  }


  return true;
}

var byteLength;
try {
  byteLength = Function.prototype.call.bind(Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, 'byteLength').get);
  byteLength(new ArrayBuffer(4)); // can fail on older ie
} catch(e) { // can fail on older node/v8
  byteLength = function(buffer) { return buffer.byteLength; };
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
if (TOTAL_MEMORY < TOTAL_STACK) Module.printErr('TOTAL_MEMORY should be larger than TOTAL_STACK, was ' + TOTAL_MEMORY + '! (TOTAL_STACK=' + TOTAL_STACK + ')');

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && Int32Array.prototype.subarray !== undefined && Int32Array.prototype.set !== undefined,
       'JS engine does not provide full typed array support');



// Use a provided buffer, if there is one, or else allocate a new one
if (Module['buffer']) {
  buffer = Module['buffer'];
  assert(buffer.byteLength === TOTAL_MEMORY, 'provided buffer should be ' + TOTAL_MEMORY + ' bytes, but it is ' + buffer.byteLength);
} else {
  // Use a WebAssembly memory where available
  {
    buffer = new ArrayBuffer(TOTAL_MEMORY);
  }
  assert(buffer.byteLength === TOTAL_MEMORY);
}
updateGlobalBufferViews();


function getTotalMemory() {
  return TOTAL_MEMORY;
}

// Endianness check (note: assumes compiler arch was little-endian)
  HEAP32[0] = 0x63736d65; /* 'emsc' */
HEAP16[1] = 0x6373;
if (HEAPU8[2] !== 0x73 || HEAPU8[3] !== 0x63) throw 'Runtime error: expected the system to be little-endian!';

Module['HEAP'] = HEAP;
Module['buffer'] = buffer;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Module['dynCall_v'](func);
      } else {
        Module['dynCall_vi'](func, callback.arg);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;
var runtimeExited = false;


function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  checkStackCookie();
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  checkStackCookie();
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  checkStackCookie();
  callRuntimeCallbacks(__ATEXIT__);
  runtimeExited = true;
}

function postRun() {
  checkStackCookie();
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module["addOnPreRun"] = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module["addOnInit"] = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module["addOnPreMain"] = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module["addOnExit"] = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module["addOnPostRun"] = addOnPostRun;

// Tools

/** @type {function(string, boolean=, number=)} */
function intArrayFromString(stringy, dontAddNull, length) {
  var len = length > 0 ? length : lengthBytesUTF8(stringy)+1;
  var u8array = new Array(len);
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
  if (dontAddNull) u8array.length = numBytesWritten;
  return u8array;
}
Module["intArrayFromString"] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join(');
}
Module["intArrayToString"] = intArrayToString;

// Deprecated: This function should not be called because it is unsafe and does not provide
// a maximum length limit of how many bytes it is allowed to write. Prefer calling the
// function stringToUTF8Array() instead, which takes in a maximum length that can be used
// to be secure from out of bounds writes.
/** @deprecated */
function writeStringToMemory(string, buffer, dontAddNull) {
  Runtime.warnOnce('writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!');

  var /** @type {number} */ lastChar, /** @type {number} */ end;
  if (dontAddNull) {
    // stringToUTF8Array always appends null. If we don't want to do that, remember the
    // character that existed at the location where the null will be placed, and restore
    // that after the write (below).
    end = buffer + lengthBytesUTF8(string);
    lastChar = HEAP8[end];
  }
  stringToUTF8(string, buffer, Infinity);
  if (dontAddNull) HEAP8[end] = lastChar; // Restore the value under the null character.
}
Module["writeStringToMemory"] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  assert(array.length >= 0, 'writeArrayToMemory array must have a length (should be an array or typed array)')
  HEAP8.set(array, buffer);
}
Module["writeArrayToMemory"] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; ++i) {
    assert(str.charCodeAt(i) === str.charCodeAt(i)&0xff);
    SAFE_HEAP_STORE(((buffer++)|0), ((str.charCodeAt(i))|0), 1);
  }
  // Null-terminate the pointer to the HEAP.
  if (!dontAddNull) SAFE_HEAP_STORE(((buffer)|0), ((0)|0), 1);
}
Module["writeAsciiToMemory"] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


if (!Math['clz32']) Math['clz32'] = function(x) {
  x = x >>> 0;
  for (var i = 0; i < 32; i++) {
    if (x & (1 << (31 - i))) return i;
  }
  return 32;
};
Math.clz32 = Math['clz32']

if (!Math['trunc']) Math['trunc'] = function(x) {
  return x < 0 ? Math.ceil(x) : Math.floor(x);
};
Math.trunc = Math['trunc'];

var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_round = Math.round;
var Math_min = Math.min;
var Math_clz32 = Math.clz32;
var Math_trunc = Math.trunc;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

function getUniqueRunDependency(id) {
  var orig = id;
  while (1) {
    if (!runDependencyTracking[id]) return id;
    id = orig + Math.random();
  }
  return id;
}

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        if (ABORT) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
          return;
        }
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr('still waiting on run dependencies:');
          }
          Module.printErr('dependency: ' + dep);
        }
        if (shown) {
          Module.printErr('(end of list)');
        }
      }, 10000);
    }
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module["addRunDependency"] = addRunDependency;

function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module["removeRunDependency"] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data



var memoryInitializer = null;



var /* show errors on likely calls to FS when it was not included */ FS = {
  error: function() {
    abort('Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with  -s FORCE_FILESYSTEM=1');
  },
  init: function() { FS.error() },
  createDataFile: function() { FS.error() },
  createPreloadedFile: function() { FS.error() },
  createLazyFile: function() { FS.error() },
  open: function() { FS.error() },
  mkdev: function() { FS.error() },
  registerDevice: function() { FS.error() },
  analyzePath: function() { FS.error() },
  loadFilesFromDB: function() { FS.error() },

  ErrnoError: function ErrnoError() { FS.error() },
};
Module['FS_createDataFile'] = FS.createDataFile;
Module['FS_createPreloadedFile'] = FS.createPreloadedFile;



// === Body ===

var ASM_CONSTS = [];




STATIC_BASE = Runtime.GLOBAL_BASE;

STATICTOP = STATIC_BASE + 1216;
/* global initializers */  __ATINIT__.push();


memoryInitializer = ".././examples\\workers/testWorker.js.mem";





/* no memory initializer */
var tempDoublePtr = STATICTOP; STATICTOP += 16;

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}

// {{PRE_LIBRARY}}


  
  function ___setErrNo(value) {
      if (Module['___errno_location']) SAFE_HEAP_STORE(((Module['___errno_location']())|0), ((value)|0), 4);
      else Module.printErr('failed to set errno from JS');
      return value;
    } 

   

  
  
  
  function _emscripten_set_main_loop_timing(mode, value) {
      Browser.mainLoop.timingMode = mode;
      Browser.mainLoop.timingValue = value;
  
      if (!Browser.mainLoop.func) {
        console.error('emscripten_set_main_loop_timing: Cannot set timing mode for main loop since a main loop does not exist! Call emscripten_set_main_loop first to set one up.');
        return 1; // Return non-zero on failure, can't set timing mode when there is no main loop.
      }
  
      if (mode == 0 /*EM_TIMING_SETTIMEOUT*/) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setTimeout() {
          var timeUntilNextTick = Math.max(0, Browser.mainLoop.tickStartTime + value - _emscripten_get_now())|0;
          setTimeout(Browser.mainLoop.runner, timeUntilNextTick); // doing this each time means that on exception, we stop
        };
        Browser.mainLoop.method = 'timeout';
      } else if (mode == 1 /*EM_TIMING_RAF*/) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
          Browser.requestAnimationFrame(Browser.mainLoop.runner);
        };
        Browser.mainLoop.method = 'rAF';
      } else if (mode == 2 /*EM_TIMING_SETIMMEDIATE*/) {
        if (!window['setImmediate']) {
          // Emulate setImmediate. (note: not a complete polyfill, we don't emulate clearImmediate() to keep code size to minimum, since not needed)
          var setImmediates = [];
          var emscriptenMainLoopMessageId = 'setimmediate';
          function Browser_setImmediate_messageHandler(event) {
            if (event.source === window && event.data === emscriptenMainLoopMessageId) {
              event.stopPropagation();
              setImmediates.shift()();
            }
          }
          window.addEventListener("message", Browser_setImmediate_messageHandler, true);
          window['setImmediate'] = function Browser_emulated_setImmediate(func) {
            setImmediates.push(func);
            if (ENVIRONMENT_IS_WORKER) {
              if (Module['setImmediates'] === undefined) Module['setImmediates'] = [];
              Module['setImmediates'].push(func);
              window.postMessage({target: emscriptenMainLoopMessageId}); // In --proxy-to-worker, route the message via proxyClient.js
            } else window.postMessage(emscriptenMainLoopMessageId, "*"); // On the main thread, can just send the message to itself.
          }
        }
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setImmediate() {
          window['setImmediate'](Browser.mainLoop.runner);
        };
        Browser.mainLoop.method = 'immediate';
      }
      return 0;
    }
  
  function _emscripten_get_now() { abort() }function _emscripten_set_main_loop(func, fps, simulateInfiniteLoop, arg, noSetTiming) {
      Module['noExitRuntime'] = true;
  
      assert(!Browser.mainLoop.func, 'emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.');
  
      Browser.mainLoop.func = func;
      Browser.mainLoop.arg = arg;
  
      var browserIterationFunc;
      if (typeof arg !== 'undefined') {
        browserIterationFunc = function() {
          Module['dynCall_vi'](func, arg);
        };
      } else {
        browserIterationFunc = function() {
          Module['dynCall_v'](func);
        };
      }
  
      var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;
  
      Browser.mainLoop.runner = function Browser_mainLoop_runner() {
        if (ABORT) return;
        if (Browser.mainLoop.queue.length > 0) {
          var start = Date.now();
          var blocker = Browser.mainLoop.queue.shift();
          blocker.func(blocker.arg);
          if (Browser.mainLoop.remainingBlockers) {
            var remaining = Browser.mainLoop.remainingBlockers;
            var next = remaining%1 == 0 ? remaining-1 : Math.floor(remaining);
            if (blocker.counted) {
              Browser.mainLoop.remainingBlockers = next;
            } else {
              // not counted, but move the progress along a tiny bit
              next = next + 0.5; // do not steal all the next one's progress
              Browser.mainLoop.remainingBlockers = (8*remaining + next)/9;
            }
          }
          console.log('main loop blocker " + blocker.name + ' took ' + (Date.now() - start) + ' ms'); //, left: ' + Browser.mainLoop.remainingBlockers);
          Browser.mainLoop.updateStatus();
          
          // catches pause/resume main loop from blocker execution
          if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
          
          setTimeout(Browser.mainLoop.runner, 0);
          return;
        }
  
        // catch pauses from non-main loop sources
        if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
  
        // Implement very basic swap interval control
        Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0;
        if (Browser.mainLoop.timingMode == 1/*EM_TIMING_RAF*/ && Browser.mainLoop.timingValue > 1 && Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0) {
          // Not the scheduled time to render this frame - skip.
          Browser.mainLoop.scheduler();
          return;
        } else if (Browser.mainLoop.timingMode == 0/*EM_TIMING_SETTIMEOUT*/) {
          Browser.mainLoop.tickStartTime = _emscripten_get_now();
        }
  
        // Signal GL rendering layer that processing of a new frame is about to start. This helps it optimize
        // VBO double-buffering and reduce GPU stalls.
  
  
        if (Browser.mainLoop.method === 'timeout' && Module.ctx) {
          Module.printErr('Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!');
          Browser.mainLoop.method = '; // just warn once per call to set main loop
        }
  
        Browser.mainLoop.runIter(browserIterationFunc);
  
        checkStackCookie();
  
        // catch pauses from the main loop itself
        if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
  
        // Queue new audio data. This is important to be right after the main loop invocation, so that we will immediately be able
        // to queue the newest produced audio samples.
        // TODO: Consider adding pre- and post- rAF callbacks so that GL.newRenderingFrameStarted() and SDL.audio.queueNewAudioData()
        //       do not need to be hardcoded into this function, but can be more generic.
        if (typeof SDL === 'object' && SDL.audio && SDL.audio.queueNewAudioData) SDL.audio.queueNewAudioData();
  
        Browser.mainLoop.scheduler();
      }
  
      if (!noSetTiming) {
        if (fps && fps > 0) _emscripten_set_main_loop_timing(0/*EM_TIMING_SETTIMEOUT*/, 1000.0 / fps);
        else _emscripten_set_main_loop_timing(1/*EM_TIMING_RAF*/, 1); // Do rAF by rendering each frame (no decimating)
  
        Browser.mainLoop.scheduler();
      }
  
      if (simulateInfiniteLoop) {
        throw 'SimulateInfiniteLoop';
      }
    }var Browser={mainLoop:{scheduler:null,method:",currentlyRunningMainloop:0,func:null,arg:0,timingMode:0,timingValue:0,currentFrameNumber:0,queue:[],pause:function () {
          Browser.mainLoop.scheduler = null;
          Browser.mainLoop.currentlyRunningMainloop++; // Incrementing this signals the previous main loop that it's now become old, and it must return.
        },resume:function () {
          Browser.mainLoop.currentlyRunningMainloop++;
          var timingMode = Browser.mainLoop.timingMode;
          var timingValue = Browser.mainLoop.timingValue;
          var func = Browser.mainLoop.func;
          Browser.mainLoop.func = null;
          _emscripten_set_main_loop(func, 0, false, Browser.mainLoop.arg, true /* do not set timing and call scheduler, we will do it on the next lines */);
          _emscripten_set_main_loop_timing(timingMode, timingValue);
          Browser.mainLoop.scheduler();
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus'](');
            }
          }
        },runIter:function (func) {
          if (ABORT) return;
          if (Module['preMainLoop']) {
            var preRet = Module['preMainLoop']();
            if (preRet === false) {
              return; // |return false| skips a frame
            }
          }
          try {
            func();
          } catch (e) {
            if (e instanceof ExitStatus) {
              return;
            } else {
              if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
              throw e;
            }
          }
          if (Module['postMainLoop']) Module['postMainLoop']();
        }},isFullscreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          assert(typeof url == 'string', 'createObjectURL must return a url as a string');
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            assert(typeof url == 'string', 'createObjectURL must return a url as a string');
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = ';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === Module['canvas'] ||
                                document['mozPointerLockElement'] === Module['canvas'] ||
                                document['webkitPointerLockElement'] === Module['canvas'] ||
                                document['msPointerLockElement'] === Module['canvas'];
        }
        var canvas = Module['canvas'];
        if (canvas) {
          // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
          // Module['forcedAspectRatio'] = 4 / 3;
          
          canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                      canvas['mozRequestPointerLock'] ||
                                      canvas['webkitRequestPointerLock'] ||
                                      canvas['msRequestPointerLock'] ||
                                      function(){};
          canvas.exitPointerLock = document['exitPointerLock'] ||
                                   document['mozExitPointerLock'] ||
                                   document['webkitExitPointerLock'] ||
                                   document['msExitPointerLock'] ||
                                   function(){}; // no-op if function does not exist
          canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
          document.addEventListener('pointerlockchange', pointerLockChange, false);
          document.addEventListener('mozpointerlockchange', pointerLockChange, false);
          document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
          document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
          if (Module['elementPointerLock']) {
            canvas.addEventListener("click", function(ev) {
              if (!Browser.pointerLock && Module['canvas'].requestPointerLock) {
                Module['canvas'].requestPointerLock();
                ev.preventDefault();
              }
            }, false);
          }
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx; // no need to recreate GL context if it's already been created for this canvas.
  
        var ctx;
        var contextHandle;
        if (useWebGL) {
          // For GLES2/desktop GL compatibility, adjust a few defaults to be different to WebGL defaults, so that they align better with the desktop defaults.
          var contextAttributes = {
            antialias: false,
            alpha: false
          };
  
          if (webGLContextAttributes) {
            for (var attribute in webGLContextAttributes) {
              contextAttributes[attribute] = webGLContextAttributes[attribute];
            }
          }
  
          contextHandle = GL.createContext(canvas, contextAttributes);
          if (contextHandle) {
            ctx = GL.getContext(contextHandle).GLctx;
          }
        } else {
          ctx = canvas.getContext('2d');
        }
  
        if (!ctx) return null;
  
        if (setInModule) {
          if (!useWebGL) assert(typeof GLctx === 'undefined', 'cannot set in module if GLctx is used, but we are a non-GL context that would replace it');
  
          Module.ctx = ctx;
          if (useWebGL) GL.makeContextCurrent(contextHandle);
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullscreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullscreen:function (lockPointer, resizeCanvas, vrDevice) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        Browser.vrDevice = vrDevice;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        if (typeof Browser.vrDevice === 'undefined') Browser.vrDevice = null;
  
        var canvas = Module['canvas'];
        function fullscreenChange() {
          Browser.isFullscreen = false;
          var canvasContainer = canvas.parentNode;
          if ((document['fullscreenElement'] || document['mozFullScreenElement'] ||
               document['msFullscreenElement'] || document['webkitFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.exitFullscreen = document['exitFullscreen'] ||
                                    document['cancelFullScreen'] ||
                                    document['mozCancelFullScreen'] ||
                                    document['msExitFullscreen'] ||
                                    document['webkitCancelFullScreen'] ||
                                    function() {};
            canvas.exitFullscreen = canvas.exitFullscreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullscreen = true;
            if (Browser.resizeCanvas) Browser.setFullscreenCanvasSize();
          } else {
            
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
            
            if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullscreen);
          if (Module['onFullscreen']) Module['onFullscreen'](Browser.isFullscreen);
          Browser.updateCanvasDimensions(canvas);
        }
  
        if (!Browser.fullscreenHandlersInstalled) {
          Browser.fullscreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullscreenChange, false);
          document.addEventListener('mozfullscreenchange', fullscreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullscreenChange, false);
          document.addEventListener('MSFullscreenChange', fullscreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
  
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullscreen = canvasContainer['requestFullscreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullscreen'] ? function() { canvasContainer['webkitRequestFullscreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null) ||
                                           (canvasContainer['webkitRequestFullScreen'] ? function() { canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
  
        if (vrDevice) {
          canvasContainer.requestFullscreen({ vrDisplay: vrDevice });
        } else {
          canvasContainer.requestFullscreen();
        }
      },requestFullScreen:function (lockPointer, resizeCanvas, vrDevice) {
          Module.printErr('Browser.requestFullScreen() is deprecated. Please call Browser.requestFullscreen instead.');
          Browser.requestFullScreen = function(lockPointer, resizeCanvas, vrDevice) {
            return Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice);
          }
          return Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice);
      },nextRAF:0,fakeRequestAnimationFrame:function (func) {
        // try to keep 60fps between calls to here
        var now = Date.now();
        if (Browser.nextRAF === 0) {
          Browser.nextRAF = now + 1000/60;
        } else {
          while (now + 2 >= Browser.nextRAF) { // fudge a little, to avoid timer jitter causing us to do lots of delay:0
            Browser.nextRAF += 1000/60;
          }
        }
        var delay = Math.max(Browser.nextRAF - now, 0);
        setTimeout(func, delay);
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          Browser.fakeRequestAnimationFrame(func);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           Browser.fakeRequestAnimationFrame;
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },allowAsyncCallbacks:true,queuedAsyncCallbacks:[],pauseAsyncCallbacks:function () {
        Browser.allowAsyncCallbacks = false;
      },resumeAsyncCallbacks:function () { // marks future callbacks as ok to execute, and synchronously runs any remaining ones right now
        Browser.allowAsyncCallbacks = true;
        if (Browser.queuedAsyncCallbacks.length > 0) {
          var callbacks = Browser.queuedAsyncCallbacks;
          Browser.queuedAsyncCallbacks = [];
          callbacks.forEach(function(func) {
            func();
          });
        }
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (ABORT) return;
          if (Browser.allowAsyncCallbacks) {
            func();
          } else {
            Browser.queuedAsyncCallbacks.push(func);
          }
        });
      },safeSetTimeout:function (func, timeout) {
        Module['noExitRuntime'] = true;
        return setTimeout(function() {
          if (ABORT) return;
          if (Browser.allowAsyncCallbacks) {
            func();
          } else {
            Browser.queuedAsyncCallbacks.push(func);
          }
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        Module['noExitRuntime'] = true;
        return setInterval(function() {
          if (ABORT) return;
          if (Browser.allowAsyncCallbacks) {
            func();
          } // drop it on the floor otherwise, next interval will kick in
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        var delta = 0;
        switch (event.type) {
          case 'DOMMouseScroll': 
            delta = event.detail;
            break;
          case 'mousewheel': 
            delta = event.wheelDelta;
            break;
          case 'wheel': 
            delta = event['deltaY'];
            break;
          default:
            throw 'unrecognized mouse wheel event: ' + event.type;
        }
        return delta;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,touches:{},lastTouches:{},calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
  
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
          // If this assert lands, it's likely because the browser doesn't support scrollX or pageXOffset
          // and we have no viable fallback.
          assert((typeof scrollX !== 'undefined') && (typeof scrollY !== 'undefined'), 'Unable to retrieve scroll position, mouse positions likely broken.');
  
          if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
            var touch = event.touch;
            if (touch === undefined) {
              return; // the "touch" property is only defined in SDL
  
            }
            var adjustedX = touch.pageX - (scrollX + rect.left);
            var adjustedY = touch.pageY - (scrollY + rect.top);
  
            adjustedX = adjustedX * (cw / rect.width);
            adjustedY = adjustedY * (ch / rect.height);
  
            var coords = { x: adjustedX, y: adjustedY };
            
            if (event.type === 'touchstart') {
              Browser.lastTouches[touch.identifier] = coords;
              Browser.touches[touch.identifier] = coords;
            } else if (event.type === 'touchend' || event.type === 'touchmove') {
              var last = Browser.touches[touch.identifier];
              if (!last) last = coords;
              Browser.lastTouches[touch.identifier] = last;
              Browser.touches[touch.identifier] = coords;
            } 
            return;
          }
  
          var x = event.pageX - (scrollX + rect.left);
          var y = event.pageY - (scrollY + rect.top);
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        var dep = !noRunDep ? getUniqueRunDependency('al ' + url) : ';
        Module['readAsync'](url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file " + url + ' failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (dep) removeRunDependency(dep);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file " + url + ' failed.';
          }
        });
        if (dep) addRunDependency(dep);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullscreenCanvasSize:function () {
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = ((SAFE_HEAP_LOAD(((SDL.screen+Runtime.QUANTUM_SIZE*0)|0), 4, 1))|0);
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	SAFE_HEAP_STORE(((SDL.screen+Runtime.QUANTUM_SIZE*0)|0), ((flags)|0), 4)
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = ((SAFE_HEAP_LOAD(((SDL.screen+Runtime.QUANTUM_SIZE*0)|0), 4, 1))|0);
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	SAFE_HEAP_STORE(((SDL.screen+Runtime.QUANTUM_SIZE*0)|0), ((flags)|0), 4)
        }
        Browser.updateResizeListeners();
      },updateCanvasDimensions:function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['fullscreenElement'] || document['mozFullScreenElement'] ||
             document['msFullscreenElement'] || document['webkitFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      },wgetRequests:{},nextWgetRequestHandle:0,getNextWgetRequestHandle:function () {
        var handle = Browser.nextWgetRequestHandle;
        Browser.nextWgetRequestHandle++;
        return handle;
      }};function _emscripten_worker_respond(data, size) {
      if (workerResponded) throw 'already responded with final response!';
      workerResponded = true;
      var transferObject = {
        'callbackId': workerCallbackId,
        'finalResponse': true,
        'data': data ? new Uint8Array(HEAPU8.subarray((data),(data + size))) : 0
      };
      if (data) {
        postMessage(transferObject, [transferObject.data.buffer]);
      } else {
        postMessage(transferObject);
      }
    }

  
  function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
    }
  
  
  
  var EXCEPTIONS={last:0,caught:[],infos:{},deAdjust:function (adjusted) {
        if (!adjusted || EXCEPTIONS.infos[adjusted]) return adjusted;
        for (var ptr in EXCEPTIONS.infos) {
          var info = EXCEPTIONS.infos[ptr];
          if (info.adjusted === adjusted) {
            return ptr;
          }
        }
        return adjusted;
      },addRef:function (ptr) {
        if (!ptr) return;
        var info = EXCEPTIONS.infos[ptr];
        info.refcount++;
      },decRef:function (ptr) {
        if (!ptr) return;
        var info = EXCEPTIONS.infos[ptr];
        assert(info.refcount > 0);
        info.refcount--;
        // A rethrown exception can reach refcount 0; it must not be discarded
        // Its next handler will clear the rethrown flag and addRef it, prior to
        // final decRef and destruction here
        if (info.refcount === 0 && !info.rethrown) {
          if (info.destructor) {
            Module['dynCall_vi'](info.destructor, ptr);
          }
          delete EXCEPTIONS.infos[ptr];
          ___cxa_free_exception(ptr);
        }
      },clearRef:function (ptr) {
        if (!ptr) return;
        var info = EXCEPTIONS.infos[ptr];
        info.refcount = 0;
      }};
  function ___resumeException(ptr) {
      if (!EXCEPTIONS.last) { EXCEPTIONS.last = ptr; }
      throw ptr;
    }function ___cxa_find_matching_catch() {
      var thrown = EXCEPTIONS.last;
      if (!thrown) {
        // just pass through the null ptr
        return ((Runtime.setTempRet0(0),0)|0);
      }
      var info = EXCEPTIONS.infos[thrown];
      var throwntype = info.type;
      if (!throwntype) {
        // just pass through the thrown ptr
        return ((Runtime.setTempRet0(0),thrown)|0);
      }
      var typeArray = Array.prototype.slice.call(arguments);
  
      var pointer = Module['___cxa_is_pointer_type'](throwntype);
      // can_catch receives a **, add indirection
      if (!___cxa_find_matching_catch.buffer) ___cxa_find_matching_catch.buffer = _malloc(4);
      SAFE_HEAP_STORE(((___cxa_find_matching_catch.buffer)|0), ((thrown)|0), 4);
      thrown = ___cxa_find_matching_catch.buffer;
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        if (typeArray[i] && Module['___cxa_can_catch'](typeArray[i], throwntype, thrown)) {
          thrown = ((SAFE_HEAP_LOAD(((thrown)|0), 4, 0))|0); // undo indirection
          info.adjusted = thrown;
          return ((Runtime.setTempRet0(typeArray[i]),thrown)|0);
        }
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      thrown = ((SAFE_HEAP_LOAD(((thrown)|0), 4, 0))|0); // undo indirection
      return ((Runtime.setTempRet0(throwntype),thrown)|0);
    }function ___gxx_personality_v0() {
    }

  function _abort() {
      Module['abort']();
    }

  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas, vrDevice) { Module.printErr("Module.requestFullScreen is deprecated. Please call Module.requestFullscreen instead."); Module["requestFullScreen"] = Module["requestFullscreen"]; Browser.requestFullScreen(lockPointer, resizeCanvas, vrDevice) };
  Module["requestFullscreen"] = function Module_requestFullscreen(lockPointer, resizeCanvas, vrDevice) { Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
  Module["createContext"] = function Module_createContext(canvas, useWebGL, setInModule, webGLContextAttributes) { return Browser.createContext(canvas, useWebGL, setInModule, webGLContextAttributes) };
if (ENVIRONMENT_IS_NODE) {
    _emscripten_get_now = function _emscripten_get_now_actual() {
      var t = process['hrtime']();
      return t[0] * 1e3 + t[1] / 1e6;
    };
  } else if (typeof dateNow !== 'undefined') {
    _emscripten_get_now = dateNow;
  } else if (typeof self === 'object' && self['performance'] && typeof self['performance']['now'] === 'function') {
    _emscripten_get_now = function() { return self['performance']['now'](); };
  } else if (typeof performance === 'object' && typeof performance['now'] === 'function') {
    _emscripten_get_now = function() { return performance['now'](); };
  } else {
    _emscripten_get_now = Date.now;
  };
DYNAMICTOP_PTR = allocate(1, "i32", ALLOC_STATIC);

STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

STACK_MAX = STACK_BASE + TOTAL_STACK;

DYNAMIC_BASE = Runtime.alignMemory(STACK_MAX);

HEAP32[DYNAMICTOP_PTR>>2] = DYNAMIC_BASE;

staticSealed = true; // seal the static portion of memory

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");


var debug_table_iiii = ["0", "0", "0", "0", "0", "__ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv", "0", "0"];
var debug_table_vi = ["0", "__ZN10__cxxabiv116__shim_type_infoD2Ev", "__ZN10__cxxabiv117__class_type_infoD0Ev", "__ZNK10__cxxabiv116__shim_type_info5noop1Ev", "__ZNK10__cxxabiv116__shim_type_info5noop2Ev", "0", "0", "0", "0", "__ZN10__cxxabiv120__si_class_type_infoD0Ev", "0", "0", "0", "0", "0", "0"];
var debug_table_viiiiii = ["0", "0", "0", "0", "0", "0", "__ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib", "0", "0", "0", "__ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib", "0", "0", "0", "0", "0"];
var debug_table_viiiii = ["0", "0", "0", "0", "0", "0", "0", "__ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib", "0", "0", "0", "__ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib", "0", "0", "0", "0"];
var debug_table_viiii = ["0", "0", "0", "0", "0", "0", "0", "0", "__ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi", "0", "0", "0", "__ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi", "0", "0", "0"];
function nullFunc_iiii(x) { Module["printErr"]("Invalid function pointer ' + x + " called with signature 'iiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("This pointer might make sense in another type signature: viiii: " + debug_table_viiii[x] + "  vi: " + debug_table_vi[x] + "  viiiii: " + debug_table_viiiii[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  "); abort(x) }

function nullFunc_vi(x) { Module["printErr"]("Invalid function pointer ' + x + " called with signature 'vi'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("This pointer might make sense in another type signature: viiii: " + debug_table_viiii[x] + "  viiiii: " + debug_table_viiiii[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  iiii: " + debug_table_iiii[x] + "  "); abort(x) }

function nullFunc_viiiiii(x) { Module["printErr"]("Invalid function pointer ' + x + " called with signature 'viiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("This pointer might make sense in another type signature: viiii: " + debug_table_viiii[x] + "  viiiii: " + debug_table_viiiii[x] + "  vi: " + debug_table_vi[x] + "  iiii: " + debug_table_iiii[x] + "  "); abort(x) }

function nullFunc_viiiii(x) { Module["printErr"]("Invalid function pointer ' + x + " called with signature 'viiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("This pointer might make sense in another type signature: viiii: " + debug_table_viiii[x] + "  vi: " + debug_table_vi[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  iiii: " + debug_table_iiii[x] + "  "); abort(x) }

function nullFunc_viiii(x) { Module["printErr"]("Invalid function pointer ' + x + " called with signature 'viiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("This pointer might make sense in another type signature: vi: " + debug_table_vi[x] + "  viiiii: " + debug_table_viiiii[x] + "  viiiiii: " + debug_table_viiiiii[x] + "  iiii: " + debug_table_iiii[x] + "  "); abort(x) }

function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module["setThrew"](1, 0);
  }
}

function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module["setThrew"](1, 0);
  }
}

function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiii"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module["setThrew"](1, 0);
  }
}

function invoke_viiiii(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module["setThrew"](1, 0);
  }
}

function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    Module["setThrew"](1, 0);
  }
}

Module.asmGlobalArg = { "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array, "NaN": NaN, "Infinity": Infinity, "byteLength": byteLength };

Module.asmLibraryArg = { "abort": abort, "assert": assert, "enlargeMemory": enlargeMemory, "getTotalMemory": getTotalMemory, "abortOnCannotGrowMemory": abortOnCannotGrowMemory, "abortStackOverflow": abortStackOverflow, "segfault": segfault, "alignfault": alignfault, "ftfault": ftfault, "nullFunc_iiii": nullFunc_iiii, "nullFunc_vi": nullFunc_vi, "nullFunc_viiiiii": nullFunc_viiiiii, "nullFunc_viiiii": nullFunc_viiiii, "nullFunc_viiii": nullFunc_viiii, "invoke_iiii": invoke_iiii, "invoke_vi": invoke_vi, "invoke_viiiiii": invoke_viiiiii, "invoke_viiiii": invoke_viiiii, "invoke_viiii": invoke_viiii, "_abort": _abort, "___setErrNo": ___setErrNo, "_emscripten_worker_respond": _emscripten_worker_respond, "_emscripten_set_main_loop_timing": _emscripten_set_main_loop_timing, "_emscripten_memcpy_big": _emscripten_memcpy_big, "___gxx_personality_v0": ___gxx_personality_v0, "___resumeException": ___resumeException, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "_emscripten_set_main_loop": _emscripten_set_main_loop, "_emscripten_get_now": _emscripten_get_now, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "DYNAMICTOP_PTR": DYNAMICTOP_PTR, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX };
// EMSCRIPTEN_START_ASM
var asm = (function(global, env, buffer) {
'almost asm';


  var Int8View = global.Int8Array;
  var HEAP8 = new Int8View(buffer);
  var Int16View = global.Int16Array;
  var HEAP16 = new Int16View(buffer);
  var Int32View = global.Int32Array;
  var HEAP32 = new Int32View(buffer);
  var Uint8View = global.Uint8Array;
  var HEAPU8 = new Uint8View(buffer);
  var Uint16View = global.Uint16Array;
  var HEAPU16 = new Uint16View(buffer);
  var Uint32View = global.Uint32Array;
  var HEAPU32 = new Uint32View(buffer);
  var Float32View = global.Float32Array;
  var HEAPF32 = new Float32View(buffer);
  var Float64View = global.Float64Array;
  var HEAPF64 = new Float64View(buffer);
  var byteLength = global.byteLength;

  var DYNAMICTOP_PTR=env.DYNAMICTOP_PTR|0;
  var tempDoublePtr=env.tempDoublePtr|0;
  var ABORT=env.ABORT|0;
  var STACKTOP=env.STACKTOP|0;
  var STACK_MAX=env.STACK_MAX|0;

  var __THREW__ = 0;
  var threwValue = 0;
  var setjmpId = 0;
  var undef = 0;
  var nan = global.NaN, inf = global.Infinity;
  var tempInt = 0, tempBigInt = 0, tempBigIntS = 0, tempValue = 0, tempDouble = 0.0;
  var tempRet0 = 0;

  var Math_floor=global.Math.floor;
  var Math_abs=global.Math.abs;
  var Math_sqrt=global.Math.sqrt;
  var Math_pow=global.Math.pow;
  var Math_cos=global.Math.cos;
  var Math_sin=global.Math.sin;
  var Math_tan=global.Math.tan;
  var Math_acos=global.Math.acos;
  var Math_asin=global.Math.asin;
  var Math_atan=global.Math.atan;
  var Math_atan2=global.Math.atan2;
  var Math_exp=global.Math.exp;
  var Math_log=global.Math.log;
  var Math_ceil=global.Math.ceil;
  var Math_imul=global.Math.imul;
  var Math_min=global.Math.min;
  var Math_max=global.Math.max;
  var Math_clz32=global.Math.clz32;
  var abort=env.abort;
  var assert=env.assert;
  var enlargeMemory=env.enlargeMemory;
  var getTotalMemory=env.getTotalMemory;
  var abortOnCannotGrowMemory=env.abortOnCannotGrowMemory;
  var abortStackOverflow=env.abortStackOverflow;
  var segfault=env.segfault;
  var alignfault=env.alignfault;
  var ftfault=env.ftfault;
  var nullFunc_iiii=env.nullFunc_iiii;
  var nullFunc_vi=env.nullFunc_vi;
  var nullFunc_viiiiii=env.nullFunc_viiiiii;
  var nullFunc_viiiii=env.nullFunc_viiiii;
  var nullFunc_viiii=env.nullFunc_viiii;
  var invoke_iiii=env.invoke_iiii;
  var invoke_vi=env.invoke_vi;
  var invoke_viiiiii=env.invoke_viiiiii;
  var invoke_viiiii=env.invoke_viiiii;
  var invoke_viiii=env.invoke_viiii;
  var _abort=env._abort;
  var ___setErrNo=env.___setErrNo;
  var _emscripten_worker_respond=env._emscripten_worker_respond;
  var _emscripten_set_main_loop_timing=env._emscripten_set_main_loop_timing;
  var _emscripten_memcpy_big=env._emscripten_memcpy_big;
  var ___gxx_personality_v0=env.___gxx_personality_v0;
  var ___resumeException=env.___resumeException;
  var __ZSt18uncaught_exceptionv=env.__ZSt18uncaught_exceptionv;
  var _emscripten_set_main_loop=env._emscripten_set_main_loop;
  var _emscripten_get_now=env._emscripten_get_now;
  var ___cxa_find_matching_catch=env.___cxa_find_matching_catch;
  var tempFloat = 0.0;

function _emscripten_replace_memory(newBuffer) {
  if ((byteLength(newBuffer) & 0xffffff || byteLength(newBuffer) <= 0xffffff) || byteLength(newBuffer) > 0x80000000) return false;
  HEAP8 = new Int8View(newBuffer);
  HEAP16 = new Int16View(newBuffer);
  HEAP32 = new Int32View(newBuffer);
  HEAPU8 = new Uint8View(newBuffer);
  HEAPU16 = new Uint16View(newBuffer);
  HEAPU32 = new Uint32View(newBuffer);
  HEAPF32 = new Float32View(newBuffer);
  HEAPF64 = new Float64View(newBuffer);
  buffer = newBuffer;
  return true;
}

// EMSCRIPTEN_START_FUNCS

function _malloc($0) {
 $0 = $0 | 0;
 var $$$0192$i = 0, $$$0193$i = 0, $$$4236$i = 0, $$$4351$i = 0, $$$i = 0, $$0 = 0, $$0$i$i = 0, $$0$i$i$i = 0, $$0$i18$i = 0, $$01$i$i = 0, $$0189$i = 0, $$0192$lcssa$i = 0, $$01928$i = 0, $$0193$lcssa$i = 0, $$01937$i = 0, $$0197 = 0, $$0199 = 0, $$0206$i$i = 0, $$0207$i$i = 0, $$0211$i$i = 0;
 var $$0212$i$i = 0, $$024371$i = 0, $$0287$i$i = 0, $$0288$i$i = 0, $$0289$i$i = 0, $$0295$i$i = 0, $$0296$i$i = 0, $$0342$i = 0, $$0344$i = 0, $$0345$i = 0, $$0347$i = 0, $$0353$i = 0, $$0358$i = 0, $$0359$$i = 0, $$0359$i = 0, $$0361$i = 0, $$0362$i = 0, $$0368$i = 0, $$1196$i = 0, $$1198$i = 0;
 var $$124470$i = 0, $$1291$i$i = 0, $$1293$i$i = 0, $$1343$i = 0, $$1348$i = 0, $$1363$i = 0, $$1370$i = 0, $$1374$i = 0, $$2234253237$i = 0, $$2247$ph$i = 0, $$2253$ph$i = 0, $$2355$i = 0, $$3$i = 0, $$3$i$i = 0, $$3$i201 = 0, $$3350$i = 0, $$3372$i = 0, $$4$lcssa$i = 0, $$4$ph$i = 0, $$415$i = 0;
 var $$4236$i = 0, $$4351$lcssa$i = 0, $$435114$i = 0, $$4357$$4$i = 0, $$4357$ph$i = 0, $$435713$i = 0, $$723948$i = 0, $$749$i = 0, $$pre = 0, $$pre$i = 0, $$pre$i$i = 0, $$pre$i19$i = 0, $$pre$i210 = 0, $$pre$i212 = 0, $$pre$phi$i$iZ2D = 0, $$pre$phi$i20$iZ2D = 0, $$pre$phi$i211Z2D = 0, $$pre$phi$iZ2D = 0, $$pre$phi11$i$iZ2D = 0, $$pre$phiZ2D = 0;
 var $$pre10$i$i = 0, $$sink1$i = 0, $$sink1$i$i = 0, $$sink16$i = 0, $$sink2$i = 0, $$sink2$i204 = 0, $$sink3$i = 0, $1 = 0, $10 = 0, $100 = 0, $1000 = 0, $1001 = 0, $1002 = 0, $1003 = 0, $1004 = 0, $1005 = 0, $1006 = 0, $1007 = 0, $1008 = 0, $1009 = 0;
 var $101 = 0, $1010 = 0, $1011 = 0, $1012 = 0, $1013 = 0, $1014 = 0, $1015 = 0, $1016 = 0, $1017 = 0, $1018 = 0, $1019 = 0, $102 = 0, $1020 = 0, $1021 = 0, $1022 = 0, $1023 = 0, $1024 = 0, $1025 = 0, $1026 = 0, $1027 = 0;
 var $1028 = 0, $1029 = 0, $103 = 0, $1030 = 0, $1031 = 0, $1032 = 0, $1033 = 0, $1034 = 0, $1035 = 0, $1036 = 0, $1037 = 0, $1038 = 0, $1039 = 0, $104 = 0, $1040 = 0, $1041 = 0, $1042 = 0, $1043 = 0, $1044 = 0, $1045 = 0;
 var $1046 = 0, $1047 = 0, $1048 = 0, $1049 = 0, $105 = 0, $1050 = 0, $1051 = 0, $1052 = 0, $1053 = 0, $1054 = 0, $1055 = 0, $1056 = 0, $1057 = 0, $1058 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0;
 var $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0;
 var $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0;
 var $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0;
 var $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0;
 var $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0;
 var $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0;
 var $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0;
 var $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0;
 var $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0;
 var $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0;
 var $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0;
 var $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0;
 var $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0, $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0;
 var $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0, $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0;
 var $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0, $372 = 0, $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0;
 var $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0, $388 = 0, $389 = 0, $39 = 0, $390 = 0, $391 = 0, $392 = 0, $393 = 0, $394 = 0, $395 = 0, $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0;
 var $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0, $404 = 0, $405 = 0, $406 = 0, $407 = 0, $408 = 0, $409 = 0, $41 = 0, $410 = 0, $411 = 0, $412 = 0, $413 = 0, $414 = 0, $415 = 0, $416 = 0, $417 = 0;
 var $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0, $422 = 0, $423 = 0, $424 = 0, $425 = 0, $426 = 0, $427 = 0, $428 = 0, $429 = 0, $43 = 0, $430 = 0, $431 = 0, $432 = 0, $433 = 0, $434 = 0, $435 = 0;
 var $436 = 0, $437 = 0, $438 = 0, $439 = 0, $44 = 0, $440 = 0, $441 = 0, $442 = 0, $443 = 0, $444 = 0, $445 = 0, $446 = 0, $447 = 0, $448 = 0, $449 = 0, $45 = 0, $450 = 0, $451 = 0, $452 = 0, $453 = 0;
 var $454 = 0, $455 = 0, $456 = 0, $457 = 0, $458 = 0, $459 = 0, $46 = 0, $460 = 0, $461 = 0, $462 = 0, $463 = 0, $464 = 0, $465 = 0, $466 = 0, $467 = 0, $468 = 0, $469 = 0, $47 = 0, $470 = 0, $471 = 0;
 var $472 = 0, $473 = 0, $474 = 0, $475 = 0, $476 = 0, $477 = 0, $478 = 0, $479 = 0, $48 = 0, $480 = 0, $481 = 0, $482 = 0, $483 = 0, $484 = 0, $485 = 0, $486 = 0, $487 = 0, $488 = 0, $489 = 0, $49 = 0;
 var $490 = 0, $491 = 0, $492 = 0, $493 = 0, $494 = 0, $495 = 0, $496 = 0, $497 = 0, $498 = 0, $499 = 0, $5 = 0, $50 = 0, $500 = 0, $501 = 0, $502 = 0, $503 = 0, $504 = 0, $505 = 0, $506 = 0, $507 = 0;
 var $508 = 0, $509 = 0, $51 = 0, $510 = 0, $511 = 0, $512 = 0, $513 = 0, $514 = 0, $515 = 0, $516 = 0, $517 = 0, $518 = 0, $519 = 0, $52 = 0, $520 = 0, $521 = 0, $522 = 0, $523 = 0, $524 = 0, $525 = 0;
 var $526 = 0, $527 = 0, $528 = 0, $529 = 0, $53 = 0, $530 = 0, $531 = 0, $532 = 0, $533 = 0, $534 = 0, $535 = 0, $536 = 0, $537 = 0, $538 = 0, $539 = 0, $54 = 0, $540 = 0, $541 = 0, $542 = 0, $543 = 0;
 var $544 = 0, $545 = 0, $546 = 0, $547 = 0, $548 = 0, $549 = 0, $55 = 0, $550 = 0, $551 = 0, $552 = 0, $553 = 0, $554 = 0, $555 = 0, $556 = 0, $557 = 0, $558 = 0, $559 = 0, $56 = 0, $560 = 0, $561 = 0;
 var $562 = 0, $563 = 0, $564 = 0, $565 = 0, $566 = 0, $567 = 0, $568 = 0, $569 = 0, $57 = 0, $570 = 0, $571 = 0, $572 = 0, $573 = 0, $574 = 0, $575 = 0, $576 = 0, $577 = 0, $578 = 0, $579 = 0, $58 = 0;
 var $580 = 0, $581 = 0, $582 = 0, $583 = 0, $584 = 0, $585 = 0, $586 = 0, $587 = 0, $588 = 0, $589 = 0, $59 = 0, $590 = 0, $591 = 0, $592 = 0, $593 = 0, $594 = 0, $595 = 0, $596 = 0, $597 = 0, $598 = 0;
 var $599 = 0, $6 = 0, $60 = 0, $600 = 0, $601 = 0, $602 = 0, $603 = 0, $604 = 0, $605 = 0, $606 = 0, $607 = 0, $608 = 0, $609 = 0, $61 = 0, $610 = 0, $611 = 0, $612 = 0, $613 = 0, $614 = 0, $615 = 0;
 var $616 = 0, $617 = 0, $618 = 0, $619 = 0, $62 = 0, $620 = 0, $621 = 0, $622 = 0, $623 = 0, $624 = 0, $625 = 0, $626 = 0, $627 = 0, $628 = 0, $629 = 0, $63 = 0, $630 = 0, $631 = 0, $632 = 0, $633 = 0;
 var $634 = 0, $635 = 0, $636 = 0, $637 = 0, $638 = 0, $639 = 0, $64 = 0, $640 = 0, $641 = 0, $642 = 0, $643 = 0, $644 = 0, $645 = 0, $646 = 0, $647 = 0, $648 = 0, $649 = 0, $65 = 0, $650 = 0, $651 = 0;
 var $652 = 0, $653 = 0, $654 = 0, $655 = 0, $656 = 0, $657 = 0, $658 = 0, $659 = 0, $66 = 0, $660 = 0, $661 = 0, $662 = 0, $663 = 0, $664 = 0, $665 = 0, $666 = 0, $667 = 0, $668 = 0, $669 = 0, $67 = 0;
 var $670 = 0, $671 = 0, $672 = 0, $673 = 0, $674 = 0, $675 = 0, $676 = 0, $677 = 0, $678 = 0, $679 = 0, $68 = 0, $680 = 0, $681 = 0, $682 = 0, $683 = 0, $684 = 0, $685 = 0, $686 = 0, $687 = 0, $688 = 0;
 var $689 = 0, $69 = 0, $690 = 0, $691 = 0, $692 = 0, $693 = 0, $694 = 0, $695 = 0, $696 = 0, $697 = 0, $698 = 0, $699 = 0, $7 = 0, $70 = 0, $700 = 0, $701 = 0, $702 = 0, $703 = 0, $704 = 0, $705 = 0;
 var $706 = 0, $707 = 0, $708 = 0, $709 = 0, $71 = 0, $710 = 0, $711 = 0, $712 = 0, $713 = 0, $714 = 0, $715 = 0, $716 = 0, $717 = 0, $718 = 0, $719 = 0, $72 = 0, $720 = 0, $721 = 0, $722 = 0, $723 = 0;
 var $724 = 0, $725 = 0, $726 = 0, $727 = 0, $728 = 0, $729 = 0, $73 = 0, $730 = 0, $731 = 0, $732 = 0, $733 = 0, $734 = 0, $735 = 0, $736 = 0, $737 = 0, $738 = 0, $739 = 0, $74 = 0, $740 = 0, $741 = 0;
 var $742 = 0, $743 = 0, $744 = 0, $745 = 0, $746 = 0, $747 = 0, $748 = 0, $749 = 0, $75 = 0, $750 = 0, $751 = 0, $752 = 0, $753 = 0, $754 = 0, $755 = 0, $756 = 0, $757 = 0, $758 = 0, $759 = 0, $76 = 0;
 var $760 = 0, $761 = 0, $762 = 0, $763 = 0, $764 = 0, $765 = 0, $766 = 0, $767 = 0, $768 = 0, $769 = 0, $77 = 0, $770 = 0, $771 = 0, $772 = 0, $773 = 0, $774 = 0, $775 = 0, $776 = 0, $777 = 0, $778 = 0;
 var $779 = 0, $78 = 0, $780 = 0, $781 = 0, $782 = 0, $783 = 0, $784 = 0, $785 = 0, $786 = 0, $787 = 0, $788 = 0, $789 = 0, $79 = 0, $790 = 0, $791 = 0, $792 = 0, $793 = 0, $794 = 0, $795 = 0, $796 = 0;
 var $797 = 0, $798 = 0, $799 = 0, $8 = 0, $80 = 0, $800 = 0, $801 = 0, $802 = 0, $803 = 0, $804 = 0, $805 = 0, $806 = 0, $807 = 0, $808 = 0, $809 = 0, $81 = 0, $810 = 0, $811 = 0, $812 = 0, $813 = 0;
 var $814 = 0, $815 = 0, $816 = 0, $817 = 0, $818 = 0, $819 = 0, $82 = 0, $820 = 0, $821 = 0, $822 = 0, $823 = 0, $824 = 0, $825 = 0, $826 = 0, $827 = 0, $828 = 0, $829 = 0, $83 = 0, $830 = 0, $831 = 0;
 var $832 = 0, $833 = 0, $834 = 0, $835 = 0, $836 = 0, $837 = 0, $838 = 0, $839 = 0, $84 = 0, $840 = 0, $841 = 0, $842 = 0, $843 = 0, $844 = 0, $845 = 0, $846 = 0, $847 = 0, $848 = 0, $849 = 0, $85 = 0;
 var $850 = 0, $851 = 0, $852 = 0, $853 = 0, $854 = 0, $855 = 0, $856 = 0, $857 = 0, $858 = 0, $859 = 0, $86 = 0, $860 = 0, $861 = 0, $862 = 0, $863 = 0, $864 = 0, $865 = 0, $866 = 0, $867 = 0, $868 = 0;
 var $869 = 0, $87 = 0, $870 = 0, $871 = 0, $872 = 0, $873 = 0, $874 = 0, $875 = 0, $876 = 0, $877 = 0, $878 = 0, $879 = 0, $88 = 0, $880 = 0, $881 = 0, $882 = 0, $883 = 0, $884 = 0, $885 = 0, $886 = 0;
 var $887 = 0, $888 = 0, $889 = 0, $89 = 0, $890 = 0, $891 = 0, $892 = 0, $893 = 0, $894 = 0, $895 = 0, $896 = 0, $897 = 0, $898 = 0, $899 = 0, $9 = 0, $90 = 0, $900 = 0, $901 = 0, $902 = 0, $903 = 0;
 var $904 = 0, $905 = 0, $906 = 0, $907 = 0, $908 = 0, $909 = 0, $91 = 0, $910 = 0, $911 = 0, $912 = 0, $913 = 0, $914 = 0, $915 = 0, $916 = 0, $917 = 0, $918 = 0, $919 = 0, $92 = 0, $920 = 0, $921 = 0;
 var $922 = 0, $923 = 0, $924 = 0, $925 = 0, $926 = 0, $927 = 0, $928 = 0, $929 = 0, $93 = 0, $930 = 0, $931 = 0, $932 = 0, $933 = 0, $934 = 0, $935 = 0, $936 = 0, $937 = 0, $938 = 0, $939 = 0, $94 = 0;
 var $940 = 0, $941 = 0, $942 = 0, $943 = 0, $944 = 0, $945 = 0, $946 = 0, $947 = 0, $948 = 0, $949 = 0, $95 = 0, $950 = 0, $951 = 0, $952 = 0, $953 = 0, $954 = 0, $955 = 0, $956 = 0, $957 = 0, $958 = 0;
 var $959 = 0, $96 = 0, $960 = 0, $961 = 0, $962 = 0, $963 = 0, $964 = 0, $965 = 0, $966 = 0, $967 = 0, $968 = 0, $969 = 0, $97 = 0, $970 = 0, $971 = 0, $972 = 0, $973 = 0, $974 = 0, $975 = 0, $976 = 0;
 var $977 = 0, $978 = 0, $979 = 0, $98 = 0, $980 = 0, $981 = 0, $982 = 0, $983 = 0, $984 = 0, $985 = 0, $986 = 0, $987 = 0, $988 = 0, $989 = 0, $99 = 0, $990 = 0, $991 = 0, $992 = 0, $993 = 0, $994 = 0;
 var $995 = 0, $996 = 0, $997 = 0, $998 = 0, $999 = 0, $cond$i = 0, $cond$i$i = 0, $cond$i208 = 0, $exitcond$i$i = 0, $not$$i = 0, $not$$i$i = 0, $not$$i17$i = 0, $not$$i209 = 0, $not$$i216 = 0, $not$1$i = 0, $not$1$i203 = 0, $not$5$i = 0, $not$7$i$i = 0, $not$8$i = 0, $not$9$i = 0;
 var $or$cond$i = 0, $or$cond$i214 = 0, $or$cond1$i = 0, $or$cond10$i = 0, $or$cond11$i = 0, $or$cond11$not$i = 0, $or$cond12$i = 0, $or$cond2$i = 0, $or$cond2$i215 = 0, $or$cond5$i = 0, $or$cond50$i = 0, $or$cond51$i = 0, $or$cond7$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16 | 0;
 if ((STACKTOP | 0) >= (STACK_MAX | 0)) abortStackOverflow(16 | 0);
 $1 = sp;
 $2 = $0 >>> 0 < 245;
 do {
  if ($2) {
   $3 = $0 >>> 0 < 11;
   $4 = $0 + 11 | 0;
   $5 = $4 & -8;
   $6 = $3 ? 16 : $5;
   $7 = $6 >>> 3;
   $8 = SAFE_HEAP_LOAD(164 * 4 | 0, 4, 0) | 0 | 0;
   $9 = $8 >>> $7;
   $10 = $9 & 3;
   $11 = ($10 | 0) == 0;
   if (!$11) {
    $12 = $9 & 1;
    $13 = $12 ^ 1;
    $14 = $13 + $7 | 0;
    $15 = $14 << 1;
    $16 = 696 + ($15 << 2) | 0;
    $17 = $16 + 8 | 0;
    $18 = SAFE_HEAP_LOAD($17 | 0, 4, 0) | 0 | 0;
    $19 = $18 + 8 | 0;
    $20 = SAFE_HEAP_LOAD($19 | 0, 4, 0) | 0 | 0;
    $21 = ($16 | 0) == ($20 | 0);
    do {
     if ($21) {
      $22 = 1 << $14;
      $23 = $22 ^ -1;
      $24 = $8 & $23;
      SAFE_HEAP_STORE(164 * 4 | 0, $24 | 0, 4);
     } else {
      $25 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
      $26 = $20 >>> 0 < $25 >>> 0;
      if ($26) {
       _abort();
      }
      $27 = $20 + 12 | 0;
      $28 = SAFE_HEAP_LOAD($27 | 0, 4, 0) | 0 | 0;
      $29 = ($28 | 0) == ($18 | 0);
      if ($29) {
       SAFE_HEAP_STORE($27 | 0, $16 | 0, 4);
       SAFE_HEAP_STORE($17 | 0, $20 | 0, 4);
       break;
      } else {
       _abort();
      }
     }
    } while (0);
    $30 = $14 << 3;
    $31 = $30 | 3;
    $32 = $18 + 4 | 0;
    SAFE_HEAP_STORE($32 | 0, $31 | 0, 4);
    $33 = $18 + $30 | 0;
    $34 = $33 + 4 | 0;
    $35 = SAFE_HEAP_LOAD($34 | 0, 4, 0) | 0 | 0;
    $36 = $35 | 1;
    SAFE_HEAP_STORE($34 | 0, $36 | 0, 4);
    $$0 = $19;
    STACKTOP = sp;
    return $$0 | 0;
   }
   $37 = SAFE_HEAP_LOAD(664 | 0, 4, 0) | 0 | 0;
   $38 = $6 >>> 0 > $37 >>> 0;
   if ($38) {
    $39 = ($9 | 0) == 0;
    if (!$39) {
     $40 = $9 << $7;
     $41 = 2 << $7;
     $42 = 0 - $41 | 0;
     $43 = $41 | $42;
     $44 = $40 & $43;
     $45 = 0 - $44 | 0;
     $46 = $44 & $45;
     $47 = $46 + -1 | 0;
     $48 = $47 >>> 12;
     $49 = $48 & 16;
     $50 = $47 >>> $49;
     $51 = $50 >>> 5;
     $52 = $51 & 8;
     $53 = $52 | $49;
     $54 = $50 >>> $52;
     $55 = $54 >>> 2;
     $56 = $55 & 4;
     $57 = $53 | $56;
     $58 = $54 >>> $56;
     $59 = $58 >>> 1;
     $60 = $59 & 2;
     $61 = $57 | $60;
     $62 = $58 >>> $60;
     $63 = $62 >>> 1;
     $64 = $63 & 1;
     $65 = $61 | $64;
     $66 = $62 >>> $64;
     $67 = $65 + $66 | 0;
     $68 = $67 << 1;
     $69 = 696 + ($68 << 2) | 0;
     $70 = $69 + 8 | 0;
     $71 = SAFE_HEAP_LOAD($70 | 0, 4, 0) | 0 | 0;
     $72 = $71 + 8 | 0;
     $73 = SAFE_HEAP_LOAD($72 | 0, 4, 0) | 0 | 0;
     $74 = ($69 | 0) == ($73 | 0);
     do {
      if ($74) {
       $75 = 1 << $67;
       $76 = $75 ^ -1;
       $77 = $8 & $76;
       SAFE_HEAP_STORE(164 * 4 | 0, $77 | 0, 4);
       $98 = $77;
      } else {
       $78 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
       $79 = $73 >>> 0 < $78 >>> 0;
       if ($79) {
        _abort();
       }
       $80 = $73 + 12 | 0;
       $81 = SAFE_HEAP_LOAD($80 | 0, 4, 0) | 0 | 0;
       $82 = ($81 | 0) == ($71 | 0);
       if ($82) {
        SAFE_HEAP_STORE($80 | 0, $69 | 0, 4);
        SAFE_HEAP_STORE($70 | 0, $73 | 0, 4);
        $98 = $8;
        break;
       } else {
        _abort();
       }
      }
     } while (0);
     $83 = $67 << 3;
     $84 = $83 - $6 | 0;
     $85 = $6 | 3;
     $86 = $71 + 4 | 0;
     SAFE_HEAP_STORE($86 | 0, $85 | 0, 4);
     $87 = $71 + $6 | 0;
     $88 = $84 | 1;
     $89 = $87 + 4 | 0;
     SAFE_HEAP_STORE($89 | 0, $88 | 0, 4);
     $90 = $87 + $84 | 0;
     SAFE_HEAP_STORE($90 | 0, $84 | 0, 4);
     $91 = ($37 | 0) == 0;
     if (!$91) {
      $92 = SAFE_HEAP_LOAD(676 | 0, 4, 0) | 0 | 0;
      $93 = $37 >>> 3;
      $94 = $93 << 1;
      $95 = 696 + ($94 << 2) | 0;
      $96 = 1 << $93;
      $97 = $98 & $96;
      $99 = ($97 | 0) == 0;
      if ($99) {
       $100 = $98 | $96;
       SAFE_HEAP_STORE(164 * 4 | 0, $100 | 0, 4);
       $$pre = $95 + 8 | 0;
       $$0199 = $95;
       $$pre$phiZ2D = $$pre;
      } else {
       $101 = $95 + 8 | 0;
       $102 = SAFE_HEAP_LOAD($101 | 0, 4, 0) | 0 | 0;
       $103 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
       $104 = $102 >>> 0 < $103 >>> 0;
       if ($104) {
        _abort();
       } else {
        $$0199 = $102;
        $$pre$phiZ2D = $101;
       }
      }
      SAFE_HEAP_STORE($$pre$phiZ2D | 0, $92 | 0, 4);
      $105 = $$0199 + 12 | 0;
      SAFE_HEAP_STORE($105 | 0, $92 | 0, 4);
      $106 = $92 + 8 | 0;
      SAFE_HEAP_STORE($106 | 0, $$0199 | 0, 4);
      $107 = $92 + 12 | 0;
      SAFE_HEAP_STORE($107 | 0, $95 | 0, 4);
     }
     SAFE_HEAP_STORE(664 | 0, $84 | 0, 4);
     SAFE_HEAP_STORE(676 | 0, $87 | 0, 4);
     $$0 = $72;
     STACKTOP = sp;
     return $$0 | 0;
    }
    $108 = SAFE_HEAP_LOAD(660 | 0, 4, 0) | 0 | 0;
    $109 = ($108 | 0) == 0;
    if ($109) {
     $$0197 = $6;
    } else {
     $110 = 0 - $108 | 0;
     $111 = $108 & $110;
     $112 = $111 + -1 | 0;
     $113 = $112 >>> 12;
     $114 = $113 & 16;
     $115 = $112 >>> $114;
     $116 = $115 >>> 5;
     $117 = $116 & 8;
     $118 = $117 | $114;
     $119 = $115 >>> $117;
     $120 = $119 >>> 2;
     $121 = $120 & 4;
     $122 = $118 | $121;
     $123 = $119 >>> $121;
     $124 = $123 >>> 1;
     $125 = $124 & 2;
     $126 = $122 | $125;
     $127 = $123 >>> $125;
     $128 = $127 >>> 1;
     $129 = $128 & 1;
     $130 = $126 | $129;
     $131 = $127 >>> $129;
     $132 = $130 + $131 | 0;
     $133 = 960 + ($132 << 2) | 0;
     $134 = SAFE_HEAP_LOAD($133 | 0, 4, 0) | 0 | 0;
     $135 = $134 + 4 | 0;
     $136 = SAFE_HEAP_LOAD($135 | 0, 4, 0) | 0 | 0;
     $137 = $136 & -8;
     $138 = $137 - $6 | 0;
     $139 = $134 + 16 | 0;
     $140 = SAFE_HEAP_LOAD($139 | 0, 4, 0) | 0 | 0;
     $not$5$i = ($140 | 0) == (0 | 0);
     $$sink16$i = $not$5$i & 1;
     $141 = ($134 + 16 | 0) + ($$sink16$i << 2) | 0;
     $142 = SAFE_HEAP_LOAD($141 | 0, 4, 0) | 0 | 0;
     $143 = ($142 | 0) == (0 | 0);
     if ($143) {
      $$0192$lcssa$i = $134;
      $$0193$lcssa$i = $138;
     } else {
      $$01928$i = $134;
      $$01937$i = $138;
      $145 = $142;
      while (1) {
       $144 = $145 + 4 | 0;
       $146 = SAFE_HEAP_LOAD($144 | 0, 4, 0) | 0 | 0;
       $147 = $146 & -8;
       $148 = $147 - $6 | 0;
       $149 = $148 >>> 0 < $$01937$i >>> 0;
       $$$0193$i = $149 ? $148 : $$01937$i;
       $$$0192$i = $149 ? $145 : $$01928$i;
       $150 = $145 + 16 | 0;
       $151 = SAFE_HEAP_LOAD($150 | 0, 4, 0) | 0 | 0;
       $not$$i = ($151 | 0) == (0 | 0);
       $$sink1$i = $not$$i & 1;
       $152 = ($145 + 16 | 0) + ($$sink1$i << 2) | 0;
       $153 = SAFE_HEAP_LOAD($152 | 0, 4, 0) | 0 | 0;
       $154 = ($153 | 0) == (0 | 0);
       if ($154) {
        $$0192$lcssa$i = $$$0192$i;
        $$0193$lcssa$i = $$$0193$i;
        break;
       } else {
        $$01928$i = $$$0192$i;
        $$01937$i = $$$0193$i;
        $145 = $153;
       }
      }
     }
     $155 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
     $156 = $$0192$lcssa$i >>> 0 < $155 >>> 0;
     if ($156) {
      _abort();
     }
     $157 = $$0192$lcssa$i + $6 | 0;
     $158 = $$0192$lcssa$i >>> 0 < $157 >>> 0;
     if (!$158) {
      _abort();
     }
     $159 = $$0192$lcssa$i + 24 | 0;
     $160 = SAFE_HEAP_LOAD($159 | 0, 4, 0) | 0 | 0;
     $161 = $$0192$lcssa$i + 12 | 0;
     $162 = SAFE_HEAP_LOAD($161 | 0, 4, 0) | 0 | 0;
     $163 = ($162 | 0) == ($$0192$lcssa$i | 0);
     do {
      if ($163) {
       $173 = $$0192$lcssa$i + 20 | 0;
       $174 = SAFE_HEAP_LOAD($173 | 0, 4, 0) | 0 | 0;
       $175 = ($174 | 0) == (0 | 0);
       if ($175) {
        $176 = $$0192$lcssa$i + 16 | 0;
        $177 = SAFE_HEAP_LOAD($176 | 0, 4, 0) | 0 | 0;
        $178 = ($177 | 0) == (0 | 0);
        if ($178) {
         $$3$i = 0;
         break;
        } else {
         $$1196$i = $177;
         $$1198$i = $176;
        }
       } else {
        $$1196$i = $174;
        $$1198$i = $173;
       }
       while (1) {
        $179 = $$1196$i + 20 | 0;
        $180 = SAFE_HEAP_LOAD($179 | 0, 4, 0) | 0 | 0;
        $181 = ($180 | 0) == (0 | 0);
        if (!$181) {
         $$1196$i = $180;
         $$1198$i = $179;
         continue;
        }
        $182 = $$1196$i + 16 | 0;
        $183 = SAFE_HEAP_LOAD($182 | 0, 4, 0) | 0 | 0;
        $184 = ($183 | 0) == (0 | 0);
        if ($184) {
         break;
        } else {
         $$1196$i = $183;
         $$1198$i = $182;
        }
       }
       $185 = $$1198$i >>> 0 < $155 >>> 0;
       if ($185) {
        _abort();
       } else {
        SAFE_HEAP_STORE($$1198$i | 0, 0 | 0, 4);
        $$3$i = $$1196$i;
        break;
       }
      } else {
       $164 = $$0192$lcssa$i + 8 | 0;
       $165 = SAFE_HEAP_LOAD($164 | 0, 4, 0) | 0 | 0;
       $166 = $165 >>> 0 < $155 >>> 0;
       if ($166) {
        _abort();
       }
       $167 = $165 + 12 | 0;
       $168 = SAFE_HEAP_LOAD($167 | 0, 4, 0) | 0 | 0;
       $169 = ($168 | 0) == ($$0192$lcssa$i | 0);
       if (!$169) {
        _abort();
       }
       $170 = $162 + 8 | 0;
       $171 = SAFE_HEAP_LOAD($170 | 0, 4, 0) | 0 | 0;
       $172 = ($171 | 0) == ($$0192$lcssa$i | 0);
       if ($172) {
        SAFE_HEAP_STORE($167 | 0, $162 | 0, 4);
        SAFE_HEAP_STORE($170 | 0, $165 | 0, 4);
        $$3$i = $162;
        break;
       } else {
        _abort();
       }
      }
     } while (0);
     $186 = ($160 | 0) == (0 | 0);
     L73 : do {
      if (!$186) {
       $187 = $$0192$lcssa$i + 28 | 0;
       $188 = SAFE_HEAP_LOAD($187 | 0, 4, 0) | 0 | 0;
       $189 = 960 + ($188 << 2) | 0;
       $190 = SAFE_HEAP_LOAD($189 | 0, 4, 0) | 0 | 0;
       $191 = ($$0192$lcssa$i | 0) == ($190 | 0);
       do {
        if ($191) {
         SAFE_HEAP_STORE($189 | 0, $$3$i | 0, 4);
         $cond$i = ($$3$i | 0) == (0 | 0);
         if ($cond$i) {
          $192 = 1 << $188;
          $193 = $192 ^ -1;
          $194 = $108 & $193;
          SAFE_HEAP_STORE(660 | 0, $194 | 0, 4);
          break L73;
         }
        } else {
         $195 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
         $196 = $160 >>> 0 < $195 >>> 0;
         if ($196) {
          _abort();
         } else {
          $197 = $160 + 16 | 0;
          $198 = SAFE_HEAP_LOAD($197 | 0, 4, 0) | 0 | 0;
          $not$1$i = ($198 | 0) != ($$0192$lcssa$i | 0);
          $$sink2$i = $not$1$i & 1;
          $199 = ($160 + 16 | 0) + ($$sink2$i << 2) | 0;
          SAFE_HEAP_STORE($199 | 0, $$3$i | 0, 4);
          $200 = ($$3$i | 0) == (0 | 0);
          if ($200) {
           break L73;
          } else {
           break;
          }
         }
        }
       } while (0);
       $201 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
       $202 = $$3$i >>> 0 < $201 >>> 0;
       if ($202) {
        _abort();
       }
       $203 = $$3$i + 24 | 0;
       SAFE_HEAP_STORE($203 | 0, $160 | 0, 4);
       $204 = $$0192$lcssa$i + 16 | 0;
       $205 = SAFE_HEAP_LOAD($204 | 0, 4, 0) | 0 | 0;
       $206 = ($205 | 0) == (0 | 0);
       do {
        if (!$206) {
         $207 = $205 >>> 0 < $201 >>> 0;
         if ($207) {
          _abort();
         } else {
          $208 = $$3$i + 16 | 0;
          SAFE_HEAP_STORE($208 | 0, $205 | 0, 4);
          $209 = $205 + 24 | 0;
          SAFE_HEAP_STORE($209 | 0, $$3$i | 0, 4);
          break;
         }
        }
       } while (0);
       $210 = $$0192$lcssa$i + 20 | 0;
       $211 = SAFE_HEAP_LOAD($210 | 0, 4, 0) | 0 | 0;
       $212 = ($211 | 0) == (0 | 0);
       if (!$212) {
        $213 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
        $214 = $211 >>> 0 < $213 >>> 0;
        if ($214) {
         _abort();
        } else {
         $215 = $$3$i + 20 | 0;
         SAFE_HEAP_STORE($215 | 0, $211 | 0, 4);
         $216 = $211 + 24 | 0;
         SAFE_HEAP_STORE($216 | 0, $$3$i | 0, 4);
         break;
        }
       }
      }
     } while (0);
     $217 = $$0193$lcssa$i >>> 0 < 16;
     if ($217) {
      $218 = $$0193$lcssa$i + $6 | 0;
      $219 = $218 | 3;
      $220 = $$0192$lcssa$i + 4 | 0;
      SAFE_HEAP_STORE($220 | 0, $219 | 0, 4);
      $221 = $$0192$lcssa$i + $218 | 0;
      $222 = $221 + 4 | 0;
      $223 = SAFE_HEAP_LOAD($222 | 0, 4, 0) | 0 | 0;
      $224 = $223 | 1;
      SAFE_HEAP_STORE($222 | 0, $224 | 0, 4);
     } else {
      $225 = $6 | 3;
      $226 = $$0192$lcssa$i + 4 | 0;
      SAFE_HEAP_STORE($226 | 0, $225 | 0, 4);
      $227 = $$0193$lcssa$i | 1;
      $228 = $157 + 4 | 0;
      SAFE_HEAP_STORE($228 | 0, $227 | 0, 4);
      $229 = $157 + $$0193$lcssa$i | 0;
      SAFE_HEAP_STORE($229 | 0, $$0193$lcssa$i | 0, 4);
      $230 = ($37 | 0) == 0;
      if (!$230) {
       $231 = SAFE_HEAP_LOAD(676 | 0, 4, 0) | 0 | 0;
       $232 = $37 >>> 3;
       $233 = $232 << 1;
       $234 = 696 + ($233 << 2) | 0;
       $235 = 1 << $232;
       $236 = $8 & $235;
       $237 = ($236 | 0) == 0;
       if ($237) {
        $238 = $8 | $235;
        SAFE_HEAP_STORE(164 * 4 | 0, $238 | 0, 4);
        $$pre$i = $234 + 8 | 0;
        $$0189$i = $234;
        $$pre$phi$iZ2D = $$pre$i;
       } else {
        $239 = $234 + 8 | 0;
        $240 = SAFE_HEAP_LOAD($239 | 0, 4, 0) | 0 | 0;
        $241 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
        $242 = $240 >>> 0 < $241 >>> 0;
        if ($242) {
         _abort();
        } else {
         $$0189$i = $240;
         $$pre$phi$iZ2D = $239;
        }
       }
       SAFE_HEAP_STORE($$pre$phi$iZ2D | 0, $231 | 0, 4);
       $243 = $$0189$i + 12 | 0;
       SAFE_HEAP_STORE($243 | 0, $231 | 0, 4);
       $244 = $231 + 8 | 0;
       SAFE_HEAP_STORE($244 | 0, $$0189$i | 0, 4);
       $245 = $231 + 12 | 0;
       SAFE_HEAP_STORE($245 | 0, $234 | 0, 4);
      }
      SAFE_HEAP_STORE(664 | 0, $$0193$lcssa$i | 0, 4);
      SAFE_HEAP_STORE(676 | 0, $157 | 0, 4);
     }
     $246 = $$0192$lcssa$i + 8 | 0;
     $$0 = $246;
     STACKTOP = sp;
     return $$0 | 0;
    }
   } else {
    $$0197 = $6;
   }
  } else {
   $247 = $0 >>> 0 > 4294967231;
   if ($247) {
    $$0197 = -1;
   } else {
    $248 = $0 + 11 | 0;
    $249 = $248 & -8;
    $250 = SAFE_HEAP_LOAD(660 | 0, 4, 0) | 0 | 0;
    $251 = ($250 | 0) == 0;
    if ($251) {
     $$0197 = $249;
    } else {
     $252 = 0 - $249 | 0;
     $253 = $248 >>> 8;
     $254 = ($253 | 0) == 0;
     if ($254) {
      $$0358$i = 0;
     } else {
      $255 = $249 >>> 0 > 16777215;
      if ($255) {
       $$0358$i = 31;
      } else {
       $256 = $253 + 1048320 | 0;
       $257 = $256 >>> 16;
       $258 = $257 & 8;
       $259 = $253 << $258;
       $260 = $259 + 520192 | 0;
       $261 = $260 >>> 16;
       $262 = $261 & 4;
       $263 = $262 | $258;
       $264 = $259 << $262;
       $265 = $264 + 245760 | 0;
       $266 = $265 >>> 16;
       $267 = $266 & 2;
       $268 = $263 | $267;
       $269 = 14 - $268 | 0;
       $270 = $264 << $267;
       $271 = $270 >>> 15;
       $272 = $269 + $271 | 0;
       $273 = $272 << 1;
       $274 = $272 + 7 | 0;
       $275 = $249 >>> $274;
       $276 = $275 & 1;
       $277 = $276 | $273;
       $$0358$i = $277;
      }
     }
     $278 = 960 + ($$0358$i << 2) | 0;
     $279 = SAFE_HEAP_LOAD($278 | 0, 4, 0) | 0 | 0;
     $280 = ($279 | 0) == (0 | 0);
     L117 : do {
      if ($280) {
       $$2355$i = 0;
       $$3$i201 = 0;
       $$3350$i = $252;
       label = 81;
      } else {
       $281 = ($$0358$i | 0) == 31;
       $282 = $$0358$i >>> 1;
       $283 = 25 - $282 | 0;
       $284 = $281 ? 0 : $283;
       $285 = $249 << $284;
       $$0342$i = 0;
       $$0347$i = $252;
       $$0353$i = $279;
       $$0359$i = $285;
       $$0362$i = 0;
       while (1) {
        $286 = $$0353$i + 4 | 0;
        $287 = SAFE_HEAP_LOAD($286 | 0, 4, 0) | 0 | 0;
        $288 = $287 & -8;
        $289 = $288 - $249 | 0;
        $290 = $289 >>> 0 < $$0347$i >>> 0;
        if ($290) {
         $291 = ($289 | 0) == 0;
         if ($291) {
          $$415$i = $$0353$i;
          $$435114$i = 0;
          $$435713$i = $$0353$i;
          label = 85;
          break L117;
         } else {
          $$1343$i = $$0353$i;
          $$1348$i = $289;
         }
        } else {
         $$1343$i = $$0342$i;
         $$1348$i = $$0347$i;
        }
        $292 = $$0353$i + 20 | 0;
        $293 = SAFE_HEAP_LOAD($292 | 0, 4, 0) | 0 | 0;
        $294 = $$0359$i >>> 31;
        $295 = ($$0353$i + 16 | 0) + ($294 << 2) | 0;
        $296 = SAFE_HEAP_LOAD($295 | 0, 4, 0) | 0 | 0;
        $297 = ($293 | 0) == (0 | 0);
        $298 = ($293 | 0) == ($296 | 0);
        $or$cond2$i = $297 | $298;
        $$1363$i = $or$cond2$i ? $$0362$i : $293;
        $299 = ($296 | 0) == (0 | 0);
        $not$8$i = $299 ^ 1;
        $300 = $not$8$i & 1;
        $$0359$$i = $$0359$i << $300;
        if ($299) {
         $$2355$i = $$1363$i;
         $$3$i201 = $$1343$i;
         $$3350$i = $$1348$i;
         label = 81;
         break;
        } else {
         $$0342$i = $$1343$i;
         $$0347$i = $$1348$i;
         $$0353$i = $296;
         $$0359$i = $$0359$$i;
         $$0362$i = $$1363$i;
        }
       }
      }
     } while (0);
     if ((label | 0) == 81) {
      $301 = ($$2355$i | 0) == (0 | 0);
      $302 = ($$3$i201 | 0) == (0 | 0);
      $or$cond$i = $301 & $302;
      if ($or$cond$i) {
       $303 = 2 << $$0358$i;
       $304 = 0 - $303 | 0;
       $305 = $303 | $304;
       $306 = $250 & $305;
       $307 = ($306 | 0) == 0;
       if ($307) {
        $$0197 = $249;
        break;
       }
       $308 = 0 - $306 | 0;
       $309 = $306 & $308;
       $310 = $309 + -1 | 0;
       $311 = $310 >>> 12;
       $312 = $311 & 16;
       $313 = $310 >>> $312;
       $314 = $313 >>> 5;
       $315 = $314 & 8;
       $316 = $315 | $312;
       $317 = $313 >>> $315;
       $318 = $317 >>> 2;
       $319 = $318 & 4;
       $320 = $316 | $319;
       $321 = $317 >>> $319;
       $322 = $321 >>> 1;
       $323 = $322 & 2;
       $324 = $320 | $323;
       $325 = $321 >>> $323;
       $326 = $325 >>> 1;
       $327 = $326 & 1;
       $328 = $324 | $327;
       $329 = $325 >>> $327;
       $330 = $328 + $329 | 0;
       $331 = 960 + ($330 << 2) | 0;
       $332 = SAFE_HEAP_LOAD($331 | 0, 4, 0) | 0 | 0;
       $$4$ph$i = 0;
       $$4357$ph$i = $332;
      } else {
       $$4$ph$i = $$3$i201;
       $$4357$ph$i = $$2355$i;
      }
      $333 = ($$4357$ph$i | 0) == (0 | 0);
      if ($333) {
       $$4$lcssa$i = $$4$ph$i;
       $$4351$lcssa$i = $$3350$i;
      } else {
       $$415$i = $$4$ph$i;
       $$435114$i = $$3350$i;
       $$435713$i = $$4357$ph$i;
       label = 85;
      }
     }
     if ((label | 0) == 85) {
      while (1) {
       label = 0;
       $334 = $$435713$i + 4 | 0;
       $335 = SAFE_HEAP_LOAD($334 | 0, 4, 0) | 0 | 0;
       $336 = $335 & -8;
       $337 = $336 - $249 | 0;
       $338 = $337 >>> 0 < $$435114$i >>> 0;
       $$$4351$i = $338 ? $337 : $$435114$i;
       $$4357$$4$i = $338 ? $$435713$i : $$415$i;
       $339 = $$435713$i + 16 | 0;
       $340 = SAFE_HEAP_LOAD($339 | 0, 4, 0) | 0 | 0;
       $not$1$i203 = ($340 | 0) == (0 | 0);
       $$sink2$i204 = $not$1$i203 & 1;
       $341 = ($$435713$i + 16 | 0) + ($$sink2$i204 << 2) | 0;
       $342 = SAFE_HEAP_LOAD($341 | 0, 4, 0) | 0 | 0;
       $343 = ($342 | 0) == (0 | 0);
       if ($343) {
        $$4$lcssa$i = $$4357$$4$i;
        $$4351$lcssa$i = $$$4351$i;
        break;
       } else {
        $$415$i = $$4357$$4$i;
        $$435114$i = $$$4351$i;
        $$435713$i = $342;
        label = 85;
       }
      }
     }
     $344 = ($$4$lcssa$i | 0) == (0 | 0);
     if ($344) {
      $$0197 = $249;
     } else {
      $345 = SAFE_HEAP_LOAD(664 | 0, 4, 0) | 0 | 0;
      $346 = $345 - $249 | 0;
      $347 = $$4351$lcssa$i >>> 0 < $346 >>> 0;
      if ($347) {
       $348 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
       $349 = $$4$lcssa$i >>> 0 < $348 >>> 0;
       if ($349) {
        _abort();
       }
       $350 = $$4$lcssa$i + $249 | 0;
       $351 = $$4$lcssa$i >>> 0 < $350 >>> 0;
       if (!$351) {
        _abort();
       }
       $352 = $$4$lcssa$i + 24 | 0;
       $353 = SAFE_HEAP_LOAD($352 | 0, 4, 0) | 0 | 0;
       $354 = $$4$lcssa$i + 12 | 0;
       $355 = SAFE_HEAP_LOAD($354 | 0, 4, 0) | 0 | 0;
       $356 = ($355 | 0) == ($$4$lcssa$i | 0);
       do {
        if ($356) {
         $366 = $$4$lcssa$i + 20 | 0;
         $367 = SAFE_HEAP_LOAD($366 | 0, 4, 0) | 0 | 0;
         $368 = ($367 | 0) == (0 | 0);
         if ($368) {
          $369 = $$4$lcssa$i + 16 | 0;
          $370 = SAFE_HEAP_LOAD($369 | 0, 4, 0) | 0 | 0;
          $371 = ($370 | 0) == (0 | 0);
          if ($371) {
           $$3372$i = 0;
           break;
          } else {
           $$1370$i = $370;
           $$1374$i = $369;
          }
         } else {
          $$1370$i = $367;
          $$1374$i = $366;
         }
         while (1) {
          $372 = $$1370$i + 20 | 0;
          $373 = SAFE_HEAP_LOAD($372 | 0, 4, 0) | 0 | 0;
          $374 = ($373 | 0) == (0 | 0);
          if (!$374) {
           $$1370$i = $373;
           $$1374$i = $372;
           continue;
          }
          $375 = $$1370$i + 16 | 0;
          $376 = SAFE_HEAP_LOAD($375 | 0, 4, 0) | 0 | 0;
          $377 = ($376 | 0) == (0 | 0);
          if ($377) {
           break;
          } else {
           $$1370$i = $376;
           $$1374$i = $375;
          }
         }
         $378 = $$1374$i >>> 0 < $348 >>> 0;
         if ($378) {
          _abort();
         } else {
          SAFE_HEAP_STORE($$1374$i | 0, 0 | 0, 4);
          $$3372$i = $$1370$i;
          break;
         }
        } else {
         $357 = $$4$lcssa$i + 8 | 0;
         $358 = SAFE_HEAP_LOAD($357 | 0, 4, 0) | 0 | 0;
         $359 = $358 >>> 0 < $348 >>> 0;
         if ($359) {
          _abort();
         }
         $360 = $358 + 12 | 0;
         $361 = SAFE_HEAP_LOAD($360 | 0, 4, 0) | 0 | 0;
         $362 = ($361 | 0) == ($$4$lcssa$i | 0);
         if (!$362) {
          _abort();
         }
         $363 = $355 + 8 | 0;
         $364 = SAFE_HEAP_LOAD($363 | 0, 4, 0) | 0 | 0;
         $365 = ($364 | 0) == ($$4$lcssa$i | 0);
         if ($365) {
          SAFE_HEAP_STORE($360 | 0, $355 | 0, 4);
          SAFE_HEAP_STORE($363 | 0, $358 | 0, 4);
          $$3372$i = $355;
          break;
         } else {
          _abort();
         }
        }
       } while (0);
       $379 = ($353 | 0) == (0 | 0);
       L164 : do {
        if ($379) {
         $470 = $250;
        } else {
         $380 = $$4$lcssa$i + 28 | 0;
         $381 = SAFE_HEAP_LOAD($380 | 0, 4, 0) | 0 | 0;
         $382 = 960 + ($381 << 2) | 0;
         $383 = SAFE_HEAP_LOAD($382 | 0, 4, 0) | 0 | 0;
         $384 = ($$4$lcssa$i | 0) == ($383 | 0);
         do {
          if ($384) {
           SAFE_HEAP_STORE($382 | 0, $$3372$i | 0, 4);
           $cond$i208 = ($$3372$i | 0) == (0 | 0);
           if ($cond$i208) {
            $385 = 1 << $381;
            $386 = $385 ^ -1;
            $387 = $250 & $386;
            SAFE_HEAP_STORE(660 | 0, $387 | 0, 4);
            $470 = $387;
            break L164;
           }
          } else {
           $388 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
           $389 = $353 >>> 0 < $388 >>> 0;
           if ($389) {
            _abort();
           } else {
            $390 = $353 + 16 | 0;
            $391 = SAFE_HEAP_LOAD($390 | 0, 4, 0) | 0 | 0;
            $not$$i209 = ($391 | 0) != ($$4$lcssa$i | 0);
            $$sink3$i = $not$$i209 & 1;
            $392 = ($353 + 16 | 0) + ($$sink3$i << 2) | 0;
            SAFE_HEAP_STORE($392 | 0, $$3372$i | 0, 4);
            $393 = ($$3372$i | 0) == (0 | 0);
            if ($393) {
             $470 = $250;
             break L164;
            } else {
             break;
            }
           }
          }
         } while (0);
         $394 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
         $395 = $$3372$i >>> 0 < $394 >>> 0;
         if ($395) {
          _abort();
         }
         $396 = $$3372$i + 24 | 0;
         SAFE_HEAP_STORE($396 | 0, $353 | 0, 4);
         $397 = $$4$lcssa$i + 16 | 0;
         $398 = SAFE_HEAP_LOAD($397 | 0, 4, 0) | 0 | 0;
         $399 = ($398 | 0) == (0 | 0);
         do {
          if (!$399) {
           $400 = $398 >>> 0 < $394 >>> 0;
           if ($400) {
            _abort();
           } else {
            $401 = $$3372$i + 16 | 0;
            SAFE_HEAP_STORE($401 | 0, $398 | 0, 4);
            $402 = $398 + 24 | 0;
            SAFE_HEAP_STORE($402 | 0, $$3372$i | 0, 4);
            break;
           }
          }
         } while (0);
         $403 = $$4$lcssa$i + 20 | 0;
         $404 = SAFE_HEAP_LOAD($403 | 0, 4, 0) | 0 | 0;
         $405 = ($404 | 0) == (0 | 0);
         if ($405) {
          $470 = $250;
         } else {
          $406 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
          $407 = $404 >>> 0 < $406 >>> 0;
          if ($407) {
           _abort();
          } else {
           $408 = $$3372$i + 20 | 0;
           SAFE_HEAP_STORE($408 | 0, $404 | 0, 4);
           $409 = $404 + 24 | 0;
           SAFE_HEAP_STORE($409 | 0, $$3372$i | 0, 4);
           $470 = $250;
           break;
          }
         }
        }
       } while (0);
       $410 = $$4351$lcssa$i >>> 0 < 16;
       do {
        if ($410) {
         $411 = $$4351$lcssa$i + $249 | 0;
         $412 = $411 | 3;
         $413 = $$4$lcssa$i + 4 | 0;
         SAFE_HEAP_STORE($413 | 0, $412 | 0, 4);
         $414 = $$4$lcssa$i + $411 | 0;
         $415 = $414 + 4 | 0;
         $416 = SAFE_HEAP_LOAD($415 | 0, 4, 0) | 0 | 0;
         $417 = $416 | 1;
         SAFE_HEAP_STORE($415 | 0, $417 | 0, 4);
        } else {
         $418 = $249 | 3;
         $419 = $$4$lcssa$i + 4 | 0;
         SAFE_HEAP_STORE($419 | 0, $418 | 0, 4);
         $420 = $$4351$lcssa$i | 1;
         $421 = $350 + 4 | 0;
         SAFE_HEAP_STORE($421 | 0, $420 | 0, 4);
         $422 = $350 + $$4351$lcssa$i | 0;
         SAFE_HEAP_STORE($422 | 0, $$4351$lcssa$i | 0, 4);
         $423 = $$4351$lcssa$i >>> 3;
         $424 = $$4351$lcssa$i >>> 0 < 256;
         if ($424) {
          $425 = $423 << 1;
          $426 = 696 + ($425 << 2) | 0;
          $427 = SAFE_HEAP_LOAD(164 * 4 | 0, 4, 0) | 0 | 0;
          $428 = 1 << $423;
          $429 = $427 & $428;
          $430 = ($429 | 0) == 0;
          if ($430) {
           $431 = $427 | $428;
           SAFE_HEAP_STORE(164 * 4 | 0, $431 | 0, 4);
           $$pre$i210 = $426 + 8 | 0;
           $$0368$i = $426;
           $$pre$phi$i211Z2D = $$pre$i210;
          } else {
           $432 = $426 + 8 | 0;
           $433 = SAFE_HEAP_LOAD($432 | 0, 4, 0) | 0 | 0;
           $434 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
           $435 = $433 >>> 0 < $434 >>> 0;
           if ($435) {
            _abort();
           } else {
            $$0368$i = $433;
            $$pre$phi$i211Z2D = $432;
           }
          }
          SAFE_HEAP_STORE($$pre$phi$i211Z2D | 0, $350 | 0, 4);
          $436 = $$0368$i + 12 | 0;
          SAFE_HEAP_STORE($436 | 0, $350 | 0, 4);
          $437 = $350 + 8 | 0;
          SAFE_HEAP_STORE($437 | 0, $$0368$i | 0, 4);
          $438 = $350 + 12 | 0;
          SAFE_HEAP_STORE($438 | 0, $426 | 0, 4);
          break;
         }
         $439 = $$4351$lcssa$i >>> 8;
         $440 = ($439 | 0) == 0;
         if ($440) {
          $$0361$i = 0;
         } else {
          $441 = $$4351$lcssa$i >>> 0 > 16777215;
          if ($441) {
           $$0361$i = 31;
          } else {
           $442 = $439 + 1048320 | 0;
           $443 = $442 >>> 16;
           $444 = $443 & 8;
           $445 = $439 << $444;
           $446 = $445 + 520192 | 0;
           $447 = $446 >>> 16;
           $448 = $447 & 4;
           $449 = $448 | $444;
           $450 = $445 << $448;
           $451 = $450 + 245760 | 0;
           $452 = $451 >>> 16;
           $453 = $452 & 2;
           $454 = $449 | $453;
           $455 = 14 - $454 | 0;
           $456 = $450 << $453;
           $457 = $456 >>> 15;
           $458 = $455 + $457 | 0;
           $459 = $458 << 1;
           $460 = $458 + 7 | 0;
           $461 = $$4351$lcssa$i >>> $460;
           $462 = $461 & 1;
           $463 = $462 | $459;
           $$0361$i = $463;
          }
         }
         $464 = 960 + ($$0361$i << 2) | 0;
         $465 = $350 + 28 | 0;
         SAFE_HEAP_STORE($465 | 0, $$0361$i | 0, 4);
         $466 = $350 + 16 | 0;
         $467 = $466 + 4 | 0;
         SAFE_HEAP_STORE($467 | 0, 0 | 0, 4);
         SAFE_HEAP_STORE($466 | 0, 0 | 0, 4);
         $468 = 1 << $$0361$i;
         $469 = $470 & $468;
         $471 = ($469 | 0) == 0;
         if ($471) {
          $472 = $470 | $468;
          SAFE_HEAP_STORE(660 | 0, $472 | 0, 4);
          SAFE_HEAP_STORE($464 | 0, $350 | 0, 4);
          $473 = $350 + 24 | 0;
          SAFE_HEAP_STORE($473 | 0, $464 | 0, 4);
          $474 = $350 + 12 | 0;
          SAFE_HEAP_STORE($474 | 0, $350 | 0, 4);
          $475 = $350 + 8 | 0;
          SAFE_HEAP_STORE($475 | 0, $350 | 0, 4);
          break;
         }
         $476 = SAFE_HEAP_LOAD($464 | 0, 4, 0) | 0 | 0;
         $477 = ($$0361$i | 0) == 31;
         $478 = $$0361$i >>> 1;
         $479 = 25 - $478 | 0;
         $480 = $477 ? 0 : $479;
         $481 = $$4351$lcssa$i << $480;
         $$0344$i = $481;
         $$0345$i = $476;
         while (1) {
          $482 = $$0345$i + 4 | 0;
          $483 = SAFE_HEAP_LOAD($482 | 0, 4, 0) | 0 | 0;
          $484 = $483 & -8;
          $485 = ($484 | 0) == ($$4351$lcssa$i | 0);
          if ($485) {
           label = 139;
           break;
          }
          $486 = $$0344$i >>> 31;
          $487 = ($$0345$i + 16 | 0) + ($486 << 2) | 0;
          $488 = $$0344$i << 1;
          $489 = SAFE_HEAP_LOAD($487 | 0, 4, 0) | 0 | 0;
          $490 = ($489 | 0) == (0 | 0);
          if ($490) {
           label = 136;
           break;
          } else {
           $$0344$i = $488;
           $$0345$i = $489;
          }
         }
         if ((label | 0) == 136) {
          $491 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
          $492 = $487 >>> 0 < $491 >>> 0;
          if ($492) {
           _abort();
          } else {
           SAFE_HEAP_STORE($487 | 0, $350 | 0, 4);
           $493 = $350 + 24 | 0;
           SAFE_HEAP_STORE($493 | 0, $$0345$i | 0, 4);
           $494 = $350 + 12 | 0;
           SAFE_HEAP_STORE($494 | 0, $350 | 0, 4);
           $495 = $350 + 8 | 0;
           SAFE_HEAP_STORE($495 | 0, $350 | 0, 4);
           break;
          }
         } else if ((label | 0) == 139) {
          $496 = $$0345$i + 8 | 0;
          $497 = SAFE_HEAP_LOAD($496 | 0, 4, 0) | 0 | 0;
          $498 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
          $499 = $497 >>> 0 >= $498 >>> 0;
          $not$9$i = $$0345$i >>> 0 >= $498 >>> 0;
          $500 = $499 & $not$9$i;
          if ($500) {
           $501 = $497 + 12 | 0;
           SAFE_HEAP_STORE($501 | 0, $350 | 0, 4);
           SAFE_HEAP_STORE($496 | 0, $350 | 0, 4);
           $502 = $350 + 8 | 0;
           SAFE_HEAP_STORE($502 | 0, $497 | 0, 4);
           $503 = $350 + 12 | 0;
           SAFE_HEAP_STORE($503 | 0, $$0345$i | 0, 4);
           $504 = $350 + 24 | 0;
           SAFE_HEAP_STORE($504 | 0, 0 | 0, 4);
           break;
          } else {
           _abort();
          }
         }
        }
       } while (0);
       $505 = $$4$lcssa$i + 8 | 0;
       $$0 = $505;
       STACKTOP = sp;
       return $$0 | 0;
      } else {
       $$0197 = $249;
      }
     }
    }
   }
  }
 } while (0);
 $506 = SAFE_HEAP_LOAD(664 | 0, 4, 0) | 0 | 0;
 $507 = $506 >>> 0 < $$0197 >>> 0;
 if (!$507) {
  $508 = $506 - $$0197 | 0;
  $509 = SAFE_HEAP_LOAD(676 | 0, 4, 0) | 0 | 0;
  $510 = $508 >>> 0 > 15;
  if ($510) {
   $511 = $509 + $$0197 | 0;
   SAFE_HEAP_STORE(676 | 0, $511 | 0, 4);
   SAFE_HEAP_STORE(664 | 0, $508 | 0, 4);
   $512 = $508 | 1;
   $513 = $511 + 4 | 0;
   SAFE_HEAP_STORE($513 | 0, $512 | 0, 4);
   $514 = $511 + $508 | 0;
   SAFE_HEAP_STORE($514 | 0, $508 | 0, 4);
   $515 = $$0197 | 3;
   $516 = $509 + 4 | 0;
   SAFE_HEAP_STORE($516 | 0, $515 | 0, 4);
  } else {
   SAFE_HEAP_STORE(664 | 0, 0 | 0, 4);
   SAFE_HEAP_STORE(676 | 0, 0 | 0, 4);
   $517 = $506 | 3;
   $518 = $509 + 4 | 0;
   SAFE_HEAP_STORE($518 | 0, $517 | 0, 4);
   $519 = $509 + $506 | 0;
   $520 = $519 + 4 | 0;
   $521 = SAFE_HEAP_LOAD($520 | 0, 4, 0) | 0 | 0;
   $522 = $521 | 1;
   SAFE_HEAP_STORE($520 | 0, $522 | 0, 4);
  }
  $523 = $509 + 8 | 0;
  $$0 = $523;
  STACKTOP = sp;
  return $$0 | 0;
 }
 $524 = SAFE_HEAP_LOAD(668 | 0, 4, 0) | 0 | 0;
 $525 = $524 >>> 0 > $$0197 >>> 0;
 if ($525) {
  $526 = $524 - $$0197 | 0;
  SAFE_HEAP_STORE(668 | 0, $526 | 0, 4);
  $527 = SAFE_HEAP_LOAD(680 | 0, 4, 0) | 0 | 0;
  $528 = $527 + $$0197 | 0;
  SAFE_HEAP_STORE(680 | 0, $528 | 0, 4);
  $529 = $526 | 1;
  $530 = $528 + 4 | 0;
  SAFE_HEAP_STORE($530 | 0, $529 | 0, 4);
  $531 = $$0197 | 3;
  $532 = $527 + 4 | 0;
  SAFE_HEAP_STORE($532 | 0, $531 | 0, 4);
  $533 = $527 + 8 | 0;
  $$0 = $533;
  STACKTOP = sp;
  return $$0 | 0;
 }
 $534 = SAFE_HEAP_LOAD(282 * 4 | 0, 4, 0) | 0 | 0;
 $535 = ($534 | 0) == 0;
 if ($535) {
  SAFE_HEAP_STORE(1136 | 0, 4096 | 0, 4);
  SAFE_HEAP_STORE(1132 | 0, 4096 | 0, 4);
  SAFE_HEAP_STORE(1140 | 0, -1 | 0, 4);
  SAFE_HEAP_STORE(1144 | 0, -1 | 0, 4);
  SAFE_HEAP_STORE(1148 | 0, 0 | 0, 4);
  SAFE_HEAP_STORE(1100 | 0, 0 | 0, 4);
  $536 = $1;
  $537 = $536 & -16;
  $538 = $537 ^ 1431655768;
  SAFE_HEAP_STORE($1 | 0, $538 | 0, 4);
  SAFE_HEAP_STORE(282 * 4 | 0, $538 | 0, 4);
  $542 = 4096;
 } else {
  $$pre$i212 = SAFE_HEAP_LOAD(1136 | 0, 4, 0) | 0 | 0;
  $542 = $$pre$i212;
 }
 $539 = $$0197 + 48 | 0;
 $540 = $$0197 + 47 | 0;
 $541 = $542 + $540 | 0;
 $543 = 0 - $542 | 0;
 $544 = $541 & $543;
 $545 = $544 >>> 0 > $$0197 >>> 0;
 if (!$545) {
  $$0 = 0;
  STACKTOP = sp;
  return $$0 | 0;
 }
 $546 = SAFE_HEAP_LOAD(1096 | 0, 4, 0) | 0 | 0;
 $547 = ($546 | 0) == 0;
 if (!$547) {
  $548 = SAFE_HEAP_LOAD(1088 | 0, 4, 0) | 0 | 0;
  $549 = $548 + $544 | 0;
  $550 = $549 >>> 0 <= $548 >>> 0;
  $551 = $549 >>> 0 > $546 >>> 0;
  $or$cond1$i = $550 | $551;
  if ($or$cond1$i) {
   $$0 = 0;
   STACKTOP = sp;
   return $$0 | 0;
  }
 }
 $552 = SAFE_HEAP_LOAD(1100 | 0, 4, 0) | 0 | 0;
 $553 = $552 & 4;
 $554 = ($553 | 0) == 0;
 L244 : do {
  if ($554) {
   $555 = SAFE_HEAP_LOAD(680 | 0, 4, 0) | 0 | 0;
   $556 = ($555 | 0) == (0 | 0);
   L246 : do {
    if ($556) {
     label = 163;
    } else {
     $$0$i$i = 1104;
     while (1) {
      $557 = SAFE_HEAP_LOAD($$0$i$i | 0, 4, 0) | 0 | 0;
      $558 = $557 >>> 0 > $555 >>> 0;
      if (!$558) {
       $559 = $$0$i$i + 4 | 0;
       $560 = SAFE_HEAP_LOAD($559 | 0, 4, 0) | 0 | 0;
       $561 = $557 + $560 | 0;
       $562 = $561 >>> 0 > $555 >>> 0;
       if ($562) {
        break;
       }
      }
      $563 = $$0$i$i + 8 | 0;
      $564 = SAFE_HEAP_LOAD($563 | 0, 4, 0) | 0 | 0;
      $565 = ($564 | 0) == (0 | 0);
      if ($565) {
       label = 163;
       break L246;
      } else {
       $$0$i$i = $564;
      }
     }
     $588 = $541 - $524 | 0;
     $589 = $588 & $543;
     $590 = $589 >>> 0 < 2147483647;
     if ($590) {
      $591 = _sbrk($589 | 0) | 0;
      $592 = SAFE_HEAP_LOAD($$0$i$i | 0, 4, 0) | 0 | 0;
      $593 = SAFE_HEAP_LOAD($559 | 0, 4, 0) | 0 | 0;
      $594 = $592 + $593 | 0;
      $595 = ($591 | 0) == ($594 | 0);
      if ($595) {
       $596 = ($591 | 0) == (-1 | 0);
       if ($596) {
        $$2234253237$i = $589;
       } else {
        $$723948$i = $589;
        $$749$i = $591;
        label = 180;
        break L244;
       }
      } else {
       $$2247$ph$i = $591;
       $$2253$ph$i = $589;
       label = 171;
      }
     } else {
      $$2234253237$i = 0;
     }
    }
   } while (0);
   do {
    if ((label | 0) == 163) {
     $566 = _sbrk(0) | 0;
     $567 = ($566 | 0) == (-1 | 0);
     if ($567) {
      $$2234253237$i = 0;
     } else {
      $568 = $566;
      $569 = SAFE_HEAP_LOAD(1132 | 0, 4, 0) | 0 | 0;
      $570 = $569 + -1 | 0;
      $571 = $570 & $568;
      $572 = ($571 | 0) == 0;
      $573 = $570 + $568 | 0;
      $574 = 0 - $569 | 0;
      $575 = $573 & $574;
      $576 = $575 - $568 | 0;
      $577 = $572 ? 0 : $576;
      $$$i = $577 + $544 | 0;
      $578 = SAFE_HEAP_LOAD(1088 | 0, 4, 0) | 0 | 0;
      $579 = $$$i + $578 | 0;
      $580 = $$$i >>> 0 > $$0197 >>> 0;
      $581 = $$$i >>> 0 < 2147483647;
      $or$cond$i214 = $580 & $581;
      if ($or$cond$i214) {
       $582 = SAFE_HEAP_LOAD(1096 | 0, 4, 0) | 0 | 0;
       $583 = ($582 | 0) == 0;
       if (!$583) {
        $584 = $579 >>> 0 <= $578 >>> 0;
        $585 = $579 >>> 0 > $582 >>> 0;
        $or$cond2$i215 = $584 | $585;
        if ($or$cond2$i215) {
         $$2234253237$i = 0;
         break;
        }
       }
       $586 = _sbrk($$$i | 0) | 0;
       $587 = ($586 | 0) == ($566 | 0);
       if ($587) {
        $$723948$i = $$$i;
        $$749$i = $566;
        label = 180;
        break L244;
       } else {
        $$2247$ph$i = $586;
        $$2253$ph$i = $$$i;
        label = 171;
       }
      } else {
       $$2234253237$i = 0;
      }
     }
    }
   } while (0);
   do {
    if ((label | 0) == 171) {
     $597 = 0 - $$2253$ph$i | 0;
     $598 = ($$2247$ph$i | 0) != (-1 | 0);
     $599 = $$2253$ph$i >>> 0 < 2147483647;
     $or$cond7$i = $599 & $598;
     $600 = $539 >>> 0 > $$2253$ph$i >>> 0;
     $or$cond10$i = $600 & $or$cond7$i;
     if (!$or$cond10$i) {
      $610 = ($$2247$ph$i | 0) == (-1 | 0);
      if ($610) {
       $$2234253237$i = 0;
       break;
      } else {
       $$723948$i = $$2253$ph$i;
       $$749$i = $$2247$ph$i;
       label = 180;
       break L244;
      }
     }
     $601 = SAFE_HEAP_LOAD(1136 | 0, 4, 0) | 0 | 0;
     $602 = $540 - $$2253$ph$i | 0;
     $603 = $602 + $601 | 0;
     $604 = 0 - $601 | 0;
     $605 = $603 & $604;
     $606 = $605 >>> 0 < 2147483647;
     if (!$606) {
      $$723948$i = $$2253$ph$i;
      $$749$i = $$2247$ph$i;
      label = 180;
      break L244;
     }
     $607 = _sbrk($605 | 0) | 0;
     $608 = ($607 | 0) == (-1 | 0);
     if ($608) {
      _sbrk($597 | 0) | 0;
      $$2234253237$i = 0;
      break;
     } else {
      $609 = $605 + $$2253$ph$i | 0;
      $$723948$i = $609;
      $$749$i = $$2247$ph$i;
      label = 180;
      break L244;
     }
    }
   } while (0);
   $611 = SAFE_HEAP_LOAD(1100 | 0, 4, 0) | 0 | 0;
   $612 = $611 | 4;
   SAFE_HEAP_STORE(1100 | 0, $612 | 0, 4);
   $$4236$i = $$2234253237$i;
   label = 178;
  } else {
   $$4236$i = 0;
   label = 178;
  }
 } while (0);
 if ((label | 0) == 178) {
  $613 = $544 >>> 0 < 2147483647;
  if ($613) {
   $614 = _sbrk($544 | 0) | 0;
   $615 = _sbrk(0) | 0;
   $616 = ($614 | 0) != (-1 | 0);
   $617 = ($615 | 0) != (-1 | 0);
   $or$cond5$i = $616 & $617;
   $618 = $614 >>> 0 < $615 >>> 0;
   $or$cond11$i = $618 & $or$cond5$i;
   $619 = $615;
   $620 = $614;
   $621 = $619 - $620 | 0;
   $622 = $$0197 + 40 | 0;
   $623 = $621 >>> 0 > $622 >>> 0;
   $$$4236$i = $623 ? $621 : $$4236$i;
   $or$cond11$not$i = $or$cond11$i ^ 1;
   $624 = ($614 | 0) == (-1 | 0);
   $not$$i216 = $623 ^ 1;
   $625 = $624 | $not$$i216;
   $or$cond50$i = $625 | $or$cond11$not$i;
   if (!$or$cond50$i) {
    $$723948$i = $$$4236$i;
    $$749$i = $614;
    label = 180;
   }
  }
 }
 if ((label | 0) == 180) {
  $626 = SAFE_HEAP_LOAD(1088 | 0, 4, 0) | 0 | 0;
  $627 = $626 + $$723948$i | 0;
  SAFE_HEAP_STORE(1088 | 0, $627 | 0, 4);
  $628 = SAFE_HEAP_LOAD(1092 | 0, 4, 0) | 0 | 0;
  $629 = $627 >>> 0 > $628 >>> 0;
  if ($629) {
   SAFE_HEAP_STORE(1092 | 0, $627 | 0, 4);
  }
  $630 = SAFE_HEAP_LOAD(680 | 0, 4, 0) | 0 | 0;
  $631 = ($630 | 0) == (0 | 0);
  do {
   if ($631) {
    $632 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
    $633 = ($632 | 0) == (0 | 0);
    $634 = $$749$i >>> 0 < $632 >>> 0;
    $or$cond12$i = $633 | $634;
    if ($or$cond12$i) {
     SAFE_HEAP_STORE(672 | 0, $$749$i | 0, 4);
    }
    SAFE_HEAP_STORE(1104 | 0, $$749$i | 0, 4);
    SAFE_HEAP_STORE(1108 | 0, $$723948$i | 0, 4);
    SAFE_HEAP_STORE(1116 | 0, 0 | 0, 4);
    $635 = SAFE_HEAP_LOAD(282 * 4 | 0, 4, 0) | 0 | 0;
    SAFE_HEAP_STORE(692 | 0, $635 | 0, 4);
    SAFE_HEAP_STORE(688 | 0, -1 | 0, 4);
    $$01$i$i = 0;
    while (1) {
     $636 = $$01$i$i << 1;
     $637 = 696 + ($636 << 2) | 0;
     $638 = $637 + 12 | 0;
     SAFE_HEAP_STORE($638 | 0, $637 | 0, 4);
     $639 = $637 + 8 | 0;
     SAFE_HEAP_STORE($639 | 0, $637 | 0, 4);
     $640 = $$01$i$i + 1 | 0;
     $exitcond$i$i = ($640 | 0) == 32;
     if ($exitcond$i$i) {
      break;
     } else {
      $$01$i$i = $640;
     }
    }
    $641 = $$723948$i + -40 | 0;
    $642 = $$749$i + 8 | 0;
    $643 = $642;
    $644 = $643 & 7;
    $645 = ($644 | 0) == 0;
    $646 = 0 - $643 | 0;
    $647 = $646 & 7;
    $648 = $645 ? 0 : $647;
    $649 = $$749$i + $648 | 0;
    $650 = $641 - $648 | 0;
    SAFE_HEAP_STORE(680 | 0, $649 | 0, 4);
    SAFE_HEAP_STORE(668 | 0, $650 | 0, 4);
    $651 = $650 | 1;
    $652 = $649 + 4 | 0;
    SAFE_HEAP_STORE($652 | 0, $651 | 0, 4);
    $653 = $649 + $650 | 0;
    $654 = $653 + 4 | 0;
    SAFE_HEAP_STORE($654 | 0, 40 | 0, 4);
    $655 = SAFE_HEAP_LOAD(1144 | 0, 4, 0) | 0 | 0;
    SAFE_HEAP_STORE(684 | 0, $655 | 0, 4);
   } else {
    $$024371$i = 1104;
    while (1) {
     $656 = SAFE_HEAP_LOAD($$024371$i | 0, 4, 0) | 0 | 0;
     $657 = $$024371$i + 4 | 0;
     $658 = SAFE_HEAP_LOAD($657 | 0, 4, 0) | 0 | 0;
     $659 = $656 + $658 | 0;
     $660 = ($$749$i | 0) == ($659 | 0);
     if ($660) {
      label = 190;
      break;
     }
     $661 = $$024371$i + 8 | 0;
     $662 = SAFE_HEAP_LOAD($661 | 0, 4, 0) | 0 | 0;
     $663 = ($662 | 0) == (0 | 0);
     if ($663) {
      break;
     } else {
      $$024371$i = $662;
     }
    }
    if ((label | 0) == 190) {
     $664 = $$024371$i + 12 | 0;
     $665 = SAFE_HEAP_LOAD($664 | 0, 4, 0) | 0 | 0;
     $666 = $665 & 8;
     $667 = ($666 | 0) == 0;
     if ($667) {
      $668 = $630 >>> 0 >= $656 >>> 0;
      $669 = $630 >>> 0 < $$749$i >>> 0;
      $or$cond51$i = $669 & $668;
      if ($or$cond51$i) {
       $670 = $658 + $$723948$i | 0;
       SAFE_HEAP_STORE($657 | 0, $670 | 0, 4);
       $671 = SAFE_HEAP_LOAD(668 | 0, 4, 0) | 0 | 0;
       $672 = $630 + 8 | 0;
       $673 = $672;
       $674 = $673 & 7;
       $675 = ($674 | 0) == 0;
       $676 = 0 - $673 | 0;
       $677 = $676 & 7;
       $678 = $675 ? 0 : $677;
       $679 = $630 + $678 | 0;
       $680 = $$723948$i - $678 | 0;
       $681 = $671 + $680 | 0;
       SAFE_HEAP_STORE(680 | 0, $679 | 0, 4);
       SAFE_HEAP_STORE(668 | 0, $681 | 0, 4);
       $682 = $681 | 1;
       $683 = $679 + 4 | 0;
       SAFE_HEAP_STORE($683 | 0, $682 | 0, 4);
       $684 = $679 + $681 | 0;
       $685 = $684 + 4 | 0;
       SAFE_HEAP_STORE($685 | 0, 40 | 0, 4);
       $686 = SAFE_HEAP_LOAD(1144 | 0, 4, 0) | 0 | 0;
       SAFE_HEAP_STORE(684 | 0, $686 | 0, 4);
       break;
      }
     }
    }
    $687 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
    $688 = $$749$i >>> 0 < $687 >>> 0;
    if ($688) {
     SAFE_HEAP_STORE(672 | 0, $$749$i | 0, 4);
     $752 = $$749$i;
    } else {
     $752 = $687;
    }
    $689 = $$749$i + $$723948$i | 0;
    $$124470$i = 1104;
    while (1) {
     $690 = SAFE_HEAP_LOAD($$124470$i | 0, 4, 0) | 0 | 0;
     $691 = ($690 | 0) == ($689 | 0);
     if ($691) {
      label = 198;
      break;
     }
     $692 = $$124470$i + 8 | 0;
     $693 = SAFE_HEAP_LOAD($692 | 0, 4, 0) | 0 | 0;
     $694 = ($693 | 0) == (0 | 0);
     if ($694) {
      break;
     } else {
      $$124470$i = $693;
     }
    }
    if ((label | 0) == 198) {
     $695 = $$124470$i + 12 | 0;
     $696 = SAFE_HEAP_LOAD($695 | 0, 4, 0) | 0 | 0;
     $697 = $696 & 8;
     $698 = ($697 | 0) == 0;
     if ($698) {
      SAFE_HEAP_STORE($$124470$i | 0, $$749$i | 0, 4);
      $699 = $$124470$i + 4 | 0;
      $700 = SAFE_HEAP_LOAD($699 | 0, 4, 0) | 0 | 0;
      $701 = $700 + $$723948$i | 0;
      SAFE_HEAP_STORE($699 | 0, $701 | 0, 4);
      $702 = $$749$i + 8 | 0;
      $703 = $702;
      $704 = $703 & 7;
      $705 = ($704 | 0) == 0;
      $706 = 0 - $703 | 0;
      $707 = $706 & 7;
      $708 = $705 ? 0 : $707;
      $709 = $$749$i + $708 | 0;
      $710 = $689 + 8 | 0;
      $711 = $710;
      $712 = $711 & 7;
      $713 = ($712 | 0) == 0;
      $714 = 0 - $711 | 0;
      $715 = $714 & 7;
      $716 = $713 ? 0 : $715;
      $717 = $689 + $716 | 0;
      $718 = $717;
      $719 = $709;
      $720 = $718 - $719 | 0;
      $721 = $709 + $$0197 | 0;
      $722 = $720 - $$0197 | 0;
      $723 = $$0197 | 3;
      $724 = $709 + 4 | 0;
      SAFE_HEAP_STORE($724 | 0, $723 | 0, 4);
      $725 = ($717 | 0) == ($630 | 0);
      do {
       if ($725) {
        $726 = SAFE_HEAP_LOAD(668 | 0, 4, 0) | 0 | 0;
        $727 = $726 + $722 | 0;
        SAFE_HEAP_STORE(668 | 0, $727 | 0, 4);
        SAFE_HEAP_STORE(680 | 0, $721 | 0, 4);
        $728 = $727 | 1;
        $729 = $721 + 4 | 0;
        SAFE_HEAP_STORE($729 | 0, $728 | 0, 4);
       } else {
        $730 = SAFE_HEAP_LOAD(676 | 0, 4, 0) | 0 | 0;
        $731 = ($717 | 0) == ($730 | 0);
        if ($731) {
         $732 = SAFE_HEAP_LOAD(664 | 0, 4, 0) | 0 | 0;
         $733 = $732 + $722 | 0;
         SAFE_HEAP_STORE(664 | 0, $733 | 0, 4);
         SAFE_HEAP_STORE(676 | 0, $721 | 0, 4);
         $734 = $733 | 1;
         $735 = $721 + 4 | 0;
         SAFE_HEAP_STORE($735 | 0, $734 | 0, 4);
         $736 = $721 + $733 | 0;
         SAFE_HEAP_STORE($736 | 0, $733 | 0, 4);
         break;
        }
        $737 = $717 + 4 | 0;
        $738 = SAFE_HEAP_LOAD($737 | 0, 4, 0) | 0 | 0;
        $739 = $738 & 3;
        $740 = ($739 | 0) == 1;
        if ($740) {
         $741 = $738 & -8;
         $742 = $738 >>> 3;
         $743 = $738 >>> 0 < 256;
         L314 : do {
          if ($743) {
           $744 = $717 + 8 | 0;
           $745 = SAFE_HEAP_LOAD($744 | 0, 4, 0) | 0 | 0;
           $746 = $717 + 12 | 0;
           $747 = SAFE_HEAP_LOAD($746 | 0, 4, 0) | 0 | 0;
           $748 = $742 << 1;
           $749 = 696 + ($748 << 2) | 0;
           $750 = ($745 | 0) == ($749 | 0);
           do {
            if (!$750) {
             $751 = $745 >>> 0 < $752 >>> 0;
             if ($751) {
              _abort();
             }
             $753 = $745 + 12 | 0;
             $754 = SAFE_HEAP_LOAD($753 | 0, 4, 0) | 0 | 0;
             $755 = ($754 | 0) == ($717 | 0);
             if ($755) {
              break;
             }
             _abort();
            }
           } while (0);
           $756 = ($747 | 0) == ($745 | 0);
           if ($756) {
            $757 = 1 << $742;
            $758 = $757 ^ -1;
            $759 = SAFE_HEAP_LOAD(164 * 4 | 0, 4, 0) | 0 | 0;
            $760 = $759 & $758;
            SAFE_HEAP_STORE(164 * 4 | 0, $760 | 0, 4);
            break;
           }
           $761 = ($747 | 0) == ($749 | 0);
           do {
            if ($761) {
             $$pre10$i$i = $747 + 8 | 0;
             $$pre$phi11$i$iZ2D = $$pre10$i$i;
            } else {
             $762 = $747 >>> 0 < $752 >>> 0;
             if ($762) {
              _abort();
             }
             $763 = $747 + 8 | 0;
             $764 = SAFE_HEAP_LOAD($763 | 0, 4, 0) | 0 | 0;
             $765 = ($764 | 0) == ($717 | 0);
             if ($765) {
              $$pre$phi11$i$iZ2D = $763;
              break;
             }
             _abort();
            }
           } while (0);
           $766 = $745 + 12 | 0;
           SAFE_HEAP_STORE($766 | 0, $747 | 0, 4);
           SAFE_HEAP_STORE($$pre$phi11$i$iZ2D | 0, $745 | 0, 4);
          } else {
           $767 = $717 + 24 | 0;
           $768 = SAFE_HEAP_LOAD($767 | 0, 4, 0) | 0 | 0;
           $769 = $717 + 12 | 0;
           $770 = SAFE_HEAP_LOAD($769 | 0, 4, 0) | 0 | 0;
           $771 = ($770 | 0) == ($717 | 0);
           do {
            if ($771) {
             $781 = $717 + 16 | 0;
             $782 = $781 + 4 | 0;
             $783 = SAFE_HEAP_LOAD($782 | 0, 4, 0) | 0 | 0;
             $784 = ($783 | 0) == (0 | 0);
             if ($784) {
              $785 = SAFE_HEAP_LOAD($781 | 0, 4, 0) | 0 | 0;
              $786 = ($785 | 0) == (0 | 0);
              if ($786) {
               $$3$i$i = 0;
               break;
              } else {
               $$1291$i$i = $785;
               $$1293$i$i = $781;
              }
             } else {
              $$1291$i$i = $783;
              $$1293$i$i = $782;
             }
             while (1) {
              $787 = $$1291$i$i + 20 | 0;
              $788 = SAFE_HEAP_LOAD($787 | 0, 4, 0) | 0 | 0;
              $789 = ($788 | 0) == (0 | 0);
              if (!$789) {
               $$1291$i$i = $788;
               $$1293$i$i = $787;
               continue;
              }
              $790 = $$1291$i$i + 16 | 0;
              $791 = SAFE_HEAP_LOAD($790 | 0, 4, 0) | 0 | 0;
              $792 = ($791 | 0) == (0 | 0);
              if ($792) {
               break;
              } else {
               $$1291$i$i = $791;
               $$1293$i$i = $790;
              }
             }
             $793 = $$1293$i$i >>> 0 < $752 >>> 0;
             if ($793) {
              _abort();
             } else {
              SAFE_HEAP_STORE($$1293$i$i | 0, 0 | 0, 4);
              $$3$i$i = $$1291$i$i;
              break;
             }
            } else {
             $772 = $717 + 8 | 0;
             $773 = SAFE_HEAP_LOAD($772 | 0, 4, 0) | 0 | 0;
             $774 = $773 >>> 0 < $752 >>> 0;
             if ($774) {
              _abort();
             }
             $775 = $773 + 12 | 0;
             $776 = SAFE_HEAP_LOAD($775 | 0, 4, 0) | 0 | 0;
             $777 = ($776 | 0) == ($717 | 0);
             if (!$777) {
              _abort();
             }
             $778 = $770 + 8 | 0;
             $779 = SAFE_HEAP_LOAD($778 | 0, 4, 0) | 0 | 0;
             $780 = ($779 | 0) == ($717 | 0);
             if ($780) {
              SAFE_HEAP_STORE($775 | 0, $770 | 0, 4);
              SAFE_HEAP_STORE($778 | 0, $773 | 0, 4);
              $$3$i$i = $770;
              break;
             } else {
              _abort();
             }
            }
           } while (0);
           $794 = ($768 | 0) == (0 | 0);
           if ($794) {
            break;
           }
           $795 = $717 + 28 | 0;
           $796 = SAFE_HEAP_LOAD($795 | 0, 4, 0) | 0 | 0;
           $797 = 960 + ($796 << 2) | 0;
           $798 = SAFE_HEAP_LOAD($797 | 0, 4, 0) | 0 | 0;
           $799 = ($717 | 0) == ($798 | 0);
           do {
            if ($799) {
             SAFE_HEAP_STORE($797 | 0, $$3$i$i | 0, 4);
             $cond$i$i = ($$3$i$i | 0) == (0 | 0);
             if (!$cond$i$i) {
              break;
             }
             $800 = 1 << $796;
             $801 = $800 ^ -1;
             $802 = SAFE_HEAP_LOAD(660 | 0, 4, 0) | 0 | 0;
             $803 = $802 & $801;
             SAFE_HEAP_STORE(660 | 0, $803 | 0, 4);
             break L314;
            } else {
             $804 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
             $805 = $768 >>> 0 < $804 >>> 0;
             if ($805) {
              _abort();
             } else {
              $806 = $768 + 16 | 0;
              $807 = SAFE_HEAP_LOAD($806 | 0, 4, 0) | 0 | 0;
              $not$$i17$i = ($807 | 0) != ($717 | 0);
              $$sink1$i$i = $not$$i17$i & 1;
              $808 = ($768 + 16 | 0) + ($$sink1$i$i << 2) | 0;
              SAFE_HEAP_STORE($808 | 0, $$3$i$i | 0, 4);
              $809 = ($$3$i$i | 0) == (0 | 0);
              if ($809) {
               break L314;
              } else {
               break;
              }
             }
            }
           } while (0);
           $810 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
           $811 = $$3$i$i >>> 0 < $810 >>> 0;
           if ($811) {
            _abort();
           }
           $812 = $$3$i$i + 24 | 0;
           SAFE_HEAP_STORE($812 | 0, $768 | 0, 4);
           $813 = $717 + 16 | 0;
           $814 = SAFE_HEAP_LOAD($813 | 0, 4, 0) | 0 | 0;
           $815 = ($814 | 0) == (0 | 0);
           do {
            if (!$815) {
             $816 = $814 >>> 0 < $810 >>> 0;
             if ($816) {
              _abort();
             } else {
              $817 = $$3$i$i + 16 | 0;
              SAFE_HEAP_STORE($817 | 0, $814 | 0, 4);
              $818 = $814 + 24 | 0;
              SAFE_HEAP_STORE($818 | 0, $$3$i$i | 0, 4);
              break;
             }
            }
           } while (0);
           $819 = $813 + 4 | 0;
           $820 = SAFE_HEAP_LOAD($819 | 0, 4, 0) | 0 | 0;
           $821 = ($820 | 0) == (0 | 0);
           if ($821) {
            break;
           }
           $822 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
           $823 = $820 >>> 0 < $822 >>> 0;
           if ($823) {
            _abort();
           } else {
            $824 = $$3$i$i + 20 | 0;
            SAFE_HEAP_STORE($824 | 0, $820 | 0, 4);
            $825 = $820 + 24 | 0;
            SAFE_HEAP_STORE($825 | 0, $$3$i$i | 0, 4);
            break;
           }
          }
         } while (0);
         $826 = $717 + $741 | 0;
         $827 = $741 + $722 | 0;
         $$0$i18$i = $826;
         $$0287$i$i = $827;
        } else {
         $$0$i18$i = $717;
         $$0287$i$i = $722;
        }
        $828 = $$0$i18$i + 4 | 0;
        $829 = SAFE_HEAP_LOAD($828 | 0, 4, 0) | 0 | 0;
        $830 = $829 & -2;
        SAFE_HEAP_STORE($828 | 0, $830 | 0, 4);
        $831 = $$0287$i$i | 1;
        $832 = $721 + 4 | 0;
        SAFE_HEAP_STORE($832 | 0, $831 | 0, 4);
        $833 = $721 + $$0287$i$i | 0;
        SAFE_HEAP_STORE($833 | 0, $$0287$i$i | 0, 4);
        $834 = $$0287$i$i >>> 3;
        $835 = $$0287$i$i >>> 0 < 256;
        if ($835) {
         $836 = $834 << 1;
         $837 = 696 + ($836 << 2) | 0;
         $838 = SAFE_HEAP_LOAD(164 * 4 | 0, 4, 0) | 0 | 0;
         $839 = 1 << $834;
         $840 = $838 & $839;
         $841 = ($840 | 0) == 0;
         do {
          if ($841) {
           $842 = $838 | $839;
           SAFE_HEAP_STORE(164 * 4 | 0, $842 | 0, 4);
           $$pre$i19$i = $837 + 8 | 0;
           $$0295$i$i = $837;
           $$pre$phi$i20$iZ2D = $$pre$i19$i;
          } else {
           $843 = $837 + 8 | 0;
           $844 = SAFE_HEAP_LOAD($843 | 0, 4, 0) | 0 | 0;
           $845 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
           $846 = $844 >>> 0 < $845 >>> 0;
           if (!$846) {
            $$0295$i$i = $844;
            $$pre$phi$i20$iZ2D = $843;
            break;
           }
           _abort();
          }
         } while (0);
         SAFE_HEAP_STORE($$pre$phi$i20$iZ2D | 0, $721 | 0, 4);
         $847 = $$0295$i$i + 12 | 0;
         SAFE_HEAP_STORE($847 | 0, $721 | 0, 4);
         $848 = $721 + 8 | 0;
         SAFE_HEAP_STORE($848 | 0, $$0295$i$i | 0, 4);
         $849 = $721 + 12 | 0;
         SAFE_HEAP_STORE($849 | 0, $837 | 0, 4);
         break;
        }
        $850 = $$0287$i$i >>> 8;
        $851 = ($850 | 0) == 0;
        do {
         if ($851) {
          $$0296$i$i = 0;
         } else {
          $852 = $$0287$i$i >>> 0 > 16777215;
          if ($852) {
           $$0296$i$i = 31;
           break;
          }
          $853 = $850 + 1048320 | 0;
          $854 = $853 >>> 16;
          $855 = $854 & 8;
          $856 = $850 << $855;
          $857 = $856 + 520192 | 0;
          $858 = $857 >>> 16;
          $859 = $858 & 4;
          $860 = $859 | $855;
          $861 = $856 << $859;
          $862 = $861 + 245760 | 0;
          $863 = $862 >>> 16;
          $864 = $863 & 2;
          $865 = $860 | $864;
          $866 = 14 - $865 | 0;
          $867 = $861 << $864;
          $868 = $867 >>> 15;
          $869 = $866 + $868 | 0;
          $870 = $869 << 1;
          $871 = $869 + 7 | 0;
          $872 = $$0287$i$i >>> $871;
          $873 = $872 & 1;
          $874 = $873 | $870;
          $$0296$i$i = $874;
         }
        } while (0);
        $875 = 960 + ($$0296$i$i << 2) | 0;
        $876 = $721 + 28 | 0;
        SAFE_HEAP_STORE($876 | 0, $$0296$i$i | 0, 4);
        $877 = $721 + 16 | 0;
        $878 = $877 + 4 | 0;
        SAFE_HEAP_STORE($878 | 0, 0 | 0, 4);
        SAFE_HEAP_STORE($877 | 0, 0 | 0, 4);
        $879 = SAFE_HEAP_LOAD(660 | 0, 4, 0) | 0 | 0;
        $880 = 1 << $$0296$i$i;
        $881 = $879 & $880;
        $882 = ($881 | 0) == 0;
        if ($882) {
         $883 = $879 | $880;
         SAFE_HEAP_STORE(660 | 0, $883 | 0, 4);
         SAFE_HEAP_STORE($875 | 0, $721 | 0, 4);
         $884 = $721 + 24 | 0;
         SAFE_HEAP_STORE($884 | 0, $875 | 0, 4);
         $885 = $721 + 12 | 0;
         SAFE_HEAP_STORE($885 | 0, $721 | 0, 4);
         $886 = $721 + 8 | 0;
         SAFE_HEAP_STORE($886 | 0, $721 | 0, 4);
         break;
        }
        $887 = SAFE_HEAP_LOAD($875 | 0, 4, 0) | 0 | 0;
        $888 = ($$0296$i$i | 0) == 31;
        $889 = $$0296$i$i >>> 1;
        $890 = 25 - $889 | 0;
        $891 = $888 ? 0 : $890;
        $892 = $$0287$i$i << $891;
        $$0288$i$i = $892;
        $$0289$i$i = $887;
        while (1) {
         $893 = $$0289$i$i + 4 | 0;
         $894 = SAFE_HEAP_LOAD($893 | 0, 4, 0) | 0 | 0;
         $895 = $894 & -8;
         $896 = ($895 | 0) == ($$0287$i$i | 0);
         if ($896) {
          label = 265;
          break;
         }
         $897 = $$0288$i$i >>> 31;
         $898 = ($$0289$i$i + 16 | 0) + ($897 << 2) | 0;
         $899 = $$0288$i$i << 1;
         $900 = SAFE_HEAP_LOAD($898 | 0, 4, 0) | 0 | 0;
         $901 = ($900 | 0) == (0 | 0);
         if ($901) {
          label = 262;
          break;
         } else {
          $$0288$i$i = $899;
          $$0289$i$i = $900;
         }
        }
        if ((label | 0) == 262) {
         $902 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
         $903 = $898 >>> 0 < $902 >>> 0;
         if ($903) {
          _abort();
         } else {
          SAFE_HEAP_STORE($898 | 0, $721 | 0, 4);
          $904 = $721 + 24 | 0;
          SAFE_HEAP_STORE($904 | 0, $$0289$i$i | 0, 4);
          $905 = $721 + 12 | 0;
          SAFE_HEAP_STORE($905 | 0, $721 | 0, 4);
          $906 = $721 + 8 | 0;
          SAFE_HEAP_STORE($906 | 0, $721 | 0, 4);
          break;
         }
        } else if ((label | 0) == 265) {
         $907 = $$0289$i$i + 8 | 0;
         $908 = SAFE_HEAP_LOAD($907 | 0, 4, 0) | 0 | 0;
         $909 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
         $910 = $908 >>> 0 >= $909 >>> 0;
         $not$7$i$i = $$0289$i$i >>> 0 >= $909 >>> 0;
         $911 = $910 & $not$7$i$i;
         if ($911) {
          $912 = $908 + 12 | 0;
          SAFE_HEAP_STORE($912 | 0, $721 | 0, 4);
          SAFE_HEAP_STORE($907 | 0, $721 | 0, 4);
          $913 = $721 + 8 | 0;
          SAFE_HEAP_STORE($913 | 0, $908 | 0, 4);
          $914 = $721 + 12 | 0;
          SAFE_HEAP_STORE($914 | 0, $$0289$i$i | 0, 4);
          $915 = $721 + 24 | 0;
          SAFE_HEAP_STORE($915 | 0, 0 | 0, 4);
          break;
         } else {
          _abort();
         }
        }
       }
      } while (0);
      $1047 = $709 + 8 | 0;
      $$0 = $1047;
      STACKTOP = sp;
      return $$0 | 0;
     }
    }
    $$0$i$i$i = 1104;
    while (1) {
     $916 = SAFE_HEAP_LOAD($$0$i$i$i | 0, 4, 0) | 0 | 0;
     $917 = $916 >>> 0 > $630 >>> 0;
     if (!$917) {
      $918 = $$0$i$i$i + 4 | 0;
      $919 = SAFE_HEAP_LOAD($918 | 0, 4, 0) | 0 | 0;
      $920 = $916 + $919 | 0;
      $921 = $920 >>> 0 > $630 >>> 0;
      if ($921) {
       break;
      }
     }
     $922 = $$0$i$i$i + 8 | 0;
     $923 = SAFE_HEAP_LOAD($922 | 0, 4, 0) | 0 | 0;
     $$0$i$i$i = $923;
    }
    $924 = $920 + -47 | 0;
    $925 = $924 + 8 | 0;
    $926 = $925;
    $927 = $926 & 7;
    $928 = ($927 | 0) == 0;
    $929 = 0 - $926 | 0;
    $930 = $929 & 7;
    $931 = $928 ? 0 : $930;
    $932 = $924 + $931 | 0;
    $933 = $630 + 16 | 0;
    $934 = $932 >>> 0 < $933 >>> 0;
    $935 = $934 ? $630 : $932;
    $936 = $935 + 8 | 0;
    $937 = $935 + 24 | 0;
    $938 = $$723948$i + -40 | 0;
    $939 = $$749$i + 8 | 0;
    $940 = $939;
    $941 = $940 & 7;
    $942 = ($941 | 0) == 0;
    $943 = 0 - $940 | 0;
    $944 = $943 & 7;
    $945 = $942 ? 0 : $944;
    $946 = $$749$i + $945 | 0;
    $947 = $938 - $945 | 0;
    SAFE_HEAP_STORE(680 | 0, $946 | 0, 4);
    SAFE_HEAP_STORE(668 | 0, $947 | 0, 4);
    $948 = $947 | 1;
    $949 = $946 + 4 | 0;
    SAFE_HEAP_STORE($949 | 0, $948 | 0, 4);
    $950 = $946 + $947 | 0;
    $951 = $950 + 4 | 0;
    SAFE_HEAP_STORE($951 | 0, 40 | 0, 4);
    $952 = SAFE_HEAP_LOAD(1144 | 0, 4, 0) | 0 | 0;
    SAFE_HEAP_STORE(684 | 0, $952 | 0, 4);
    $953 = $935 + 4 | 0;
    SAFE_HEAP_STORE($953 | 0, 27 | 0, 4);
    {}
    SAFE_HEAP_STORE($936 | 0, SAFE_HEAP_LOAD(1104 | 0, 4, 0) | 0 | 0 | 0, 4);
    SAFE_HEAP_STORE($936 + 4 | 0, SAFE_HEAP_LOAD(1104 + 4 | 0, 4, 0) | 0 | 0 | 0, 4);
    SAFE_HEAP_STORE($936 + 8 | 0, SAFE_HEAP_LOAD(1104 + 8 | 0, 4, 0) | 0 | 0 | 0, 4);
    SAFE_HEAP_STORE($936 + 12 | 0, SAFE_HEAP_LOAD(1104 + 12 | 0, 4, 0) | 0 | 0 | 0, 4);
    SAFE_HEAP_STORE(1104 | 0, $$749$i | 0, 4);
    SAFE_HEAP_STORE(1108 | 0, $$723948$i | 0, 4);
    SAFE_HEAP_STORE(1116 | 0, 0 | 0, 4);
    SAFE_HEAP_STORE(1112 | 0, $936 | 0, 4);
    $955 = $937;
    while (1) {
     $954 = $955 + 4 | 0;
     SAFE_HEAP_STORE($954 | 0, 7 | 0, 4);
     $956 = $955 + 8 | 0;
     $957 = $956 >>> 0 < $920 >>> 0;
     if ($957) {
      $955 = $954;
     } else {
      break;
     }
    }
    $958 = ($935 | 0) == ($630 | 0);
    if (!$958) {
     $959 = $935;
     $960 = $630;
     $961 = $959 - $960 | 0;
     $962 = SAFE_HEAP_LOAD($953 | 0, 4, 0) | 0 | 0;
     $963 = $962 & -2;
     SAFE_HEAP_STORE($953 | 0, $963 | 0, 4);
     $964 = $961 | 1;
     $965 = $630 + 4 | 0;
     SAFE_HEAP_STORE($965 | 0, $964 | 0, 4);
     SAFE_HEAP_STORE($935 | 0, $961 | 0, 4);
     $966 = $961 >>> 3;
     $967 = $961 >>> 0 < 256;
     if ($967) {
      $968 = $966 << 1;
      $969 = 696 + ($968 << 2) | 0;
      $970 = SAFE_HEAP_LOAD(164 * 4 | 0, 4, 0) | 0 | 0;
      $971 = 1 << $966;
      $972 = $970 & $971;
      $973 = ($972 | 0) == 0;
      if ($973) {
       $974 = $970 | $971;
       SAFE_HEAP_STORE(164 * 4 | 0, $974 | 0, 4);
       $$pre$i$i = $969 + 8 | 0;
       $$0211$i$i = $969;
       $$pre$phi$i$iZ2D = $$pre$i$i;
      } else {
       $975 = $969 + 8 | 0;
       $976 = SAFE_HEAP_LOAD($975 | 0, 4, 0) | 0 | 0;
       $977 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
       $978 = $976 >>> 0 < $977 >>> 0;
       if ($978) {
        _abort();
       } else {
        $$0211$i$i = $976;
        $$pre$phi$i$iZ2D = $975;
       }
      }
      SAFE_HEAP_STORE($$pre$phi$i$iZ2D | 0, $630 | 0, 4);
      $979 = $$0211$i$i + 12 | 0;
      SAFE_HEAP_STORE($979 | 0, $630 | 0, 4);
      $980 = $630 + 8 | 0;
      SAFE_HEAP_STORE($980 | 0, $$0211$i$i | 0, 4);
      $981 = $630 + 12 | 0;
      SAFE_HEAP_STORE($981 | 0, $969 | 0, 4);
      break;
     }
     $982 = $961 >>> 8;
     $983 = ($982 | 0) == 0;
     if ($983) {
      $$0212$i$i = 0;
     } else {
      $984 = $961 >>> 0 > 16777215;
      if ($984) {
       $$0212$i$i = 31;
      } else {
       $985 = $982 + 1048320 | 0;
       $986 = $985 >>> 16;
       $987 = $986 & 8;
       $988 = $982 << $987;
       $989 = $988 + 520192 | 0;
       $990 = $989 >>> 16;
       $991 = $990 & 4;
       $992 = $991 | $987;
       $993 = $988 << $991;
       $994 = $993 + 245760 | 0;
       $995 = $994 >>> 16;
       $996 = $995 & 2;
       $997 = $992 | $996;
       $998 = 14 - $997 | 0;
       $999 = $993 << $996;
       $1000 = $999 >>> 15;
       $1001 = $998 + $1000 | 0;
       $1002 = $1001 << 1;
       $1003 = $1001 + 7 | 0;
       $1004 = $961 >>> $1003;
       $1005 = $1004 & 1;
       $1006 = $1005 | $1002;
       $$0212$i$i = $1006;
      }
     }
     $1007 = 960 + ($$0212$i$i << 2) | 0;
     $1008 = $630 + 28 | 0;
     SAFE_HEAP_STORE($1008 | 0, $$0212$i$i | 0, 4);
     $1009 = $630 + 20 | 0;
     SAFE_HEAP_STORE($1009 | 0, 0 | 0, 4);
     SAFE_HEAP_STORE($933 | 0, 0 | 0, 4);
     $1010 = SAFE_HEAP_LOAD(660 | 0, 4, 0) | 0 | 0;
     $1011 = 1 << $$0212$i$i;
     $1012 = $1010 & $1011;
     $1013 = ($1012 | 0) == 0;
     if ($1013) {
      $1014 = $1010 | $1011;
      SAFE_HEAP_STORE(660 | 0, $1014 | 0, 4);
      SAFE_HEAP_STORE($1007 | 0, $630 | 0, 4);
      $1015 = $630 + 24 | 0;
      SAFE_HEAP_STORE($1015 | 0, $1007 | 0, 4);
      $1016 = $630 + 12 | 0;
      SAFE_HEAP_STORE($1016 | 0, $630 | 0, 4);
      $1017 = $630 + 8 | 0;
      SAFE_HEAP_STORE($1017 | 0, $630 | 0, 4);
      break;
     }
     $1018 = SAFE_HEAP_LOAD($1007 | 0, 4, 0) | 0 | 0;
     $1019 = ($$0212$i$i | 0) == 31;
     $1020 = $$0212$i$i >>> 1;
     $1021 = 25 - $1020 | 0;
     $1022 = $1019 ? 0 : $1021;
     $1023 = $961 << $1022;
     $$0206$i$i = $1023;
     $$0207$i$i = $1018;
     while (1) {
      $1024 = $$0207$i$i + 4 | 0;
      $1025 = SAFE_HEAP_LOAD($1024 | 0, 4, 0) | 0 | 0;
      $1026 = $1025 & -8;
      $1027 = ($1026 | 0) == ($961 | 0);
      if ($1027) {
       label = 292;
       break;
      }
      $1028 = $$0206$i$i >>> 31;
      $1029 = ($$0207$i$i + 16 | 0) + ($1028 << 2) | 0;
      $1030 = $$0206$i$i << 1;
      $1031 = SAFE_HEAP_LOAD($1029 | 0, 4, 0) | 0 | 0;
      $1032 = ($1031 | 0) == (0 | 0);
      if ($1032) {
       label = 289;
       break;
      } else {
       $$0206$i$i = $1030;
       $$0207$i$i = $1031;
      }
     }
     if ((label | 0) == 289) {
      $1033 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
      $1034 = $1029 >>> 0 < $1033 >>> 0;
      if ($1034) {
       _abort();
      } else {
       SAFE_HEAP_STORE($1029 | 0, $630 | 0, 4);
       $1035 = $630 + 24 | 0;
       SAFE_HEAP_STORE($1035 | 0, $$0207$i$i | 0, 4);
       $1036 = $630 + 12 | 0;
       SAFE_HEAP_STORE($1036 | 0, $630 | 0, 4);
       $1037 = $630 + 8 | 0;
       SAFE_HEAP_STORE($1037 | 0, $630 | 0, 4);
       break;
      }
     } else if ((label | 0) == 292) {
      $1038 = $$0207$i$i + 8 | 0;
      $1039 = SAFE_HEAP_LOAD($1038 | 0, 4, 0) | 0 | 0;
      $1040 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
      $1041 = $1039 >>> 0 >= $1040 >>> 0;
      $not$$i$i = $$0207$i$i >>> 0 >= $1040 >>> 0;
      $1042 = $1041 & $not$$i$i;
      if ($1042) {
       $1043 = $1039 + 12 | 0;
       SAFE_HEAP_STORE($1043 | 0, $630 | 0, 4);
       SAFE_HEAP_STORE($1038 | 0, $630 | 0, 4);
       $1044 = $630 + 8 | 0;
       SAFE_HEAP_STORE($1044 | 0, $1039 | 0, 4);
       $1045 = $630 + 12 | 0;
       SAFE_HEAP_STORE($1045 | 0, $$0207$i$i | 0, 4);
       $1046 = $630 + 24 | 0;
       SAFE_HEAP_STORE($1046 | 0, 0 | 0, 4);
       break;
      } else {
       _abort();
      }
     }
    }
   }
  } while (0);
  $1048 = SAFE_HEAP_LOAD(668 | 0, 4, 0) | 0 | 0;
  $1049 = $1048 >>> 0 > $$0197 >>> 0;
  if ($1049) {
   $1050 = $1048 - $$0197 | 0;
   SAFE_HEAP_STORE(668 | 0, $1050 | 0, 4);
   $1051 = SAFE_HEAP_LOAD(680 | 0, 4, 0) | 0 | 0;
   $1052 = $1051 + $$0197 | 0;
   SAFE_HEAP_STORE(680 | 0, $1052 | 0, 4);
   $1053 = $1050 | 1;
   $1054 = $1052 + 4 | 0;
   SAFE_HEAP_STORE($1054 | 0, $1053 | 0, 4);
   $1055 = $$0197 | 3;
   $1056 = $1051 + 4 | 0;
   SAFE_HEAP_STORE($1056 | 0, $1055 | 0, 4);
   $1057 = $1051 + 8 | 0;
   $$0 = $1057;
   STACKTOP = sp;
   return $$0 | 0;
  }
 }
 $1058 = ___errno_location() | 0;
 SAFE_HEAP_STORE($1058 | 0, 12 | 0, 4);
 $$0 = 0;
 STACKTOP = sp;
 return $$0 | 0;
}

function _free($0) {
 $0 = $0 | 0;
 var $$0212$i = 0, $$0212$in$i = 0, $$0383 = 0, $$0384 = 0, $$0396 = 0, $$0403 = 0, $$1 = 0, $$1382 = 0, $$1387 = 0, $$1390 = 0, $$1398 = 0, $$1402 = 0, $$2 = 0, $$3 = 0, $$3400 = 0, $$pre = 0, $$pre$phi443Z2D = 0, $$pre$phi445Z2D = 0, $$pre$phiZ2D = 0, $$pre442 = 0;
 var $$pre444 = 0, $$sink3 = 0, $$sink5 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0;
 var $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0;
 var $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0;
 var $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0;
 var $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0;
 var $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0;
 var $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0;
 var $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0;
 var $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0;
 var $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0;
 var $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0;
 var $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0;
 var $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0;
 var $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0;
 var $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0;
 var $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0;
 var $99 = 0, $cond421 = 0, $cond422 = 0, $not$ = 0, $not$405 = 0, $not$437 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $1 = ($0 | 0) == (0 | 0);
 if ($1) {
  return;
 }
 $2 = $0 + -8 | 0;
 $3 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
 $4 = $2 >>> 0 < $3 >>> 0;
 if ($4) {
  _abort();
 }
 $5 = $0 + -4 | 0;
 $6 = SAFE_HEAP_LOAD($5 | 0, 4, 0) | 0 | 0;
 $7 = $6 & 3;
 $8 = ($7 | 0) == 1;
 if ($8) {
  _abort();
 }
 $9 = $6 & -8;
 $10 = $2 + $9 | 0;
 $11 = $6 & 1;
 $12 = ($11 | 0) == 0;
 L10 : do {
  if ($12) {
   $13 = SAFE_HEAP_LOAD($2 | 0, 4, 0) | 0 | 0;
   $14 = ($7 | 0) == 0;
   if ($14) {
    return;
   }
   $15 = 0 - $13 | 0;
   $16 = $2 + $15 | 0;
   $17 = $13 + $9 | 0;
   $18 = $16 >>> 0 < $3 >>> 0;
   if ($18) {
    _abort();
   }
   $19 = SAFE_HEAP_LOAD(676 | 0, 4, 0) | 0 | 0;
   $20 = ($16 | 0) == ($19 | 0);
   if ($20) {
    $104 = $10 + 4 | 0;
    $105 = SAFE_HEAP_LOAD($104 | 0, 4, 0) | 0 | 0;
    $106 = $105 & 3;
    $107 = ($106 | 0) == 3;
    if (!$107) {
     $$1 = $16;
     $$1382 = $17;
     $113 = $16;
     break;
    }
    $108 = $16 + $17 | 0;
    $109 = $16 + 4 | 0;
    $110 = $17 | 1;
    $111 = $105 & -2;
    SAFE_HEAP_STORE(664 | 0, $17 | 0, 4);
    SAFE_HEAP_STORE($104 | 0, $111 | 0, 4);
    SAFE_HEAP_STORE($109 | 0, $110 | 0, 4);
    SAFE_HEAP_STORE($108 | 0, $17 | 0, 4);
    return;
   }
   $21 = $13 >>> 3;
   $22 = $13 >>> 0 < 256;
   if ($22) {
    $23 = $16 + 8 | 0;
    $24 = SAFE_HEAP_LOAD($23 | 0, 4, 0) | 0 | 0;
    $25 = $16 + 12 | 0;
    $26 = SAFE_HEAP_LOAD($25 | 0, 4, 0) | 0 | 0;
    $27 = $21 << 1;
    $28 = 696 + ($27 << 2) | 0;
    $29 = ($24 | 0) == ($28 | 0);
    if (!$29) {
     $30 = $24 >>> 0 < $3 >>> 0;
     if ($30) {
      _abort();
     }
     $31 = $24 + 12 | 0;
     $32 = SAFE_HEAP_LOAD($31 | 0, 4, 0) | 0 | 0;
     $33 = ($32 | 0) == ($16 | 0);
     if (!$33) {
      _abort();
     }
    }
    $34 = ($26 | 0) == ($24 | 0);
    if ($34) {
     $35 = 1 << $21;
     $36 = $35 ^ -1;
     $37 = SAFE_HEAP_LOAD(164 * 4 | 0, 4, 0) | 0 | 0;
     $38 = $37 & $36;
     SAFE_HEAP_STORE(164 * 4 | 0, $38 | 0, 4);
     $$1 = $16;
     $$1382 = $17;
     $113 = $16;
     break;
    }
    $39 = ($26 | 0) == ($28 | 0);
    if ($39) {
     $$pre444 = $26 + 8 | 0;
     $$pre$phi445Z2D = $$pre444;
    } else {
     $40 = $26 >>> 0 < $3 >>> 0;
     if ($40) {
      _abort();
     }
     $41 = $26 + 8 | 0;
     $42 = SAFE_HEAP_LOAD($41 | 0, 4, 0) | 0 | 0;
     $43 = ($42 | 0) == ($16 | 0);
     if ($43) {
      $$pre$phi445Z2D = $41;
     } else {
      _abort();
     }
    }
    $44 = $24 + 12 | 0;
    SAFE_HEAP_STORE($44 | 0, $26 | 0, 4);
    SAFE_HEAP_STORE($$pre$phi445Z2D | 0, $24 | 0, 4);
    $$1 = $16;
    $$1382 = $17;
    $113 = $16;
    break;
   }
   $45 = $16 + 24 | 0;
   $46 = SAFE_HEAP_LOAD($45 | 0, 4, 0) | 0 | 0;
   $47 = $16 + 12 | 0;
   $48 = SAFE_HEAP_LOAD($47 | 0, 4, 0) | 0 | 0;
   $49 = ($48 | 0) == ($16 | 0);
   do {
    if ($49) {
     $59 = $16 + 16 | 0;
     $60 = $59 + 4 | 0;
     $61 = SAFE_HEAP_LOAD($60 | 0, 4, 0) | 0 | 0;
     $62 = ($61 | 0) == (0 | 0);
     if ($62) {
      $63 = SAFE_HEAP_LOAD($59 | 0, 4, 0) | 0 | 0;
      $64 = ($63 | 0) == (0 | 0);
      if ($64) {
       $$3 = 0;
       break;
      } else {
       $$1387 = $63;
       $$1390 = $59;
      }
     } else {
      $$1387 = $61;
      $$1390 = $60;
     }
     while (1) {
      $65 = $$1387 + 20 | 0;
      $66 = SAFE_HEAP_LOAD($65 | 0, 4, 0) | 0 | 0;
      $67 = ($66 | 0) == (0 | 0);
      if (!$67) {
       $$1387 = $66;
       $$1390 = $65;
       continue;
      }
      $68 = $$1387 + 16 | 0;
      $69 = SAFE_HEAP_LOAD($68 | 0, 4, 0) | 0 | 0;
      $70 = ($69 | 0) == (0 | 0);
      if ($70) {
       break;
      } else {
       $$1387 = $69;
       $$1390 = $68;
      }
     }
     $71 = $$1390 >>> 0 < $3 >>> 0;
     if ($71) {
      _abort();
     } else {
      SAFE_HEAP_STORE($$1390 | 0, 0 | 0, 4);
      $$3 = $$1387;
      break;
     }
    } else {
     $50 = $16 + 8 | 0;
     $51 = SAFE_HEAP_LOAD($50 | 0, 4, 0) | 0 | 0;
     $52 = $51 >>> 0 < $3 >>> 0;
     if ($52) {
      _abort();
     }
     $53 = $51 + 12 | 0;
     $54 = SAFE_HEAP_LOAD($53 | 0, 4, 0) | 0 | 0;
     $55 = ($54 | 0) == ($16 | 0);
     if (!$55) {
      _abort();
     }
     $56 = $48 + 8 | 0;
     $57 = SAFE_HEAP_LOAD($56 | 0, 4, 0) | 0 | 0;
     $58 = ($57 | 0) == ($16 | 0);
     if ($58) {
      SAFE_HEAP_STORE($53 | 0, $48 | 0, 4);
      SAFE_HEAP_STORE($56 | 0, $51 | 0, 4);
      $$3 = $48;
      break;
     } else {
      _abort();
     }
    }
   } while (0);
   $72 = ($46 | 0) == (0 | 0);
   if ($72) {
    $$1 = $16;
    $$1382 = $17;
    $113 = $16;
   } else {
    $73 = $16 + 28 | 0;
    $74 = SAFE_HEAP_LOAD($73 | 0, 4, 0) | 0 | 0;
    $75 = 960 + ($74 << 2) | 0;
    $76 = SAFE_HEAP_LOAD($75 | 0, 4, 0) | 0 | 0;
    $77 = ($16 | 0) == ($76 | 0);
    do {
     if ($77) {
      SAFE_HEAP_STORE($75 | 0, $$3 | 0, 4);
      $cond421 = ($$3 | 0) == (0 | 0);
      if ($cond421) {
       $78 = 1 << $74;
       $79 = $78 ^ -1;
       $80 = SAFE_HEAP_LOAD(660 | 0, 4, 0) | 0 | 0;
       $81 = $80 & $79;
       SAFE_HEAP_STORE(660 | 0, $81 | 0, 4);
       $$1 = $16;
       $$1382 = $17;
       $113 = $16;
       break L10;
      }
     } else {
      $82 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
      $83 = $46 >>> 0 < $82 >>> 0;
      if ($83) {
       _abort();
      } else {
       $84 = $46 + 16 | 0;
       $85 = SAFE_HEAP_LOAD($84 | 0, 4, 0) | 0 | 0;
       $not$405 = ($85 | 0) != ($16 | 0);
       $$sink3 = $not$405 & 1;
       $86 = ($46 + 16 | 0) + ($$sink3 << 2) | 0;
       SAFE_HEAP_STORE($86 | 0, $$3 | 0, 4);
       $87 = ($$3 | 0) == (0 | 0);
       if ($87) {
        $$1 = $16;
        $$1382 = $17;
        $113 = $16;
        break L10;
       } else {
        break;
       }
      }
     }
    } while (0);
    $88 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
    $89 = $$3 >>> 0 < $88 >>> 0;
    if ($89) {
     _abort();
    }
    $90 = $$3 + 24 | 0;
    SAFE_HEAP_STORE($90 | 0, $46 | 0, 4);
    $91 = $16 + 16 | 0;
    $92 = SAFE_HEAP_LOAD($91 | 0, 4, 0) | 0 | 0;
    $93 = ($92 | 0) == (0 | 0);
    do {
     if (!$93) {
      $94 = $92 >>> 0 < $88 >>> 0;
      if ($94) {
       _abort();
      } else {
       $95 = $$3 + 16 | 0;
       SAFE_HEAP_STORE($95 | 0, $92 | 0, 4);
       $96 = $92 + 24 | 0;
       SAFE_HEAP_STORE($96 | 0, $$3 | 0, 4);
       break;
      }
     }
    } while (0);
    $97 = $91 + 4 | 0;
    $98 = SAFE_HEAP_LOAD($97 | 0, 4, 0) | 0 | 0;
    $99 = ($98 | 0) == (0 | 0);
    if ($99) {
     $$1 = $16;
     $$1382 = $17;
     $113 = $16;
    } else {
     $100 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
     $101 = $98 >>> 0 < $100 >>> 0;
     if ($101) {
      _abort();
     } else {
      $102 = $$3 + 20 | 0;
      SAFE_HEAP_STORE($102 | 0, $98 | 0, 4);
      $103 = $98 + 24 | 0;
      SAFE_HEAP_STORE($103 | 0, $$3 | 0, 4);
      $$1 = $16;
      $$1382 = $17;
      $113 = $16;
      break;
     }
    }
   }
  } else {
   $$1 = $2;
   $$1382 = $9;
   $113 = $2;
  }
 } while (0);
 $112 = $113 >>> 0 < $10 >>> 0;
 if (!$112) {
  _abort();
 }
 $114 = $10 + 4 | 0;
 $115 = SAFE_HEAP_LOAD($114 | 0, 4, 0) | 0 | 0;
 $116 = $115 & 1;
 $117 = ($116 | 0) == 0;
 if ($117) {
  _abort();
 }
 $118 = $115 & 2;
 $119 = ($118 | 0) == 0;
 if ($119) {
  $120 = SAFE_HEAP_LOAD(680 | 0, 4, 0) | 0 | 0;
  $121 = ($10 | 0) == ($120 | 0);
  $122 = SAFE_HEAP_LOAD(676 | 0, 4, 0) | 0 | 0;
  if ($121) {
   $123 = SAFE_HEAP_LOAD(668 | 0, 4, 0) | 0 | 0;
   $124 = $123 + $$1382 | 0;
   SAFE_HEAP_STORE(668 | 0, $124 | 0, 4);
   SAFE_HEAP_STORE(680 | 0, $$1 | 0, 4);
   $125 = $124 | 1;
   $126 = $$1 + 4 | 0;
   SAFE_HEAP_STORE($126 | 0, $125 | 0, 4);
   $127 = ($$1 | 0) == ($122 | 0);
   if (!$127) {
    return;
   }
   SAFE_HEAP_STORE(676 | 0, 0 | 0, 4);
   SAFE_HEAP_STORE(664 | 0, 0 | 0, 4);
   return;
  }
  $128 = ($10 | 0) == ($122 | 0);
  if ($128) {
   $129 = SAFE_HEAP_LOAD(664 | 0, 4, 0) | 0 | 0;
   $130 = $129 + $$1382 | 0;
   SAFE_HEAP_STORE(664 | 0, $130 | 0, 4);
   SAFE_HEAP_STORE(676 | 0, $113 | 0, 4);
   $131 = $130 | 1;
   $132 = $$1 + 4 | 0;
   SAFE_HEAP_STORE($132 | 0, $131 | 0, 4);
   $133 = $113 + $130 | 0;
   SAFE_HEAP_STORE($133 | 0, $130 | 0, 4);
   return;
  }
  $134 = $115 & -8;
  $135 = $134 + $$1382 | 0;
  $136 = $115 >>> 3;
  $137 = $115 >>> 0 < 256;
  L108 : do {
   if ($137) {
    $138 = $10 + 8 | 0;
    $139 = SAFE_HEAP_LOAD($138 | 0, 4, 0) | 0 | 0;
    $140 = $10 + 12 | 0;
    $141 = SAFE_HEAP_LOAD($140 | 0, 4, 0) | 0 | 0;
    $142 = $136 << 1;
    $143 = 696 + ($142 << 2) | 0;
    $144 = ($139 | 0) == ($143 | 0);
    if (!$144) {
     $145 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
     $146 = $139 >>> 0 < $145 >>> 0;
     if ($146) {
      _abort();
     }
     $147 = $139 + 12 | 0;
     $148 = SAFE_HEAP_LOAD($147 | 0, 4, 0) | 0 | 0;
     $149 = ($148 | 0) == ($10 | 0);
     if (!$149) {
      _abort();
     }
    }
    $150 = ($141 | 0) == ($139 | 0);
    if ($150) {
     $151 = 1 << $136;
     $152 = $151 ^ -1;
     $153 = SAFE_HEAP_LOAD(164 * 4 | 0, 4, 0) | 0 | 0;
     $154 = $153 & $152;
     SAFE_HEAP_STORE(164 * 4 | 0, $154 | 0, 4);
     break;
    }
    $155 = ($141 | 0) == ($143 | 0);
    if ($155) {
     $$pre442 = $141 + 8 | 0;
     $$pre$phi443Z2D = $$pre442;
    } else {
     $156 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
     $157 = $141 >>> 0 < $156 >>> 0;
     if ($157) {
      _abort();
     }
     $158 = $141 + 8 | 0;
     $159 = SAFE_HEAP_LOAD($158 | 0, 4, 0) | 0 | 0;
     $160 = ($159 | 0) == ($10 | 0);
     if ($160) {
      $$pre$phi443Z2D = $158;
     } else {
      _abort();
     }
    }
    $161 = $139 + 12 | 0;
    SAFE_HEAP_STORE($161 | 0, $141 | 0, 4);
    SAFE_HEAP_STORE($$pre$phi443Z2D | 0, $139 | 0, 4);
   } else {
    $162 = $10 + 24 | 0;
    $163 = SAFE_HEAP_LOAD($162 | 0, 4, 0) | 0 | 0;
    $164 = $10 + 12 | 0;
    $165 = SAFE_HEAP_LOAD($164 | 0, 4, 0) | 0 | 0;
    $166 = ($165 | 0) == ($10 | 0);
    do {
     if ($166) {
      $177 = $10 + 16 | 0;
      $178 = $177 + 4 | 0;
      $179 = SAFE_HEAP_LOAD($178 | 0, 4, 0) | 0 | 0;
      $180 = ($179 | 0) == (0 | 0);
      if ($180) {
       $181 = SAFE_HEAP_LOAD($177 | 0, 4, 0) | 0 | 0;
       $182 = ($181 | 0) == (0 | 0);
       if ($182) {
        $$3400 = 0;
        break;
       } else {
        $$1398 = $181;
        $$1402 = $177;
       }
      } else {
       $$1398 = $179;
       $$1402 = $178;
      }
      while (1) {
       $183 = $$1398 + 20 | 0;
       $184 = SAFE_HEAP_LOAD($183 | 0, 4, 0) | 0 | 0;
       $185 = ($184 | 0) == (0 | 0);
       if (!$185) {
        $$1398 = $184;
        $$1402 = $183;
        continue;
       }
       $186 = $$1398 + 16 | 0;
       $187 = SAFE_HEAP_LOAD($186 | 0, 4, 0) | 0 | 0;
       $188 = ($187 | 0) == (0 | 0);
       if ($188) {
        break;
       } else {
        $$1398 = $187;
        $$1402 = $186;
       }
      }
      $189 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
      $190 = $$1402 >>> 0 < $189 >>> 0;
      if ($190) {
       _abort();
      } else {
       SAFE_HEAP_STORE($$1402 | 0, 0 | 0, 4);
       $$3400 = $$1398;
       break;
      }
     } else {
      $167 = $10 + 8 | 0;
      $168 = SAFE_HEAP_LOAD($167 | 0, 4, 0) | 0 | 0;
      $169 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
      $170 = $168 >>> 0 < $169 >>> 0;
      if ($170) {
       _abort();
      }
      $171 = $168 + 12 | 0;
      $172 = SAFE_HEAP_LOAD($171 | 0, 4, 0) | 0 | 0;
      $173 = ($172 | 0) == ($10 | 0);
      if (!$173) {
       _abort();
      }
      $174 = $165 + 8 | 0;
      $175 = SAFE_HEAP_LOAD($174 | 0, 4, 0) | 0 | 0;
      $176 = ($175 | 0) == ($10 | 0);
      if ($176) {
       SAFE_HEAP_STORE($171 | 0, $165 | 0, 4);
       SAFE_HEAP_STORE($174 | 0, $168 | 0, 4);
       $$3400 = $165;
       break;
      } else {
       _abort();
      }
     }
    } while (0);
    $191 = ($163 | 0) == (0 | 0);
    if (!$191) {
     $192 = $10 + 28 | 0;
     $193 = SAFE_HEAP_LOAD($192 | 0, 4, 0) | 0 | 0;
     $194 = 960 + ($193 << 2) | 0;
     $195 = SAFE_HEAP_LOAD($194 | 0, 4, 0) | 0 | 0;
     $196 = ($10 | 0) == ($195 | 0);
     do {
      if ($196) {
       SAFE_HEAP_STORE($194 | 0, $$3400 | 0, 4);
       $cond422 = ($$3400 | 0) == (0 | 0);
       if ($cond422) {
        $197 = 1 << $193;
        $198 = $197 ^ -1;
        $199 = SAFE_HEAP_LOAD(660 | 0, 4, 0) | 0 | 0;
        $200 = $199 & $198;
        SAFE_HEAP_STORE(660 | 0, $200 | 0, 4);
        break L108;
       }
      } else {
       $201 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
       $202 = $163 >>> 0 < $201 >>> 0;
       if ($202) {
        _abort();
       } else {
        $203 = $163 + 16 | 0;
        $204 = SAFE_HEAP_LOAD($203 | 0, 4, 0) | 0 | 0;
        $not$ = ($204 | 0) != ($10 | 0);
        $$sink5 = $not$ & 1;
        $205 = ($163 + 16 | 0) + ($$sink5 << 2) | 0;
        SAFE_HEAP_STORE($205 | 0, $$3400 | 0, 4);
        $206 = ($$3400 | 0) == (0 | 0);
        if ($206) {
         break L108;
        } else {
         break;
        }
       }
      }
     } while (0);
     $207 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
     $208 = $$3400 >>> 0 < $207 >>> 0;
     if ($208) {
      _abort();
     }
     $209 = $$3400 + 24 | 0;
     SAFE_HEAP_STORE($209 | 0, $163 | 0, 4);
     $210 = $10 + 16 | 0;
     $211 = SAFE_HEAP_LOAD($210 | 0, 4, 0) | 0 | 0;
     $212 = ($211 | 0) == (0 | 0);
     do {
      if (!$212) {
       $213 = $211 >>> 0 < $207 >>> 0;
       if ($213) {
        _abort();
       } else {
        $214 = $$3400 + 16 | 0;
        SAFE_HEAP_STORE($214 | 0, $211 | 0, 4);
        $215 = $211 + 24 | 0;
        SAFE_HEAP_STORE($215 | 0, $$3400 | 0, 4);
        break;
       }
      }
     } while (0);
     $216 = $210 + 4 | 0;
     $217 = SAFE_HEAP_LOAD($216 | 0, 4, 0) | 0 | 0;
     $218 = ($217 | 0) == (0 | 0);
     if (!$218) {
      $219 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
      $220 = $217 >>> 0 < $219 >>> 0;
      if ($220) {
       _abort();
      } else {
       $221 = $$3400 + 20 | 0;
       SAFE_HEAP_STORE($221 | 0, $217 | 0, 4);
       $222 = $217 + 24 | 0;
       SAFE_HEAP_STORE($222 | 0, $$3400 | 0, 4);
       break;
      }
     }
    }
   }
  } while (0);
  $223 = $135 | 1;
  $224 = $$1 + 4 | 0;
  SAFE_HEAP_STORE($224 | 0, $223 | 0, 4);
  $225 = $113 + $135 | 0;
  SAFE_HEAP_STORE($225 | 0, $135 | 0, 4);
  $226 = SAFE_HEAP_LOAD(676 | 0, 4, 0) | 0 | 0;
  $227 = ($$1 | 0) == ($226 | 0);
  if ($227) {
   SAFE_HEAP_STORE(664 | 0, $135 | 0, 4);
   return;
  } else {
   $$2 = $135;
  }
 } else {
  $228 = $115 & -2;
  SAFE_HEAP_STORE($114 | 0, $228 | 0, 4);
  $229 = $$1382 | 1;
  $230 = $$1 + 4 | 0;
  SAFE_HEAP_STORE($230 | 0, $229 | 0, 4);
  $231 = $113 + $$1382 | 0;
  SAFE_HEAP_STORE($231 | 0, $$1382 | 0, 4);
  $$2 = $$1382;
 }
 $232 = $$2 >>> 3;
 $233 = $$2 >>> 0 < 256;
 if ($233) {
  $234 = $232 << 1;
  $235 = 696 + ($234 << 2) | 0;
  $236 = SAFE_HEAP_LOAD(164 * 4 | 0, 4, 0) | 0 | 0;
  $237 = 1 << $232;
  $238 = $236 & $237;
  $239 = ($238 | 0) == 0;
  if ($239) {
   $240 = $236 | $237;
   SAFE_HEAP_STORE(164 * 4 | 0, $240 | 0, 4);
   $$pre = $235 + 8 | 0;
   $$0403 = $235;
   $$pre$phiZ2D = $$pre;
  } else {
   $241 = $235 + 8 | 0;
   $242 = SAFE_HEAP_LOAD($241 | 0, 4, 0) | 0 | 0;
   $243 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
   $244 = $242 >>> 0 < $243 >>> 0;
   if ($244) {
    _abort();
   } else {
    $$0403 = $242;
    $$pre$phiZ2D = $241;
   }
  }
  SAFE_HEAP_STORE($$pre$phiZ2D | 0, $$1 | 0, 4);
  $245 = $$0403 + 12 | 0;
  SAFE_HEAP_STORE($245 | 0, $$1 | 0, 4);
  $246 = $$1 + 8 | 0;
  SAFE_HEAP_STORE($246 | 0, $$0403 | 0, 4);
  $247 = $$1 + 12 | 0;
  SAFE_HEAP_STORE($247 | 0, $235 | 0, 4);
  return;
 }
 $248 = $$2 >>> 8;
 $249 = ($248 | 0) == 0;
 if ($249) {
  $$0396 = 0;
 } else {
  $250 = $$2 >>> 0 > 16777215;
  if ($250) {
   $$0396 = 31;
  } else {
   $251 = $248 + 1048320 | 0;
   $252 = $251 >>> 16;
   $253 = $252 & 8;
   $254 = $248 << $253;
   $255 = $254 + 520192 | 0;
   $256 = $255 >>> 16;
   $257 = $256 & 4;
   $258 = $257 | $253;
   $259 = $254 << $257;
   $260 = $259 + 245760 | 0;
   $261 = $260 >>> 16;
   $262 = $261 & 2;
   $263 = $258 | $262;
   $264 = 14 - $263 | 0;
   $265 = $259 << $262;
   $266 = $265 >>> 15;
   $267 = $264 + $266 | 0;
   $268 = $267 << 1;
   $269 = $267 + 7 | 0;
   $270 = $$2 >>> $269;
   $271 = $270 & 1;
   $272 = $271 | $268;
   $$0396 = $272;
  }
 }
 $273 = 960 + ($$0396 << 2) | 0;
 $274 = $$1 + 28 | 0;
 SAFE_HEAP_STORE($274 | 0, $$0396 | 0, 4);
 $275 = $$1 + 16 | 0;
 $276 = $$1 + 20 | 0;
 SAFE_HEAP_STORE($276 | 0, 0 | 0, 4);
 SAFE_HEAP_STORE($275 | 0, 0 | 0, 4);
 $277 = SAFE_HEAP_LOAD(660 | 0, 4, 0) | 0 | 0;
 $278 = 1 << $$0396;
 $279 = $277 & $278;
 $280 = ($279 | 0) == 0;
 do {
  if ($280) {
   $281 = $277 | $278;
   SAFE_HEAP_STORE(660 | 0, $281 | 0, 4);
   SAFE_HEAP_STORE($273 | 0, $$1 | 0, 4);
   $282 = $$1 + 24 | 0;
   SAFE_HEAP_STORE($282 | 0, $273 | 0, 4);
   $283 = $$1 + 12 | 0;
   SAFE_HEAP_STORE($283 | 0, $$1 | 0, 4);
   $284 = $$1 + 8 | 0;
   SAFE_HEAP_STORE($284 | 0, $$1 | 0, 4);
  } else {
   $285 = SAFE_HEAP_LOAD($273 | 0, 4, 0) | 0 | 0;
   $286 = ($$0396 | 0) == 31;
   $287 = $$0396 >>> 1;
   $288 = 25 - $287 | 0;
   $289 = $286 ? 0 : $288;
   $290 = $$2 << $289;
   $$0383 = $290;
   $$0384 = $285;
   while (1) {
    $291 = $$0384 + 4 | 0;
    $292 = SAFE_HEAP_LOAD($291 | 0, 4, 0) | 0 | 0;
    $293 = $292 & -8;
    $294 = ($293 | 0) == ($$2 | 0);
    if ($294) {
     label = 124;
     break;
    }
    $295 = $$0383 >>> 31;
    $296 = ($$0384 + 16 | 0) + ($295 << 2) | 0;
    $297 = $$0383 << 1;
    $298 = SAFE_HEAP_LOAD($296 | 0, 4, 0) | 0 | 0;
    $299 = ($298 | 0) == (0 | 0);
    if ($299) {
     label = 121;
     break;
    } else {
     $$0383 = $297;
     $$0384 = $298;
    }
   }
   if ((label | 0) == 121) {
    $300 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
    $301 = $296 >>> 0 < $300 >>> 0;
    if ($301) {
     _abort();
    } else {
     SAFE_HEAP_STORE($296 | 0, $$1 | 0, 4);
     $302 = $$1 + 24 | 0;
     SAFE_HEAP_STORE($302 | 0, $$0384 | 0, 4);
     $303 = $$1 + 12 | 0;
     SAFE_HEAP_STORE($303 | 0, $$1 | 0, 4);
     $304 = $$1 + 8 | 0;
     SAFE_HEAP_STORE($304 | 0, $$1 | 0, 4);
     break;
    }
   } else if ((label | 0) == 124) {
    $305 = $$0384 + 8 | 0;
    $306 = SAFE_HEAP_LOAD($305 | 0, 4, 0) | 0 | 0;
    $307 = SAFE_HEAP_LOAD(672 | 0, 4, 0) | 0 | 0;
    $308 = $306 >>> 0 >= $307 >>> 0;
    $not$437 = $$0384 >>> 0 >= $307 >>> 0;
    $309 = $308 & $not$437;
    if ($309) {
     $310 = $306 + 12 | 0;
     SAFE_HEAP_STORE($310 | 0, $$1 | 0, 4);
     SAFE_HEAP_STORE($305 | 0, $$1 | 0, 4);
     $311 = $$1 + 8 | 0;
     SAFE_HEAP_STORE($311 | 0, $306 | 0, 4);
     $312 = $$1 + 12 | 0;
     SAFE_HEAP_STORE($312 | 0, $$0384 | 0, 4);
     $313 = $$1 + 24 | 0;
     SAFE_HEAP_STORE($313 | 0, 0 | 0, 4);
     break;
    } else {
     _abort();
    }
   }
  }
 } while (0);
 $314 = SAFE_HEAP_LOAD(688 | 0, 4, 0) | 0 | 0;
 $315 = $314 + -1 | 0;
 SAFE_HEAP_STORE(688 | 0, $315 | 0, 4);
 $316 = ($315 | 0) == 0;
 if ($316) {
  $$0212$in$i = 1112;
 } else {
  return;
 }
 while (1) {
  $$0212$i = SAFE_HEAP_LOAD($$0212$in$i | 0, 4, 0) | 0 | 0;
  $317 = ($$0212$i | 0) == (0 | 0);
  $318 = $$0212$i + 8 | 0;
  if ($317) {
   break;
  } else {
   $$0212$in$i = $318;
  }
 }
 SAFE_HEAP_STORE(688 | 0, -1 | 0, 4);
 return;
}

function __ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($0, $1, $2, $3, $4) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 $4 = $4 | 0;
 var $$037$off038 = 0, $$037$off039 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $5 = 0, $6 = 0, $7 = 0;
 var $8 = 0, $9 = 0, $not$ = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $5 = $1 + 8 | 0;
 $6 = SAFE_HEAP_LOAD($5 | 0, 4, 0) | 0 | 0;
 $7 = __ZN10__cxxabiv18is_equalEPKSt9type_infoS2_b($0, $6, $4) | 0;
 do {
  if ($7) {
   __ZNK10__cxxabiv117__class_type_info29process_static_type_below_dstEPNS_19__dynamic_cast_infoEPKvi(0, $1, $2, $3);
  } else {
   $8 = SAFE_HEAP_LOAD($1 | 0, 4, 0) | 0 | 0;
   $9 = __ZN10__cxxabiv18is_equalEPKSt9type_infoS2_b($0, $8, $4) | 0;
   $10 = $0 + 8 | 0;
   if (!$9) {
    $41 = SAFE_HEAP_LOAD($10 | 0, 4, 0) | 0 | 0;
    $42 = SAFE_HEAP_LOAD($41 | 0, 4, 0) | 0 | 0;
    $43 = $42 + 24 | 0;
    $44 = SAFE_HEAP_LOAD($43 | 0, 4, 0) | 0 | 0;
    FUNCTION_TABLE_viiiii[(SAFE_FT_MASK($44 | 0, 15 | 0) | 0) & 15]($41, $1, $2, $3, $4);
    break;
   }
   $11 = $1 + 16 | 0;
   $12 = SAFE_HEAP_LOAD($11 | 0, 4, 0) | 0 | 0;
   $13 = ($12 | 0) == ($2 | 0);
   $14 = $1 + 32 | 0;
   if (!$13) {
    $15 = $1 + 20 | 0;
    $16 = SAFE_HEAP_LOAD($15 | 0, 4, 0) | 0 | 0;
    $17 = ($16 | 0) == ($2 | 0);
    if (!$17) {
     SAFE_HEAP_STORE($14 | 0, $3 | 0, 4);
     $19 = $1 + 44 | 0;
     $20 = SAFE_HEAP_LOAD($19 | 0, 4, 0) | 0 | 0;
     $21 = ($20 | 0) == 4;
     if ($21) {
      break;
     }
     $22 = $1 + 52 | 0;
     SAFE_HEAP_STORE($22 >> 0 | 0, 0 | 0, 1);
     $23 = $1 + 53 | 0;
     SAFE_HEAP_STORE($23 >> 0 | 0, 0 | 0, 1);
     $24 = SAFE_HEAP_LOAD($10 | 0, 4, 0) | 0 | 0;
     $25 = SAFE_HEAP_LOAD($24 | 0, 4, 0) | 0 | 0;
     $26 = $25 + 20 | 0;
     $27 = SAFE_HEAP_LOAD($26 | 0, 4, 0) | 0 | 0;
     FUNCTION_TABLE_viiiiii[(SAFE_FT_MASK($27 | 0, 15 | 0) | 0) & 15]($24, $1, $2, $2, 1, $4);
     $28 = SAFE_HEAP_LOAD($23 >> 0 | 0, 1, 0) | 0 | 0;
     $29 = $28 << 24 >> 24 == 0;
     if ($29) {
      $$037$off038 = 4;
      label = 11;
     } else {
      $30 = SAFE_HEAP_LOAD($22 >> 0 | 0, 1, 0) | 0 | 0;
      $not$ = $30 << 24 >> 24 == 0;
      if ($not$) {
       $$037$off038 = 3;
       label = 11;
      } else {
       $$037$off039 = 3;
      }
     }
     if ((label | 0) == 11) {
      SAFE_HEAP_STORE($15 | 0, $2 | 0, 4);
      $31 = $1 + 40 | 0;
      $32 = SAFE_HEAP_LOAD($31 | 0, 4, 0) | 0 | 0;
      $33 = $32 + 1 | 0;
      SAFE_HEAP_STORE($31 | 0, $33 | 0, 4);
      $34 = $1 + 36 | 0;
      $35 = SAFE_HEAP_LOAD($34 | 0, 4, 0) | 0 | 0;
      $36 = ($35 | 0) == 1;
      if ($36) {
       $37 = $1 + 24 | 0;
       $38 = SAFE_HEAP_LOAD($37 | 0, 4, 0) | 0 | 0;
       $39 = ($38 | 0) == 2;
       if ($39) {
        $40 = $1 + 54 | 0;
        SAFE_HEAP_STORE($40 >> 0 | 0, 1 | 0, 1);
        $$037$off039 = $$037$off038;
       } else {
        $$037$off039 = $$037$off038;
       }
      } else {
       $$037$off039 = $$037$off038;
      }
     }
     SAFE_HEAP_STORE($19 | 0, $$037$off039 | 0, 4);
     break;
    }
   }
   $18 = ($3 | 0) == 1;
   if ($18) {
    SAFE_HEAP_STORE($14 | 0, 1 | 0, 4);
   }
  }
 } while (0);
 return;
}

function ___dynamic_cast($0, $1, $2, $3) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 var $$ = 0, $$0 = 0, $$33 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0;
 var $46 = 0, $47 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $or$cond = 0, $or$cond28 = 0, $or$cond30 = 0, $or$cond32 = 0, dest = 0, label = 0, sp = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64 | 0;
 if ((STACKTOP | 0) >= (STACK_MAX | 0)) abortStackOverflow(64 | 0);
 $4 = sp;
 $5 = SAFE_HEAP_LOAD($0 | 0, 4, 0) | 0 | 0;
 $6 = $5 + -8 | 0;
 $7 = SAFE_HEAP_LOAD($6 | 0, 4, 0) | 0 | 0;
 $8 = $0 + $7 | 0;
 $9 = $5 + -4 | 0;
 $10 = SAFE_HEAP_LOAD($9 | 0, 4, 0) | 0 | 0;
 SAFE_HEAP_STORE($4 | 0, $2 | 0, 4);
 $11 = $4 + 4 | 0;
 SAFE_HEAP_STORE($11 | 0, $0 | 0, 4);
 $12 = $4 + 8 | 0;
 SAFE_HEAP_STORE($12 | 0, $1 | 0, 4);
 $13 = $4 + 12 | 0;
 SAFE_HEAP_STORE($13 | 0, $3 | 0, 4);
 $14 = $4 + 16 | 0;
 $15 = $4 + 20 | 0;
 $16 = $4 + 24 | 0;
 $17 = $4 + 28 | 0;
 $18 = $4 + 32 | 0;
 $19 = $4 + 40 | 0;
 dest = $14;
 stop = dest + 36 | 0;
 do {
  SAFE_HEAP_STORE(dest | 0, 0 | 0 | 0, 4);
  dest = dest + 4 | 0;
 } while ((dest | 0) < (stop | 0));
 SAFE_HEAP_STORE($14 + 36 | 0, 0 | 0 | 0, 2);
 SAFE_HEAP_STORE($14 + 38 >> 0 | 0, 0 | 0 | 0, 1);
 $20 = __ZN10__cxxabiv18is_equalEPKSt9type_infoS2_b($10, $2, 0) | 0;
 L1 : do {
  if ($20) {
   $21 = $4 + 48 | 0;
   SAFE_HEAP_STORE($21 | 0, 1 | 0, 4);
   $22 = SAFE_HEAP_LOAD($10 | 0, 4, 0) | 0 | 0;
   $23 = $22 + 20 | 0;
   $24 = SAFE_HEAP_LOAD($23 | 0, 4, 0) | 0 | 0;
   FUNCTION_TABLE_viiiiii[(SAFE_FT_MASK($24 | 0, 15 | 0) | 0) & 15]($10, $4, $8, $8, 1, 0);
   $25 = SAFE_HEAP_LOAD($16 | 0, 4, 0) | 0 | 0;
   $26 = ($25 | 0) == 1;
   $$ = $26 ? $8 : 0;
   $$0 = $$;
  } else {
   $27 = $4 + 36 | 0;
   $28 = SAFE_HEAP_LOAD($10 | 0, 4, 0) | 0 | 0;
   $29 = $28 + 24 | 0;
   $30 = SAFE_HEAP_LOAD($29 | 0, 4, 0) | 0 | 0;
   FUNCTION_TABLE_viiiii[(SAFE_FT_MASK($30 | 0, 15 | 0) | 0) & 15]($10, $4, $8, 1, 0);
   $31 = SAFE_HEAP_LOAD($27 | 0, 4, 0) | 0 | 0;
   switch ($31 | 0) {
   case 0:
    {
     $32 = SAFE_HEAP_LOAD($19 | 0, 4, 0) | 0 | 0;
     $33 = ($32 | 0) == 1;
     $34 = SAFE_HEAP_LOAD($17 | 0, 4, 0) | 0 | 0;
     $35 = ($34 | 0) == 1;
     $or$cond = $33 & $35;
     $36 = SAFE_HEAP_LOAD($18 | 0, 4, 0) | 0 | 0;
     $37 = ($36 | 0) == 1;
     $or$cond28 = $or$cond & $37;
     $38 = SAFE_HEAP_LOAD($15 | 0, 4, 0) | 0 | 0;
     $$33 = $or$cond28 ? $38 : 0;
     $$0 = $$33;
     break L1;
     break;
    }
   case 1:
    {
     break;
    }
   default:
    {
     $$0 = 0;
     break L1;
    }
   }
   $39 = SAFE_HEAP_LOAD($16 | 0, 4, 0) | 0 | 0;
   $40 = ($39 | 0) == 1;
   if (!$40) {
    $41 = SAFE_HEAP_LOAD($19 | 0, 4, 0) | 0 | 0;
    $42 = ($41 | 0) == 0;
    $43 = SAFE_HEAP_LOAD($17 | 0, 4, 0) | 0 | 0;
    $44 = ($43 | 0) == 1;
    $or$cond30 = $42 & $44;
    $45 = SAFE_HEAP_LOAD($18 | 0, 4, 0) | 0 | 0;
    $46 = ($45 | 0) == 1;
    $or$cond32 = $or$cond30 & $46;
    if (!$or$cond32) {
     $$0 = 0;
     break;
    }
   }
   $47 = SAFE_HEAP_LOAD($14 | 0, 4, 0) | 0 | 0;
   $$0 = $47;
  }
 } while (0);
 STACKTOP = sp;
 return $$0 | 0;
}

function _memcpy(dest, src, num) {
 dest = dest | 0;
 src = src | 0;
 num = num | 0;
 var ret = 0;
 var aligned_dest_end = 0;
 var block_aligned_dest_end = 0;
 var dest_end = 0;
 if ((num | 0) >= 8192) {
  return _emscripten_memcpy_big(dest | 0, src | 0, num | 0) | 0;
 }
 ret = dest | 0;
 dest_end = dest + num | 0;
 if ((dest & 3) == (src & 3)) {
  while (dest & 3) {
   if ((num | 0) == 0) return ret | 0;
   SAFE_HEAP_STORE(dest | 0, SAFE_HEAP_LOAD(src | 0, 1, 0) | 0 | 0, 1);
   dest = dest + 1 | 0;
   src = src + 1 | 0;
   num = num - 1 | 0;
  }
  aligned_dest_end = dest_end & -4 | 0;
  block_aligned_dest_end = aligned_dest_end - 64 | 0;
  while ((dest | 0) <= (block_aligned_dest_end | 0)) {
   SAFE_HEAP_STORE(dest | 0, SAFE_HEAP_LOAD(src | 0, 4, 0) | 0 | 0, 4);
   SAFE_HEAP_STORE(dest + 4 | 0, SAFE_HEAP_LOAD(src + 4 | 0, 4, 0) | 0 | 0, 4);
   SAFE_HEAP_STORE(dest + 8 | 0, SAFE_HEAP_LOAD(src + 8 | 0, 4, 0) | 0 | 0, 4);
   SAFE_HEAP_STORE(dest + 12 | 0, SAFE_HEAP_LOAD(src + 12 | 0, 4, 0) | 0 | 0, 4);
   SAFE_HEAP_STORE(dest + 16 | 0, SAFE_HEAP_LOAD(src + 16 | 0, 4, 0) | 0 | 0, 4);
   SAFE_HEAP_STORE(dest + 20 | 0, SAFE_HEAP_LOAD(src + 20 | 0, 4, 0) | 0 | 0, 4);
   SAFE_HEAP_STORE(dest + 24 | 0, SAFE_HEAP_LOAD(src + 24 | 0, 4, 0) | 0 | 0, 4);
   SAFE_HEAP_STORE(dest + 28 | 0, SAFE_HEAP_LOAD(src + 28 | 0, 4, 0) | 0 | 0, 4);
   SAFE_HEAP_STORE(dest + 32 | 0, SAFE_HEAP_LOAD(src + 32 | 0, 4, 0) | 0 | 0, 4);
   SAFE_HEAP_STORE(dest + 36 | 0, SAFE_HEAP_LOAD(src + 36 | 0, 4, 0) | 0 | 0, 4);
   SAFE_HEAP_STORE(dest + 40 | 0, SAFE_HEAP_LOAD(src + 40 | 0, 4, 0) | 0 | 0, 4);
   SAFE_HEAP_STORE(dest + 44 | 0, SAFE_HEAP_LOAD(src + 44 | 0, 4, 0) | 0 | 0, 4);
   SAFE_HEAP_STORE(dest + 48 | 0, SAFE_HEAP_LOAD(src + 48 | 0, 4, 0) | 0 | 0, 4);
   SAFE_HEAP_STORE(dest + 52 | 0, SAFE_HEAP_LOAD(src + 52 | 0, 4, 0) | 0 | 0, 4);
   SAFE_HEAP_STORE(dest + 56 | 0, SAFE_HEAP_LOAD(src + 56 | 0, 4, 0) | 0 | 0, 4);
   SAFE_HEAP_STORE(dest + 60 | 0, SAFE_HEAP_LOAD(src + 60 | 0, 4, 0) | 0 | 0, 4);
   dest = dest + 64 | 0;
   src = src + 64 | 0;
  }
  while ((dest | 0) < (aligned_dest_end | 0)) {
   SAFE_HEAP_STORE(dest | 0, SAFE_HEAP_LOAD(src | 0, 4, 0) | 0 | 0, 4);
   dest = dest + 4 | 0;
   src = src + 4 | 0;
  }
 } else {
  aligned_dest_end = dest_end - 4 | 0;
  while ((dest | 0) < (aligned_dest_end | 0)) {
   SAFE_HEAP_STORE(dest | 0, SAFE_HEAP_LOAD(src | 0, 1, 0) | 0 | 0, 1);
   SAFE_HEAP_STORE(dest + 1 | 0, SAFE_HEAP_LOAD(src + 1 | 0, 1, 0) | 0 | 0, 1);
   SAFE_HEAP_STORE(dest + 2 | 0, SAFE_HEAP_LOAD(src + 2 | 0, 1, 0) | 0 | 0, 1);
   SAFE_HEAP_STORE(dest + 3 | 0, SAFE_HEAP_LOAD(src + 3 | 0, 1, 0) | 0 | 0, 1);
   dest = dest + 4 | 0;
   src = src + 4 | 0;
  }
 }
 while ((dest | 0) < (dest_end | 0)) {
  SAFE_HEAP_STORE(dest | 0, SAFE_HEAP_LOAD(src | 0, 1, 0) | 0 | 0, 1);
  dest = dest + 1 | 0;
  src = src + 1 | 0;
 }
 return ret | 0;
}

function __ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($0, $1, $2, $3, $4) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 $4 = $4 | 0;
 var $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $5 = 0;
 var $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $5 = $1 + 8 | 0;
 $6 = SAFE_HEAP_LOAD($5 | 0, 4, 0) | 0 | 0;
 $7 = __ZN10__cxxabiv18is_equalEPKSt9type_infoS2_b($0, $6, $4) | 0;
 do {
  if ($7) {
   __ZNK10__cxxabiv117__class_type_info29process_static_type_below_dstEPNS_19__dynamic_cast_infoEPKvi(0, $1, $2, $3);
  } else {
   $8 = SAFE_HEAP_LOAD($1 | 0, 4, 0) | 0 | 0;
   $9 = __ZN10__cxxabiv18is_equalEPKSt9type_infoS2_b($0, $8, $4) | 0;
   if ($9) {
    $10 = $1 + 16 | 0;
    $11 = SAFE_HEAP_LOAD($10 | 0, 4, 0) | 0 | 0;
    $12 = ($11 | 0) == ($2 | 0);
    $13 = $1 + 32 | 0;
    if (!$12) {
     $14 = $1 + 20 | 0;
     $15 = SAFE_HEAP_LOAD($14 | 0, 4, 0) | 0 | 0;
     $16 = ($15 | 0) == ($2 | 0);
     if (!$16) {
      SAFE_HEAP_STORE($13 | 0, $3 | 0, 4);
      SAFE_HEAP_STORE($14 | 0, $2 | 0, 4);
      $18 = $1 + 40 | 0;
      $19 = SAFE_HEAP_LOAD($18 | 0, 4, 0) | 0 | 0;
      $20 = $19 + 1 | 0;
      SAFE_HEAP_STORE($18 | 0, $20 | 0, 4);
      $21 = $1 + 36 | 0;
      $22 = SAFE_HEAP_LOAD($21 | 0, 4, 0) | 0 | 0;
      $23 = ($22 | 0) == 1;
      if ($23) {
       $24 = $1 + 24 | 0;
       $25 = SAFE_HEAP_LOAD($24 | 0, 4, 0) | 0 | 0;
       $26 = ($25 | 0) == 2;
       if ($26) {
        $27 = $1 + 54 | 0;
        SAFE_HEAP_STORE($27 >> 0 | 0, 1 | 0, 1);
       }
      }
      $28 = $1 + 44 | 0;
      SAFE_HEAP_STORE($28 | 0, 4 | 0, 4);
      break;
     }
    }
    $17 = ($3 | 0) == 1;
    if ($17) {
     SAFE_HEAP_STORE($13 | 0, 1 | 0, 4);
    }
   }
  }
 } while (0);
 return;
}

function __ZNK10__cxxabiv117__class_type_info29process_static_type_above_dstEPNS_19__dynamic_cast_infoEPKvS4_i($0, $1, $2, $3, $4) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 $4 = $4 | 0;
 var $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $5 = 0;
 var $6 = 0, $7 = 0, $8 = 0, $9 = 0, $or$cond = 0, $or$cond22 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $5 = $1 + 53 | 0;
 SAFE_HEAP_STORE($5 >> 0 | 0, 1 | 0, 1);
 $6 = $1 + 4 | 0;
 $7 = SAFE_HEAP_LOAD($6 | 0, 4, 0) | 0 | 0;
 $8 = ($7 | 0) == ($3 | 0);
 do {
  if ($8) {
   $9 = $1 + 52 | 0;
   SAFE_HEAP_STORE($9 >> 0 | 0, 1 | 0, 1);
   $10 = $1 + 16 | 0;
   $11 = SAFE_HEAP_LOAD($10 | 0, 4, 0) | 0 | 0;
   $12 = ($11 | 0) == (0 | 0);
   $13 = $1 + 54 | 0;
   $14 = $1 + 48 | 0;
   $15 = $1 + 24 | 0;
   $16 = $1 + 36 | 0;
   if ($12) {
    SAFE_HEAP_STORE($10 | 0, $2 | 0, 4);
    SAFE_HEAP_STORE($15 | 0, $4 | 0, 4);
    SAFE_HEAP_STORE($16 | 0, 1 | 0, 4);
    $17 = SAFE_HEAP_LOAD($14 | 0, 4, 0) | 0 | 0;
    $18 = ($17 | 0) == 1;
    $19 = ($4 | 0) == 1;
    $or$cond = $18 & $19;
    if (!$or$cond) {
     break;
    }
    SAFE_HEAP_STORE($13 >> 0 | 0, 1 | 0, 1);
    break;
   }
   $20 = ($11 | 0) == ($2 | 0);
   if (!$20) {
    $27 = SAFE_HEAP_LOAD($16 | 0, 4, 0) | 0 | 0;
    $28 = $27 + 1 | 0;
    SAFE_HEAP_STORE($16 | 0, $28 | 0, 4);
    SAFE_HEAP_STORE($13 >> 0 | 0, 1 | 0, 1);
    break;
   }
   $21 = SAFE_HEAP_LOAD($15 | 0, 4, 0) | 0 | 0;
   $22 = ($21 | 0) == 2;
   if ($22) {
    SAFE_HEAP_STORE($15 | 0, $4 | 0, 4);
    $26 = $4;
   } else {
    $26 = $21;
   }
   $23 = SAFE_HEAP_LOAD($14 | 0, 4, 0) | 0 | 0;
   $24 = ($23 | 0) == 1;
   $25 = ($26 | 0) == 1;
   $or$cond22 = $24 & $25;
   if ($or$cond22) {
    SAFE_HEAP_STORE($13 >> 0 | 0, 1 | 0, 1);
   }
  }
 } while (0);
 return;
}

function __ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv($0, $1, $2) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 var $$0 = 0, $$2 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
 var dest = 0, label = 0, sp = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64 | 0;
 if ((STACKTOP | 0) >= (STACK_MAX | 0)) abortStackOverflow(64 | 0);
 $3 = sp;
 $4 = __ZN10__cxxabiv18is_equalEPKSt9type_infoS2_b($0, $1, 0) | 0;
 if ($4) {
  $$2 = 1;
 } else {
  $5 = ($1 | 0) == (0 | 0);
  if ($5) {
   $$2 = 0;
  } else {
   $6 = ___dynamic_cast($1, 24, 8, 0) | 0;
   $7 = ($6 | 0) == (0 | 0);
   if ($7) {
    $$2 = 0;
   } else {
    $8 = $3 + 4 | 0;
    dest = $8;
    stop = dest + 52 | 0;
    do {
     SAFE_HEAP_STORE(dest | 0, 0 | 0 | 0, 4);
     dest = dest + 4 | 0;
    } while ((dest | 0) < (stop | 0));
    SAFE_HEAP_STORE($3 | 0, $6 | 0, 4);
    $9 = $3 + 8 | 0;
    SAFE_HEAP_STORE($9 | 0, $0 | 0, 4);
    $10 = $3 + 12 | 0;
    SAFE_HEAP_STORE($10 | 0, -1 | 0, 4);
    $11 = $3 + 48 | 0;
    SAFE_HEAP_STORE($11 | 0, 1 | 0, 4);
    $12 = SAFE_HEAP_LOAD($6 | 0, 4, 0) | 0 | 0;
    $13 = $12 + 28 | 0;
    $14 = SAFE_HEAP_LOAD($13 | 0, 4, 0) | 0 | 0;
    $15 = SAFE_HEAP_LOAD($2 | 0, 4, 0) | 0 | 0;
    FUNCTION_TABLE_viiii[(SAFE_FT_MASK($14 | 0, 15 | 0) | 0) & 15]($6, $3, $15, 1);
    $16 = $3 + 24 | 0;
    $17 = SAFE_HEAP_LOAD($16 | 0, 4, 0) | 0 | 0;
    $18 = ($17 | 0) == 1;
    if ($18) {
     $19 = $3 + 16 | 0;
     $20 = SAFE_HEAP_LOAD($19 | 0, 4, 0) | 0 | 0;
     SAFE_HEAP_STORE($2 | 0, $20 | 0, 4);
     $$0 = 1;
    } else {
     $$0 = 0;
    }
    $$2 = $$0;
   }
  }
 }
 STACKTOP = sp;
 return $$2 | 0;
}

function _memset(ptr, value, num) {
 ptr = ptr | 0;
 value = value | 0;
 num = num | 0;
 var end = 0, aligned_end = 0, block_aligned_end = 0, value4 = 0;
 end = ptr + num | 0;
 value = value & 255;
 if ((num | 0) >= 67) {
  while ((ptr & 3) != 0) {
   SAFE_HEAP_STORE(ptr | 0, value | 0, 1);
   ptr = ptr + 1 | 0;
  }
  aligned_end = end & -4 | 0;
  block_aligned_end = aligned_end - 64 | 0;
  value4 = value | value << 8 | value << 16 | value << 24;
  while ((ptr | 0) <= (block_aligned_end | 0)) {
   SAFE_HEAP_STORE(ptr | 0, value4 | 0, 4);
   SAFE_HEAP_STORE(ptr + 4 | 0, value4 | 0, 4);
   SAFE_HEAP_STORE(ptr + 8 | 0, value4 | 0, 4);
   SAFE_HEAP_STORE(ptr + 12 | 0, value4 | 0, 4);
   SAFE_HEAP_STORE(ptr + 16 | 0, value4 | 0, 4);
   SAFE_HEAP_STORE(ptr + 20 | 0, value4 | 0, 4);
   SAFE_HEAP_STORE(ptr + 24 | 0, value4 | 0, 4);
   SAFE_HEAP_STORE(ptr + 28 | 0, value4 | 0, 4);
   SAFE_HEAP_STORE(ptr + 32 | 0, value4 | 0, 4);
   SAFE_HEAP_STORE(ptr + 36 | 0, value4 | 0, 4);
   SAFE_HEAP_STORE(ptr + 40 | 0, value4 | 0, 4);
   SAFE_HEAP_STORE(ptr + 44 | 0, value4 | 0, 4);
   SAFE_HEAP_STORE(ptr + 48 | 0, value4 | 0, 4);
   SAFE_HEAP_STORE(ptr + 52 | 0, value4 | 0, 4);
   SAFE_HEAP_STORE(ptr + 56 | 0, value4 | 0, 4);
   SAFE_HEAP_STORE(ptr + 60 | 0, value4 | 0, 4);
   ptr = ptr + 64 | 0;
  }
  while ((ptr | 0) < (aligned_end | 0)) {
   SAFE_HEAP_STORE(ptr | 0, value4 | 0, 4);
   ptr = ptr + 4 | 0;
  }
 }
 while ((ptr | 0) < (end | 0)) {
  SAFE_HEAP_STORE(ptr | 0, value | 0, 1);
  ptr = ptr + 1 | 0;
 }
 return end - num | 0;
}

function __ZNK10__cxxabiv117__class_type_info24process_found_base_classEPNS_19__dynamic_cast_infoEPvi($0, $1, $2, $3) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 var $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $4 = $1 + 16 | 0;
 $5 = SAFE_HEAP_LOAD($4 | 0, 4, 0) | 0 | 0;
 $6 = ($5 | 0) == (0 | 0);
 $7 = $1 + 36 | 0;
 $8 = $1 + 24 | 0;
 do {
  if ($6) {
   SAFE_HEAP_STORE($4 | 0, $2 | 0, 4);
   SAFE_HEAP_STORE($8 | 0, $3 | 0, 4);
   SAFE_HEAP_STORE($7 | 0, 1 | 0, 4);
  } else {
   $9 = ($5 | 0) == ($2 | 0);
   if (!$9) {
    $12 = SAFE_HEAP_LOAD($7 | 0, 4, 0) | 0 | 0;
    $13 = $12 + 1 | 0;
    SAFE_HEAP_STORE($7 | 0, $13 | 0, 4);
    SAFE_HEAP_STORE($8 | 0, 2 | 0, 4);
    $14 = $1 + 54 | 0;
    SAFE_HEAP_STORE($14 >> 0 | 0, 1 | 0, 1);
    break;
   }
   $10 = SAFE_HEAP_LOAD($8 | 0, 4, 0) | 0 | 0;
   $11 = ($10 | 0) == 2;
   if ($11) {
    SAFE_HEAP_STORE($8 | 0, $3 | 0, 4);
   }
  }
 } while (0);
 return;
}

function __ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($0, $1, $2, $3, $4, $5) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 $4 = $4 | 0;
 $5 = $5 | 0;
 var $10 = 0, $11 = 0, $12 = 0, $13 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $6 = $1 + 8 | 0;
 $7 = SAFE_HEAP_LOAD($6 | 0, 4, 0) | 0 | 0;
 $8 = __ZN10__cxxabiv18is_equalEPKSt9type_infoS2_b($0, $7, $5) | 0;
 if ($8) {
  __ZNK10__cxxabiv117__class_type_info29process_static_type_above_dstEPNS_19__dynamic_cast_infoEPKvS4_i(0, $1, $2, $3, $4);
 } else {
  $9 = $0 + 8 | 0;
  $10 = SAFE_HEAP_LOAD($9 | 0, 4, 0) | 0 | 0;
  $11 = SAFE_HEAP_LOAD($10 | 0, 4, 0) | 0 | 0;
  $12 = $11 + 20 | 0;
  $13 = SAFE_HEAP_LOAD($12 | 0, 4, 0) | 0 | 0;
  FUNCTION_TABLE_viiiiii[(SAFE_FT_MASK($13 | 0, 15 | 0) | 0) & 15]($10, $1, $2, $3, $4, $5);
 }
 return;
}

function __ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($0, $1, $2, $3) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 var $10 = 0, $11 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $4 = $1 + 8 | 0;
 $5 = SAFE_HEAP_LOAD($4 | 0, 4, 0) | 0 | 0;
 $6 = __ZN10__cxxabiv18is_equalEPKSt9type_infoS2_b($0, $5, 0) | 0;
 if ($6) {
  __ZNK10__cxxabiv117__class_type_info24process_found_base_classEPNS_19__dynamic_cast_infoEPvi(0, $1, $2, $3);
 } else {
  $7 = $0 + 8 | 0;
  $8 = SAFE_HEAP_LOAD($7 | 0, 4, 0) | 0 | 0;
  $9 = SAFE_HEAP_LOAD($8 | 0, 4, 0) | 0 | 0;
  $10 = $9 + 28 | 0;
  $11 = SAFE_HEAP_LOAD($10 | 0, 4, 0) | 0 | 0;
  FUNCTION_TABLE_viiii[(SAFE_FT_MASK($11 | 0, 15 | 0) | 0) & 15]($8, $1, $2, $3);
 }
 return;
}

function runPostSets() {}
function _sbrk(increment) {
 increment = increment | 0;
 var oldDynamicTop = 0;
 var oldDynamicTopOnChange = 0;
 var newDynamicTop = 0;
 var totalMemory = 0;
 increment = increment + 15 & -16 | 0;
 oldDynamicTop = SAFE_HEAP_LOAD(DYNAMICTOP_PTR | 0, 4, 0) | 0 | 0;
 newDynamicTop = oldDynamicTop + increment | 0;
 if ((increment | 0) > 0 & (newDynamicTop | 0) < (oldDynamicTop | 0) | (newDynamicTop | 0) < 0) {
  abortOnCannotGrowMemory() | 0;
  ___setErrNo(12);
  return -1;
 }
 SAFE_HEAP_STORE(DYNAMICTOP_PTR | 0, newDynamicTop | 0, 4);
 totalMemory = getTotalMemory() | 0;
 if ((newDynamicTop | 0) > (totalMemory | 0)) {
  if ((enlargeMemory() | 0) == 0) {
   SAFE_HEAP_STORE(DYNAMICTOP_PTR | 0, oldDynamicTop | 0, 4);
   ___setErrNo(12);
   return -1;
  }
 }
 return oldDynamicTop | 0;
}

function ___cxa_can_catch($0, $1, $2) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 var $10 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16 | 0;
 if ((STACKTOP | 0) >= (STACK_MAX | 0)) abortStackOverflow(16 | 0);
 $3 = sp;
 $4 = SAFE_HEAP_LOAD($2 | 0, 4, 0) | 0 | 0;
 SAFE_HEAP_STORE($3 | 0, $4 | 0, 4);
 $5 = SAFE_HEAP_LOAD($0 | 0, 4, 0) | 0 | 0;
 $6 = $5 + 16 | 0;
 $7 = SAFE_HEAP_LOAD($6 | 0, 4, 0) | 0 | 0;
 $8 = FUNCTION_TABLE_iiii[(SAFE_FT_MASK($7 | 0, 7 | 0) | 0) & 7]($0, $1, $3) | 0;
 $9 = $8 & 1;
 if ($8) {
  $10 = SAFE_HEAP_LOAD($3 | 0, 4, 0) | 0 | 0;
  SAFE_HEAP_STORE($2 | 0, $10 | 0, 4);
 }
 STACKTOP = sp;
 return $9 | 0;
}

function _TestModule__test2($0, $1, $2, $3) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 var $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32 | 0;
 if ((STACKTOP | 0) >= (STACK_MAX | 0)) abortStackOverflow(32 | 0);
 $8 = sp;
 $4 = $0;
 $5 = $1;
 $6 = $2;
 $7 = $3;
 $9 = $4;
 $10 = $5;
 $11 = $6;
 __ZN10TestModule5test2EPviS0_($8, $9, $10, $11);
 $12 = SAFE_HEAP_LOAD($8 | 0, 4, 0) | 0 | 0;
 $13 = $8 + 4 | 0;
 $14 = SAFE_HEAP_LOAD($13 | 0, 4, 0) | 0 | 0;
 _emscripten_worker_respond($12 | 0, $14 | 0);
 STACKTOP = sp;
 return;
}

function _TestModule__test($0, $1, $2, $3) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 var $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32 | 0;
 if ((STACKTOP | 0) >= (STACK_MAX | 0)) abortStackOverflow(32 | 0);
 $8 = sp;
 $4 = $0;
 $5 = $1;
 $6 = $2;
 $7 = $3;
 $9 = $4;
 $10 = $5;
 $11 = $6;
 __ZN10TestModule4testEPviS0_($8, $9, $10, $11);
 $12 = SAFE_HEAP_LOAD($8 | 0, 4, 0) | 0 | 0;
 $13 = $8 + 4 | 0;
 $14 = SAFE_HEAP_LOAD($13 | 0, 4, 0) | 0 | 0;
 _emscripten_worker_respond($12 | 0, $14 | 0);
 STACKTOP = sp;
 return;
}

function __ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($0, $1, $2, $3, $4, $5) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 $4 = $4 | 0;
 $5 = $5 | 0;
 var $6 = 0, $7 = 0, $8 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $6 = $1 + 8 | 0;
 $7 = SAFE_HEAP_LOAD($6 | 0, 4, 0) | 0 | 0;
 $8 = __ZN10__cxxabiv18is_equalEPKSt9type_infoS2_b($0, $7, $5) | 0;
 if ($8) {
  __ZNK10__cxxabiv117__class_type_info29process_static_type_above_dstEPNS_19__dynamic_cast_infoEPKvS4_i(0, $1, $2, $3, $4);
 }
 return;
}

function SAFE_HEAP_LOAD(dest, bytes, unsigned) {
 dest = dest | 0;
 bytes = bytes | 0;
 unsigned = unsigned | 0;
 if ((dest | 0) <= 0) segfault();
 if ((dest + bytes | 0) > (HEAP32[DYNAMICTOP_PTR >> 2] | 0)) segfault();
 if ((bytes | 0) == 4) {
  if (dest & 3) alignfault();
  return HEAP32[dest >> 2] | 0;
 } else if ((bytes | 0) == 1) {
  if (unsigned) {
   return HEAPU8[dest >> 0] | 0;
  } else {
   return HEAP8[dest >> 0] | 0;
  }
 }
 if (dest & 1) alignfault();
 if (unsigned) return HEAPU16[dest >> 1] | 0;
 return HEAP16[dest >> 1] | 0;
}

function __ZNK10__cxxabiv117__class_type_info29process_static_type_below_dstEPNS_19__dynamic_cast_infoEPKvi($0, $1, $2, $3) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 var $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $4 = $1 + 4 | 0;
 $5 = SAFE_HEAP_LOAD($4 | 0, 4, 0) | 0 | 0;
 $6 = ($5 | 0) == ($2 | 0);
 if ($6) {
  $7 = $1 + 28 | 0;
  $8 = SAFE_HEAP_LOAD($7 | 0, 4, 0) | 0 | 0;
  $9 = ($8 | 0) == 1;
  if (!$9) {
   SAFE_HEAP_STORE($7 | 0, $3 | 0, 4);
  }
 }
 return;
}

function __ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($0, $1, $2, $3) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 var $4 = 0, $5 = 0, $6 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $4 = $1 + 8 | 0;
 $5 = SAFE_HEAP_LOAD($4 | 0, 4, 0) | 0 | 0;
 $6 = __ZN10__cxxabiv18is_equalEPKSt9type_infoS2_b($0, $5, 0) | 0;
 if ($6) {
  __ZNK10__cxxabiv117__class_type_info24process_found_base_classEPNS_19__dynamic_cast_infoEPvi(0, $1, $2, $3);
 }
 return;
}

function __ZN10TestModule5test2EPviS0_($0, $1, $2, $3) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 var $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16 | 0;
 if ((STACKTOP | 0) >= (STACK_MAX | 0)) abortStackOverflow(16 | 0);
 $4 = $1;
 $5 = $2;
 $6 = $3;
 $7 = $4;
 SAFE_HEAP_STORE($0 | 0, $7 | 0, 4);
 $8 = $0 + 4 | 0;
 $9 = $5;
 SAFE_HEAP_STORE($8 | 0, $9 | 0, 4);
 STACKTOP = sp;
 return;
}

function __ZN10TestModule4testEPviS0_($0, $1, $2, $3) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 var $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16 | 0;
 if ((STACKTOP | 0) >= (STACK_MAX | 0)) abortStackOverflow(16 | 0);
 $4 = $1;
 $5 = $2;
 $6 = $3;
 $7 = $4;
 SAFE_HEAP_STORE($0 | 0, $7 | 0, 4);
 $8 = $0 + 4 | 0;
 $9 = $5;
 SAFE_HEAP_STORE($8 | 0, $9 | 0, 4);
 STACKTOP = sp;
 return;
}

function SAFE_HEAP_STORE(dest, value, bytes) {
 dest = dest | 0;
 value = value | 0;
 bytes = bytes | 0;
 if ((dest | 0) <= 0) segfault();
 if ((dest + bytes | 0) > (HEAP32[DYNAMICTOP_PTR >> 2] | 0)) segfault();
 if ((bytes | 0) == 4) {
  if (dest & 3) alignfault();
  HEAP32[dest >> 2] = value;
 } else if ((bytes | 0) == 1) {
  HEAP8[dest >> 0] = value;
 } else {
  if (dest & 1) alignfault();
  HEAP16[dest >> 1] = value;
 }
}

function SAFE_HEAP_STORE_D(dest, value, bytes) {
 dest = dest | 0;
 value = +value;
 bytes = bytes | 0;
 if ((dest | 0) <= 0) segfault();
 if ((dest + bytes | 0) > (HEAP32[DYNAMICTOP_PTR >> 2] | 0)) segfault();
 if ((bytes | 0) == 8) {
  if (dest & 7) alignfault();
  HEAPF64[dest >> 3] = value;
 } else {
  if (dest & 3) alignfault();
  HEAPF32[dest >> 2] = value;
 }
}

function SAFE_HEAP_LOAD_D(dest, bytes) {
 dest = dest | 0;
 bytes = bytes | 0;
 if ((dest | 0) <= 0) segfault();
 if ((dest + bytes | 0) > (HEAP32[DYNAMICTOP_PTR >> 2] | 0)) segfault();
 if ((bytes | 0) == 8) {
  if (dest & 7) alignfault();
  return +HEAPF64[dest >> 3];
 }
 if (dest & 3) alignfault();
 return +HEAPF32[dest >> 2];
}

function ___cxa_is_pointer_type($0) {
 $0 = $0 | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $phitmp = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $1 = ($0 | 0) == (0 | 0);
 if ($1) {
  $4 = 0;
 } else {
  $2 = ___dynamic_cast($0, 24, 80, 0) | 0;
  $phitmp = ($2 | 0) != (0 | 0);
  $4 = $phitmp;
 }
 $3 = $4 & 1;
 return $3 | 0;
}

function dynCall_viiiiii(index, a1, a2, a3, a4, a5, a6) {
 index = index | 0;
 a1 = a1 | 0;
 a2 = a2 | 0;
 a3 = a3 | 0;
 a4 = a4 | 0;
 a5 = a5 | 0;
 a6 = a6 | 0;
 FUNCTION_TABLE_viiiiii[(SAFE_FT_MASK(index | 0, 15 | 0) | 0) & 15](a1 | 0, a2 | 0, a3 | 0, a4 | 0, a5 | 0, a6 | 0);
}

function _main($0, $1) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 var $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16 | 0;
 if ((STACKTOP | 0) >= (STACK_MAX | 0)) abortStackOverflow(16 | 0);
 $2 = $0;
 $3 = $1;
 STACKTOP = sp;
 return 0;
}

function dynCall_viiiii(index, a1, a2, a3, a4, a5) {
 index = index | 0;
 a1 = a1 | 0;
 a2 = a2 | 0;
 a3 = a3 | 0;
 a4 = a4 | 0;
 a5 = a5 | 0;
 FUNCTION_TABLE_viiiii[(SAFE_FT_MASK(index | 0, 15 | 0) | 0) & 15](a1 | 0, a2 | 0, a3 | 0, a4 | 0, a5 | 0);
}
function stackAlloc(size) {
 size = size | 0;
 var ret = 0;
 ret = STACKTOP;
 STACKTOP = STACKTOP + size | 0;
 STACKTOP = STACKTOP + 15 & -16;
 if ((STACKTOP | 0) >= (STACK_MAX | 0)) abortStackOverflow(size | 0);
 return ret | 0;
}

function dynCall_viiii(index, a1, a2, a3, a4) {
 index = index | 0;
 a1 = a1 | 0;
 a2 = a2 | 0;
 a3 = a3 | 0;
 a4 = a4 | 0;
 FUNCTION_TABLE_viiii[(SAFE_FT_MASK(index | 0, 15 | 0) | 0) & 15](a1 | 0, a2 | 0, a3 | 0, a4 | 0);
}

function dynCall_iiii(index, a1, a2, a3) {
 index = index | 0;
 a1 = a1 | 0;
 a2 = a2 | 0;
 a3 = a3 | 0;
 return FUNCTION_TABLE_iiii[(SAFE_FT_MASK(index | 0, 7 | 0) | 0) & 7](a1 | 0, a2 | 0, a3 | 0) | 0;
}

function __ZN10__cxxabiv18is_equalEPKSt9type_infoS2_b($0, $1, $2) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 var $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $3 = ($0 | 0) == ($1 | 0);
 return $3 | 0;
}

function __ZN10__cxxabiv120__si_class_type_infoD0Ev($0) {
 $0 = $0 | 0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 __ZN10__cxxabiv116__shim_type_infoD2Ev($0);
 __ZdlPv($0);
 return;
}

function __ZN10__cxxabiv117__class_type_infoD0Ev($0) {
 $0 = $0 | 0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 __ZN10__cxxabiv116__shim_type_infoD2Ev($0);
 __ZdlPv($0);
 return;
}

function SAFE_FT_MASK(value, mask) {
 value = value | 0;
 mask = mask | 0;
 var ret = 0;
 ret = value & mask;
 if ((ret | 0) != (value | 0)) ftfault();
 return ret | 0;
}

function ___errno_location() {
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ___pthread_self_108() | 0;
 $1 = $0 + 64 | 0;
 return $1 | 0;
}

function establishStackSpace(stackBase, stackMax) {
 stackBase = stackBase | 0;
 stackMax = stackMax | 0;
 STACKTOP = stackBase;
 STACK_MAX = stackMax;
}

function setThrew(threw, value) {
 threw = threw | 0;
 value = value | 0;
 if ((__THREW__ | 0) == 0) {
  __THREW__ = threw;
  threwValue = value;
 }
}

function b34(p0, p1, p2, p3, p4, p5) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 p5 = p5 | 0;
 nullFunc_viiiiii(15);
}

function b33(p0, p1, p2, p3, p4, p5) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 p5 = p5 | 0;
 nullFunc_viiiiii(14);
}

function b32(p0, p1, p2, p3, p4, p5) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 p5 = p5 | 0;
 nullFunc_viiiiii(13);
}

function b31(p0, p1, p2, p3, p4, p5) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 p5 = p5 | 0;
 nullFunc_viiiiii(12);
}

function b30(p0, p1, p2, p3, p4, p5) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 p5 = p5 | 0;
 nullFunc_viiiiii(11);
}

function b29(p0, p1, p2, p3, p4, p5) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 p5 = p5 | 0;
 nullFunc_viiiiii(9);
}

function b28(p0, p1, p2, p3, p4, p5) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 p5 = p5 | 0;
 nullFunc_viiiiii(8);
}

function b27(p0, p1, p2, p3, p4, p5) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 p5 = p5 | 0;
 nullFunc_viiiiii(7);
}

function b26(p0, p1, p2, p3, p4, p5) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 p5 = p5 | 0;
 nullFunc_viiiiii(5);
}

function b25(p0, p1, p2, p3, p4, p5) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 p5 = p5 | 0;
 nullFunc_viiiiii(4);
}

function b24(p0, p1, p2, p3, p4, p5) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 p5 = p5 | 0;
 nullFunc_viiiiii(3);
}

function b23(p0, p1, p2, p3, p4, p5) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 p5 = p5 | 0;
 nullFunc_viiiiii(2);
}

function b22(p0, p1, p2, p3, p4, p5) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 p5 = p5 | 0;
 nullFunc_viiiiii(1);
}

function b21(p0, p1, p2, p3, p4, p5) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 p5 = p5 | 0;
 nullFunc_viiiiii(0);
}

function dynCall_vi(index, a1) {
 index = index | 0;
 a1 = a1 | 0;
 FUNCTION_TABLE_vi[(SAFE_FT_MASK(index | 0, 15 | 0) | 0) & 15](a1 | 0);
}

function b49(p0, p1, p2, p3, p4) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 nullFunc_viiiii(15);
}

function b48(p0, p1, p2, p3, p4) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 nullFunc_viiiii(14);
}

function b47(p0, p1, p2, p3, p4) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 nullFunc_viiiii(13);
}

function b46(p0, p1, p2, p3, p4) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 nullFunc_viiiii(12);
}

function b45(p0, p1, p2, p3, p4) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 nullFunc_viiiii(10);
}

function b44(p0, p1, p2, p3, p4) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 nullFunc_viiiii(9);
}

function b43(p0, p1, p2, p3, p4) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 nullFunc_viiiii(8);
}

function b42(p0, p1, p2, p3, p4) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 nullFunc_viiiii(6);
}

function b41(p0, p1, p2, p3, p4) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 nullFunc_viiiii(5);
}

function b40(p0, p1, p2, p3, p4) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 nullFunc_viiiii(4);
}

function b39(p0, p1, p2, p3, p4) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 nullFunc_viiiii(3);
}

function b38(p0, p1, p2, p3, p4) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 nullFunc_viiiii(2);
}

function b37(p0, p1, p2, p3, p4) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 nullFunc_viiiii(1);
}

function b36(p0, p1, p2, p3, p4) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 nullFunc_viiiii(0);
}

function ___pthread_self_108() {
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = _pthread_self() | 0;
 return $0 | 0;
}

function __ZNK10__cxxabiv116__shim_type_info5noop2Ev($0) {
 $0 = $0 | 0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 return;
}

function __ZNK10__cxxabiv116__shim_type_info5noop1Ev($0) {
 $0 = $0 | 0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 return;
}

function __ZN10__cxxabiv116__shim_type_infoD2Ev($0) {
 $0 = $0 | 0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 return;
}

function b64(p0, p1, p2, p3) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 nullFunc_viiii(15);
}

function b63(p0, p1, p2, p3) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 nullFunc_viiii(14);
}

function b62(p0, p1, p2, p3) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 nullFunc_viiii(13);
}

function b61(p0, p1, p2, p3) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 nullFunc_viiii(11);
}

function b60(p0, p1, p2, p3) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 nullFunc_viiii(10);
}

function b59(p0, p1, p2, p3) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 nullFunc_viiii(9);
}

function b58(p0, p1, p2, p3) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 nullFunc_viiii(7);
}

function b57(p0, p1, p2, p3) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 nullFunc_viiii(6);
}

function b56(p0, p1, p2, p3) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 nullFunc_viiii(5);
}

function b55(p0, p1, p2, p3) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 nullFunc_viiii(4);
}

function b54(p0, p1, p2, p3) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 nullFunc_viiii(3);
}

function b53(p0, p1, p2, p3) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 nullFunc_viiii(2);
}

function b52(p0, p1, p2, p3) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 nullFunc_viiii(1);
}

function b51(p0, p1, p2, p3) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 nullFunc_viiii(0);
}

function setDynamicTop(value) {
 value = value | 0;
 SAFE_HEAP_STORE(DYNAMICTOP_PTR | 0, value | 0, 4);
}

function _emscripten_get_global_libc() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 return 1152 | 0;
}

function __ZNSt9type_infoD2Ev($0) {
 $0 = $0 | 0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 return;
}

function b7(p0, p1, p2) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 nullFunc_iiii(7);
 return 0;
}

function b6(p0, p1, p2) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 nullFunc_iiii(6);
 return 0;
}

function b5(p0, p1, p2) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 nullFunc_iiii(4);
 return 0;
}

function b4(p0, p1, p2) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 nullFunc_iiii(3);
 return 0;
}

function b3(p0, p1, p2) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 nullFunc_iiii(2);
 return 0;
}

function b2(p0, p1, p2) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 nullFunc_iiii(1);
 return 0;
}

function b1(p0, p1, p2) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 nullFunc_iiii(0);
 return 0;
}

function __ZdlPv($0) {
 $0 = $0 | 0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 _free($0);
 return;
}

function _pthread_self() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 return 104 | 0;
}

function setTempRet0(value) {
 value = value | 0;
 tempRet0 = value;
}

function stackRestore(top) {
 top = top | 0;
 STACKTOP = top;
}

function b19(p0) {
 p0 = p0 | 0;
 nullFunc_vi(15);
}

function b18(p0) {
 p0 = p0 | 0;
 nullFunc_vi(14);
}

function b17(p0) {
 p0 = p0 | 0;
 nullFunc_vi(13);
}

function b16(p0) {
 p0 = p0 | 0;
 nullFunc_vi(12);
}

function b15(p0) {
 p0 = p0 | 0;
 nullFunc_vi(11);
}

function b14(p0) {
 p0 = p0 | 0;
 nullFunc_vi(10);
}

function b13(p0) {
 p0 = p0 | 0;
 nullFunc_vi(8);
}

function b12(p0) {
 p0 = p0 | 0;
 nullFunc_vi(7);
}

function b11(p0) {
 p0 = p0 | 0;
 nullFunc_vi(6);
}

function b10(p0) {
 p0 = p0 | 0;
 nullFunc_vi(5);
}

function b9(p0) {
 p0 = p0 | 0;
 nullFunc_vi(0);
}

function getTempRet0() {
 return tempRet0 | 0;
}

function stackSave() {
 return STACKTOP | 0;
}

// EMSCRIPTEN_END_FUNCS
var FUNCTION_TABLE_iiii = [b1,b2,b3,b4,b5,__ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv,b6,b7];
var FUNCTION_TABLE_vi = [b9,__ZN10__cxxabiv116__shim_type_infoD2Ev,__ZN10__cxxabiv117__class_type_infoD0Ev,__ZNK10__cxxabiv116__shim_type_info5noop1Ev,__ZNK10__cxxabiv116__shim_type_info5noop2Ev,b10,b11,b12,b13,__ZN10__cxxabiv120__si_class_type_infoD0Ev,b14,b15,b16,b17,b18,b19];
var FUNCTION_TABLE_viiiiii = [b21,b22,b23,b24,b25,b26,__ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,b27,b28,b29,__ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,b30,b31,b32,b33,b34];
var FUNCTION_TABLE_viiiii = [b36,b37,b38,b39,b40,b41,b42,__ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,b43,b44,b45,__ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,b46,b47,b48,b49];
var FUNCTION_TABLE_viiii = [b51,b52,b53,b54,b55,b56,b57,b58,__ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,b59,b60,b61,__ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,b62,b63,b64];

  return { _main: _main, setDynamicTop: setDynamicTop, setThrew: setThrew, ___cxa_is_pointer_type: ___cxa_is_pointer_type, ___errno_location: ___errno_location, _TestModule__test: _TestModule__test, _memset: _memset, _sbrk: _sbrk, _memcpy: _memcpy, stackAlloc: stackAlloc, dynCall_vi: dynCall_vi, getTempRet0: getTempRet0, setTempRet0: setTempRet0, dynCall_iiii: dynCall_iiii, _emscripten_get_global_libc: _emscripten_get_global_libc, _TestModule__test2: _TestModule__test2, dynCall_viiii: dynCall_viiii, stackSave: stackSave, dynCall_viiiii: dynCall_viiiii, ___cxa_can_catch: ___cxa_can_catch, _free: _free, runPostSets: runPostSets, dynCall_viiiiii: dynCall_viiiiii, establishStackSpace: establishStackSpace, stackRestore: stackRestore, _malloc: _malloc, _emscripten_replace_memory: _emscripten_replace_memory };
})
// EMSCRIPTEN_END_ASM
(Module.asmGlobalArg, Module.asmLibraryArg, buffer);

var real__main = asm["_main"]; asm["_main"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__main.apply(null, arguments);
};

var real_setDynamicTop = asm["setDynamicTop"]; asm["setDynamicTop"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real_setDynamicTop.apply(null, arguments);
};

var real_setThrew = asm["setThrew"]; asm["setThrew"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real_setThrew.apply(null, arguments);
};

var real____cxa_is_pointer_type = asm["___cxa_is_pointer_type"]; asm["___cxa_is_pointer_type"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real____cxa_is_pointer_type.apply(null, arguments);
};

var real____errno_location = asm["___errno_location"]; asm["___errno_location"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real____errno_location.apply(null, arguments);
};

var real__TestModule__test = asm["_TestModule__test"]; asm["_TestModule__test"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__TestModule__test.apply(null, arguments);
};

var real__sbrk = asm["_sbrk"]; asm["_sbrk"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__sbrk.apply(null, arguments);
};

var real_stackAlloc = asm["stackAlloc"]; asm["stackAlloc"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real_stackAlloc.apply(null, arguments);
};

var real_getTempRet0 = asm["getTempRet0"]; asm["getTempRet0"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real_getTempRet0.apply(null, arguments);
};

var real_setTempRet0 = asm["setTempRet0"]; asm["setTempRet0"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real_setTempRet0.apply(null, arguments);
};

var real__emscripten_get_global_libc = asm["_emscripten_get_global_libc"]; asm["_emscripten_get_global_libc"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__emscripten_get_global_libc.apply(null, arguments);
};

var real__TestModule__test2 = asm["_TestModule__test2"]; asm["_TestModule__test2"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__TestModule__test2.apply(null, arguments);
};

var real_stackSave = asm["stackSave"]; asm["stackSave"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real_stackSave.apply(null, arguments);
};

var real____cxa_can_catch = asm["___cxa_can_catch"]; asm["___cxa_can_catch"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real____cxa_can_catch.apply(null, arguments);
};

var real__free = asm["_free"]; asm["_free"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__free.apply(null, arguments);
};

var real_establishStackSpace = asm["establishStackSpace"]; asm["establishStackSpace"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real_establishStackSpace.apply(null, arguments);
};

var real_stackRestore = asm["stackRestore"]; asm["stackRestore"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real_stackRestore.apply(null, arguments);
};

var real__malloc = asm["_malloc"]; asm["_malloc"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__malloc.apply(null, arguments);
};
var _main = Module["_main"] = asm["_main"];
var setDynamicTop = Module["setDynamicTop"] = asm["setDynamicTop"];
var setThrew = Module["setThrew"] = asm["setThrew"];
var ___cxa_is_pointer_type = Module["___cxa_is_pointer_type"] = asm["___cxa_is_pointer_type"];
var ___errno_location = Module["___errno_location"] = asm["___errno_location"];
var _TestModule__test = Module["_TestModule__test"] = asm["_TestModule__test"];
var _memset = Module["_memset"] = asm["_memset"];
var _sbrk = Module["_sbrk"] = asm["_sbrk"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var stackAlloc = Module["stackAlloc"] = asm["stackAlloc"];
var getTempRet0 = Module["getTempRet0"] = asm["getTempRet0"];
var setTempRet0 = Module["setTempRet0"] = asm["setTempRet0"];
var _emscripten_get_global_libc = Module["_emscripten_get_global_libc"] = asm["_emscripten_get_global_libc"];
var _TestModule__test2 = Module["_TestModule__test2"] = asm["_TestModule__test2"];
var stackSave = Module["stackSave"] = asm["stackSave"];
var ___cxa_can_catch = Module["___cxa_can_catch"] = asm["___cxa_can_catch"];
var _free = Module["_free"] = asm["_free"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var establishStackSpace = Module["establishStackSpace"] = asm["establishStackSpace"];
var stackRestore = Module["stackRestore"] = asm["stackRestore"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _emscripten_replace_memory = Module["_emscripten_replace_memory"] = asm["_emscripten_replace_memory"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_viiiiii = Module["dynCall_viiiiii"] = asm["dynCall_viiiiii"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];
;
Runtime.stackAlloc = Module['stackAlloc'];
Runtime.stackSave = Module['stackSave'];
Runtime.stackRestore = Module['stackRestore'];
Runtime.establishStackSpace = Module['establishStackSpace'];
Runtime.setDynamicTop = Module['setDynamicTop'];
Runtime.setTempRet0 = Module['setTempRet0'];
Runtime.getTempRet0 = Module['getTempRet0'];


// === Auto-generated postamble setup entry stuff ===

Module['asm'] = asm;



if (memoryInitializer) {
  if (typeof Module['locateFile'] === 'function') {
    memoryInitializer = Module['locateFile'](memoryInitializer);
  } else if (Module['memoryInitializerPrefixURL']) {
    memoryInitializer = Module['memoryInitializerPrefixURL'] + memoryInitializer;
  }
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = Module['readBinary'](memoryInitializer);
    HEAPU8.set(data, Runtime.GLOBAL_BASE);
  } else {
    addRunDependency('memory initializer');
    var applyMemoryInitializer = function(data) {
      if (data.byteLength) data = new Uint8Array(data);
      for (var i = 0; i < data.length; i++) {
        assert(HEAPU8[Runtime.GLOBAL_BASE + i] === 0, "area for memory initializer should not have been touched before it's loaded");
      }
      HEAPU8.set(data, Runtime.GLOBAL_BASE);
      // Delete the typed array that contains the large blob of the memory initializer request response so that
      // we won't keep unnecessary memory lying around. However, keep the XHR object itself alive so that e.g.
      // its .status field can still be accessed later.
      if (Module['memoryInitializerRequest']) delete Module['memoryInitializerRequest'].response;
      removeRunDependency('memory initializer');
    }
    function doBrowserLoad() {
      Module['readAsync'](memoryInitializer, applyMemoryInitializer, function() {
        throw 'could not load memory initializer ' + memoryInitializer;
      });
    }
    if (Module['memoryInitializerRequest']) {
      // a network request has already been created, just use that
      function useRequest() {
        var request = Module['memoryInitializerRequest'];
        if (request.status !== 200 && request.status !== 0) {
          // If you see this warning, the issue may be that you are using locateFile or memoryInitializerPrefixURL, and defining them in JS. That
          // means that the HTML file doesn't know about them, and when it tries to create the mem init request early, does it to the wrong place.
          // Look in your browser's devtools network console to see what's going on.
          console.warn('a problem seems to have happened with Module.memoryInitializerRequest, status: ' + request.status + ', retrying ' + memoryInitializer);
          doBrowserLoad();
          return;
        }
        applyMemoryInitializer(request.response);
      }
      if (Module['memoryInitializerRequest'].response) {
        setTimeout(useRequest, 0); // it's already here; but, apply it asynchronously
      } else {
        Module['memoryInitializerRequest'].addEventListener('load', useRequest); // wait for it
      }
    } else {
      // fetch it from the network ourselves
      doBrowserLoad();
    }
  }
}



/**
 * @constructor
 * @extends {Error}
 */
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun']) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString(Module['thisProgram']), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);


  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    exit(ret, /* implicit = */ true);
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      var toLog = e;
      if (e && typeof e === 'object' && e.stack) {
        toLog = [e, e.stack];
      }
      Module.printErr('exception thrown: ' + toLog);
      Module['quit'](1, e);
    }
  } finally {
    calledMain = true;
  }
}




/** @type {function(Array=)} */
function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    return;
  }

  writeStackCookie();

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    if (ABORT) return;

    ensureInitRuntime();

    preMain();

    if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
      Module.printErr('pre-main prep time: ' + (Date.now() - preloadStartTime) + ' ms');
    }

    if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();

    if (Module['_main'] && shouldRunNow) Module['callMain'](args);

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus'](');
      }, 1);
      doRun();
    }, 1);
  } else {
    doRun();
  }
  checkStackCookie();
}
Module['run'] = Module.run = run;

function exit(status, implicit) {
  if (implicit && Module['noExitRuntime']) {
    Module.printErr('exit(' + status + ') implicitly called by end of main(), but noExitRuntime, so not exiting the runtime (you can use emscripten_force_exit, if you want to force a true shutdown)');
    return;
  }

  if (Module['noExitRuntime']) {
    Module.printErr('exit(' + status + ') called, but noExitRuntime, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)');
  } else {

    ABORT = true;
    EXITSTATUS = status;
    STACKTOP = initialStackTop;

    exitRuntime();

    if (Module['onExit']) Module['onExit'](status);
  }

  if (ENVIRONMENT_IS_NODE) {
    process['exit'](status);
  }
  Module['quit'](status, new ExitStatus(status));
}
Module['exit'] = Module.exit = exit;

var abortDecorators = [];

function abort(what) {
  if (Module['onAbort']) {
    Module['onAbort'](what);
  }

  if (what !== undefined) {
    Module.print(what);
    Module.printErr(what);
    what = JSON.stringify(what)
  } else {
    what = ';
  }

  ABORT = true;
  EXITSTATUS = 1;

  var extra = ';

  var output = 'abort(' + what + ') at ' + stackTrace() + extra;
  if (abortDecorators) {
    abortDecorators.forEach(function(decorator) {
      output = decorator(output, what);
    });
  }
  throw output;
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}

Module["noExitRuntime"] = true;

run();

// {{POST_RUN_ADDITIONS}}


var workerResponded = false, workerCallbackId = -1;

(function() {
  var messageBuffer = null, buffer = 0, bufferSize = 0;

  function flushMessages() {
    if (!messageBuffer) return;
    if (runtimeInitialized) {
      var temp = messageBuffer;
      messageBuffer = null;
      temp.forEach(function(message) {
        onmessage(message);
      });
    }
  }

  function messageResender() {
    flushMessages();
    if (messageBuffer) {
      setTimeout(messageResender, 100); // still more to do
    }
  }

  onmessage = function onmessage(msg) {
    // if main has not yet been called (mem init file, other async things), buffer messages
    if (!runtimeInitialized) {
      if (!messageBuffer) {
        messageBuffer = [];
        setTimeout(messageResender, 100);
      }
      messageBuffer.push(msg);
      return;
    }
    flushMessages();

    var func = Module['_' + msg.data['funcName']];
    if (!func) throw 'invalid worker function to call: ' + msg.data['funcName'];
    var data = msg.data['data'];
    if (data) {
      if (!data.byteLength) data = new Uint8Array(data);
      if (!buffer || bufferSize < data.length) {
        if (buffer) _free(buffer);
        bufferSize = data.length;
        buffer = _malloc(data.length);
      }
      HEAPU8.set(data, buffer);
    }

    workerResponded = false;
    workerCallbackId = msg.data['callbackId'];
    if (data) {
      func(buffer, data.length);
    } else {
      func(0, 0);
    }
  }
})();





// {{MODULE_ADDITIONS}}







