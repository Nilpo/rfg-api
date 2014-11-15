var api = require('./index.js').init();
var fs = require('fs');

api.generate_favicon_markups('test/index.html', '<link rel="icon" type="image/png" href="favicons/favicon-192x192.png" sizes="192x192"><link rel="icon" type="image/png" href="favicons/favicon-160x160.png" sizes="160x160">', function (code) {
  fs.writeFile('test/index-test.html', code, function (err) {
    if (err) {
      throw err;
    } else {
      console.log('Test complete.')
    }
  });
});
