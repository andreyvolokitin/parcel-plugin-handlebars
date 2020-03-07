'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
const frontMatter = require('front-matter')
const Handlebars = require('handlebars')
const handlebarsWax = require('handlebars-wax')
const handlebarsLayouts = require('handlebars-layouts')
const handlebarsHelpersPackage = require('handlebars-helpers')
const HTMLAsset = require('parcel-bundler/src/assets/HTMLAsset')
const glob = require('globby')

// lib
const { loadUserConfig } = require('./utils')

/* -----------------------------------------------------------------------------
 * configure handlebars/handlebars-wax
 * -------------------------------------------------------------------------- */

const handlebars = Handlebars.create()
handlebarsHelpersPackage({ handlebars })

const config = {
  data: 'src/markup/data/**/*.{json,js}',
  decorators: 'src/markup/decorators/**/*.js',
  helpers: 'src/markup/helpers/**/*.js',
  layouts: 'src/markup/layouts/**/*.{hbs,handlebars,js}',
  partials: 'src/markup/partials/**/*.{hbs,handlebars,js}',
  ...loadUserConfig()
}

const wax = handlebarsWax(handlebars)
  .helpers(handlebarsLayouts)
  .helpers(config.helpers)
  .data(config.data)
  .decorators(config.decorators)
  .partials(config.layouts)
  .partials(config.partials)

/* -----------------------------------------------------------------------------
 * HbsAsset
 * -------------------------------------------------------------------------- */

class HbsAsset extends HTMLAsset {
  processSingleDependency (path, opts) {
    if (path) {
      return super.processSingleDependency(path, opts)
    }
  }

  parse (code) {
    glob
      .sync(Object.values(config))
      .forEach(path => this.addDependency(path, { includedInParent: true }))

    const { attributes, body } = frontMatter(code)
    const { NODE_ENV } = process.env

    return super.parse(wax.compile(body)({ NODE_ENV, ...attributes }))
  }
}

module.exports = HbsAsset
