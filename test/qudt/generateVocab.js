/*
 * Generates test/qudt/qudt-vocab.json from a pinned QUDT release.
 *
 * Usage, from the root directory of the repository:
 *   node test/qudt/generateVocab.js
 */
'use strict'
const fs = require('fs')
const https = require('https')
const path = require('path')

const QUDT_VERSION = 'v3.1.11'
const BASE_URL = `https://raw.githubusercontent.com/qudt/qudt-public-repo/${QUDT_VERSION}/src/main/rdf/vocab`
const UNITS_URL = `${BASE_URL}/unit/VOCAB_QUDT-UNITS-ALL.ttl`
const QUANTITY_KINDS_URL = `${BASE_URL}/quantitykinds/VOCAB_QUDT-QUANTITY-KINDS-ALL.ttl`
const OUT_FILE = path.join(__dirname, 'qudt-vocab.json')

function fetchUrl (url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch ${url}: HTTP ${res.statusCode}`))
        res.resume()
        return
      }
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    }).on('error', reject)
  })
}

function parseTurtleVocab (ttl, prefix) {
  const prefixMatch = ttl.match(new RegExp(`@prefix\\s+${prefix}:\\s*<([^>]+)>`))
  if (!prefixMatch) {
    throw new Error(`Could not find @prefix ${prefix}: declaration in Turtle file`)
  }
  const namespaceUri = prefixMatch[1]
  const vocab = {}
  const blockRegex = new RegExp(`\\n(?=${prefix}:[A-Za-z0-9_-]+\\s)`)
  const subjectRegex = new RegExp(`^${prefix}:([A-Za-z0-9_-]+)\\s`)
  const replacedByRegex = new RegExp(`dcterms:isReplacedBy\\s+(?:${prefix}:)?([A-Za-z0-9_:-]+)`)
  const blocks = ttl.split(blockRegex)

  for (const block of blocks) {
    const match = block.match(subjectRegex)
    if (!match) continue
    const fullUri = namespaceUri + match[1]
    const entry = {}
    if (/(?:qudt|owl):deprecated\s+true\b/.test(block)) {
      entry.deprecated = true
      const repMatch = block.match(replacedByRegex)
      if (repMatch) {
        entry.replacedBy = namespaceUri + repMatch[1]
      }
    }
    vocab[fullUri] = entry
  }

  const sorted = {}
  for (const key of Object.keys(vocab).sort()) {
    sorted[key] = vocab[key]
  }
  return sorted
}

async function main () {
  const [unitsTtl, quantityKindsTtl] = await Promise.all([
    fetchUrl(UNITS_URL),
    fetchUrl(QUANTITY_KINDS_URL)
  ])
  const data = {
    qudtVersion: QUDT_VERSION,
    units: parseTurtleVocab(unitsTtl, 'unit'),
    quantityKinds: parseTurtleVocab(quantityKindsTtl, 'quantitykind')
  }
  fs.writeFileSync(OUT_FILE, JSON.stringify(data, null, 2) + '\n')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
