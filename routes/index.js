var express = require('express');
var router = express.Router();

//DB
//var db_config = require('../config/database');
//var conn = db_config.init();
var bodyParser = require('body-parser');

// 1. multer 미들웨어 등록
const multer = require("multer");
const path = require("path");
var fs = require('fs');
const cookieParser = require('cookie-parser');

let storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "upload/")
    },
    filename: function (req, file, callback) {
        let extension = path.extname(file.originalname);
        let basename = path.basename(file.originalname, extension);
        callback(null, basename + extension);
        console.log(extension);
        console.log(basename);
    }
});

let upload = multer({storage: storage});

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'board'});

});

router.get('/board', function (req, res, next) {
    var sql = 'select * from board where re_l=0';
    conn.query(sql, function (err, rows, fields) {
        if (err) 
            console.log('query is not excuted. select fail...\n' + err);
        else {
            
            res.render('board', {
                list: rows,
                title: 'board',
                session : req.session
            });
        }
    });
});

router.get('/insert', function (req, res) {
    res.render('insert',{session : req.session});
});

router.post('/insert2', upload.single("file"), function (req, res) {
    var mode = req.query.mode;
    var member_no= req.session.user.member_no;
    if(mode!=undefined){
        var re=req.body.re;
        var body = req.query;
        
        sql = 'insert into board values(null,1,?,?,null,null,?,1,?)';
        var params = [
            re,req.session.user.id, body.reg,member_no
        ];
        conn.query(sql, params, function (err) {
            if (err) 
                console.log(err);
            else {
                res.redirect('/content?no=' + body.no);
            }
        })
    }else{
        var body = req.body;
        let file = req.file;
        if(file){
            var sql = 'INSERT INTO BOARD VALUES(null, ?, ?, ?, ?, ? ,(select ifnull(max(no),0) from board d),0,?)';
            
            var params = [body.title, body.content, body.name, file.originalname, file.size,member_no];
            conn.query(sql, params, function (err) {
                if (err) console.log('query is not excuted. insert fail...\n' + err);
                else 
                    res.redirect('/board');
                }
            );
        }else{
            var sql = 'INSERT INTO BOARD VALUES(null, ?, ?, ?, null, 0 ,(select ifnull(max(no),0) from board d),0,?)';
            
            var params = [body.title, body.content, body.name,member_no];
            conn.query(sql, params, function (err) {
                if (err) console.log('query is not excuted. insert fail...111\n' + err);
                else 
                    res.redirect('/board');
                }
            );
        }
    }
});

router.get('/content', function (req, res) {
    var par = req.query.no;
    var sql = 'select * from board where no=?';
    var ssql = conn.query(sql, par, function (err, rows, fields) {
        if (err) 
            console.log('query is not excuted. select fail...\n' + err);
        else {
            sql = 'select * from board where re_g=? and re_l=1';
            conn.query(sql, rows[0].re_g, function(err,rows2, fileds){
                if(err) console.log(err);
                else {
                    var seid=null;
                    if(req.session.user!=undefined) seid=req.session;
                    res.render('content', {
                        list: rows,
                        re_list : rows2,
                        session : seid
                    });
                }
            })

        }
    })
    console.log(ssql.sql);
});

router.get('/delete', function (req, res) {
    var par = req.query.no;
    var mode = req.query.mode;
    var sql = 'select * from board where no=?';
    var filename = "";
    conn.query(sql, par, function (err, rows, fileds) {
        if (err) 
            console.log(err);
        else {
            filename = rows[0].filename;
            if(filename==undefined){
                filename="";
            }
            sql = 'select count(*) as crow from test.board where filename = ?';
            conn.query(sql, filename, function (err, rows, fileds) {
                if (err) 
                    console.log('파일에러:' + err);
                else {
                    if (rows[0].crow == 1) {
                        fs.unlink('upload/' + filename, function (err) { //사진삭제
                            if (err) 
                                throw err;
                            console.log(filename + '삭제');
                        });
                    }

                    sql = 'delete from board where no=?';
                    conn.query(sql, par, function (err, fileds) {
                        if (err) 
                            console.log('query is not\n' + err);
                        else {
                            if(mode==undefined) res.redirect('/board');
                            else res.redirect('/content?no='+mode);
                        }
                    });
                }
            });
        }
    });
});

router.get('/board_update',function(req,res){
    var sql = 'select * from board where no = ?';
    conn.query(sql,req.query.no,function(err,rows,fileds){
        if(err) console.log(err);
        else{
            res.render('board_update',{
                board:rows
            });
        }
    })
});

router.post('/board_update',upload.single('file'),function(req,res){
    var sql = 'update board set title=?, content=?, filename=?, filesize=? where no=?';
    let file = req.file;
    var par = [req.body.title , req.body.content, file.originalname, file.size, req.body.no];
    conn.query(sql,par,function(err){
        if(err)console.log(err);
        else{
            res.redirect('/content?no='+req.body.no);
        }
    })
})

router

module.exports = router;
