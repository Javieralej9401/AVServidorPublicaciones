var mysql= require("mysql");

function nueva_conexion_bd(host,user,pass,bd,port){
	var connection= mysql.createConnection({host:host,user:user,password:pass,database:bd,port:port});
	return connection;
}
function conectar_bd(con){
	con.connect(function(error){
		if(error){
			throw error;	
		}else{
			console.log("BD conectada");	
		}
	});
}
function nueva_consulta(con,query, CB_error, CB_success){
    con.query(query, function(error,result){
        if(error){
                console.log(error);
        }else{
            CB_success(result); 
        }   
    });
}
exports.nueva_conexion_bd=nueva_conexion_bd;
exports.conectar_bd=conectar_bd;
exports.nueva_consulta=nueva_consulta;
