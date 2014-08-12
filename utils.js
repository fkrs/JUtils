(function(jQuery) {
  var faviconObject = {
    draw: function(url) {
      var link = jQuery('<link></link>');
      jQuery('<img></img>')
        .attr('src', url)
        .on('load', function() {
          var canvas = document.createElement('canvas');
          var img = this;
          canvas.width = img.width;
          canvas.height = img.height;
          canvas.getContext("2d").drawImage(img, 0, 0);
          link.attr('href', canvas.toDataURL('image/png'));
          link.attr('rel', 'shortcut icon');
          link.attr('type', 'image/png');
          link.appendTo('head');
        });
      return link;
    },
    remove: function() {
      jQuery('link[rel="icon"],link[rel="short icon"]').remove();
    },
    _animateList: [],
    _animateCount: 0,
    _animateIndex: 0,
    _animateInterval: null,
    animate: function() {
      var idx = faviconObject._animateIndex;
      faviconObject._animateIndex = (faviconObject._animateIndex + 1) % faviconObject._animateCount;
      if(faviconObject._animateList[idx]) {
        jQuery('link[rel="icon"],link[rel="short icon"]').remove();
        var link = jQuery('<link></link>');
        link.attr('href', faviconObject._animateList[idx]);
        link.attr('rel', 'shortcut icon');
        link.attr('type', 'image/png');
        link.appendTo('head');
      }
    },
    animateLoadURL: function(url, index) {
      jQuery('<img></img>')
        .attr('src', url)
        .on('load', function() {
          var canvas = document.createElement('canvas');
          var img = this;
          canvas.width = img.width;
          canvas.height = img.height;
          canvas.getContext("2d").drawImage(img, 0, 0);
          faviconObject._animateList[index] = canvas.toDataURL('image/png');
        });
    },
    addAnimation: function(url) {
      faviconObject.animateLoadURL(url, faviconObject._animateCount);
      faviconObject._animateCount++;
    },
    animationLength: function() {
      return faviconObject._animateCount;
    },
    startAnimation: function(delay) {
      if(faviconObject._animateInterval !== null) {
        clearInterval(faviconObject._animateInterval);
      }
      faviconObject._animateInterval = setInterval(faviconObject.animate, delay);
    },
    stopAnimation: function() {
      if(faviconObject._animateInterval !== null) {
        clearInterval(faviconObject._animateInterval);
      }
    }
  };
  var storageEngine = (function() {
    var storage = window.localStorage || window.sessionStorage || {
      _engineName: 'internal',
      _items: {},
      getItem: function(key) {
        if(this._items[key]) {
          return this._items[key];
        }
        return null;
      },
      setItem: function(key, value) {
        this._items[key] = value;
      },
      removeItem: function(key) {
        this._items[key] = null;
      }
    };
    return {
      getEngineName: function() {
        if(storage._engineName) {
          return storage._engineName;
        } else if(window.localStorage) {
          return 'localStorage';
        } else if(window.sessionStorage) {
          return 'sessionStorage';
        }
      },
      timestamp: function() {
        if(Date.getTime) {
          return Date.getTime();
        } else {
          return +(new Date());
        }
      },
      get: function(key) {
        var data = storage.getItem(key);
        if(data !== null) {
          var arr = JSON.parse(data);
          if(arr) {
            if(arr.timeout) {
              if(arr.timeout >= this.timestamp()) {
                return arr.data;
              } else {
                return null;
              }
            }
          }
        }
        return data;
      },
      set: function(key, value, timeout) {
        timeout = timeout || 3600;
        timeout *= 1000;
        var data = {
          data: value,
          timeout: (this.timestamp() + timeout)
        }
        return storage.setItem(key, JSON.stringify(data));
      },
      isset: function(key) {
        var data = storage.getItem(key);
        if(data !== null) {
          var obj = JSON.parse(data);
          if(obj && obj.timeout && (obj.timeout >= this.timestamp())) {
            return true;
          }
        }
        return false;
      },
      unset: function(key) {
        return storage.removeItem(key);
      },
      touch: function(key, timeout) {
        var data = storage.getItem(key);
        if(data !== null) {
          var obj = JSON.parse(data);
          if(obj && obj.timeout && (obj.timeout >= this.timestamp())) {
            return this.set(key, obj, timeout);
          }
        }
        return false;
      },
      getValid: function(key) {
        var data = storage.getItem(key);
        if(data !== null) {
          var obj = JSON.parse(data);
          var timestamp = this.timestamp();
          if(obj && obj.timeout && (obj.timeout >= timestamp)) {
            return ((obj.timeout - timestamp) / 1000);
          }
        }
        return false;
      }
    };
  }());
  
  jQuery.extend({
    faviconAdd: function(url) {
      faviconObject.remove();
      faviconObject.draw(url);
    },
    faviconAnimationAdd: function(url) {
      faviconObject.addAnimation(url);
    },
    faviconAnimationStart: function(delay) {
      faviconObject.startAnimation(delay);
    },
    faviconAnimationStop: function() {
      faviconObject.stopAnimation();
    },
    imageToCanvas: function(url) {
      var canvas = document.createElement("canvas");
      var image = jQuery('<img></img>').attr('src', url).on('load', function() {
        var img = image.get(0);
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d").drawImage(img, 0, 0);
      });
      return jQuery(canvas);
    },
    storage: {
      getEngineName: function() {
        return storageEngine.getEngineName();
      },
      get: function(key) {
        return storageEngine.get(key);
      },
      set: function(key, value, timeout) {
        return storageEngine.set(key, value, timeout);
      },
      isset: function(key) {
        return storageEngine.isset(key);
      },
      unset: function(key) {
        return storageEngine.unset(key);
      },
      touch: function(key, timeout) {
        return storageEngine.touch(key, timeout);
      },
      getValid: function(key) {
        return storageEngine.getValid(key);
      }
    }
  });
  jQuery.fn.extend({
    faviconAdd: function() {
      return this.each(function() {
        faviconObject.remove();
        faviconObject.draw(jQuery(this).attr("src"));
      });
    },
    faviconAnimationAdd: function(options) {
      options = options || {};
      if(options.start === true) {
        faviconObject.startAnimation(options.delay || 250);
      }
      return this.each(function() {
        faviconObject.addAnimation(jQuery(this).attr("src"));
      });
    },
    imageToCanvas: function(sel) {
      return this.each(function() {
        var canvas = document.createElement("canvas");
        var image = this;
        canvas.width = image.width;
        canvas.height = image.height;
        canvas.getContext("2d").drawImage(image, 0, 0);
        return jQuery(canvas).appendTo(sel);
      });
    }
  });
} (jQuery));