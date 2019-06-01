const http=require('http');
const app=require('.');
const port= process.env.PORT||3000;

const server=http.createServer(app);

server.listen(port);
console.log("server running port at  :"+port);