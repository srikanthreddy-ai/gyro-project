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
  app.engine('handlebars', exphbs({defaultLayout:'main'}));
  app.set('view engine', 'handlebars');
server.listen(3000, ()=>console.log("server running port at :"+port));

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
    options: {
      encrypt: false
    }// Use this if you're on Windows Azure
}

console.log(config.server);

var conn=sql.connect(config, function(err) {
    // ... error checks
    var req = new sql.Request();
    req.stream = true; // You can set streaming differently for each request
    //req.query('select * from TBL_USER'); // or request.execute(procedure);

    req.on('recordset', function(columns) {
        // Emitted once for each recordset in a query
        console.log(columns);
    });

    req.on('row', function(row) {
        // Emitted for each row in a recordset
        console.log(row);
    });

    req.on('error', function(err) {
        // May be emitted multiple times
        console.log(err);
    });

    req.on('done', function(returnValue) {
        // Always emitted as the last one
        console.log(returnValue);
    });

});

createRoutes(app, config);


app.get('/questionsforuser' ,(req, res, next) => {

    var req = new sql.Request(conn);
           
        // query to the database and get the records
        req.query('EXEC [dbo].[SP_GETQUSTIONSFORUSER] ', function (err, recordset,rowCount) {
            
            if (err) console.log(err)

            // send records as a response
            console.log(rowCount + ' row(s) returned');
            res.send(recordset);
     

    });

});
app.get('/questionare' ,(req, res, next) => {

    var req = new sql.Request(conn);
           
        // query to the database and get the records
        req.query('EXEC [dbo].[SP_QUSTIONARE_OLD] ', function (err, recordset,rowCount) {
            
            if (err) console.log(err)

            // send records as a response
            console.log(rowCount + ' row(s) returned');
            res.send(recordset);
     

    });

});
app.get('/surveyuser' ,(req, res, next) => {

    var req = new sql.Request();
           
        // query to the database and get the records
        req.query('EXEC [dbo].[SP_GETSURVEYUSER] ', function (err, recordset,rowCount) {
            
            if (err) console.log(err)

            // send records as a response
            console.log(rowCount + ' row(s) returned');
            res.send(recordset);
     

    });

});

app.put('/surveyuser/emp_id' ,(req, res, next) => {

    var req = new sql.Request();
           
        // query to the database and get the records
        req.query("EXEC [dbo].[SP_RESPONSE]  ( @survey_id = '"+req.body.survey_id+"',@emp_id ='"+req.body.emp_id+"' ,@quest_attempted = "+req.body.quest_attempted+",@no_questions_ans = "+req.body.no_questions_ans+" )", function (err, recordset,rowCount) {
            
            if (err) console.log(err)

            // send records as a response
            console.log(rowCount + ' row(s) returned');
            res.send(recordset);
     

    });

});



app.get('/surveyhistory' ,(req, res, next) => {

    var req = new sql.Request();
           
        // query to the database and get the records
        req.query('EXEC [dbo].[SP_GETUSERSURVEYHISTORY] ', function (err, recordset,rowCount) {
            
            if (err) console.log(err)

            // send records as a response
            console.log(rowCount + ' row(s) returned');
            res.send(recordset);
     

    });

});




app.get('/user/:emp_id' ,(req, res) => {
    var emp_id = (req.params.emp_id); 
    var req = new sql.Request();
        // query to the database and get the records
    
        req.query('SELECT * FROM TBL_USER WHERE emp_id ='+["emp_id"], function (err, row, fields, rowCount) {
            if (err) console.log(err),
            console.log(emp_id);

            // send records as a response
            res.send(row);
     

    });

});


app.get('/question/:question_no' ,(req, res, question_no) => {
    var question_no = (req.params.question_no); 
    var req = new sql.Request();
        // query to the database and get the records
    
        req.query('SELECT * FROM TBL_QUESTIONS WHERE question_no ='+[question_no], function (err, rows, rowCount, fields) {
            if (err) console.log(err)

            // send records as a response
            console.log(rowCount + ' row(s) returned');
            res.send(rows);
     

    });

});
app.get('/userplant/:id' ,(req, res, id) => {
    var id = req.params.id; 
    var req = new sql.Request();
        // query to the database and get the records
    
        req.query('SELECT * FROM TBL_USER WHERE plant_id ='+[id], function (err, row, fields) {
            if (err) console.log(err)

            // send records as a response
            res.send(row),
            console.log('Deleted successfully'+row);
     

    });

});

app.post('/surveyuser/update' ,(req, res, parameters) => {

    var req = new sql.Request();
        // query to the database and get the records
    
        req.query("INSERT INTO SP_RESPONSE ( survey_id, emp_id, quest_attempted, last_attempt_date) VALUES ('req.body.survey_id' , 'req.body.emp_id', 'req.body.quest_attempted', 'req.body.last_attempt_date')", function (err, rows, rowCount, fields) {
            
            if (err) console.log(  err);

            // send records as a response
            console.log(req.body);
            console.log(rowCount + ' row(s) returned');
            res.send(rows);

    });

});

app.post('/responce' ,(req, res, next) => {

    var req = new sql.Request();
        // query to the database and get the records
    
        req.query("INSERT INTO [TBL_RESPONSE] (emp_id, survey_id, question_no, attempts, answer, points) VALUES ('"+req.body.emp_id+"' , '"+req.body.survey_id+"', "+req.body.question_no+", "+req.body.attempts+", '"+req.body.answer+"', "+req.body.ponts+")", function (err, data, rowCount, fields) {
           
            if (err) {
                console.log(req.body);
                console.log(  err);
                res.writeHead(500, "Internal error occured",{"content-type":"application/json"});
            res.write(JSON.stringify({data:"error occured"+err}));
            }

            else{// send records as a response
            console.log(req.body);
            console.log(rowCount + ' row(s) returned');
            res.send(JSON.stringify(data));
            }

    });

});

app.put('/spresponce/:emp_id' ,(req, res,emp_id) => {
    var emp_id = req.params.emp_id; 
    var req = new sql.Request(conn);
        // query to the database and get the records
    
        req.query("EXEC [dbo].[SP_RESPONSE]  (@emp_id ='"+req.body.emp_id+"' , @survey_id = '"+req.body.survey_id+"',@question_no = "+req.body.question_no+",@attempts = "+req.body.attempts+",@answer = '"+req.body.answer+"',@points = "+req.body.points+")", function (err, data, fields) {
            
            if (err) console.log(err);

            // send records as a response
        
            res.send(data);

    });

});

app.put('/spresponce' ,(req, res,emp_id) => {
    var emp_id = req.params.emp_id; 
    var req = new sql.Request(conn);
        // query to the database and get the records
    
        req.query("EXEC [dbo].[SP_RESPONSE]  (@emp_id ='"+req.body.emp_id+"' , @survey_id = '"+req.body.survey_id+"',@question_no = "+req.body.question_no+",@attempts = "+req.body.attempts+",@answer = '"+req.body.answer+"',@points = "+req.body.points+")", function (err, data, fields) {
            
            if (err) console.log(err);

            // send records as a response
        
            res.send(data);

    });

});





try{
    clientRedis.on('connect', function(err) {
        if(err){
            console.log(err);
            nhhs_logger.error(err,"Redis connection error");
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


    