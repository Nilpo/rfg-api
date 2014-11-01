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
  var cheerio = require('cheerio');
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

  exports.generate_favicon_markups = function(file, html_code) {
    var content = fs.readFileSync(file);

    // The following lines were inspired by https://github.com/gleero/grunt-favicons and https://github.com/haydenbleasel/favicons
    var $ = cheerio.load(content);
    var html = $.html().replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '').replace(/\s+/g, ' ');
    if (html === '') {
        $ = cheerio.load('');
    }

    // Removing exists favicon from HTML
    $('link[rel="shortcut icon"]').remove();
    $('link[rel="icon"]').remove();
    $('link[rel="apple-touch-icon"]').remove();
    $('link[rel="apple-touch-icon-precomposed"]').remove();
    $('meta').each(function(i, elem) {
      var name = $(this).attr('name');
      if (name && (name === 'msapplication-TileImage' ||
                name === 'msapplication-TileColor' ||
                name.indexOf('msapplication-square') >= 0)) {
        $(this).remove();
      }
    });

    if ($('head').length > 0) {
      $('head').append(html_code);
    }
    else {
      $.root().append(html_code);
    }

    return $.html();
  }

  return exports;
}
