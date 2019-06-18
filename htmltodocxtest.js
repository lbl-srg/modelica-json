var HtmlDocx = require('html-docx-js');
var fs = require('fs');

var inputFile = '/home/lisarivalin/Projects/modelica-json/docx/FromModelica.Modulation-docx.html'
var outputFile = 'encoding.docx'

fs.readFile(inputFile, 'utf-8', function(err, html) {
  if (err) throw err;

  var docx = HtmlDocx.asBlob(html);
  fs.writeFile(outputFile, docx, function(err) {
    if (err) throw err;
  });
});
