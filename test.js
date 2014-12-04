var api = require('./index.js').init();
var fs = require('fs');

var url = 'test/index.html';
var markup = [
  '<link rel="icon" type="image/png" href="favicons/favicon-192x192.png" sizes="192x192">',
  '<link rel="icon" type="image/png" href="favicons/favicon-160x160.png" sizes="160x160">'
];
var opts = {
  add: '<link rel="author" href="humans.txt" />',
  remove: [
    'link[href="favicons/favicon-192x192.png"]',
    'link[href="favicons/favicon-160x160.png"]'
  ]
};

api.generate_favicon_markups(url, markup, opts, function (code) {
  fs.writeFile('test/index-test.html', code, function (err) {
    if (err) {
      throw err;
    } else {
      console.log('Test complete.')
    }
  });
});
