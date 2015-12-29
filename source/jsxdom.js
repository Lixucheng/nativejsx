'use strict';

let fs = require('fs');
let util = require('util');

let merge = require('merge');
let escodegen = require('escodegen');
let acorn = require('acorn-jsx');
let walk = require('acorn/dist/walk');

let jsxdom = {};

const defaults = {
  encoding: 'utf-8',
  variablePrefix: '$$',
  declarationType: 'var',
  acorn: {
    plugins: {
      jsx: true
    }
  }
};

let allocator = jsxdom.allocator = require('./allocator.js');
let generators = jsxdom.generators = require('./generators.js');
let walker = jsxdom.walker = walk.make(require('./walkers.js'));
let transformers = jsxdom.transformers = require('./transformers.js');
let safeOptions = (options) => {
  let copy = merge(
    {},
    defaults,
    util.isObject(options) ? options : {}
  );

  // Make sure that the JSX plugin isn't clobbered.
  copy.acorn = copy.hasOwnProperty('acorn') ?
    copy.acorn : {};
  copy.acorn.plugins = copy.acorn.hasOwnProperty('plugins') ?
    copy.acorn.plugins : {};
  copy.acorn.plugins.jsx = true;

  return copy;
};

/**
 * @function transpile
 * @description
 * Transpiles a String containing JSX source code to JavaScript
 * enhanced with native DOM API calls that reflect the original JSX.
 *
 * @param {String} jsx - JSX source code in String format.
 * @param {JSXOptions} options - User-defined compilation options.
 * @returns {String} - A String representing JSX transpiled to JavaScript.
 */
let transpile = jsxdom.transpile = (jsx, options) => {
  let safe = safeOptions(options);
  let isValidDeclarationType = generators.
    ALLOWABLE_DECLARATION_TYPES.
    indexOf(safe.declarationType) !== -1;

  allocator.VARIABLE_PREFIX = typeof safe.variablePrefix === 'string' ?
    safe.variablePrefix :
    allocator.VARIABLE_PREFIX;

  generators.DECLARATION_TYPE = isValidDeclarationType ?
    safe.declarationType :
    generators.DECLARATION_TYPE;

  let ast = acorn.parse(jsx, safe.acorn);
  walk.simple(ast, transformers, walker);
  return escodegen.generate(ast);
};

/**
 * @function parse
 * @description
 * Transforms the JSX AST by reading the specified file and using jsxdom to
 * transpile it to valid JavaScript. This function operates asynchronously
 * and resolves through the Promise API.
 * @param {String} file - A path to and including the JSX file.
 * @param {JSXOptions} options - User-defined compilation options.
 * @returns {Promise} - A Promise that resolves when the file is read and transpiled.
 */
jsxdom.parse = (file, options) => {
  let safe = safeOptions(options);

  return new Promise((resolve, reject) => {
    fs.readFile(file, safe.encoding, function(error, contents) {
      if (error) return reject(error);
      resolve(transpile(contents, safe));
    });
  });
};

/**
 * @function parseSync
 * @description
 * Transforms the JSX AST by reading the specified file and using jsxdom to
 * transpile it to valid JavaScript. This function operates synchronously
 * (much like readFileSync in node.js).
 * @param {String} file - A path to and including the JSX file.
 * @param {JSXOptions} options - User-defined compilation options.
 * @returns {String} - A String containing valid JavaScript.
 */
jsxdom.parseSync = (file, options) => {
  let safe = safeOptions(options);

  return transpile(
    fs.readFileSync(file, safe.encoding),
    options
  );
};

module.exports = jsxdom;
