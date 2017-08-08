
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const expect = require('chai').expect;

function createDocument() {
  var dom = new JSDOM('<!DOCTYPE html><head></head><body></body>');
  var document = dom.window.document;
  document.window = dom.window;
  document.window.jQuery = require('jquery')(document.window);
  return document;
}

function assertTag(domElement, tagName, attributes) {
  expect(domElement.tagName).to.eql(tagName);
  var i = 0;
  _.each(attributes, (value, key) => {
    expect(domElement.attributes[i].name).to.eql(key);
    expect(domElement.attributes[i].value).to.eql(value);
    i++;
  });
  expect(domElement.attributes.length).to.eql(i);
}

global.document = createDocument();
global.Drupal = {};
global.Drupal.AjaxCommands = function(){};
global.drupalSettings = {};
global.jQuery = global.document.window.jQuery;
global.Backbone = require('backbone');
global.Backbone.$ = global.jQuery;
global._ = require('underscore');

require('../editor_assets');

module.exports = {
  createDocument: createDocument,
  assertTag: assertTag,
};
