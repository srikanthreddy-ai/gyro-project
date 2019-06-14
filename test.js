

var config = {
    user: 'SAEEsa',
    password: 'gyrit@123',
    server: '13.234.235.89', // You can use 'localhost\\instance' to connect to named instance 
    database: 'SAEEdb',
    stream: true,
    options: {
      encrypt: false
    }// Use this if you're on Windows Azure
}

console.log(config.server);

sql.connect(config, function(err) {
    // ... error checks

    var req = new sql.Request();
    req.stream = true; // You can set streaming differently for each request
    req.query('select * from TBL_USER'); // or request.execute(procedure);

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
    
        req.query("INSERT INTO [TBL_RESPONSE] (emp_id, survey_id, question_no, attempts, answer, points) VALUES ('"+req.body.emp_id+"' , '"+req.body.survey_id+"', "+req.body.question_no+", "+req.body.attempts+", '"+req.body.answer+"', "+req.body.ponts+")", function (err, results) {
           
            if (err) {
                console.log(req.body);
                console.log(  err);
                res.writeHead(500, "Internal error occured",{"content-type":"application/json"});
            res.write(JSON.stringify({data:"error occured"+err}));
            }

            else{// send records as a response
            console.log(req.body);
           
            res.send(JSON.stringify(req.body.recordset[0]));
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

app.post('/spresponce' ,(req, res) => {
    
   
        // query to the database and get the records
    var sql="SET @emp_id=?;SET @survey_id=?;SET @question_no=?;SET @attempts=?;SET @answer=?;SET @points=?; CALL SP_RESPONSE (@emp_id, @survey_id,@question_no,@attempts, @answer,  @points); "
        req.query(sql,[emp_id,survey_id,question_no,attempts, answer,  points], function (err, rows, fields) {
            
            if (err) console.log(err);

            // send records as a response
        
            res.send(rows);

    });

});

app.get('/questionsforuser' ,(req, res, next) => {

    var req = new sql.Request(conn);
           
        // query to the database and get the records
        req.execute('[SP_GETQUSTIONSFORUSER]', function (err, results) {
            
            if (err) console.log(err)

            // send records as a response
            res.send(JSON.stringify(results.recordset));
     

    });
});

app.get('/questionare' ,(req, res, next) => {

    var req = new sql.Request(conn);
           
        // query to the database and get the records
        req.query('EXEC [dbo].[SP_QUSTIONARE_OLD]', function (err, results) {
            
            if (err) console.log(err)

            // send records as a response
            //console.log(JSON.stringify(results.recordset));
            res.send(JSON.stringify(results.recordset));
     

    });

});


app.get("/surveyuser1/:surveyid/:empid",  function(req, res) {
    let key1 = req.params.surveyid;
    let key2=req.params.empid;
    let surveyForUser="";
    clientRedis.get(key1, function(err, reply)
    {
      if(reply){
          //res.send(reply);
          console.log("In Cache find");
          surveyForUser = reply;
          console.log(surveyForUser );
      }
       {
          console.log("Getting data from survey user Stored Proc");
          console.log(key1);
          console.log(key2);
        var req = new sql.Request();
        req.execute('SP_GETSURVEYUSER', function (err,data) {
            if (err) console.log(err),
                console.log(data);
            //Loop through data here
            console.log("Succesful in geting data from SP");
           //console.log(data.recordset);
            for (var i = 0; i < data.recordset.length;  ) {
                console.log("Finding Data" + data.recordset[i].survey_id);
                var id=data.recordset[i].emp_id;
                console.log(id);
                var suveyUser=[];
                var checkLoop = true;
                var loopCounter=0;
                while(i < data.recordset.length && data.recordset[i].emp_id) {
                    console.log(data[i]);
                    if (id==key2)
                    {
                        console.log("test");
                    }
                    suveyUser.push(data.recordset[i]);
                    i++;
                }

                //clientRedis.set(id, JSON.stringify(empQuestions));
              console.log("Completed for " + id);
              console.log(suveyUser);
              if (id == key2)
              {
                  console.log(suveyUser.length);
                  surveyForUser=JSON.stringify(suveyUser);
                  console.log(surveyForUser);
                  //queriesForUser = JSON.stringify(empQuestions);
              }
            }
           });
        }
        //console.log(queriesForUser);
        res.send((surveyForUser));
        //console.log(response);
    });
  });

  app.post('/surveyuser' ,(req, res, next) => {

    var req = new sql.Request();
           
        // query to the database and get the records
        req.query("EXEC [dbo].[SP_RESPONSE]  ( @survey_id = '"+req.body.survey_id+"',@emp_id ='"+req.body.emp_id+"' ,@quest_attempted = "+req.body.quest_attempted+",@no_questions_ans = "+req.body.no_questions_ans+" )", function (err, recordset,rowCount) {
            
            if (err) console.log(err)

            // send records as a response
            console.log(rowCount + ' row(s) returned');
            res.send(recordset);
     

    });

});
app.get("/survey/:surveyid/:empid",redisMiddleware1,  function(req, res) {
    let key1 = req.params.surveyid;
    let key2=req.params.empid;
    let surveyForUser="";
    clientRedis.get(key1, function(err, reply)
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
                    console.log(key1);
                    console.log(key2);
                    var req = new sql.Request();
                    req.execute('SP_GETSURVEYUSER', function (err,data) {
                        if (err) console.log(err),
                            console.log(data);
                        //Loop through data here
                        console.log("Succesful in geting data from userSP");
                        //console.log(data.recordset);
                        let i=0;
                        while (i < data.recordset.length) {
                            //console.log("Finding Data for user" + data.recordset[i].logon_name);
                            var id=data.recordset[i].emp_id;
                            var id1=data.recordset[i].survey_id;
                        //console.log(id);
                        var surveyuser=[];
                          clientRedis.set(id1, JSON.stringify(surveyuser));
                        surveyuser.push(JSON.stringify(data.recordset[i]));
                      
                        if (id == key2)
                        {
        
                            console.log(surveyuser.length);
                            console.log("Completed for user " + id);
                            surveyForUser=JSON.stringify(surveyuser);
                            console.log(surveyForUser);
                            
                        }
                        i++;
                        }
                    });
                }
                  //console.log(queriesForUser);
                  res.send(surveyForUser);
                  console.log(surveyForUser);
    });
  });

  app.get('/user/post' ,(req, res,id) => {
    var id = (req.body.logon_name); 
    var lan = (req.body.lang_pref); 
   var req = new sql.Request();
        // query to the database and get the records
    //req.input('id', sql.nvarchar, value)
    //var sql="SET @logon_name=?;SET @lang_pref=?; CALL SP_UPDATEUSERLANGUAGE @logon_name, @lang_pref"
    //console.log(sql);
        var q=req.query("EXEC SP_UPDATEUSERLANGUAGE id,lan", function (err, rows) {
            
            if (err) {
                
            console.log(err)
            }
            
            console.log(q),
            console.log(id),
            console.log(lan);

            // send records as a response
          return  res.send(JSON.stringify(rows));
         
    });

});


app.get('/surveyuser' ,(req, res, next) => {

    var req = new sql.Request();
           
        // query to the database and get the records
        req.execute('SP_GETSURVEYUSER', function (err, results) {
            
            if (err) console.log(err)

            // send records as a response
            
            res.end(JSON.stringify(results.recordset));
     

    });

});

clientRedis.set('my test key', 'test');
  
  

clientRedis.get('my test key', function (error, result) {
    if (error) {
        console.log(error);
        throw error;
    }
    console.log('GET result ->' + result);
});

app.get('/certificate' ,(req, res,emp_id) => {
   
    var req = new sql.Request();
        // query to the database and get the records
    
        req.query('SELECT * FROM TBL_CERTIFICATE', function (err, results) {
            if (err) console.log(err),
            console.log(results);

            // send records as a response
            res.send(JSON.stringify(results.recordset));
    });

});


let redisMiddleware = (req, res, next) => {
   
    //let key = "userinfo" + req.originalUrl || req.url;
    let key = "userinfo";
    clientRedis.get(key, function(err, reply){
      if(reply){
          res.send(reply);
         
          console.log("Logging from data cache"); 
          console.log(reply);
      }{
          // call the func that executes the stored proce
          // response of stored proce you should set to cahe
          // Return the same value
          res.sendResponse = res.send;
          res.send = (body) => {
            clientRedis.set(key, body);
              res.sendResponse(body);
             
              //console.log(body);
          }
          next();
      }
    });
  };










let startTime = new Date(Date.now());
let endTime = new Date(startTime.getTime() + 5000);
var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(4, 6)];
rule.hour = 17;
rule.minute = 0;
//{ start: startTime, end: endTime, rule: '*/1 * * * * *' }
var i = schedule.scheduleJob({ start: startTime, end: endTime, rule: '*/1 * * * * *' }, function(){
  var req = new sql.Request();
           
        // query to the database and get the records
        req.execute('EXEC [dbo].[SP_GETQUSTIONSFORUSER] ', function (res, err, recordset,rowCount) {
            
            if (err) console.log(err)

            // send records as a response
            console.log('Questionsforuser caching created');
     

    });
});

var j = schedule.scheduleJob({ start: startTime, end: endTime, rule: '*/1 * * * * *' }, function(){
   
    var req = new sql.Request();
             
          // query to the database and get the records
          req.execute('SP_GETSURVEYUSER', function (res, err, recordset) {
              
              if (err) console.log(err)
  
              // send records as a response
             
              console.log('Survey caching created');
  
      });
  });

  var k = schedule.scheduleJob({ start: startTime, end: endTime, rule: '*/1 * * * * *' }, function(){
   
    var req = new sql.Request();
             
          // query to the database and get the records
          req.execute('SP_GETUSERINFO', function (res, err, recordset) {
              
              if (err) console.log(err)
  
              // send records as a response
             
              console.log('userinfo caching created');
  
      });
  });














  app.get('/jobs', function (req, res) {
    var jobs = [];
    client.keys('*', function (err, keys) {
        if (err) return console.log(err);
        if(keys){
            async.map(keys, function(key, cb) {
               client.get(key, function (error, value) {
                    if (error) return cb(error);
                    var job = {};
                    job['jobId']=key;
                    job['data']=value;
                    cb(null, job);
                }); 
            }, function (error, results) {
               if (error) return console.log(error);
               console.log(results);
               res.json({data:results});
            });
        }
    });
});



console.log("Getting data from Stored Proc");
                console.log(key);
                var req = new sql.Request();
                req.query('select * from [dbo].[TBL_RESPONSE]', function (err,data) {
                    if (err) console.log(err),
                        console.log(data);
                    //Loop through data here
                    console.log("Succesful in geting data from userSP");
                    console.log(data.recordset);
                    let i=0;
                    while (i < data.recordset.length) {
                        //console.log("Finding Data for user" + data.recordset[i].logon_name);
                        var id=data.recordset[i].emp_id;
                    //console.log(id);
                    var history=[];
                    history.push(JSON.stringify(data.recordset[i]));
                    if (id == key)
                    {
                        //console.log(empQuestions);
                        console.log(history.length);
                        console.log("Completed for user " + id);
                        console.log(history);
                        clientRedis.set("userhistory"+id, (history));
                        userhostory=JSON.stringify(history);
                    }
                    i++;
                    }
                });


                client.setex(key, parseInt((new Date().setHours(23, 59, 59, 999)-new Date())/1000),  function(err, result) {
                    //check for success/failure here
                  });

                  client.set(key,36,  function(err, result) {
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
                      
                       {
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
                