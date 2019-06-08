

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