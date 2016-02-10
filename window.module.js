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

        return resolved[name];
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