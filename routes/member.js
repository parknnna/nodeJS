var express = require('express');
var router = express.Router();

var db_config = require('C:/GitHub/nodeJS/config/database.js');
var conn = db_config.init();
var bodyParser = require('body-parser');

/* GET users listing. */
router.get('/login', function (req, res, next) {
    res.render('login',{idon : req.cookies.idon});
});

router.get('/member_insert', function (req, res, next) {
    res.render('member_insert');
});

router.post('/member_insert', function (req, res, next) {
    var sql = "insert into member values(null,?,?,?)";
    var params = [req.body.name, req.body.id, req.body.password];

    conn.query(sql, params, function (err) {
        if (err) 
            console.log(err);
        else {
            res.redirect('/board');
        }
    });
});

router.get('/logout',function(req,res,next){
  req.session.destroy();
  res.redirect('/board');
});

router.post('/login_ok',function(req,res,next){
  var sql= "select * from member where id=?";
  
  conn.query(sql, req.body.id, function(err, rows, filed){
    if(err) console.log(err);
    else{
      if(rows.length<1){
        res.render('masage',{    //메세지 만들것
          masage : "아이디가 없습니다.",
          url : "login"
        })
      }else{
        sql="select * from member where id=? and password=?";
        var params=[req.body.id, req.body.password];
        conn.query(sql,params,function(err,rows,filed){
          if(err) console.log(err);
          else{
            if(rows.length<1){
              res.render('masage',{
                masage : "비밀번호가 다릅니다.",
                url : "login" 
              })
            }else{
              req.session.login=true;
              req.session.user=rows[0];
              if(req.body.idon) res.cookie('idon', req.body.id,{maxAge:30000});
              res.render('masage',{
                masage : "로그인",
                url : "board" 
              })
            }
          }
        });
      }
    }
  });
});




module.exports = router;
