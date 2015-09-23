var fs      = require("fs");
var path    = require('path')
var file    = require("./file");
var marked  = require('marked');
var color   = require('colorful');
var stylus = require('./stylus');
var copy = require('./copy');
var toc = require('./toc');
var log     = console.log;

var template = ''

function build(commander){

    // 载入配置文件
    var pkg = require(path.resolve('package.json'));

    // 模板目录
    template = path.dirname(__dirname) + '/lib/theme/' + pkg.idoc.theme;

    var name = pkg.name;
    var idocmd = pkg.idoc.md;
    var todir = pkg.idoc.todir;
    var html = '';
    var markedstr;
    var _path;
    var tocHTML = '';
    
    idocmd.forEach(function(item,idx){
        // markdown 生成HTML
        markedstr = marked(file.read(process.cwd() + '/md/' + item));
        // markdown 增强 及树菜单生成
        markedstr = toc(markedstr,function(_html){
            tocHTML = _html
        });
        // 指定HTML路径
        _path = process.cwd() + '/' + (idx === 0?'index.html':item.replace('.md',".html")  );
        // ejs 模板生成HTML
        html = file.ejs(template + '/layout.ejs',{
            title: pkg.name,
            toc: tocHTML,
            test:'<div>123123</div>'
        });
        //写入指定目录中
        file.write(_path,html.replace('{{content}}',markedstr) );
        log('Generates "' + path.basename(_path).replace('.html',".md") + '"' + color.blue(" Success ! ") + new Date() );
    })

    // 复制复制所有静态资源到生产目录里面
    copy( template +'/source/', todir,{
        filter:function(_file){
            if(!/\.(styl)$/.test(_file)) {
                return true;
            }else{
                return false;
            }
        }
    },function(err,_file){
        if(err) return console.error(err);
    })

    // css如果是 stylus 生成 css
    stylus(template+'/source/css/main.styl',function(err,css){
        if(err) return log(err);
        file.write(todir+ 'css/main.css',css);
    });

    log();
    log(color.green('Successful build static pages!') );
}

module.exports = build;
