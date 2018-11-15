var
  express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  sql = require('mysql'),
  formidable = require('formidable'),
  datetime = require('node-datetime'),
  escape = require('sql-escape'),
  fs = require('fs'),
  multer = require('multer'),
  morgan = require('morgan'),
  url = require('url'),

  port = 4000;



const fileUpload = require('express-fileupload');
var router = express.Router();

var sqlConfig = {
      user: 'root',
      password: 'Chanakya@198',
      server: 'localhost',
      database: 'realestate'
}

var connection = sql.createConnection(sqlConfig);

app.use(fileUpload());

var server=app.listen(port,function(){
  console.log("PORT: " + port);
})


app.use(bodyParser.urlencoded({
  extended: true
}));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use('/', express.static(__dirname + '/public'));
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});


app.post("/login", function(req , res) {
  connection.query('SELECT * FROM users WHERE (username = ?)', [ req.body.username ], function (error, result, fields) {
    if(error) console.log(error);
    else if(!result.length) {
      res.send({success: false, message: "INCORRECT USERNAME"})
    }
    else {
        console.log(result);
      if(result[0].password == req.body.password){
        res.send({success: true, message: "correct", type: result[0].type})
      }
      else {
        res.send({success: false, message: "INVALID credentials!"});
      }
    }
})
});

app.post("/register", function(req , res) {
  connection.query('INSERT INTO users(username,email) values(?,?)', [req.body.username, req.body.email], function(err, result) {
    if(err) {
      console.log(err);
      console.log(req);
      res.send({"success": false, message: "USERNAME OR PASSWORD ALREADY TAKEN"});
    }
    else {
      connection.query('UPDATE users SET name = ?,password = ?,phone = ? WHERE username = ?',[req.body.name,req.body.password, req.body.phone, req.body.username], function (error, result, fields) {
        if(error) {
          console.log(error);
          res.send({success: false, message: "Unable to update to database"});
        }
        else {
          res.send({success: true, message: "SUCCESSFULLY REGISTERED"});
        }
      });
    }
  })
});

app.post("/emplogin", function(req , res) {
  connection.query('SELECT * FROM employee WHERE (username = ?)', [ req.body.username ], function (error, result, fields) {
    if(error) console.log(error);
    else if(!result.length) {
      res.send({success: false, message: "INCORRECT USERNAME"})
    }
    else {
      if(result[0].password == req.body.password){
        res.send({success: true, message: "correct", type: result[0].type})
      }
      else {
        res.send({success: false, message: "INVALID credentials!"});
      }
    }
})
});

app.get("/getverify", function(req , res) {
  var url_parts = url.parse(req.url, true);
  req.body.username = url_parts.query.username;
  connection.query('SELECT employeeid from employee where username = ?',[req.body.username],function(err,result){
    if(err) {
      console.log(err);
      res.send({success: false});
    }
    else {
      req.body.employeeid = result[0].employeeid;
      connection.query('SELECT * FROM document WHERE documentid in (SELECT verification.documentid FROM verification WHERE verification.employeeid = ? AND verification.status = ?)',
        [req.body.employeeid, 0],function(err,result1){
        if(err) {
          console.log(err);
          res.send({success: false});
        }
        else {
          console.log("MINE" + result1.body);
          res.send([{success: true,data:result1}]);
        }
      });
    }
  })

});

app.post("/verify", function(req , res) {
    connection.query('SELECT employeeid from employee where username = ?',[req.body.username],function(err,result){
      if(err) {
        console.log(err);
        res.send({success: false});
      }
      else{
        req.body.employeeid = result[0].employeeid;
        connection.query('UPDATE verification SET status = 1 WHERE employeeid = ? AND documentid = ?',[req.body.employeeid,req.body.documentid],function(err,result1){
          if(err) {
            console.log(err);
            res.send({success: false});
          }
          else {
            connection.query('SELECT propertyid FROM document WHERE documentid = ?',[req.body.documentid],function(err,result2){
              if(err) {
                console.log(err);
                res.send({success: false});
              }
              else{
                req.body.propertyid = result2[0].propertyid;
                connection.query('SELECT COUNT(*) AS cnt FROM verification WHERE status = 1 AND documentid IN (SELECT documentid FROM document WHERE propertyid = ?)',[req.body.propertyid],function(err,result3){
                  if(err) {
                    console.log(err);
                    res.send({success: false});
                  }
                  else {
                    var cnt = result3[0].cnt;
                    if(cnt==2)
                    {
                        connection.query('UPDATE property SET verified = 1 WHERE propertyid = ?',[req.body.propertyid],function(err,result4){
                          if(err) {
                            console.log(err);
                            res.send({success: false});
                          }
                          else {
                            res.send({success: true,message:"Document is verified"});
                          }
                        });
                    }
                    else {
                      res.send({success: true,message:"Document is verified"});
                    }
                  }
                });
              }
            });
          }
        });
      }
    })
});

app.get("/getnotifications", function(req , res) {
  var url_parts = url.parse(req.url, true);
  req.body.username = url_parts.query.username;
  connection.query('SELECT userid FROM users WHERE username = ?',[req.body.username],function(err,result){
    if(err) {
      console.log(err);
      res.send({success: false});
    }
    else {
      req.body.userid = result[0].userid;
      connection.query('SELECT * FROM property,upload WHERE upload.userid = ? AND property.propertyid = upload.propertyid AND  property.verified = 1',[req.body.userid],function(err,result1){
        if(err) {
          console.log(err);
          res.send({success: false});
        }
        else {
          connection.query('SELECT *  FROM users WHERE userid in (SELECT userid FROM interested WHERE propertyid in (SELECT propertyid FROM upload WHERE userid = ?))',[req.body.userid],function(err,result2){
            if(err) {
              console.log(err);
              res.send({success: false});
            }
            else {
              console.log(result1);
              console.log(result2);
              res.send([{success: true,data:{result1,result2}}]);
            }
          });
        }
      });
    }
  })
});

//Updating the wishlist by the user
app.post("/addwishlist", function(req , res) {
  var username = req.body.username;
  connection.query('SELECT userid FROM users WHERE username = ?',[username],function(err,result){
    if(err) {
      console.log(err);
      res.send({success: false});
    }
    else {
      console.log(result);
      req.body.userid = result[0].userid;
      connection.query('DELETE FROM wishlist WHERE buyerid = ?',[req.body.userid],function(err,result){
        if(err) {
          console.log(err);
          res.send({success: false});
        }
        else {
          connection.query('INSERT INTO wishlist(buyerid,type,rlow,rhigh,location) values(?,?,?,?,?)',[req.body.userid,req.body.type,req.body.rlow,req.body.rhigh,req.body.location],function(err,result1){
            if(err) {
              console.log(err);
              res.send({success: false});
            }
            else {
              //console.log(result1);
              res.send({success:true,message:"Your Wishlist is updated!"});
            }
          });
        }
      });
    }
  })
});

//GET all the relevant properties relevant to the user according to his wishlist
app.get("/getproperty", function(req , res) {
  var url_parts = url.parse(req.url, true);
  req.body.username = url_parts.query.username;
  console.log("HAHA" + req.body.username);
  connection.query('SELECT userid FROM users WHERE username = ?',[req.body.username],function(err,result){
    if(err) {
      console.log(err);
      res.send({success: false});
    }
    else {
      req.body.userid = result[0].userid;
      connection.query('SELECT * FROM property where verified = 1 AND price >= (SELECT rlow FROM wishlist WHERE buyerid = ?) AND price<= (SELECT rhigh FROM wishlist WHERE buyerid = ? AND location = (SELECT location FROM wishlist WHERE buyerid = ?) AND propertyid NOT IN (SELECT propertyid FROM upload WHERE userid = ?))',[req.body.userid,req.body.userid,req.body.userid,req.body.userid],function(err,result1){
        if(err) {
          console.log(err);
          res.send({success: false});
        }
        else {
              console.log(result1);
            res.send([{success:true,data:result1}]);
        }
      });
    }
  })
});

//Record the act of the user if he is interested in some of the property
app.post("/interested", function(req , res) {
  console.log(req.body);
  connection.query('SELECT userid FROM users WHERE username = ?',[req.body.username],function(err,result){
    if(err) {
      console.log(err);
      res.send({success: false});
    }
    else {
      req.body.userid = result[0].userid;
      connection.query('INSERT INTO interested(userid,propertyid) values(?,?)',[req.body.userid,req.body.propertyid],function(err,result1){
        if(err) {
          console.log(err);
          res.send({success: false});
        }
        else {
              res.send({success:true,"message":"Your response is recorded"});
        }
      });
    }
  })
});

app.post("/uploadproperty", function(req , res)
{
    console.log(req.body);
    console.log(req.files);
    if (!req.files)
        return res.status(400).send('No files were uploaded.');
    
    req.body.khata = Math.floor(Math.random() * 1000000+1);
    req.body.tax = Math.floor(Math.random() * 1000000+1);
    req.body.propertyid = Math.floor(Math.random() * 1000000+1);

    var image = req.files.image;
    var khata = req.files.khata;
    var tax = req.files.tax;

    image.mv('public/views/upload/'+req.body.propertyid+'image.jpg', function(err) 
    {
        if (err)
            return res.status(500).send(err);
        else
        {
            khata.mv('public/views/upload/'+req.body.propertyid+'khata.pdf',function(err)
            {
                if(err)
                    return res.status(500).send(err);
                else
                {
                    tax.mv('public/views/upload/'+req.body.propertyid+'tax.pdf',function(err)
                    {
                        if(err)
                            return res.status(500).send(err);
                        else
                        {
                            connection.query('SELECT userid FROM users WHERE username = ?',[req.body.username],function(err,result)
                            {
                                if(err) 
                                {
                                    console.log(err);
                                    res.send({success: false, message: "USER NOT FOUND"});
                                }
                                else
                                {
                                    req.body.userid = result[0].userid;
                                    connection.query('INSERT INTO property(propertyid,price,type,location,address,image) values(?,?,?,?,?,?)',
                                    [req.body.propertyid,req.body.price,req.body.type,req.body.location,req.body.address,'views/upload/'+req.body.propertyid+'image.jpg'],
                                    function(err,result)
                                    {
                                        if(err) 
                                        {
                                            console.log(err);
                                            res.send({success: false, message: "1 .FAILED TO UPDATE"});
                                        }
                                        else
                                        {
                                            connection.query('INSERT INTO document(documentid,type,propertyid,image) values(?,?,?,?)',[req.body.khata,'khata',
                                            req.body.propertyid,'views/upload/'+req.body.propertyid+'khata.pdf'],function(err,result)
                                            {
                                                if(err) 
                                                {
                                                    console.log(err);
                                                    res.send({success: false, message: "2 .FAILED TO UPDATE"});
                                                }
                                                else
                                                {
                                                    connection.query('INSERT INTO verification(documentid,employeeid) values(?,?)',[req.body.khata,1],function(err,result1)
                                                    {
                                                        if(err) 
                                                        {
                                                            console.log(err);
                                                            res.send({success: false, message: "3 .FAILED TO UPDATE"});
                                                        }
                                                        else
                                                        {
                                                            connection.query('INSERT INTO document (documentid,type,propertyid,image) values(?,?,?,?)',
                                                            [req.body.tax,'tax',req.body.propertyid,'views/upload/'+req.body.propertyid+'tax.pdf'],function(err,result1)
                                                            {
                                                                if(err) 
                                                                {
                                                                    console.log(err);
                                                                    res.send({success: false, message: "FAILED TO UPDATE"});
                                                                }
                                                                else
                                                                {
                                                                    connection.query('INSERT INTO verification(documentid,employeeid) values(?,?)',[req.body.tax,2],
                                                                    function(err,result1)
                                                                    {
                                                                        if(err) 
                                                                        {
                                                                            console.log(err);
                                                                            res.send({success: false, message: "4 .FAILED TO UPDATE"});
                                                                        }
                                                                        else
                                                                        {
                                                                            connection.query('INSERT INTO upload(userid,propertyid) values(?,?)',[req.body.userid,req.body.propertyid],function(err,response)
                                                                            {
                                                                                if(err) 
                                                                                {
                                                                                    console.log(err);
                                                                                    res.send({success: false, message: "5 .FAILED TO UPDATE"});
                                                                                }
                                                                                else
                                                                                {
                                                                                    console.log("Executed successfully");
                                                                                    res.redirect("/#/redirect");
                                                                                }
                                                                            });

                                                                        }
                                                                    });

                                                                }
                                                            });

                                                        }
                                                    });

                                                }
                                            });
                                
                                        }
                                    });
                            
                                }
                            });
                        }
                    });
                }
            });
        }

    });

});
