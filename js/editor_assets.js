
(function(Drupal, drupalSettings, $, _) {

  Drupal.editor_assets = {};

  Drupal.editor_assets.activeManagers = {};

  Drupal.editor_assets.createManager = function(id, initialAssets, document) {
    if (!initialAssets) {
      initialAssets = [];
    }
    return this.activeManagers[id] = new Drupal.editor_assets.AssetManager(initialAssets, {
      'document': document,
    });
  };

  Drupal.editor_assets.getManager = function(id) {
    return this.activeManagers[id];
  };

  Drupal.editor_assets.destroyManager = function(id) {
    delete this.activeManagers[id];
  };

  Drupal.editor_assets.InlineCssView = Backbone.View.extend({
    tagName: 'style',

    render: function() {
      this.$el.html(this.model.get('data'));
      return this;
    }
  });

  Drupal.editor_assets.FileCssView = Backbone.View.extend({
    tagName: 'link',

    render: function() {
      this.$el.attr('rel', 'stylesheet');
      this.$el.attr('type', 'text/css');
      this.$el.attr('href', this.model.get('data'));
      return this;
    }
  });

  Drupal.editor_assets.InlineJsView = Backbone.View.extend({
    tagName: 'script',

    render: function() {
      this.$el.attr('type', 'text/javascript');
      this.$el.html(this.model.get('data'));
      return this;
    }
  });

  Drupal.editor_assets.FileJsView = Backbone.View.extend({
    tagName: 'script',

    render: function() {
      this.$el.attr('type', 'text/javascript');
      this.$el.attr('src', this.model.get('data'));
      return this;
    }
  });

  Drupal.editor_assets.viewMap = {
    'css': {
      'inline': Drupal.editor_assets.InlineCssView,
      'file': Drupal.editor_assets.FileCssView,
    },
    'js': {
      'inline': Drupal.editor_assets.InlineJsView,
      'file': Drupal.editor_assets.FileJsView,
    },
  };


  Drupal.editor_assets.AssetLoadingQueue = function(document) {
    this.document = document;
    this._queue = [];
    this._isProcessing = false;
    this._isBlocking = false;
  }

  _.extend(Drupal.editor_assets.AssetLoadingQueue.prototype, {

    load: function(model) {
      this._queue.push(model);
      if (!this._isProcessing) {
        this._process();
      }
    },

    merge: function(model) {
      if (model.get('id') == 'settings') {
        var settings = model.previous('data');
        if (!settings) {
          settings = {};
        }
        $.extend(true, settings, model.get('data'));
        model.set('settings', settings, {silent: true});
        this.load(model);
      }
    },

    _process: function(lastModel) {
      this._isProcessing = true;

      if (lastModel) {
        lastModel.set({ loaded: true });
      }

      var model = this._queue.shift();

      if (model) {
        this._processModel(model);
      }

      if (!this._isBlocking && !this._queue.length) {
        this._isProcessing = false;
      }

      return this;
    },

    _processModel: function(model) {
      this._isBlocking = false;

      if (model.get('type') == 'settings') {
        if (this.document.window.drupalSettings) {
          $.extend(true, drupalSettings, model.get('data'));
        }
        else {
          this.document.window.drupalSettings = model.get('data');
        }
        return this._process(model);
      }
      else {
        var el = this._createTag(model);
        if (model.get('source') == 'file') {
          el.onload = el.onerror = _.bind(this._process, this, model);
          this._isBlocking = true;
        }

        var targetEl;
        if (model.get('location') == 'footer') {
          targetEl = this.document.body;
        }
        else {
          targetEl = this.document.head;
        }

        targetEl.appendChild(el);

        if (model.get('source') != 'file') {
          return this._process(model);
        }
      }

      return this;
    },

    _createTag: function(model) {
      return this._createView(model).render().el;
    },

    _createView: function(model) {
      return new Drupal.editor_assets.viewMap[model.get('type')][model.get('source')]({
        model: model,
      });
    }

  });

  Drupal.editor_assets.AssetManager = Backbone.Collection.extend({

    initialize: function(models, options) {
      if (options.document) {
        this.start(options.document);
      }
    },

    start: function(document) {
      this._loader = new Drupal.editor_assets.AssetLoadingQueue(document);
      this.document = document;
      this.forEach(function(model) {
        this._loader.load(model);
      }, this);
      this.on('add', this._loader.load, this._loader);
      this.on('update', this._loader.merge, this._loader);
    },

    stop: function() {
      this.off();
      delete this._loader;
      this.document = undefined;
    },

    attachBehaviors: function(context, settings) {
      if (this.document) {
        this.document.window.Drupal.attachBehaviors(context, settings);
      }
    },

    detachBehaviors: function(context, settings, trigger) {
      if (this.document) {
        this.document.window.Drupal.detachBehaviors(context, settings, trigger);
      }
    },

  });

  Drupal.AjaxCommands.prototype.add_editor_assets = function(ajax, response, status) {
    var manager = Drupal.editor_assets.getManager(response.editorId);
    if (manager) {
      manager.add(response.assets);
    }
  }

})(Drupal, drupalSettings, jQuery, _);
