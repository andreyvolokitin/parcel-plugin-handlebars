'use strict'

const path = require('path');
const glob = require('globby');
const frontMatter = require('front-matter');

const Transformer = require('@parcel/plugin');

// const Handlebars = require('handlebars')
// const handlebarsWax = require('handlebars-wax');
// const handlebarsLayouts = require('handlebars-layouts');
// const handlebarsHelpersPackage = require('handlebars-helpers');


const transformer = new Transformer({
  async getConfig({asset}) {
    const config = await asset.getConfig([
      '.handlebars',
      '.handlebars.js',
      'handlebars.config.js'
    ]);
    return config || {};
  },

  async transform({asset, config, options}) {
    if (!config) {
      return [asset];
    }

    const Handlebars = await options.packageManager.require('handlebars', asset.filePath);
    const handlebarsWax = await options.packageManager.require('handlebars-wax', asset.filePath);
    const handlebarsLayouts = await options.packageManager.require('handlebars-layouts', asset.filePath);
    const handlebarsHelpersPackage = await options.packageManager.require('handlebars-helpers', asset.filePath);

    const content = await asset.getCode();

    const handlebars = Handlebars.create();
    handlebarsHelpersPackage({ handlebars });

    const cfg = {
      data: 'src/data/**/*.{json,js}',
      decorators: 'src/decorators/**/*.js',
      helpers: 'src/helpers/**/*.js',
      layouts: 'src/layouts/**/*.{hbs,handlebars,js}',
      partials: 'src/partials/**/*.{hbs,handlebars,js}',
      ...config
    };

    const wax = handlebarsWax(handlebars)
      .helpers(handlebarsLayouts)
      .helpers(cfg.helpers)
      .data(cfg.data)
      .decorators(cfg.decorators)
      .partials(cfg.layouts, cfg.partialsOptions)
      .partials(cfg.partials, cfg.partialsOptions);

    delete cfg.partialsOptions;

    // glob
    //   .sync(Object.values(cfg))
    //   .forEach(path => this.addDependency(path, { includedInParent: true }));

    const { attributes, body } = frontMatter(content);
    const { NODE_ENV } = process.env;

    const render = wax.compile(body)({ NODE_ENV, ...attributes });

    // for (let filePath of render.dependencies) {
    //   await asset.addIncludedFile({filePath});
    // }

    asset.type = 'html';
    asset.setCode(render);

    return [asset];
  }
});

module.exports = transformer;

/* -----------------------------------------------------------------------------
 * HbsAsset
 * -------------------------------------------------------------------------- */
// //
// // class HbsTransformer extends HTMLTransformer {
// //   processSingleDependency (path, opts) {
// //     if (path) {
// //       return super.processSingleDependency(path, opts)
// //     }
// //   }
// //
// //   parse (code) {
// //     const handlebars = Handlebars.create()
// //     handlebarsHelpersPackage({ handlebars })
// //
// //     const cfg = {
// //       data: 'src/data/**/*.{json,js}',
// //       decorators: 'src/decorators/**/*.js',
// //       helpers: 'src/helpers/**/*.js',
// //       layouts: 'src/layouts/**/*.{hbs,handlebars,js}',
// //       partials: 'src/partials/**/*.{hbs,handlebars,js}',
// //       ...config
// //     }
// //
// //     const wax = handlebarsWax(handlebars)
// //       .helpers(handlebarsLayouts)
// //       .helpers(cfg.helpers)
// //       .data(cfg.data)
// //       .decorators(cfg.decorators)
// //       .partials(cfg.layouts, cfg.partialsOptions)
// //       .partials(cfg.partials, cfg.partialsOptions)
// //
// //     delete cfg.partialsOptions;
// //
// //     glob
// //       .sync(Object.values(cfg))
// //       .forEach(path => this.addDependency(path, { includedInParent: true }))
// //
// //     const { attributes, body } = frontMatter(code)
// //     const { NODE_ENV } = process.env
// //
// //     return super.parse(wax.compile(body)({ NODE_ENV, ...attributes }))
// //   }
// // }
//
// module.exports = HbsTransformer
