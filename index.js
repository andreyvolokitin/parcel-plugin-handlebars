'use strict'

const path = require('path');
const glob = require('globby');
const frontMatter = require('front-matter');
const { Transformer } = require('@parcel/plugin');
const Handlebars = require('handlebars')
const handlebarsWax = require('handlebars-wax');
const handlebarsLayouts = require('handlebars-layouts');
const handlebarsHelpersPackage = require('handlebars-helpers');

const transformer = new Transformer({
  async loadConfig({ config }) {
    const conf = await config.getConfig(['handlebars.config.js']);
    const contents = {};

    if (conf) {
      config.shouldInvalidateOnStartup();
      Object.assign(contents, conf.contents);
    }

    config.setResult(contents);
  },

  async transform({asset, config, options, resolve}) {
    if (!config) {
      return [asset];
    }

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

    const { attributes, body } = frontMatter(content);
    const { NODE_ENV } = process.env;
    const resolvedDepsPaths = glob.sync(Object.values(cfg));

    for (let filePath of resolvedDepsPaths) {
      await asset.addIncludedFile(path.resolve(filePath));
    }

    const render = wax.compile(body)({ NODE_ENV, ...attributes });

    asset.type = 'html';
    asset.setCode(render);

    return [asset];
  }
});

module.exports = transformer;
