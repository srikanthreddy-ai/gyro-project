var mysql=require('mysql');
var express=require('express');
var router = express.Router();
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
var lowerCase = require('lower-case');
var ignoreCase = require('ignore-case');
var ci = require('case-insensitive');
var userinfo=require('./router/userinfo');

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
var conn=sql.connect(config, function(req,res,err) {
    if (err) res.send(err);
    // ... error checks
    console.log(config.server);

});

createRoutes(app, config);


  app.get("/userinfo/:empname", function(req, res, next) {
    let key =lowerCase(req.params.empname);
    let empdetails="";
       try{
                    var req = new sql.Request();
                    req.execute('SP_GETUSERINFO', function (err,data) {
                        if (err) console.log(err);
                        for (var i = 0; i < data.recordset.length;  ) {
                            lowerCase(data);
                            var a=data.recordset[i].logon_name;
                            var id=lowerCase(data.recordset[i].logon_name);
                            var emp=[];
                            ignoreCase.equals(id, data.recordset[i].logon_name)
                            var checkLoop = true;
                            var loopCounter=0;
                            while(i < data.recordset.length && id ==lowerCase(data.recordset[i].logon_name)) { 
                                emp.push(data.recordset[i]);
                                i++;
                            }
                            if (id == key)
                            {
                                empdetails = JSON.stringify(emp);
                            }
                
                        }
                        res.send(empdetails);
                    });
    
                }
                catch(err){
                    throw Error(err);
                }
  });

  

  


  

  app.get("/surveyuser1/:empid",  function(req, res,next) {
    let key=req.params.empid;
    let surveyForUser="";      
    try{      
                    var req = new sql.Request();
                    req.execute('SP_GETSURVEYUSER', function (err,data) {
                        if (err) console.log(err);
                        for (var i = 0; i < data.recordset.length;  ) {
            
                            var id=data.recordset[i].emp_id;
                            var surveyuser=[];
                            var checkLoop = true;
                            var loopCounter=0;
                            while(i < data.recordset.length && id == data.recordset[i].emp_id) {
                                surveyuser.push(data.recordset[i]);
                                i++;  
                            }
                            if (id == key)
                            {
                                surveyForUser = JSON.stringify(surveyuser);
                            }
                           
                           
                        }
                        
                        res.send(surveyForUser);
                    });
                }
                catch(err){
                    throw Error(err);
                }
  });


  



  app.get("/getquestionforuser1/:emp_id", function(req, res,next) {
    let empid=req.params.emp_id ;
	let key = req.params.emp_id +"_Query" ;
    let queriesForUser ='';
    let cacheFound = false;
    var req = new sql.Request();

    try
	{
        if (clientRedis != null)
        {
            clientRedis.get(key, function(err, reply){
                if (reply)
                {
                    cacheFound = true;
                    queriesForUser=reply;
                    res.send(reply);
                }
                else
                {
                   
                    req.execute('SP_GETQUSTIONSFORUSER', function (err,data) {
                        if(data.recordset.length==0){
                            res.send("data not found");
                        }

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
                                            
                                        clientRedis.setex(id+"_Query",86400,JSON.stringify(empQuestions));
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
       res.send("Something went wrong, please try again");
    }
});


var j = schedule.scheduleJob('0 0 0 * * *', function(){
    console.log('caching every day at 12 AM');
    var req = new sql.Request();
    req.query("EXEC SP_STARTSURVEY", function (req,res) {console.log("Survey started") });
  req.query("EXEC SP_STOPSURVEY", function (req,res) {console.log("Survey Stoped");});
    try{
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
                                //console.log(id);
                            }
                            
                        clientRedis.setex(id+"_Query",86400,JSON.stringify(empQuestions));
                        
                       
                }
        
            }
        });
    }
    catch(err){
        throw Error(err);
    }
    
    
  });

app.get('/', function (req, res,err) {
    res.send("Server Connected Succesfully")
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
          if (err) console.log(err);
            
          for (var i = 0; i < data.recordset.length;  ) {

              var id=data.recordset[i].survey_id;
              var pictures=[];
              var checkLoop = true;
              var loopCounter=0;
              while(i < data.recordset.length && id == data.recordset[i].survey_id) {
                  pictures.push(data.recordset[i]);
                  i++;
              }

              clientRedis.set("picture"+id, JSON.stringify(pictures));
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
          surveypicture = reply;
      }
      else {
      var req = new sql.Request();
      req.query('[dbo].[SP_GETSURVEYQUESTIONSIMAGE]', function (err,data) {
          if (err) console.log(err);
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

 
  app.post('/userpreflang' ,(req, res, next) => {
      try{
      var logon_name=req.body.logon_name;
      var lang_pref=req.body.lang_pref;
      console.log(logon_name);
      console.log(lang_pref);
    var req = new sql.Request();
    req.query("EXEC SP_UPDATEUSERLANGUAGE @logon_name='"+logon_name+"',@lang_pref='"+lang_pref+"';", function (err, data) {
        
        if (err) {
            res.send(err);
        }
        else{
            if(lang_pref=="") {
                res.send("Please Select Language")
            } 
            else{
                res.send("User Prefered Language Updated");
            }
       
        }
        });
      }
      catch(err){
        throw Error(err);
      }

});


app.post('/addnewuser' ,(req, res, next) => {
    try{
    var logon_name=(req.body.logon_name);
    var emp_id=(req.body.emp_id);
    var name=(req.body.name);
    var plant_id=(req.body.plant_id);
    var email=(req.body.email);
    var lang_pref=(req.body.lang_pref);
    console.log(logon_name);
    console.log(emp_id);
    console.log(name);
  var req = new sql.Request();
  req.query("EXEC SP_ADDNEWUSER @logon_name='"+logon_name+"',@emp_id='"+emp_id+"',@name='"+name+"',@plant_id="+plant_id+",@email='"+email+"',@lang_pref='"+lang_pref+"';", function (err, data) {
      
            if (err) {
                console.log(err);
            }
            else{
                if(emp_id==""||name==""||plant_id==""||email==""||lang_pref==""){
                    res.send("JSON not valid or wrong user details");
                }
                else{
                res.send("New user added successfully");
                }
            }
      });
    
    }
    catch(err){
        throw Error(err);
    }

});

app.post('/addnewsurveyuser' ,(req, res, next) => {
    try{
    var emp_id=(req.body.emp_id);
    var plant_id=(req.body.plant_id);
    console.log(plant_id);
    console.log(emp_id);
  var req = new sql.Request();
  req.query("EXEC SP_ADDNEWSURVEYUSER @emp_id='"+emp_id+"',@plant_id='"+plant_id+"';", function (err, data) {
      
            if (err) {
                console.log(err);
            }
            else{
                if(plant_id==""||emp_id==""){
                    res.send("Please provide survey user information");
                }
                else{
                res.send("New survey user added successfully");
                }
            }
      });
    
    }
    catch(err){
        throw Error(err);
    }

});
  
app.post('/addsurveyaction' ,(req, res, next) => {
    try{
    var survey_id=(req.body.survey_id);
    var emp_id=(req.body.emp_id);
    var action=(req.body.action);
    console.log(survey_id);
    console.log(emp_id);
  var req = new sql.Request();
  req.query("EXEC SP_ADDSURVEYACTION @survey_id='"+survey_id+"',@emp_id='"+emp_id+"',@action="+action+";", function (err, data) {
          
    
            if (err) {
                res.send(emp_id+"  User already added for the survey  "+survey_id);
            }
            else{
                        if(emp_id==""||action==""){
                            res.send("Please provide survey action information");
                        }
                        else{
                        res.send("New survey action added successfully");
                        }
               }
      });
    
    }
    catch(err){
        throw Error(err);
    }

});

app.post('/updateresponse' ,(req, res, next) => {

    var survey_id=(req.body.survey_id);
    var emp_id=(req.body.emp_id);
    var rsp_date = (req.body.rsp_date); // Added for calling SP_UPDATERESPONSE1
    var qno_1=(req.body.qno_1);
    var attempt_1=(req.body.attempt_1);
    var ans_1=(req.body.ans_1);
    var points_1=(req.body.points_1);
    var qno_2=(req.body.qno_2);
    var attempt_2=(req.body.attempt_2);
    var ans_2=(req.body.ans_2);
    var points_2=(req.body.points_2);
    var qno_3=(req.body.qno_3);
    var attempt_3=(req.body.attempt_3);
    var ans_3=(req.body.ans_3);
    var points_3=(req.body.points_3);


  var req = new sql.Request();
  req.query("EXEC SP_UPDATERESPONSE1 '"+survey_id+"','"+emp_id+"','"+rsp_date+"',"+qno_1+","+attempt_1+",'"+ans_1+"',"+points_1+","+qno_2+","+attempt_2+",'"+ans_2+"',"+points_2+","+qno_3+","+attempt_3+",'"+ans_3+"',"+points_3+"", function (err, data) {
      
            if (err) {

                res.send(400+err);
            }
            else{
               
                res.send(emp_id+"User Response added successfully");
                
            }
      });
    
});


app.get('/startsurvey' ,(req, res, next) => {
    try{
  var req = new sql.Request();
  req.query("EXEC SP_STARTSURVEY", function (err, data) {
          
    
            if (err) {
                res.send("Something went wrong");
            }
            else{
              res.send("Survey started");

               }
      });
    
    }
    catch(err){
        throw Error(err);
    }

});
app.get('/stopsurvey' ,(req, res, next) => {
    try{
  var req = new sql.Request();
  req.query("EXEC SP_STOPSURVEY", function (err, data) {
          
    
            if (err) {
                res.send("Something went wrong");
            }
            else{
              res.send("Survey Stoped");

               }
      });
    
    }
    catch(err){
        throw Error(err);
    }

});

app.get('/deletekey/:emp_id' ,(req, res, next) => {
    let keys=req.params.emp_id+"_Query";
    console.log(keys);
    try{
        clientRedis.del(keys, function(req,res,err) {
            console.log("deleted successfully");
        });
        res.send(keys+" Deleted Successfully");
    }
    catch(err){
        throw Error(err);
    }

});

app.get('/deleteallkeys' ,(req, res, next) => {
    try{
        clientRedis.flushall((err, success) => {
            if (err) {
              throw new Error(err);
            }
            console.log(success); // will be true if successfull
          });
        res.send(" Deleted All Keys Successfully");
    }
    catch(err){
        throw Error(err);
    }



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