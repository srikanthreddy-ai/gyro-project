var express = require('express');
var router = express.Router();
var userinfoController=require('../controller/user');



router.get('/userinfo/:empname', userinfoController.getuserinfo);