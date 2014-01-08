rincewind-watch
===

Watch [rincewind](https://github.com/mmckegg/rincewind) views and trigger callbacks on change.

[![NPM](https://nodei.co/npm/rincewind-watch.png?compact=true)](https://nodei.co/npm/rincewind-watch/)

## API

```js
var watch = require('rincewind-watch')
```

### watch(viewPaths, [opts], cb)

Pass in a single path string, an array of viewPaths or an object with named paths (e.g `{view: __dirname + '/view.html'}).

If opts.watch is false, don't watch for changes, only trigger callback once.

Returns a function which when called, stops watching and cleans up.

## Example

Automatically compile views to javascript when they are changed

```js
var watch = require('rincewind-watch')
var fs = require('fs')
var viewRoot = __dirname + '/views'

watch({view: viewRoot + '/view.html'}, function(views){
  fs.writeFile(viewRoot + '/index.js', getModule(views, viewRoot))
})

function getModule(views, relativeTo){
  var results = Object.keys(views).map(function(key){
    return key + ': View(' + views[key].stringify(relativeTo) + ')' 
  })
  return 'var View = require("rincewind"); module.exports = {' + results.join(', ') + '}'
}
```
