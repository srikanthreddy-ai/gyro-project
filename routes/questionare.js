var mysql=require('mysql');
var bodyParser=require('body-parser');
var nodemon=require('nodemon');
var express = require('express');
var app=require('express');
var normalizePort = require('normalize-port');
var port=normalizePort(process.env.PORT||3000);
const http=require('http');
const redis=require('redis');
var exphbs  = require('express-handlebars');
var clientRedis = redis.createClient('6379','localhost',0);
const sql = require('mssql-plus');
var createRoutes = require('restful-stored-procedure');
var Connection = require('tedious').Connection;
var morgan=require('morgan');
var async = require('async');
var session = require('express-session');
var redisStore = require('connect-redis')(session);
const responseTime = require('response-time')
var router=express.Router();
var questionare = express.Router();






questionare.get('/questionare' ,(req, res, next) => {

    var req = new sql.Request(conn);
           
        // query to the database and get the records
        req.query('EXEC [dbo].[SP_QUSTIONARE_OLD] ', function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
          
            res.send(recordset);
     

    });

});


module.exports=questionare;