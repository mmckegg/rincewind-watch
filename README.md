rincewind-watch
===

Watch [rincewind](https://github.com/mmckegg/rincewind) views and trigger callbacks on change.

[![NPM](https://nodei.co/npm/rincewind-watch.png?compact=true)](https://nodei.co/npm/rincewind-watch/)

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
  var results = Object.keys(views).forEach(function(key){
    return key + ': View(' + views[key].stringify(relativeTo) + ')' 
  })
  return 'var View = require("rincewind"); module.exports = {' + results.join(', ') '}'
}
```
