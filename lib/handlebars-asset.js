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
const { cosmiconfigSync } = require('cosmiconfig')

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
    const { config: userConfig, filepath: configFilePath } =
      cosmiconfigSync('handlebars').search() || {}

    if (configFilePath) {
      this.addDependency(configFilePath, { includedInParent: true })
    }

    const handlebars = Handlebars.create()
    handlebarsHelpersPackage({ handlebars })

    const config = {
      data: 'src/data/**/*.{json,js}',
      decorators: 'src/decorators/**/*.js',
      helpers: 'src/helpers/**/*.js',
      layouts: 'src/layouts/**/*.{hbs,handlebars,js}',
      partials: 'src/partials/**/*.{hbs,handlebars,js}',
      ...userConfig
    }

    const wax = handlebarsWax(handlebars)
      .helpers(handlebarsLayouts)
      .helpers(config.helpers)
      .data(config.data)
      .decorators(config.decorators)
      .partials(config.layouts, config.partialsOptions)
      .partials(config.partials, config.partialsOptions)

    delete config.partialsOptions;

    glob
      .sync(Object.values(config))
      .forEach(path => this.addDependency(path, { includedInParent: true }))

    const { attributes, body } = frontMatter(code)
    const { NODE_ENV } = process.env

    return super.parse(wax.compile(body)({ NODE_ENV, ...attributes }))
  }
}

module.exports = HbsAsset
