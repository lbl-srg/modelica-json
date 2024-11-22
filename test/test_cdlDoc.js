const assert = require('assert')
const cheerio = require('cheerio')
const fs = require('bluebird').promisifyAll(require('fs'))
const logger = require('winston')
const math = require('mathjs')
const mocha = require('mocha')
const path = require('path')
const rewire = require('rewire')

// We use rewire to access private functions and test them
const cdlDoc = rewire('../lib/cdlDoc.js')
const expressionEvaluation = rewire('../lib/expressionEvaluation.js')

// Function to unset rewired functions after each test
let unset
mocha.afterEach(() => {
  if (unset != null) { unset.call() }
})

logger.level = 'error'
const unitData = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'units-si.json'), 'utf8'))

mocha.describe('cdlDoc', function () {
  mocha.describe('#sortDocSections()', function () {
    const sortDocSections = cdlDoc.__get__('sortDocSections')
    const doc = [
      { doc: '1', section: undefined },
      { doc: '2', section: '1.1' },
      { doc: '3', section: '1' },
      { doc: '8', section: '2.1.b' },
      { doc: '4', section: '1.1.b' },
      { doc: '5', section: undefined },
      { doc: '6', section: null },
      { doc: '7', section: '1.1.a' },
      { doc: '9', section: '2.' }
    ]
    const orderedDoc = [
      { doc: '1', section: undefined },
      { doc: '5', section: undefined },
      { doc: '6', section: null },
      { doc: '3', section: '1' },
      { doc: '2', section: '1.1' },
      { doc: '7', section: '1.1.a' },
      { doc: '4', section: '1.1.b' },
      { doc: '9', section: '2.' },
      { doc: '8', section: '2.1.b' }
    ]
    mocha.it('should return the given ordered array', function () {
      assert.deepStrictEqual(
        doc.sort(sortDocSections.bind(doc)),
        orderedDoc)
    })
  })

  mocha.describe('#convertUnit()', function () {
    const convertUnit = cdlDoc.__get__('convertUnit')
    mocha.it('should return the given array of converted units', function () {
      assert.deepStrictEqual(
        unitData.reduce((a, v) =>
          [...a, math.round(convertUnit(300, v.unit, v.displayUnit, unitData), 5)], []
        ),
        [26.85, 0.08333, 0.00008, 1080]
      )
    })
  })

  mocha.describe('#processImg()', function () {
    const processImg = cdlDoc.__get__('processImg')
    mocha.it('should return the absolute image path and modify the src attributes as expected', function () {
      const htmlStr = '<p align="center"><img src="modelica://Library/Resources/Image.png"' +
        'border="1" alt="Test image"/></p>'
      const $ = cheerio.load(htmlStr)
      const imgPath = path.resolve(
        path.join(process.cwd(), 'test', 'cdlDoc', 'Library', 'Resources', 'Image.png')
      )
      const libPath = path.join(process.cwd(), 'test', 'cdlDoc')
      process.env.MODELICAPATH = process.env.MODELICAPATH + `:${libPath}`
      assert.deepStrictEqual(
        processImg($),
        { 'Library_Resources_Image.png': imgPath }
      )
      assert.strictEqual(
        $.html(),
        '<html><head></head><body><p align="center">' +
        '<img src="img/Library_Resources_Image.png" border="1" alt="Test image"></p></body></html>'
      )
    })
  })

  mocha.describe('#processCdlToggle()', function () {
    const processCdlToggle = cdlDoc.__get__('processCdlToggle')
    mocha.it('should empty the span element', function () {
      const htmlStr = `<html><p>
      Controller for a radiant heating system.
      </p>
      <span><-- cdl(visible=controllerType <> CDL.Types.SimpleController.P) -->
      <p><b>Note:</b>
      For systems with high thermal mass, this controller should be left configured as a P-controller.
      </p><-- end cdl --></span>
      </html>`
      const $ = cheerio.load(htmlStr)
      const $1 = cheerio.load(htmlStr)
      processCdlToggle($, { controllerType: 'CDL.Types.SimpleController.P' })
      $1('span').empty()
      assert.strictEqual(
        $.html(),
        $1.html()
      )
    })
  })

  mocha.describe('#processHref()', function () {
    const processHref = cdlDoc.__get__('processHref')
    mocha.it('should modify the href attributes as expected', function () {
      const htmlStr = '<html><p>See <a href="modelica://Library.ControlBlock">Library.ControlBlock</a> ' +
        'and <a href="modelica://Library.ExternalControlBlock">Library.ExternalControlBlock</a></p></html>'
      const documentation = [
        {
          headingText: 'Heading',
          fullClassName: 'Library.ControlBlock',
          headingNum: '5'
        }
      ]
      const libPath = path.join(process.cwd(), 'test', 'cdlDoc')
      process.env.MODELICAPATH = process.env.MODELICAPATH + `:${libPath}`
      const $ = cheerio.load(htmlStr)
      processHref($, documentation)
      assert.strictEqual(
        $.html(),
        '<html><head></head><body><p>See Section&nbsp;<a href="#5heading"' +
        ' style="white-space: nowrap;">5</a> and <span style="color: grey;"' +
        ' id="Library.ExternalControlBlock"><a>Library.ExternalControlBlock</a></span></p></body></html>'
      )
    })
  })

  mocha.describe('#createAnchorId()', function () {
    const createAnchorId = cdlDoc.__get__('createAnchorId')
    mocha.it('should return "1.1heading-text"', function () {
      assert.strictEqual(
        createAnchorId('Heading Text', '1.1'),
        '1.1heading-text'
      )
    })
  })

  mocha.describe('#modifyInfo()', function () {
    const modifyInfo = cdlDoc.__get__('modifyInfo')
    const docElement = {
      instance: {
        name: 'frePro',
        protected: false,
        condition: null,
        cdlAnnotation: { section: '1.' }
      },
      descriptionString: 'Heading from description string',
      cdlAnnotation: { section: '1.2' },
      documentationInfo: '"<html>\n' +
        '<h4>Existing heading</h4>\n' +
        '<p>Documentation with <code>T + dT1 + dT2</code></p>\n' +
        '</html>"',
      headingIdx: 1,
      headingNum: '5'
    }
    const modifiedInfo = {
      html: '<h1><a name="3heading-from-description-stri"></a><!--[if !supportLists]--><span style="mso-list:Ignore">3.&nbsp;</span><!--[endif]-->Heading from description string</h1>\n' +
        '<h2><a name="3.1existing-heading"></a><!--[if !supportLists]--><span style="mso-list:Ignore">3.1.&nbsp;</span><!--[endif]-->Existing heading</h2>\n' +
        '\n' +
        '<p>Documentation with <code>T + dT1 + dT2</code>&nbsp;(22&nbsp;°C, adjustable)</p>\n',
      lastHeadingNum: '3.1'
    }
    mocha.it('should return the given HTML string', function () {
      assert.deepStrictEqual(
        modifyInfo(
          docElement,
          { 'frePro.T': 293.15, 'frePro.dT1': 'frePro.dT2', 'frePro.dT2': 1 },
          { 'frePro.T': { unit: 'K', displayUnit: 'degC' }, 'frePro.dT1': { unit: 'K' } },
          unitData,
          '2.1'
        ),
        modifiedInfo
      )
    })
  })

  mocha.describe('#buildDoc()', function () {
    mocha.it('should create the expected HTML document', function () {
      const outputDir = path.join(process.cwd(), 'tmp')
      const paramAndDoc = JSON.parse(fs.readFileSync(path.join(
        process.cwd(), 'test', 'cdlDoc', 'MultiZoneVavParamAndDoc.json'
      ), 'utf8'))
      unset = cdlDoc.__set__({
        expressionEvaluation: {
          ...expressionEvaluation,
          getParametersAndBindings: function () {
            return paramAndDoc
          }
        }
      })
      const jsons = JSON.parse(fs.readFileSync(path.join(
        process.cwd(), 'test', 'cdlDoc', 'MultiZoneVav.json'
      ), 'utf8'))
      cdlDoc.buildDoc(jsons[0], jsons, unitData, outputDir, /* includeVariables= */ true, 'MultiZoneVavDoc')
      const htmlDoc = fs.readFileSync(path.join(outputDir, 'MultiZoneVavDoc.html'))
      const htmlDocExp = fs.readFileSync(path.join(
        process.cwd(), 'test', 'cdlDoc', 'MultiZoneVavDoc.html'
      ))
      fs.rmSync(outputDir, { recursive: true, force: true })
      assert.strictEqual(
        cheerio.loadBuffer(htmlDoc).text(),
        cheerio.loadBuffer(htmlDocExp).text()
      )
    })
  })
})
