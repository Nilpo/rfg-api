/*
 * rfg-api.js
 * https://github.com/RealFaviconGenerator/rfg-api.js
 *
 * Copyright (c) 2014 Philippe Bernard
 * Licensed under the MIT license.
 */

'use strict';

module.exports.init = function() {

  var exports = {};

  var Client = require('node-rest-client').Client;
  var http = require('http');
  var fs = require('fs');
  var unzip = require('unzip');
  var metaparser = require('metaparser');
  var fstream = require('fstream');
  var mkdirp = require('mkdirp');

  exports.file_to_base64 = function(file) {
    return fs.readFileSync(file, {encoding: null}).toString('base64');
  }

  exports.generate_favicon = function(favicon_gneration_request, dest, callback) {
    mkdirp.sync(dest);

    var client = new Client();
    var args = {
      data: {
        "favicon_generation": favicon_gneration_request
      },
      headers:{"Content-Type": "application/json"}
    };
    client.post("http://realfavicongenerator.net/api/favicon", args, function(data, response) {
      if (response.statusCode !== 200) {
        console.log(data);
        return;
      }

      var writeStream = fstream.Writer(dest);
      var parserStream = unzip.Parse();
      var request = http.get(data.favicon_generation_result.favicon.package_url, function(response) {
        response.pipe(parserStream).pipe(writeStream);
      });
      writeStream.on('close', function() {
        callback(data.favicon_generation_result);
      });
    });
  }

  exports.generate_favicon_markups = function(file, html_code, opts, callback) {
    var defaultRemove = [
      'link[rel="shortcut icon"]',
      'link[rel="icon"]',
      'link[rel^="apple-touch-icon"]',
      'link[rel="manifest"]',
      'meta[name^="msapplication"]',
      'meta[name="mobile-web-app-capable"]',
      'meta[property="og:image"]'
    ],
      add = typeof html_code === 'string' ? [html_code] : html_code,
      remove = defaultRemove;

    if (opts) {
      if (opts.add) {
        var optsAdd = typeof opts.add === 'string' ? [opts.add] : opts.add;
        add = add.concat(optsAdd);
      }
      if (opts.remove) {
        var optsRemove = typeof opts.remove === 'string' ? [opts.remove] : opts.remove;
        remove = remove.concat(optsRemove);
      }
    }

    metaparser({
      source: file,
      add: add,
      remove: remove,
      callback: function(error, html) {
        if (error) {
          throw error;
        }
        return callback(html);
      }
    });
  }

  return exports;
}
