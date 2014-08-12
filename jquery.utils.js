(function(jQuery) {
  // Internal object to manage favicons
  var faviconObject = {
    // Draw a favicon as a shortcut icon
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
    // Remove any defined favicons
    remove: function() {
      jQuery('link[rel="icon"],link[rel="short icon"]').remove();
    },
    // List of images to use in animations
    _animateList: [],
    // Number of images added
    _animateCount: 0,
    // Current index for the animation
    _animateIndex: 0,
    // Vaiable to keep the Interval for the animation
    _animateInterval: null,
    // Function used by setInterval to perform the animation
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
    // Add an image to the animation list. The image is converted to a text based png format
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
    // A wrapper function that calls animateLoadURL and keeps track of the numer of added images
    addAnimation: function(url) {
      faviconObject.animateLoadURL(url, faviconObject._animateCount);
      faviconObject._animateCount++;
    },
    // Get the current number of added images
    animationLength: function() {
      return faviconObject._animateCount;
    },
    // Start the animation with the specified delay.
    // If the animation is running then stop it and restart it with the new delay.
    startAnimation: function(delay) {
      if(faviconObject._animateInterval !== null) {
        clearInterval(faviconObject._animateInterval);
      }
      faviconObject._animateInterval = setInterval(faviconObject.animate, delay);
    },
    // Stop the animation
    stopAnimation: function() {
      if(faviconObject._animateInterval !== null) {
        clearInterval(faviconObject._animateInterval);
      }
    }
  };
  // Create a storageEngine with fallbacks from localStorage to sessionStorage and then back to a local key/value-pair list
  // The calls to the engine is wrapped to allow timeouts. This means that the stored values is an JSON object with two properties (data and timeout)
  var storageEngine = (function() {
    var storage = window.localStorage || window.sessionStorage || {
      // Simple kvp implementation (key/value-pair)
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
      // Exposed functions
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
  
  // jQuery plugin
  // First the extension if the jQuery object
  jQuery.extend({
    // Add favicon
    faviconAdd: function(url) {
      faviconObject.remove();
      faviconObject.draw(url);
    },
    // Add image to the favicon animation
    faviconAnimationAdd: function(url) {
      faviconObject.addAnimation(url);
    },
    // Start the favicon animation
    faviconAnimationStart: function(delay) {
      faviconObject.startAnimation(delay);
    },
    // Stop the favicon animation
    faviconAnimationStop: function() {
      faviconObject.stopAnimation();
    },
    // Convert an image to a canvas object
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
    // WebStorage functions
    storage: {
      // Get the current engines name (localStorage, sessionStorage or local)
      getEngineName: function() {
        return storageEngine.getEngineName();
      },
      // Get a stored value
      get: function(key) {
        return storageEngine.get(key);
      },
      // Set a value (with timeout)
      set: function(key, value, timeout) {
        return storageEngine.set(key, value, timeout);
      },
      // Check if a key exists (and is valid)
      isset: function(key) {
        return storageEngine.isset(key);
      },
      // Remove a key
      unset: function(key) {
        return storageEngine.unset(key);
      },
      // Update the timeout for a key (if it is valid)
      touch: function(key, timeout) {
        return storageEngine.touch(key, timeout);
      },
      // Check if a key is valid
      getValid: function(key) {
        return storageEngine.getValid(key);
      }
    }
  });
  // jQuery plugin part 2
  // The selector based functions
  jQuery.fn.extend({
    // Add images to favicons
    faviconAdd: function() {
      return this.each(function() {
        faviconObject.remove();
        faviconObject.draw(jQuery(this).attr("src"));
      });
    },
    // Add images to the animation list for the favicon 
    faviconAnimationAdd: function(options) {
      options = options || {};
      if(options.start === true) {
        faviconObject.startAnimation(options.delay || 250);
      }
      return this.each(function() {
        faviconObject.addAnimation(jQuery(this).attr("src"));
      });
    },
    // Convert images to canvas and append them to the specified selector
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