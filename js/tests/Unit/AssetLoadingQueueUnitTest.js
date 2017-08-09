
const utility = require('../TestUtility');
const expect = require('chai').expect;

describe('AssetLoadingQueue::construct', () => {

  it('should be callable', function() {
    var window = utility.createWindow();
    var loader = new Drupal.editor_assets.AssetLoadingQueue(window);
  });

});

describe('AssetLoadingQueue::load', () => {

  it('should load javascript files to the window.document footer', function() {
    var window = utility.createWindow();
    var loader = new Drupal.editor_assets.AssetLoadingQueue(window);

    loader.load(new Backbone.Model({
      'type': 'js',
      'data': '/test.js',
      'source': 'file',
      'location': 'footer',
    }));
    utility.assertTag(window.document.body.firstChild, 'SCRIPT', {
      'type': 'text/javascript',
      'src': '/test.js',
    });
  });

  it('should load css files to the window.document footer', function() {
    var window = utility.createWindow();
    var loader = new Drupal.editor_assets.AssetLoadingQueue(window);

    loader.load(new Backbone.Model({
      'type': 'css',
      'data': '/test2.css',
      'source': 'file',
      'location': 'footer',
    }));
    utility.assertTag(window.document.body.firstChild, 'LINK', {
      'rel': 'stylesheet',
      'type': 'text/css',
      'href': '/test2.css',
    });
  });

  it('should load javascript files to the window.document header', function() {
    var window = utility.createWindow();
    var loader = new Drupal.editor_assets.AssetLoadingQueue(window);

    loader.load(new Backbone.Model({
      'type': 'js',
      'data': '/test3.js',
      'source': 'file',
      'location': 'header',
    }));
    utility.assertTag(window.document.head.firstChild, 'SCRIPT', {
      'type': 'text/javascript',
      'src': '/test3.js',
    });

  });

  it('should load css files to the window.document header', function() {
    var window = utility.createWindow();
    var loader = new Drupal.editor_assets.AssetLoadingQueue(window);

    loader.load(new Backbone.Model({
      'type': 'css',
      'data': '/test4.css',
      'source': 'file',
      'location': 'header',
    }));
    utility.assertTag(window.document.head.firstChild, 'LINK', {
      'rel': 'stylesheet',
      'type': 'text/css',
      'href': '/test4.css',
    });
  });

  it('should load assets synchronosly', function() {
    var window = utility.createWindow();
    var loader = new Drupal.editor_assets.AssetLoadingQueue(window);

    loader.load(new Backbone.Model({
      'type': 'js',
      'data': '/test5.js',
      'source': 'file',
      'location': 'footer',
    }));
    loader.load(new Backbone.Model({
      'type': 'css',
      'data': '/test6.css',
      'source': 'file',
      'location': 'header',
    }));
    loader.load(new Backbone.Model({
      'type': 'js',
      'data': '/test7.js',
      'source': 'file',
      'location': 'header',
    }));

    expect(window.document.body.childElementCount).to.eql(1);
    expect(window.document.head.childElementCount).to.eql(0);
    utility.assertTag(window.document.body.firstChild, 'SCRIPT', {
      'type': 'text/javascript',
      'src': '/test5.js',
    });

    var event=window.document.createEvent("Event");
    event.initEvent("load", false, false);
    window.document.body.firstChild.dispatchEvent(event);

    expect(window.document.body.childElementCount).to.eql(1);
    expect(window.document.head.childElementCount).to.eql(1);
    utility.assertTag(window.document.head.firstChild, 'LINK', {
      'rel': 'stylesheet',
      'type': 'text/css',
      'href': '/test6.css',
    });

    var event=window.document.createEvent("Event");
    event.initEvent("error", false, false);
    window.document.head.firstChild.dispatchEvent(event);
    expect(window.document.body.childElementCount).to.eql(1);
    expect(window.document.head.childElementCount).to.eql(2);
    utility.assertTag(window.document.head.lastChild, 'SCRIPT', {
      'type': 'text/javascript',
      'src': '/test7.js',
    });
  });

});

describe('AssetLoadingQueue::merge', () => {

  it('should initialize drupalSettings when it does not already exist', function() {
    var window = utility.createWindow();
    var loader = new Drupal.editor_assets.AssetLoadingQueue(window);

    var testSettings = {
      'initial': 'value',
    };
    loader.load(new Backbone.Model({
      'id': 'settings',
      'type': 'settings',
      'data': testSettings,
    }));

    expect(window.drupalSettings).to.eql(testSettings);
  });

  it('should merge drupalSettings when it already exists', function() {
    var window = utility.createWindow();
    var loader = new Drupal.editor_assets.AssetLoadingQueue(window);

    var testSettings = {
      'initial': 'value',
    };
    var settingsModel = new Backbone.Model({
      'id': 'settings',
      'type': 'settings',
      'data': testSettings,
    });

    loader.merge(settingsModel);
    expect(window.drupalSettings).to.eql(testSettings);

    var otherSettings = {
      'more': 'settings',
    };
    settingsModel.set({
      'data': otherSettings,
    });
    loader.merge(settingsModel);
    expect(window.drupalSettings).to.eql(jQuery.merge(testSettings, otherSettings, true));
    expect(settingsModel.get('settings')).to.eql(jQuery.merge(testSettings, otherSettings, true));
  });

});
