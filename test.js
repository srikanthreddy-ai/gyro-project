

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