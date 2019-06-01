var mysql=require('mysql');
var router=express.Router();

var mysqlConnection=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'mydb'
})
mysqlConnection.connect((err)=>{
if(!err)

 console.log("database connected")
else
console.log("database not connected \n Error" + JSON.stringify(err, undefined, 2));

});


module.export=config;