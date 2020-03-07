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

module.exports = {
  loadUserConfig
}
