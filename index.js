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

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser. json());



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

var config = {
    user: 'SAEEsa',
    password: 'gyrit@123',
    server: '13.234.235.89',
    //server: 'CORPSSPS01\\SQLEXPRESS', // You can use 'localhost\\instance' to connect to named instance 
    database: 'SAEEdb',
    stream: true,
    port:1433,
    multipleStatements:true,
    parseJSON:true,
    options: {    
        instance:'SQLEXPRESS', 
     auto_reconnect: true,
      encrypt: false
    }// Use this if you're on Windows Azure
}


var connection = new Connection(config); 
var conn=sql.connect(config, function(err) {
    if (err) console.log(err);
    // ... error checks
    console.log(config.server);// You can set streaming differently for each request
    //req.query('select * from TBL_USER'); // or request.execute(procedure);


});



createRoutes(app, config);




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

 

  

  app.get("/userinfo/:empname", function(req, res) {
    let key = req.params.empname;
    let empdetails="";
    clientRedis.get("user"+key, function(err, reply)
    {
        empdetails=reply;
                 console.log("Getting data from survey user Stored Proc");
                    console.log(key);
                    
                    var req = new sql.Request();
                    req.execute('SP_GETUSERINFO', function (err,data) {
                        if (err) console.log(err),
                            console.log(data);
                        console.log("Succesful in geting data from userSP");
                        for (var i = 0; i < data.recordset.length;  ) {
                            var id=data.recordset[i].logon_name;
                            var emp=[];
                            var checkLoop = true;
                            var loopCounter=0;
                            while(i < data.recordset.length && id == data.recordset[i].logon_name) {
                               
                                emp.push(data.recordset[i]);
                                i++;

                            }

                            clientRedis.set("user"+id, JSON.stringify(emp));
                            if (id == key)
                            {
                                empdetails = JSON.stringify(emp);
                            }
                            else{
                                empdetails="USER NOT FOUND";
                            }
                           
                        }
                    });
       
       res.send(empdetails);
    });
  });

  

  


  

  app.get("/surveyuser1/:empid",redisMiddleware1,  function(req, res) {
    let key=req.params.empid;
    let surveyForUser="";
    console.log(key);
    clientRedis.get("survey"+key, function(err, reply){
                 
                    console.log("Getting data from survey user Stored Proc");
                    console.log(key);
                    surveyForUser=reply;
                    var req = new sql.Request();
                    req.execute('SP_GETSURVEYUSER', function (err,data) {
                        if (err) console.log(err),
                            console.log(data);
                        for (var i = 0; i < data.recordset.length;  ) {
            
                            var id=data.recordset[i].emp_id;
                            var surveyuser=[];
                            var checkLoop = true;
                            var loopCounter=0;
                            while(i < data.recordset.length && id == data.recordset[i].emp_id) {
                                surveyuser.push(data.recordset[i]);
                                i++;
                            }
            
                            clientRedis.set("survey"+id, JSON.stringify(surveyuser));
                          if (id == key)
                          {
                              surveyForUser = JSON.stringify(surveyuser);
                          }
                          else{
                            surveyForUser="USER NOT AVAILABLE FOR THE SURVEY";
                        }
                        }
                    });
                       
                  res.send(surveyForUser);
                  
    });
    
  });


  



  app.get("/getquestionforuser1/:emp_id", function(req, res) {
    let empid=req.params.emp_id ;
	let key = req.params.emp_id +"_Query" ;
    let userQuestions = '';
    let cacheFound = false;

    try
	{
        if (clientRedis != null)
        {
            clientRedis.get(key, function(err, reply){
                if (reply)
                {
                    console.log("in cache");
                    cacheFound = true;
                    userQuestions=reply;
                    res.send(reply);
                }
                else
                {
                    console.log("in data fetch");
                    var req = new sql.Request();
                    req.execute('SP_GETQUSTIONSFORUSER', function (err,data) {
                            if (data != 'undefined' && data.recordset != 'undefined')	{
                                for (var i = 0; i < data.recordset.length;  ) {
                                        var id=data.recordset[i].emp_id;
                                        var empQuestions=[];
                                        var checkLoop = true;
                                        var loopCounter=0;
                                            while(i < data.recordset.length && id == data.recordset[i].emp_id) {
                                                
                                                empQuestions.push(data.recordset[i]);
                                                i++;
                                            }
                                        clientRedis.setex(id+"_Query",60*60*12,JSON.stringify(empQuestions));
                                        if (id === empid)
                                        {

                                            queriesForUser = JSON.stringify(empQuestions);
                                        }
                                        else{
                                            queriesForUser="USER NOT AVAILABLE FOR THE TEST";
                                        }
                                }
                                if(queriesForUser)
                                {
                                    res.send(queriesForUser);
                                }
                            }
                        });
                    }
            });

           
        }

    }
    catch(err){
       // queriesForUser = errors.error("Something went wrong, please try again", 400, err);
       res.send("Something went wrong, please try again");
    }
});




app.get('/', function (req, res) {
    var services=[],
    services=[{"1.getuserlanguage":"http://host:3000/userinfo/[logon_name]"},
    {"2.getquestionforuser":"http://host:3000/getquestionforuser1/[emp_id]"},
    {"3.getsurveyuser":"http://host:3000/surveyuser1/[emp_id]"},
    {"4.getuserhistory":"http://host:3000/usersurveyhistory/[emp_id]"},
    {"5.getuserhistory":"http://host:3000/pictures/[emp_id]"}]
    res.send(services)
  });

  app.get("/usersurveyhistory/:empid",  function(req, res) {
    let key=req.params.empid;
    let usersurveyhostory="";

    clientRedis.get("userhistory"+key, function(err, reply)
    {
        usersurveyhostory=reply;
          console.log("Getting data from Stored Proc");
          console.log(key);
        var req = new sql.Request();
        req.query('SELECT * FROM [dbo].[TBL_RESPONSE]', function (err,data) {
            if (err) console.log(err),
                console.log(data);
            for (var i = 0; i < data.recordset.length;  ) {
                console.log("Finding Data" + data.recordset[i].emp_id);

                var id=data.recordset[i].emp_id;
                var history=[];
                var checkLoop = true;
                var loopCounter=0;
                while(i < data.recordset.length && id == data.recordset[i].emp_id) {
                    if (id==key)
                    {
                        console.log("test");
                    }
                    history.push(data.recordset[i]);
                    i++;
                }

                clientRedis.set("userhistory"+id, JSON.stringify(history));
              if (id == key)
              {
                  usersurveyhostory = JSON.stringify(history);
              }
            }
           });
        res.send(usersurveyhostory);
    });
  });


  app.get("/pictures/:survey_id",  function(req, res) {
    let key=req.params.survey_id;
    let picture="";
    clientRedis.get("picture"+key, function(err, reply)
    {
      if(reply){
          picture = reply;
      }
      else {

      var req = new sql.Request();
      req.query('[dbo].[SP_GETSURVEYIMAGE]', function (err,data) {
          if (err) console.log(err),
              console.log(data);
          console.log("Succesful in geting data from SP");
          for (var i = 0; i < data.recordset.length;  ) {
              console.log("Finding Data" + data.recordset[i].survey_id);

              var id=data.recordset[i].survey_id;
              var pictures=[];
              var checkLoop = true;
              var loopCounter=0;
              while(i < data.recordset.length && id == data.recordset[i].survey_id) {
                  if (id==key)
                  {
                      console.log("test");
                  }
                  pictures.push(data.recordset[i]);
                  i++;
              }

              clientRedis.set("picture"+id, JSON.stringify(pictures));
            console.log("Completed for " + id);
            if (id == key)
            {
                picture = JSON.stringify(pictures);
            }
          }
         });
        }
       res.send(picture);
    });
  });


  app.get("/getsurveyimage/:survey_id",  function(req, res) {
    let key=req.params.survey_id;
    let surveypicture="";
    console.log(key);
    clientRedis.get("surveypicture"+key, function(err, reply)
    {
      if(reply){
          console.log("In Cache find");
          surveypicture = reply;
      }
       {
        console.log("Getting data from Stored Proc");
        console.log(key);
      var req = new sql.Request();
      req.query('[dbo].[SP_GETSURVEYQUESTIONSIMAGE]', function (err,data) {
          if (err) console.log(err),
              console.log(data);
        
          console.log("Succesful in geting data from SP");
          for (var i = 0; i < data.recordset.length;  ) {
              var id=data.recordset[i].survey_id;
              var surveyimage=[];
              var checkLoop = true;
              var loopCounter=0;
              while(i < data.recordset.length && id == data.recordset[i].survey_id) {
                  if (id==key)
                  {
                      //console.log("test");
                  }
                  surveyimage.push(data.recordset[i]);
                  i++;
              }

              clientRedis.set("surveypicture"+id, JSON.stringify(surveyimage));
            console.log("Completed for " + id);
            if (id == key)
            {
                surveypicture = JSON.stringify(surveyimage);
            }
          }
         });
        }
       res.send(surveypicture);
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