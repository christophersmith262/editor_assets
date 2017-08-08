
const utility = require('../TestUtility');
const expect = require('chai').expect;

describe('AssetLoadingQueue::construct', () => {

  it('should be callable', function() {
    var document = utility.createDocument();
    var loader = new Drupal.editor_assets.AssetLoadingQueue(document);
  });

});

describe('AssetLoadingQueue::load', () => {

  it('should load javascript files to the document footer', function() {
    var document = utility.createDocument();
    var loader = new Drupal.editor_assets.AssetLoadingQueue(document);

    loader.load(new Backbone.Model({
      'type': 'js',
      'data': '/test.js',
      'source': 'file',
      'location': 'footer',
    }));
    utility.assertTag(document.body.firstChild, 'SCRIPT', {
      'type': 'text/javascript',
      'src': '/test.js',
    });
  });

  it('should load css files to the document footer', function() {
    var document = utility.createDocument();
    var loader = new Drupal.editor_assets.AssetLoadingQueue(document);

    loader.load(new Backbone.Model({
      'type': 'css',
      'data': '/test2.css',
      'source': 'file',
      'location': 'footer',
    }));
    utility.assertTag(document.body.firstChild, 'LINK', {
      'rel': 'stylesheet',
      'type': 'text/css',
      'href': '/test2.css',
    });
  });

  it('should load javascript files to the document header', function() {
    var document = utility.createDocument();
    var loader = new Drupal.editor_assets.AssetLoadingQueue(document);

    loader.load(new Backbone.Model({
      'type': 'js',
      'data': '/test3.js',
      'source': 'file',
      'location': 'header',
    }));
    utility.assertTag(document.head.firstChild, 'SCRIPT', {
      'type': 'text/javascript',
      'src': '/test3.js',
    });

  });

  it('should load css files to the document header', function() {
    var document = utility.createDocument();
    var loader = new Drupal.editor_assets.AssetLoadingQueue(document);

    loader.load(new Backbone.Model({
      'type': 'css',
      'data': '/test4.css',
      'source': 'file',
      'location': 'header',
    }));
    utility.assertTag(document.head.firstChild, 'LINK', {
      'rel': 'stylesheet',
      'type': 'text/css',
      'href': '/test4.css',
    });
  });

  it('should load assets synchronosly', function() {
    var document = utility.createDocument();
    var loader = new Drupal.editor_assets.AssetLoadingQueue(document);

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

    expect(document.body.childElementCount).to.eql(1);
    expect(document.head.childElementCount).to.eql(0);
    utility.assertTag(document.body.firstChild, 'SCRIPT', {
      'type': 'text/javascript',
      'src': '/test5.js',
    });

    var event=document.createEvent("Event");
    event.initEvent("load", false, false);
    document.body.firstChild.dispatchEvent(event);

    expect(document.body.childElementCount).to.eql(1);
    expect(document.head.childElementCount).to.eql(1);
    utility.assertTag(document.head.firstChild, 'LINK', {
      'rel': 'stylesheet',
      'type': 'text/css',
      'href': '/test6.css',
    });

    var event=document.createEvent("Event");
    event.initEvent("error", false, false);
    document.head.firstChild.dispatchEvent(event);
    expect(document.body.childElementCount).to.eql(1);
    expect(document.head.childElementCount).to.eql(2);
    utility.assertTag(document.head.lastChild, 'SCRIPT', {
      'type': 'text/javascript',
      'src': '/test7.js',
    });
  });

});

describe('AssetLoadingQueue::merge', () => {

  it('should initialize drupalSettings when it does not already exist', function() {
    var document = utility.createDocument();
    var loader = new Drupal.editor_assets.AssetLoadingQueue(document);

    var testSettings = {
      'initial': 'value',
    };
    loader.load(new Backbone.Model({
      'id': 'settings',
      'type': 'settings',
      'data': testSettings,
    }));

    expect(document.window.drupalSettings).to.eql(testSettings);
  });

  it('should merge drupalSettings when it already exists', function() {
    var document = utility.createDocument();
    var loader = new Drupal.editor_assets.AssetLoadingQueue(document);

    var testSettings = {
      'initial': 'value',
    };
    var settingsModel = new Backbone.Model({
      'id': 'settings',
      'type': 'settings',
      'data': testSettings,
    });

    loader.merge(settingsModel);
    expect(document.window.drupalSettings).to.eql(testSettings);

    var otherSettings = {
      'more': 'settings',
    };
    settingsModel.set({
      'data': otherSettings,
    });
    loader.merge(settingsModel);
    expect(document.window.drupalSettings).to.eql(jQuery.merge(testSettings, otherSettings, true));
    expect(settingsModel.get('settings')).to.eql(jQuery.merge(testSettings, otherSettings, true));
  });

});
