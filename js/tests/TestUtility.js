
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const expect = require('chai').expect;
const sinon = require('sinon');

function createDrupalSpy() {
  return {
    attachBehaviors: sinon.spy(),
    detachBehaviors: sinon.spy(),
  };
}

function createWindow() {
  var dom = new JSDOM('<!DOCTYPE html><head></head><body></body>');
  dom.window.jQuery = require('jquery')(dom.window);
  dom.window.Drupal = createDrupalSpy();
  return dom.window;
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

global.window = createWindow();
global.document = global.window.document;
global.Drupal = {};
global.Drupal.AjaxCommands = function(){};
global.drupalSettings = {};
global.jQuery = global.window.jQuery;
global.Backbone = require('backbone');
global.Backbone.$ = global.jQuery;
global._ = require('underscore');

require('../editor_assets');

module.exports = {
  createWindow: createWindow,
  assertTag: assertTag
};
