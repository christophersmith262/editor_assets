
(function(Drupal, drupalSettings, $, _) {

  Drupal.editor_assets = {};

  Drupal.editor_assets.activeManagers = {};

  Drupal.editor_assets.createManager = function(id, initialAssets, window) {
    if (!initialAssets) {
      initialAssets = [];
    }
    return this.activeManagers[id] = new Drupal.editor_assets.AssetManager(initialAssets, {
      'window': window,
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


  Drupal.editor_assets.AssetLoadingQueue = function(window) {
    this.window = window;
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
        if (this.window.drupalSettings) {
          $.extend(true, drupalSettings, model.get('data'));
        }
        else {
          this.window.drupalSettings = model.get('data');
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
          targetEl = this.window.document.body;
        }
        else {
          targetEl = this.window.document.head;
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
      if (options && options.window) {
        this.start(options.window, options.loader);
      }
    },

    start: function(window, loader) {
      if (!loader) {
        loader = new Drupal.editor_assets.AssetLoadingQueue(window);
      }
      this._loader = loader;
      this.window = window;
      this.forEach(function(model) {
        this._loader.load(model);
      }, this);
      this.on('add', this._loader.load, this._loader);
      this.on('update', this._loader.merge, this._loader);
    },

    stop: function() {
      this.off();
      this._loader = undefined;
      this.window = undefined;
    },

    attachBehaviors: function(context, settings) {
      this._do('attachBehaviors', context, settings);
    },

    detachBehaviors: function(context, settings, trigger) {
      this._do('detachBehaviors', context, settings, trigger);
    },

    _do: function(callback, context, drupalSettings, trigger) {
      var doIfReady = _.bind(this._doIfReady, this, callback, context, drupalSettings, trigger);
      if (!doIfReady()) {
        this.on('change:loaded', doIfReady, this);
      }
    },

    _doIfReady: function(callback, context, drupalSettings, trigger) {
      if (this._isReady()) {
        if (this.window && this.window.Drupal) {
          var args = [];

          args.push(context ? context : this.window.document);
          args.push(drupalSettings ? drupalSettings : this.window.drupalSettings);

          if (trigger) {
            args.push(trigger);
          }

          this.window.Drupal[callback].apply(this.window.Drupal, args);
        }

        this.off('change:loaded', null, this);
        return true;
      }
      else {
        return false;
      }
    },

    _isReady: function() {
      return !this.filter(function(model) {
        return !model.get('loaded');
      }).length;
    }

  });

  Drupal.AjaxCommands.prototype.add_editor_assets = function(ajax, response, status) {
    var manager = Drupal.editor_assets.getManager(response.editorId);
    if (manager) {
      manager.add(response.assets);
    }
  }

})(Drupal, drupalSettings, jQuery, _);
