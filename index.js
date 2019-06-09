var mysql=require('mysql');
var express=require('express');
var app=express();
var bodyParser=require('body-parser');
var nodemon=require('nodemon');
var normalizePort = require('normalize-port');
var port=normalizePort(process.env.PORT||3000);
const http=require('http');
const redis=require('redis');
var exphbs  = require('express-handlebars');
var clientRedis = redis.createClient('6379','localhost',0);
const sql = require('mssql-plus');
app.set('port', port);
var server = http.createServer(app);
var createRoutes = require('restful-stored-procedure');
var Connection = require('tedious').Connection;
var morgan=require('morgan');
var async = require('async');
var session = require('express-session');
var redisStore = require('connect-redis')(session);
const responseTime = require('response-time')
var schedule = require('node-schedule');
/*var mysqlConnection=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'mydb'
});
mysqlConnection.connect((err)=>{
    if(!err)
 console.log('Database connected');
 else
 console.log('database connection  \n error' + JSON.stringify(err, undefine, 2));

});*/
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser. json());

/*app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });*/

  app.use(function (req, res, next) {
    //Enabling CORS 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
});
  app.engine('handlebars', exphbs({defaultLayout:'index'}));
  app.set('view engine', 'handlebars');
server.listen(3000, ()=>console.log("server running port at :"+port));

app.use(session({
    secret: 'ssshhhhh',
    store: new redisStore({ host: 'localhost', port: 6379, clientRedis: clientRedis,ttl :  260}),
    saveUninitialized: false,
    resave: false
}));
app.use(responseTime());
/*
const config = {
    user: 'SAEEsa',
    password: 'gyrit@123',
    server: '13.234.235.89', // You can use 'localhost\\instance' to connect to named instance
    database: 'SAEEdb',
    port:1433
    
}
*/
var config = {
    user: 'SAEEsa',
    password: 'gyrit@123',
    server: '13.234.235.89', // You can use 'localhost\\instance' to connect to named instance 
    database: 'SAEEdb',
    stream: true,
    port:1433,
    multipleStatements:true,
    parseJSON:true,
    options: {     
     auto_reconnect: true,
      encrypt: false
    }// Use this if you're on Windows Azure
}



var conn=sql.connect(config, function(err) {
    if (err) console.log(err);
    // ... error checks
    console.log(config.server);// You can set streaming differently for each request
    //req.query('select * from TBL_USER'); // or request.execute(procedure);


});



createRoutes(app, config);




app.get('/user' ,(req, res) => {
   
    var req = new sql.Request();
        // query to the database and get the records
    
        req.execute('SP_GETUSERINFO', function (err,results) {
            if (err) console.log(err),
            console.log(emp_id);

            // send records as a response
            console.time()
            res.send(JSON.stringify(results.recordset));
            
    });

});
    app.get('/ping', function(req,res){

        res.json({PONG:Date.now()});
    });

let redisMiddleware = (req, res, next) => {
   
    //let key = "userinfo" + req.originalUrl || req.url;
    let key=emp_id;
          // call the func that executes the stored proce
          // response of stored proce you should set to cahe
          // Return the same value
          res.sendResponse = res.send;
          res.send = (body) => {
            clientRedis.set(key, emp);
              res.sendResponse(emp);
             
              //console.log(body);
          }
          next();
      
   
  };

  let redisMiddleware1 = (req, res, next) => {
    let key = "surveyuser" + req.originalUrl || req.url;
    
          res.sendResponse = res.send;
          res.send = (body) => {
            clientRedis.set(key, body);
              res.sendResponse(body);
          }
          next();
   
  };

  let redisMiddleware2 = (req, res, data,next) => {
   //let key = "questionforuser1" + req.originalUrl || req.url;
          res.sendResponse = res.send;
          res.send = (body) => {
            // Loop for each record here
            for (var i = 0, len = data.length; i < len; i++) {
                //someFn(data[i]);
                // declare a variable 
                // set emp id to that 
                // do while loop until emp id == data .empid
                res.send(data[i]);

                var id=emp_id;
                do {
                   id=id[i];
                   // each question add to
                   var emp_id=[];
                   emp_id.push(id[i]);
                   console.log("emp question inserting intp array");
                  } while (id==data.emp_id);
              // 
            ///clientRedis.set(key, data);
            clientRedis.set(id, emp_id);
            
            res.send(emp_id);
            emp_id=[];
           //   res.sendResponse(body);

          }
          next();
  };
};

 

  app.get("/userinfo", redisMiddleware, function(req, res) {
    var req = new sql.Request();
    // query to the database and get the records

    req.execute('SP_GETUSERINFO', function (err,results) {
        if (err) console.log(err),
        console.log(emp_id);

        // send records as a response
        console.time()
        res.send(JSON.stringify(results.recordset));
        
        
     });
  });

  app.get("/userinfo/:empid", function(req, res) {
    let key = req.params.empid;
    let empdetails="";
    clientRedis.get(key, function(err, reply)
    {
      if(reply){
          //res.send(reply);
          console.log("In Cache find");
          empdetails = reply;
      }
      else{
                console.log("Getting data from Stored Proc");
                console.log(key);
                var req = new sql.Request();
                req.execute('SP_GETUSERINFO', function (err,data) {
                    if (err) console.log(err),
                        console.log(data);
                    //Loop through data here
                    console.log("Succesful in geting data from userSP");
                    //console.log(data.recordset);
                    let i=0;
                    while (i < data.recordset.length) {
                        //console.log("Finding Data for user" + data.recordset[i].logon_name);
                        var id=data.recordset[i].logon_name;
                    //console.log(id);
                    var emp=[];
                    emp.push(JSON.stringify(data.recordset[i]));
                    if (id == key)
                    {
                        //console.log(empQuestions);
                        console.log(emp.length);
                        console.log("Completed for user " + id);
                        console.log(emp);
                        clientRedis.set(id, (emp));
                        empdetails=JSON.stringify(emp);
                    }
                    i++;
                    }
                });
        }
        //console.log(queriesForUser);
       res.send(empdetails);
        //console.log(response);
    });
  });

  app.get("/surveyuser1", redisMiddleware1, function(req, res) {
    var req = new sql.Request();
    // query to the database and get the records

    req.execute('SP_GETSURVEYUSER', function (err,results) {
        if (err) console.log(err),
        console.log(emp_id);

        // send records as a response
        console.time()
        res.send(JSON.stringify(results.recordset));
        
     });
  });


  

  app.get("/surveyuser1/:empid",redisMiddleware1,  function(req, res) {
    let key=req.params.empid;

    let surveyForUser="";
    console.log(key);
    clientRedis.get("survey"+key, function(err, reply)
    {
                if(reply){
                    //res.send(reply);
                    console.log("In Cache find");
                    surveyForUser = reply;
                    console.log(surveyForUser);
                }
               else
                {
                    console.log("Getting data from survey user Stored Proc");
                    console.log(key);
                  
                    var req = new sql.Request();
                    req.execute('SP_GETSURVEYUSER', function (err,data) {
                        if (err) console.log(err),
                            console.log(data);
                        //Loop through data here
                        console.log("Succesful in geting data from userSP");
                        //console.log(data.recordset);
                        for (var i = 0; i < data.recordset.length;  ) {
                            console.log("Finding Data" + data.recordset[i].emp_id);
            
                            var id=data.recordset[i].emp_id;
                            var surveyuser=[];
                            var checkLoop = true;
                            var loopCounter=0;
                            while(i < data.recordset.length && id == data.recordset[i].emp_id) {
                                //console.log(data[i]);
                                if (id==key)
                                {
                                    console.log("test");
                                }
                                surveyuser.push(data.recordset[i]);
                                i++;
                            }
            
                            clientRedis.set("survey"+id, JSON.stringify(surveyuser));
                          console.log("Completed for " + id);
                          if (id == key)
                          {
                              console.log(surveyuser.length);
                              //console.log(empQuestions);
                              queriesForUser = JSON.stringify(surveyuser);
                              console.log(surveyForUser);
                          }
                        }
                    });
                }
                
                  res.send(surveyForUser);
                  console.log(surveyForUser);
    });
  });


  


  app.get("/getquestionforuser1", redisMiddleware2, function(req, res) {
    var req = new sql.Request();
    // query to the database and get the records

    req.execute('SP_GETQUSTIONSFORUSER', function (err,results) {
        if (err) console.log(err),
        console.log(emp_id);

        //Loop through data here


        // send records as a response
        console.time()
        res.send(JSON.stringify(results.recordset));
        //res.send()
     });
  });

  app.get("/getquestionforuser1/:emp_id", redisMiddleware2, function(req, res,data) {
    let key = req.params.emp_id;
    let queriesForUser="";
    clientRedis.get(key, function(err, reply)
    {
      if(reply){
          //res.send(reply);
          console.log("In Cache find");
          queriesForUser = reply;
      }
      else {
          console.log("Getting data from Stored Proc");
          console.log(key);
        var req = new sql.Request();
        req.execute('SP_GETQUSTIONSFORUSER', function (err,data) {
            if (err) console.log(err),
                console.log(data);
            //Loop through data here
            console.log("Succesful in geting data from SP");
//            console.log(data.recordset);
            for (var i = 0; i < data.recordset.length;  ) {
                console.log("Finding Data" + data.recordset[i].emp_id);

                var id=data.recordset[i].emp_id;
                var empQuestions=[];
                var checkLoop = true;
                var loopCounter=0;
                while(i < data.recordset.length && id == data.recordset[i].emp_id) {
                    //console.log(data[i]);
                    if (id==key)
                    {
                        console.log("test");
                    }
                    empQuestions.push(data.recordset[i]);
                    i++;
                }

                clientRedis.set(id, JSON.stringify(empQuestions));
              console.log("Completed for " + id);
              if (id == key)
              {
                  console.log(empQuestions.length);
                  //console.log(empQuestions);
                  queriesForUser = JSON.stringify(empQuestions);
                  console.log(queriesForUser);
              }
            }
           });
        }
        //console.log(queriesForUser);
        res.send((queriesForUser));
        //console.log(response);
    });
   
});

  //app.get("/getquestionforuser1/:emp_id", redisMiddleware2, function(req, res) {
    //res.send(JSON.stringify(results.recordset));
  //});
  
  
  
app.get('/user/:id' ,(req, res,id) => {
    var id = (req.params.id); 
    var req = new sql.Request();
        // query to the database and get the records
    req.input('id', sql.nvarchar)
        req.query('SELECT * FROM TBL_USER WHERE emp_id ='+[id], function (err, rows) {
            if (err) console.log(err),
            console.log(rows);

            // send records as a response
            console.log(id),
           res.send(JSON.stringify(rows));
         
    });

});




//clientRedis.keys('*', function (err, keys) {
    //if (err) return console.log(err);
  
    //for(var i = 0, len = keys.length; i < len; i++) {
     // console.log(keys[i]);
    //}
  //}); 

 





app.get('/surveyuser/:survey_id' ,(req, res, next) => {
    var survey_id = (req.params.survey_id); 
    var emp_id = (req.params.emp_id); 
    var req = new sql.Request();
           
        // query to the database and get the records
        req.query(' select * from TBL_SURVEY_USERS where survey_id='+["survey_id"], function (err, results) {
            
            if (err) console.log(err)

            // send records as a response
            
            res.send(JSON.stringify(results.recordset));
     

    });

});



















/*
async () => {
    try {
        await sql.connect(config)
        const result = await sql.query`SELECT * FROM TBL_CERTIFICATE`
        console.dir(result)
    } catch (err) {
        // ... error checks
        console.log(err);
    }
}
*/


app.get('/feedback/:emp_id' ,(req, res) => {
    var emp_id = (req.params.emp_id); 
    var req = new sql.Request();
        // query to the database and get the records
    
        req.query('select * from TBL_FEEDBACK WHERE emp_id ='+["emp_id"], function (err, results) {
            if (err) console.log(err),
            console.log(emp_id);

            // send records as a response
            res.send(results.recordset[0]);
     

    });

});










try{
    clientRedis.on('connect', function(err) {
        if(err){
            console.log(err);
           
        }
        console.log('Redis connected');
       
    });

    clientRedis.on("error", (err) => {
        console.log(err);
       
        //send email in case of failure
    });
}
catch(err){
    console.log(err);
}




 

    module.exports=app;