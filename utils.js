(function(jQuery) {
  var faviconObject = {
    draw: function(url) {
      jQuery('<img></img>')
        .attr('src', url)
        .on('load', function() {
          var canvas = document.createElement('canvas');
          var img = this;
          canvas.width = img.width;
          canvas.height = img.height;
          canvas.getContext("2d").drawImage(img, 0, 0);
          var f = jQuery('<link></link>');
          f.attr('href', canvas.toDataURL('image/png'));
          f.attr('rel', 'shortcut icon');
          f.attr('type', 'image/png');
          f.appendTo('head');
        });
    },
    remove: function() {
      jQuery('link[rel="icon"],link[rel="short icon"]').remove();
    }
  };
  
  jQuery.extend({
    addFavicon: function(url) {
      faviconObject.remove();
      faviconObject.draw(url);
    }
  });
  jQuery.fn.extend({
    addFavicon: function() {
      return this.each(function() {
        faviconObject.remove();
        faviconObject.draw(jQuery(this).attr("src"));
      });
    }
  });
} (jQuery));