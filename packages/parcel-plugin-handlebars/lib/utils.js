'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// core
const fs = require('fs')
const path = require('path')

/* -----------------------------------------------------------------------------
 * utils
 * -------------------------------------------------------------------------- */

function loadUserConfig () {
  const file = path.resolve(process.cwd(), 'handlebars.config.js')
  const flavors = [
    file,
    file.replace('.js', '.json'),
    file.replace('handlebars.', 'hbs.'),
    file.replace('handlebars.', 'hbs.').replace('.js', '.json')
  ]

  if (fs.existsSync(flavors[0])) {
    return require(flavors[0])
  }

  if (fs.existsSync(flavors[1])) {
    return JSON.parse(fs.readFileSync(flavors[1], { encoding: 'utf-8' }))
  }

  if (fs.existsSync(flavors[2])) {
    return require(flavors[2])
  }

  if (fs.existsSync(flavors[3])) {
    return JSON.parse(fs.readFileSync(flavors[3], { encoding: 'utf-8' }))
  }

  return {}
}

const parseSimpleLayout = (str, opts) => {
  const layoutPattern = /{{!<\s+([A-Za-z0-9._\-/]+)\s*}}/
  const matches = str.match(layoutPattern)

  if (matches) {
    let layout = matches[1]

    if (opts.layouts && layout[0] !== '.') {
      layout = path.resolve(opts.layouts, layout)
    }

    const hbsLayout = path.resolve(process.cwd(), `${layout}.hbs`)

    if (fs.existsSync(hbsLayout)) {
      const content = fs.readFileSync(hbsLayout, { encoding: 'utf-8' })
      return content.replace('{{{body}}}', {
        dependencies: [hbsLayout],
        content: str
      })
    }

    const handlebarsLayout = hbsLayout.replace('.hbs', '.handlebars')

    if (fs.existsSync(handlebarsLayout)) {
      const content = fs.readFileSync(handlebarsLayout, { encoding: 'utf-8' })
      return content.replace('{{{body}}}', {
        dependencies: [handlebarsLayout],
        content: str
      })
    }
  }

  return { dependencies: [], content: str }
}

module.exports = {
  loadUserConfig,
  parseSimpleLayout
}
