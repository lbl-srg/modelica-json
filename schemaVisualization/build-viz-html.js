#!/usr/bin/env node
/**
 * build-viz-html.js
 *
 * Generates self-contained cdl-viz.html and modelica-viz.html by inlining
 * all local CSS and JS files directly into the HTML.
 *
 * This is required because html-preview.github.io fetches relative script
 * files from raw.githubusercontent.com, which serves them with
 * Content-Type: text/plain + X-Content-Type-Options: nosniff.
 * Modern browsers refuse to execute scripts with a non-JS MIME type when
 * nosniff is set, so all external .js files silently fail to load.
 * Inlining the content avoids this restriction entirely.
 *
 * Usage (from project root):
 *   npm run generate-schema-js   # updates schema-cdl.js / schema-modelica.js
 *   node schemaVisualization/build-viz-html.js
 *
 * Or via the combined npm script:
 *   npm run build-viz
 */

'use strict'

const fs = require('fs')
const path = require('path')

const vizDir = path.join(__dirname)
const rootDir = path.join(__dirname, '..')

// Read shared local files
const jsvCss = fs.readFileSync(path.join(vizDir, 'css', 'jsv.css'), 'utf8')
const appCss = fs.readFileSync(path.join(vizDir, 'css', 'app.css'), 'utf8')
const jsvJs = fs.readFileSync(path.join(vizDir, 'js', 'jsv.js'), 'utf8')
const refParserJs = fs.readFileSync(path.join(vizDir, 'js', 'ref-parser.min.js'), 'utf8')
const appJs = fs.readFileSync(path.join(vizDir, 'js', 'app.js'), 'utf8')

function buildHtml (schemaVarName, schemaJs, schemaLabel) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
    <title>JSON Schema Viewer</title>

    <!-- Bootstrap -->
    <link href="https://fonts.googleapis.com/css?family=Open+Sans|PT+Sans" rel="stylesheet">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
    <!-- Inlined local CSS.
         Raw.githubusercontent.com serves files as text/plain + nosniff, so
         <link href="...css"> from that origin would be ignored by the browser.
         Inlining avoids this restriction. -->
    <style>
${jsvCss}
    </style>
    <style>
${appCss}
    </style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/nprogress/0.2.0/nprogress.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/nprogress/0.2.0/nprogress.min.js"></script>

  </head>
  <body>

    <!-- Nav/Toolbar -->
    <div class="btn-group" id="app-toolbar">
        <button id="visualizeButton" type="button" class="btn btn-default"><span class="glyphicon glyphicon-eye-open"> </span> Visualize</button>
        <button id="sourceButton" type="button" class="btn btn-default"><span class="glyphicon glyphicon-align-left"> </span> Source</button>
    </div>

    <!-- JSV -->
    <div id="main-body"></div>

    <!-- Editor -->
    <div id="editor">
      <pre id="json"></pre>
    </div>

    <div id="legend-container">
        <div id="legend">
            <h3 class="ui-mini">Legend</h3>
            <hr />
            <div id="legend-items">
            </div>
        </div>
    </div>

    <script>
      NProgress.start();
    </script>

    <!-- Inlined schema data and local JS.
         Raw.githubusercontent.com serves .js files as text/plain + nosniff.
         Browsers refuse to execute <script src="...js"> with that MIME type.
         Inlining avoids this restriction; works on file://, any HTTP server,
         and html-preview.github.io without any fetch() calls. -->
    <script>
${schemaJs}
    </script>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.0/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.5/ace.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.5/mode-json.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.5/theme-chrome.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.15.0/lodash.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.17/d3.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/tv4/1.2.7/tv4.min.js"></script>

    <!-- Inlined local JS libraries -->
    <script>
${jsvJs}
    </script>
    <script>
${refParserJs}
    </script>
    <script>
${appJs}
    </script>

    <script type="text/javascript">
    // Schema is always available inline via ${schemaVarName}.
    // No fetch() needed; works under file://, http://, https://, and htmlpreview.
    if (typeof window.${schemaVarName} !== 'undefined') {
      appInitWithSchema(JSON.stringify(window.${schemaVarName}, null, 4));
      NProgress.done();
    } else {
      NProgress.done();
      document.getElementById('main-body').innerHTML =
        '<div style="padding:2em;font-family:sans-serif;">' +
        '<h3>&#9888; Schema data missing</h3>' +
        '<p>The inline schema data (window.${schemaVarName}) is not defined. ' +
        'This file should be regenerated from the project root:</p>' +
        '<pre style="background:#f4f4f4;padding:1em;border-radius:4px;">' +
        'npm run build-viz' +
        '</pre></div>';
    }
    </script>
  </body>
</html>
`
}

// ── CDL ──────────────────────────────────────────────────────────────────────
const schemaCdlJs = fs.readFileSync(path.join(vizDir, 'schema-cdl.js'), 'utf8')
const cdlHtml = buildHtml('__CDL_SCHEMA__', schemaCdlJs, 'CDL')
fs.writeFileSync(path.join(vizDir, 'cdl-viz.html'), cdlHtml, 'utf8')
console.log('Written: schemaVisualization/cdl-viz.html (' + (cdlHtml.length / 1024).toFixed(1) + ' KB)')

// ── Modelica ──────────────────────────────────────────────────────────────────
const schemaModelicaJs = fs.readFileSync(path.join(vizDir, 'schema-modelica.js'), 'utf8')
const modelicaHtml = buildHtml('__MODELICA_SCHEMA__', schemaModelicaJs, 'Modelica')
fs.writeFileSync(path.join(vizDir, 'modelica-viz.html'), modelicaHtml, 'utf8')
console.log('Written: schemaVisualization/modelica-viz.html (' + (modelicaHtml.length / 1024).toFixed(1) + ' KB)')