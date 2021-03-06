$_mod.def("/sift$8.5.1/lib/index", function(require, exports, module, __filename, __dirname) { "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = sift;
exports.compare = compare;
exports.comparable = comparable;
/*
 *
 * Copryright 2018, Craig Condon
 * Licensed under MIT
 *
 * Filter JavaScript objects with mongodb queries
 */

function typeChecker(type) {
  var typeString = "[object " + type + "]";
  return function (value) {
    return Object.prototype.toString.call(value) === typeString;
  };
}

/**
 */

var isArray = typeChecker("Array");
var isObject = typeChecker("Object");
var isFunction = typeChecker("Function");

function get(obj, key) {
  return isFunction(obj.get) ? obj.get(key) : obj[key];
}

var nestable = function nestable(validator) {
  return function (validateOptions, value, key, valueOwner, nestedResults) {
    if (nestedResults) {
      return Boolean(nestedResults.find(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 3),
            value = _ref2[0],
            key = _ref2[1],
            valueOwner = _ref2[2];

        return validator(validateOptions, key, valueOwner);
      }));
    }

    return validator(validateOptions, value, key, valueOwner);
  };
};

/**
 */

var or = nestable(function (validator) {
  return function (validateOptions, value, key, valueOwner, nestedResults) {
    if (!isArray(value) || !value.length) {
      return validator(validateOptions, value);
    }
    for (var i = 0, n = value.length; i < n; i++) {
      if (validator(validateOptions, get(value, i))) return true;
    }
    return false;
  };
});

/**
 */

function and(validator) {
  return function (validateOptions, value, key, valueOwner) {
    if (!isArray(value) || !value.length) {
      return validator(validateOptions, value, key, valueOwner);
    }
    for (var i = 0, n = value.length; i < n; i++) {
      if (!validator(validateOptions, get(value, i), value, valueOwner)) return false;
    }
    return true;
  };
}

function _validate(validator, value, key, valueOwner, nestedResults) {
  return validator.validate(validator.options, value, key, valueOwner, nestedResults);
}

var defaultExpressions = {
  /**
   */

  $eq: or(function (test, value) {
    return test(value);
  }),

  /**
   */

  $ne: and(function (test, value) {
    return test(value);
  }),

  /**
   */

  $gt: or(function (test, value) {
    return test(value);
  }),

  /**
   */

  $gte: or(function (test, value) {
    return test(value);
  }),

  /**
   */

  $lt: or(function (test, value) {
    return test(value);
  }),

  /**
   */

  $lte: or(function (test, value) {
    return test(value);
  }),

  /**
   */

  $mod: or(function (test, value) {
    return test(value);
  }),

  /**
   */

  $in: function $in(test, value) {
    return test(value);
  },


  /**
   */

  $nin: function $nin(test, value) {
    return test(value);
  },

  /**
   */

  $not: function $not(test, value, key, valueOwner) {
    return test(value, key, valueOwner);
  },

  /**
   */

  $type: function $type(testType, value) {
    return testType(value);
  },

  /**
   */

  $all: function $all(allOptions, value, key, valueOwner, nestedResults) {
    return defaultExpressions.$and(allOptions, value, key, valueOwner, nestedResults);
  },

  /**
   */

  $size: function $size(sizeMatch, value) {
    return value ? sizeMatch === value.length : false;
  },

  /**
   */

  $or: function $or(orOptions, value, key, valueOwner) {
    for (var i = 0, n = orOptions.length; i < n; i++) {
      if (_validate(get(orOptions, i), value, key, valueOwner)) {
        return true;
      }
    }
    return false;
  },

  /**
   */

  $nor: function $nor(validateOptions, value, key, valueOwner) {
    return !defaultExpressions.$or(validateOptions, value, key, valueOwner);
  },

  /**
   */

  $and: function $and(validateOptions, value, key, valueOwner, nestedResults) {

    if (nestedResults) {
      for (var i = 0, n = validateOptions.length; i < n; i++) {
        if (!_validate(get(validateOptions, i), value, key, valueOwner, nestedResults)) {
          return false;
        }
      }
    } else {
      for (var i = 0, n = validateOptions.length; i < n; i++) {
        if (!_validate(get(validateOptions, i), value, key, valueOwner, nestedResults)) {
          return false;
        }
      }
    }
    return true;
  },

  /**
   */

  $regex: or(function (validateOptions, value) {
    return typeof value === "string" && validateOptions.test(value);
  }),

  /**
   */

  $where: function $where(validateOptions, value, key, valueOwner) {
    return validateOptions.call(value, value, key, valueOwner);
  },

  /**
   */

  $elemMatch: function $elemMatch(validateOptions, value, key, valueOwner) {
    if (isArray(value)) {
      return !!~search(value, validateOptions);
    }
    return _validate(validateOptions, value, key, valueOwner);
  },

  /**
   */

  $exists: function $exists(validateOptions, value, key, valueOwner) {
    return valueOwner.hasOwnProperty(key) === validateOptions;
  }
};

/**
 */

var prepare = {
  /**
   */

  $eq: function $eq(query, queryOwner, _ref3) {
    var comparable = _ref3.comparable,
        compare = _ref3.compare;

    if (query instanceof RegExp) {
      return or(function (value) {
        return typeof value === "string" && query.test(value);
      });
    } else if (query instanceof Function) {
      return or(query);
    } else if (isArray(query) && !query.length) {
      // Special case of a == []
      return or(function (value) {
        return isArray(value) && !value.length;
      });
    } else if (query === null) {
      return or(function (value) {
        //will match both null and undefined
        return value == null;
      });
    }
    return or(function (value) {
      return compare(comparable(value), comparable(query)) === 0;
    });
  },

  $gt: function $gt(query, queryOwner, _ref4) {
    var comparable = _ref4.comparable,
        compare = _ref4.compare;

    return function (value) {
      return compare(comparable(value), comparable(query)) > 0;
    };
  },

  $gte: function $gte(query, queryOwner, _ref5) {
    var comparable = _ref5.comparable,
        compare = _ref5.compare;

    return function (value) {
      return compare(comparable(value), comparable(query)) >= 0;
    };
  },

  $lt: function $lt(query, queryOwner, _ref6) {
    var comparable = _ref6.comparable,
        compare = _ref6.compare;

    return function (value) {
      return compare(comparable(value), comparable(query)) < 0;
    };
  },
  $lte: function $lte(query, queryOwner, _ref7) {
    var comparable = _ref7.comparable,
        compare = _ref7.compare;

    return function (value) {
      return compare(comparable(value), comparable(query)) <= 0;
    };
  },

  $in: function $in(query, queryOwner, options) {
    var comparable = options.comparable;

    return function (value) {
      if (value instanceof Array) {
        for (var i = value.length; i--;) {
          if (~query.indexOf(comparable(get(value, i)))) {
            return true;
          }
        }
      } else {
        var comparableValue = comparable(value);
        if (comparableValue === value && (typeof value === "undefined" ? "undefined" : _typeof(value)) === "object") {
          for (var i = query.length; i--;) {
            if (String(query[i]) === String(value) && String(value) !== "[object Object]") {
              return true;
            }
          }
        }

        /*
          Handles documents that are undefined, whilst also
          having a 'null' element in the parameters to $in.
        */
        if (typeof comparableValue == "undefined") {
          for (var i = query.length; i--;) {
            if (query[i] == null) {
              return true;
            }
          }
        }

        /*
          Handles the case of {'field': {$in: [/regexp1/, /regexp2/, ...]}}
        */
        for (var i = query.length; i--;) {
          var validator = createRootValidator(get(query, i), options);
          var result = _validate(validator, comparableValue, i, query);
          if (result && String(result) !== "[object Object]" && String(comparableValue) !== "[object Object]") {
            return true;
          }
        }

        return !!~query.indexOf(comparableValue);
      }

      return false;
    };
  },

  $nin: function $nin(query, queryOwner, options) {
    var eq = prepare.$in(query, queryOwner, options);
    return function (validateOptions, value, key, valueOwner) {
      return !eq(validateOptions, value, key, valueOwner);
    };
  },

  $mod: function $mod(query) {
    return function (value) {
      return value % query[0] == query[1];
    };
  },

  /**
   */

  $ne: function $ne(query, queryOwner, options) {
    var eq = prepare.$eq(query, queryOwner, options);
    return and(function (validateOptions, value, key, valueOwner) {
      return !eq(validateOptions, value, key, valueOwner);
    });
  },

  /**
   */

  $and: function $and(query, queryOwner, options) {
    return query.map(parse(options));
  },

  /**
   */

  $all: function $all(query, queryOwner, options) {
    return prepare.$and(query, queryOwner, options);
  },

  /**
   */

  $or: function $or(query, queryOwner, options) {
    return query.map(parse(options));
  },

  /**
   */

  $nor: function $nor(query, queryOwner, options) {
    return query.map(parse(options));
  },

  /**
   */

  $not: function $not(query, queryOwner, options) {
    var validateOptions = parse(options)(query);
    return function (value, key, valueOwner) {
      return !_validate(validateOptions, value, key, valueOwner);
    };
  },

  $type: function $type(query) {
    return function (value, key, valueOwner) {
      return value != void 0 ? value instanceof query || value.constructor == query : false;
    };
  },

  /**
   */

  $regex: function $regex(query, queryOwner) {
    return new RegExp(query, queryOwner.$options);
  },

  /**
   */

  $where: function $where(query) {
    return typeof query === "string" ? new Function("obj", "return " + query) : query;
  },

  /**
   */

  $elemMatch: function $elemMatch(query, queryOwner, options) {
    return parse(options)(query);
  },

  /**
   */

  $exists: function $exists(query) {
    return !!query;
  }
};

/**
 */

function search(array, validator) {
  for (var i = 0; i < array.length; i++) {
    var result = get(array, i);
    if (_validate(validator, get(array, i))) {
      return i;
    }
  }

  return -1;
}

/**
 */

function createValidator(options, validate) {
  return { options: options, validate: validate };
}

/**
 */

function validatedNested(_ref8, value) {
  var keyPath = _ref8.keyPath,
      child = _ref8.child,
      query = _ref8.query;

  var results = [];
  findValues(value, keyPath, 0, value, results);

  if (results.length === 1) {
    var _results$ = _slicedToArray(results[0], 3),
        _value = _results$[0],
        key = _results$[1],
        valueOwner = _results$[2];

    return _validate(child, _value, key, valueOwner);
  }

  // If the query contains $ne, need to test all elements ANDed together
  var inclusive = query && typeof query.$ne !== "undefined";
  var allValid = inclusive;
  var allValues = results.map(function (_ref9) {
    var _ref10 = _slicedToArray(_ref9, 1),
        value = _ref10[0];

    return value;
  });

  return _validate(child, undefined, undefined, undefined, results);
  // for (var i = 0; i < results.length; i++) {
  //   const [value, key, valueOwner] = results[i];
  //   var isValid = validate(child, value, key, valueOwner);
  //   console.log(isValid, value);
  //   if (inclusive) {
  //     allValid &= isValid;
  //   } else {
  //     allValid |= isValid;
  //   }
  // }
  // return allValid;
}

/**
 */

function findValues(current, keypath, index, object, values) {
  if (index === keypath.length || current == void 0) {
    values.push([current, keypath[index - 1], object]);
    return;
  }

  var k = get(keypath, index);

  // ensure that if current is an array, that the current key
  // is NOT an array index. This sort of thing needs to work:
  // sift({'foo.0':42}, [{foo: [42]}]);
  if (isArray(current) && isNaN(Number(k))) {
    for (var i = 0, n = current.length; i < n; i++) {
      findValues(get(current, i), keypath, index, current, values);
    }
  } else {
    findValues(get(current, k), keypath, index + 1, current, values);
  }
}

/**
 */

function createNestedValidator(keyPath, child, query) {
  return createValidator({ keyPath: keyPath, child: child, query: query }, validatedNested);
}

/**
 * flatten the query
 */

function isVanillaObject(value) {
  return value && (value.constructor === Object || value.constructor === Array || value.constructor.toString() === "function Object() { [native code] }" || value.constructor.toString() === "function Array() { [native code] }");
}

function parse(options) {
  var comparable = options.comparable,
      expressions = options.expressions;

  var wrapQuery = function wrapQuery(query) {
    if (!query || !isVanillaObject(query)) {
      query = { $eq: query };
    }
    return query;
  };

  var parseQuery = function parseQuery(query) {
    query = comparable(query);

    var validators = [];

    for (var key in query) {
      var queryValue = query[key];

      if (key === "$options") {
        continue;
      }

      var expression = defaultExpressions[key] || options && expressions && expressions[key];

      if (expression) {
        if (prepare[key]) {
          queryValue = prepare[key](queryValue, query, options);
        }
        validators.push(createValidator(comparable(queryValue), expression));
      } else {
        if (key.charCodeAt(0) === 36) {
          throw new Error("Unknown operation " + key);
        }

        var keyParts = key.split(".");

        validators.push(createNestedValidator(keyParts, parseNested(queryValue), queryValue));
      }
    }

    return validators.length === 1 ? validators[0] : createValidator(validators, defaultExpressions.$and);
  };

  var parseNested = function parseNested(query) {
    query = wrapQuery(query);
    if (isExactObject(query)) {
      return createValidator(query, isEqual);
    }
    return parseQuery(query);
  };

  var parseRoot = function parseRoot(query) {
    return parseQuery(wrapQuery(query));
  };

  return parseRoot;
}

function isEqual(a, b) {
  if (Object.prototype.toString.call(a) !== Object.prototype.toString.call(b)) {
    return false;
  }

  if (isObject(a)) {
    if (Object.keys(a).length !== Object.keys(b).length) {
      return false;
    }

    for (var key in a) {
      if (!isEqual(a[key], b[key])) {
        return false;
      }
    }

    return true;
  } else if (isArray(a)) {
    if (a.length !== b.length) {
      return false;
    }
    for (var i = 0, n = a.length; i < n; i++) {
      if (!isEqual(a[i], b[i])) {
        return false;
      }
    }

    return true;
  } else {
    return a === b;
  }
}

function getAllKeys(value, keys) {
  if (!isObject(value)) {
    return keys;
  }
  for (var key in value) {
    keys.push(key);
    getAllKeys(value[key], keys);
  }
  return keys;
}

function isExactObject(value) {
  var allKeysHash = getAllKeys(value, []).join(",");
  return allKeysHash.search(/[$.]/) === -1;
}

/**
 */

function createRootValidator(query, options) {
  var validator = parse(options)(query);
  if (options && options.select) {
    validator = {
      options: validator,
      validate: function validate(validateOptions, value, key, valueOwner) {
        return _validate(validateOptions, value && options.select(value), key, valueOwner);
      }
    };
  }
  return validator;
}

/**
 */

function sift(query, options) {
  options = Object.assign({ compare: compare, comparable: comparable }, options);
  var validator = createRootValidator(query, options);
  return function (value, key, valueOwner) {
    return _validate(validator, value, key, valueOwner);
  };
}

/**
 */

function compare(a, b) {
  if (isEqual(a, b)) return 0;
  if ((typeof a === "undefined" ? "undefined" : _typeof(a)) === (typeof b === "undefined" ? "undefined" : _typeof(b))) {
    if (a > b) {
      return 1;
    }
    if (a < b) {
      return -1;
    }
  }
}

/**
 */

function comparable(value) {
  if (value instanceof Date) {
    return value.getTime();
  } else if (isArray(value)) {
    return value.map(comparable);
  } else if (value && typeof value.toJSON === "function") {
    return value.toJSON();
  } else {
    return value;
  }
}

});