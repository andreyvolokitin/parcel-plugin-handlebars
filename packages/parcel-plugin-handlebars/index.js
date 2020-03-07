'use strict'

/* -----------------------------------------------------------------------------
 * parcel-plugin-handlebars
 * -------------------------------------------------------------------------- */

module.exports = bundler => {
  bundler.addAssetType('hbs', require.resolve('./lib/HbsAsset'))
  bundler.addAssetType('handlebars', require.resolve('./lib/HbsAsset'))
  bundler.addAssetType('html', require.resolve('./lib/HbsAsset'))
}
