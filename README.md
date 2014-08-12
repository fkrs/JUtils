# JUtils

JUtils is a javascript library for jQuery with loads of small useful utilities.

## jQuery(selector).fn
These functions is attached to jQuerys selector.

### jQuery(selector).faviconAdd()
Load an image and use it as a favicon in the browser.

Loads images found by the jQuery-selector and converts them into a favicon which is inserted into the documents head. If multiple elements are found then it is up to the browser to select which favicon to use. (The browser might use the first available favicon or, most likely, the last defined icon. This is entirely up to the browser and its internal design.)

### jQuery(selector).faviconAnimationAdd(options)
Adds images that matches the given selector to the animation list for the favicon.

If the options object has the property "start" set to true then the animation starts directly. The options property "delay" specifies the interval between each image. This is given in milliseconds.

To change the delay just call jQuery.faviconAnimationStart(newDelay); where "newDelay" is the new interval to use.

#### options.start
Set to true to start the interval directly.

If start is omitted or set to false then the animation can be started by calling jQuery.faviconAnimationStart();

#### options.delay
Sets the delay for the update interval. This time is specified in milliseconds. When the interval gets too low then the favicon will flicker and you will not get a proper result.

### jQuery(selector1).imageToCanvas(selector2)
Loads images found by the jQuery-selector (selector1) and converts them to canvas elements. These are attached to the object specified by the selector called selector2.

## jQuery.fn
These functions can be reached from the jQuery-object itself without specifying a selector.

### jQuery.faviconAdd(url)
This function loads an image to a internal canvas object and transform it to a png which is used as an favicon.

Load an image from the specified URL and use it as an favicon.

### jQuery.faviconAnimationAdd(url)
Adds an image to the animationList to create an animated favicon.

### jQuery.faviconAnimationStart(delay)
Start looping the images in the animationList. The delay specified is the time between shifting images for the favicon.

If the delay, which is measured in milliseconds, is to small then the favicon will start to flicker and you will not get the intended result.

If this function is called a second time then it will only set the delay once again. This makes it possible to change the delay efter the animation has been started.

### jQuery.faviconAnimationStop()
Stop an ongoing favicon animation.

### jQuery.imageToCanvas(url)
Load an image from the specified URL and convert it into a canvas object. The returned object is an jQuery object containing the canvas object.

### jQuery.storage

#### jQuery.storage.getEngineName()
Returns which engine is used. Currently there are three valid values (localStorage, sessionStorage, local).

##### localStorage
The internal localStorage is used. Any value set here will remain until removed or until it moves beyond the timeout.

##### sessionStorage
The internal sessionStorage is used. Any value here will remain until the session expires or until it moves beyond the timeout.

##### internal
The browser doesn't support any webStorage so the data is stored in an object as key-value pairs. Any value here will be lost when the page reloads or when it moves beyond the timeout.

#### jQuery.storage.get(key)
Gets the value for the specified key from storage.

If the key is invalid than the function returns null.

#### jQuery.storage.set(key, value, timeout)
Set the key to value in the storage.

The timeout specifies for how long the key is valid in the storage. This time is given in seconds. If the timeout is omitted then the timesout defaults to 3600 seconds.

#### jQuery.storage.isset(key)
Checks if the value for the given key is valid in storage.

#### jQuery.storage.unset(key)
Removes the value for the given key from storage.

#### jQuery.storage.touch(key, timeout)
Refreshes the the timeout for the given key with a new timeout defined in seconds by the argument named timeout. If this argument for the timeout is omitted then the default timeout of 3600 seconds is used.

#### jQuery.storage.getValid(key)
Returns the time left until the value for the given key gets invalid.

If the key is missing or invalid then this function returns false.