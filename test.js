var pandoc = require('node-pandoc'),
    src = '<h1>Hello</h1><p>It&rsquo;s bananas</p>',
    // Arguments in either a single String or as an Array:
    args = '-f html -t docx -o word.docx';
 
// Set your callback function
callback = function (err, result) {
  if (err) console.error('Oh Nos: ',err);
  // Without the -o arg, the converted value will be returned.
  return console.log(result), result;
};
 
// Call pandoc
// pandoc(src, args, callback);
pandoc(src, args);