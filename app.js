
/**
 * Module dependencies.
 */

var express = require('express');
//app y io son variables globales 
app = module.exports = express.createServer();
io = require('socket.io')(app);

// modulos
var bodyParser = require('body-parser')
var cors = require('cors')
var connect=require('connect');
var multipart = require('connect-multiparty');
// var url = require('url');
// var parsed_url = url.parse(request.url, true);
// var querystring_object = parsed_url.query
//Se establece la conexion a la base de datos ( con es global)
//mysql es globlal
 mysql= require("./controladores/conexionBD");
 creds = require("./controladores/conexionBD/db_creds.json");
 con =  {};

creds = {
  "host":  "localhost", 
  "user":  "root" , 
  "pass":  "", 
  "db": "aulavirtbd" , 
  "port": 3306
}
try{
  
  con= mysql.nueva_conexion_bd(creds.host,  creds.user, creds.pass, creds.db, creds.port);
 
}catch(err){
  console.log("Error al conectarse");
  console.log(err);
  return;
}

// Configuration
app.configure(function(){
   // app.use(connect.bodyParser());

  app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
      extended: true
    })); 
  app.use( bodyParser.json() );       // to support JSON-encoded bodies
  app.use(cors())
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.methodOverride());
  app.use(multipart()) ;
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.set("view options", { layout: false }); // evitar que carge el layout -.-
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

var publicaciones = require('./controladores/publicaciones'); 
var menurecursos = require('./controladores/menurecursos'); 
var retos = require('./controladores/retos'); 
// Routes
app.use(publicaciones);
app.use(menurecursos);
app.use(retos);


var port =  process.env.PORT || 3000;
app.listen(port, function(){
  console.log("Se ha iniciado el servidor en el puerto %d en modo %s", app.address().port, app.settings.env);
});


