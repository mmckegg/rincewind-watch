var chokidar = require('chokidar');
var View = require('rincewind')
var join = require('path').join
var getDirName = require('path').dirname

module.exports = watch


function watch(viewPaths, opts, cb){
  // opts: { delay: 300, watch: true }

  opts = opts || {}
  if (typeof opts === 'function'){
    cb = opts
    opts = {}
  }


  if (Array.isArray(viewPaths)){
    var array = viewPaths
    viewPaths = {}
    array.forEach(function(path){
      viewPaths[path] = path
    })
  } else if (!(viewPaths instanceof Object)){
    var path = viewPaths
    viewPaths = {}
    viewPaths[path] = path
  }

  var watches = {}
  var views = {}
  var pending = false
  var pendingPaths = []

  process.nextTick(function(){
    update()
  })

  return function stop(){
    Object.keys(watches).forEach(function(path){
      var w = watches[path]
      w.close()
    })
    watches = {}
  }

  function queueUpdate(path){

    if (!pending) setTimeout(function () {
      pending = false
      update()
      pendingPaths = []
    }, opts.delay||300)
    
    pending = true
  }

  function update(){
    var cache = {}
    var watchPaths = []
    var oldPaths = Object.keys(watches)

    Object.keys(viewPaths).forEach(function(key){
      var viewPath = viewPaths[key]
      var view = View(viewPath, {cache: cache})
      views[key] = view
      if (!~watchPaths.indexOf(viewPath)){
        watchPaths.push(viewPath)
      }
      addWatchPaths(watchPaths, view.getCompiledView(), getDirName(viewPath))
    })

    if (opts.watch !== false){
      diff(watchPaths, oldPaths).forEach(function(newPath){
        var w = watches[newPath] = chokidar.watch(newPath, {persistent: true, ignoreInitial: true})
        w.on('change', queueUpdate)
      })

      diff(oldPaths, watchPaths).forEach(function(oldPath){
        watches[oldPath].close()
        ;delete watches[oldPath]
      })
    }

    cb&&cb(views, pendingPaths)
  }

}

function addWatchPaths(watchPaths, view, root){

  if (view.resources){
    Object.keys(view.resources).forEach(function(key){
      var resource = view.resources[key]
      if (resource instanceof Object){
        if (!~watchPaths.indexOf(resource.path)){
          watchPaths.push(resource.path)
        }
      }
    })
  } else if (view.requires){
    Object.keys(view.requires).forEach(function(key){
      var path = join(root, view.requires[key])
      if (!~watchPaths.indexOf(path)){
        watchPaths.push(path)
      }
      if (view.views && view.views[key]){
        addWatchPaths(watchPaths, view.views[key], getDirName(path))
      }
    })
  } else if (view.require){
    watchPaths.push(view.require)
  }
}

function diff(ary1, ary2){
  return ary1.filter(function(i) {return !(ary2.indexOf(i) > -1);});
}