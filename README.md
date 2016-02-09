# Rationale
There are dozens of module systems available. Almost all of them are build with the assumption
that modules are loaded asynchronously. This is the case for big applications but the small ones
are usually boundled into a one big file with everything (JavaScript, CSS, HTML) inside.

Once we have a boundle with everything we can load modules synchronously. This is what _window.module_ is for.

# Usage
There are three things you can do with this library:

1. Define a factory method for a module which can potentially depend on other modules.
2. Define a constant which doesn't depend on other modules.
3. Ask for a module from another module in a synchronous way.

## Defining modules:
```javascript
window.module.define('FirstModule', function() {
    return {
        methodA: function() {
            // do something
        },

        methodB: function() {
            // do something
        }
    }
});
```

## Defining constants:
```javascript
window.module.constant('MyConfiguration', {
    name: 'John',
    surname: 'Blue'
});
```

## Using modules:
```javascript
window.module.define('AnotherModule', function() {
    var Config = window.module('MyConfiguration');
    var FirstModule = window.module('FirstModule');

    console.log(Config.name, FirstModule.methodB());
});
```

# Building a boundle file
I've found the following gulpfile useful to build a boundle compatible with _window.module_:
```javascript
'use strict';

const gulp = require('gulp');
const babel = require("gulp-babel");
const iife = require('gulp-iife');
const concat = require('gulp-concat');

gulp.task('default', function() {
    return gulp.src(['src/**/*.js'])
        .pipe(babel({ plugins: ['transform-es2015-template-literals'] }))
        .pipe(iife())
        .pipe(concat("boundle.js"))
        .pipe(gulp.dest("target/"));
});
```

You will need to add some dependencies to your package.json:
```json
"devDependencies": {
    "babel-plugin-transform-es2015-template-literals": "6.3.13",
    "gulp": "3.9.0",
    "gulp-babel": "6.1.1",
    "gulp-concat": "2.6.0",
    "gulp-iife": "0.2.4"
  }
```

Now add _window.module_ and the boundle file to the HTML file. Then ask for the main application module:
```html
<script src="libs/window.module.js"></script>
<script src="target/boundle.js"></script>
<script>window.module('Application')</script>
```

# Source code
```javascript
/**
 * window.module v1.0
 * Created by Mateusz Zieliński
 * February 2016
 * License: MIT (https://opensource.org/licenses/MIT)
 */
(function() {
    var registry = {};
    var resolved = {};
    var stack = [];

    window.module = function(name) {
        if(!registry.hasOwnProperty(name)) throw new Error('No module called: ' + name);
        if(resolved.hasOwnProperty(name)) return resolved[name];

        if(stack.indexOf(name) != -1) {
            stack.push(name);
            throw new Error('Circular dependency: ' + stack.join(' -> '));
        }

        stack.push(name);
        resolved[name] = registry[name]();
        stack.pop();
    };

    window.module.define = function (name, factory) {
        if(registry.hasOwnProperty(name)) throw new Error('Module already defined: ' + name);
        registry[name] = factory;
    };

    window.module.constant = function(name, value) {
        if(registry.hasOwnProperty(name)) throw new Error('Module already defined: ' + name);
        resolved[name] = registry[name] = value;
    }
}());
```

# License
https://opensource.org/licenses/MIT
