var express=require('express');
var router = express.Router();
var app=express();

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

  module.exports=app;