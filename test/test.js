var rimraf = require('rimraf')

var test = require('tape')
var fs = require('fs')
var watch = require('../')

test(function(t){

  t.plan(7)

  rimraf(__dirname + '/tmp', function(){

    fs.mkdirSync(__dirname + '/tmp')

    fs.writeFileSync(__dirname + '/tmp/view.html', "<? require './sub.html' as sub ?> View content")
    fs.writeFileSync(__dirname + '/tmp/sub.html', "Sub content")
    fs.writeFileSync(__dirname + '/tmp/another.html', "Another")
    fs.writeFileSync(__dirname + '/tmp/script.js', "module.exports = function(){ return 'test' }")


    var stop = watch({view: __dirname + '/tmp/view.html'}, function(data){
      var view = data.view.getCompiledView()
      handle(view)
    })

    var handle = function(view){
      t.deepEqual(view.requires, { sub: './sub.html' })
      t.deepEqual(Object.keys(view.views), ['sub'])

      setTimeout(writeFirstChange, 1000)
    }

    function writeFirstChange(){
      var path = __dirname + '/tmp/sub.html'
      handle = function(view){
        t.deepEqual(view.views.sub.requires, { another: './another.html' })
        t.deepEqual(Object.keys(view.views.sub.views), ['another'])
        setTimeout(writeSecondChange, 50)
      }
      fs.writeFileSync(path, "<? require './another.html' as another ?> Sub content")
    }

    function writeSecondChange(){
      var path = __dirname + '/tmp/view.html'
      handle = function(view){
        t.deepEqual(view.requires, {"script":"./script.js"})
        t.deepEqual(Object.keys(view.views), ['script'])
        setTimeout(writeThirdChange, 50)
      }
      fs.writeFileSync(path, "<? require './script.js' as script ?> View content")
    }

    function writeThirdChange(){
      var path = __dirname + '/tmp/script.js'
      handle = function(view){
        t.ok(true, 'change notified')
        finish()
      }
      fs.writeFileSync(path, "<? require './script.js' as script ?> View content")
    }

    function finish(){
      stop()
      t.end()
    }

  })


})