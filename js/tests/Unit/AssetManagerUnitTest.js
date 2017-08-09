
const utility = require('../TestUtility');
const expect = require('chai').expect;
const assert = require('chai').assert;

describe('AssetManagerUnitTest::attachBehaviors', () => {

  it('should attach behaviors immediately when no dependencies are loading', function() {
    var window = utility.createWindow();
    var assetManager = new Drupal.editor_assets.AssetManager();
    assetManager.window = window;
    assetManager.attachBehaviors();
    assert(window.Drupal.attachBehaviors.calledOnce);
  });

  it('should attach behaviors only after all other dependencies are loaded', function() {
    var window = utility.createWindow();
    var assetManager = new Drupal.editor_assets.AssetManager([
      {
        id: 'test',
      },
    ]);
    assetManager.window = window;
    assetManager.attachBehaviors();
    assert(window.Drupal.attachBehaviors.notCalled);
    assetManager.get('test').set({'loaded': true});
    assert(window.Drupal.attachBehaviors.calledOnce);
  });

});
