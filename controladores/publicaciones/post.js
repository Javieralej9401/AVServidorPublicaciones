
/*
 * GET home page.
 */

exports.todosPosts = function(request, response) {
console.log("Mostar todos");
  var consulta="SELECT p.id as id, p.id_grupo, p.titulo, p.contenido,p.likes, p.calidad, p.recursos,p.fecha, u.id as id_usuario, u.login from Publicacion p inner join Usuario u on p.id_usuario=u.id";
   mysql.nueva_consulta(con,consulta,null,function(publicaciones){
        for (var i = 0; i < publicaciones.length; i++) {
         var usuario={"id_usuario": publicaciones[i].id_usuario, "login": publicaciones[i].login}; 
           publicaciones[i].usuario=usuario;
           delete publicaciones[i].id_usuario;
           delete publicaciones[i].login;
        };

      // console.log(publicaciones);
        response.send(publicaciones);
        
   });

}
exports.unPost = function(request, response) {
  console.log("Se va a consultar por un solo post")
  var consulta="SELECT p.id as id, p.id_grupo, p.titulo, p.contenido,p.likes, p.calidad, p.recursos,p.fecha, u.id as id_usuario, u.login from Publicacion p inner join Usuario u on p.id_usuario=u.id where p.id="+request.params.id;
   mysql.nueva_consulta(con,consulta,null,function(publicacion){

         var usuario={"id_usuario": publicacion[0].id_usuario, "login": publicacion[0].login};
           publicacion[0]["usuario"]=usuario;

           delete publicacion[0]["id_usuario"];
           delete publicacion[0]["login"];
           // console.log(publicacion);
      response.send(publicacion);
   });

}
exports.postsDeUnGrupo = function(request, response) {
  console.log("Se va a consultar por post de un grupo")
  console.log("el dide grupo es "+request.params.id_grupo );

  

  var consulta="SELECT p.id as id, p.id_grupo, p.titulo, p.contenido,p.likes, p.calidad, p.recursos, DATE_FORMAT(p.fecha, '%d/%m/%Y') as fecha , DATE_FORMAT(p.fecha, '%h:%i %p') as hora ,u.id as id_usuario, u.login from Publicacion p inner join Usuario u on p.id_usuario=u.id where p.id_grupo="+request.params.id_grupo +" order by p.fecha desc limit "+ request.params.CantPostMostrados;



   mysql.nueva_consulta(con,consulta,null,function(publicacion){

      if(publicacion.length>0){

          for (var i = 0; i < publicacion.length; i++) {

            //Se coloca la informacion basica del usuario;
             var usuario={"id_usuario": publicacion[i].id_usuario, "login": publicacion[i].login};
               publicacion[i].usuario=usuario;
               delete publicacion[i].id_usuario;
               delete publicacion[i].login;

          };

            var consulta2="select id_publicacion from Publicacion_likes where ";
            var cond1= "(";
            for (var i = 0; i < publicacion.length; i++) {
              
                cond1+="id_publicacion= '"+publicacion[i].id +"' OR "
                
            };
            var ind= cond1.lastIndexOf("OR");
            cond1= cond1.slice(0,ind);
            cond1+=" ) and id_usuario= '"+request.params.idUsuario_logeado+"'";
            consulta2+=cond1;

            mysql.nueva_consulta(con,consulta2,null,function(rs2){

                    for (var i = 0; i < publicacion.length; i++) {
                         var b=false;
                          for (var j= 0; j < rs2.length; j++) {
                              if( rs2[j].id_publicacion== publicacion[i].id){
                                  b=true;
                                  break;
                              }
                              
                          };

                          publicacion[i].likeUsuarioLogeado=b;

                    }
                    // console.log(publicacion);
                   response.send(publicacion);   
                    
             }); 

          
          
      }else{
           response.send(publicacion); 
      }
        


   });
}
exports.crearPost = function(request, response) {
     var post = request.body;
   console.log("Intentando crear una nueva publicacion");


   var consulta="INSERT INTO Publicacion (id_usuario,id_grupo, titulo,contenido,likes,calidad,recursos) values('"+post.usuario.id_usuario+"','"+post.id_grupo+"','"+post.titulo+"','"+post.contenido+"','"+post.likes+"','"+post.calidad+"','"+post.recursos+"')";
   mysql.nueva_consulta(con,consulta,null,function(publicacion){
         var consulta="SELECT  DATE_FORMAT(p.fecha, '%d/%m/%Y') as fecha , DATE_FORMAT(p.fecha, '%h:%i %p') as hora, u.login as login from  Publicacion p inner join Usuario u on p.id_usuario=u.id where u.id="+post.usuario.id_usuario+" and p.id="+publicacion.insertId;
           mysql.nueva_consulta(con,consulta,null,function(respuesta){

                //Se anexa al json de respuesta los datos extras para que sea igual al modelo en el backend.
                post.id=publicacion.insertId;
                post.usuario.login=respuesta[0].login;
                //fecha de la publicación que se acaba de insertar
             
                
                 post.fecha= respuesta[0].fecha;
                   post.hora= respuesta[0].hora;
                // post.hora= new Date('h:i p');
                // console.log(post);
               
              response.send(post);

              console.log("Insertado con exito");
         });

   });

}
exports.actualizarPost = function(request, response) {
  console.log("Intentando actualizar una publicacion");
   var post = request.body;

   var consulta="UPDATE Publicacion set id_usuario='"+post.usuario.id_usuario+"',titulo='"+post.titulo+"',contenido='"+post.contenido+"',likes='"+post.likes+"',calidad='"+post.calidad+"',recursos='"+post.recursos+"' where id="+post.id;
   mysql.nueva_consulta(con,consulta,null,function(publicaciones){
      response.send(post);
      // console.log(post);
      console.log("Actualizado con exito");
   });

}
exports.borrarPost = function(request, response) {
  console.log("Intentando eleimar una publicacion"+request.params.id);
  var consulta="DELETE from Publicacion where id="+request.params.id;
   mysql.nueva_consulta(con,consulta,null,function(publicacion){
      response.send({id:request.params.id});
      console.log("Eliminado con exito");
   });
}



//Rutad e los grupos de usuarios

exports.GrupoUsuario =function(request, response) {
     var id_grupo = request.params.id_grupo;
   console.log("Intentando recuperar los usuarios de un grupo");

          var consulta="SELECT  u.id, u.login, u.nombre, u.apellido, u.email, u.tlf, u.iddepartamento, u.idTipousuario from Usuario u inner join GrupoEstudiante ge on u.id=ge.id_estudiante where ge.id_grupo="+id_grupo;
       mysql.nueva_consulta(con,consulta,null,function(UsuariosG){
          // console.log(UsuariosG);
                response.send(UsuariosG);
        });

}
exports.UsuariosLikes =function(request, response) {
     var id_post = request.params.id_post;
   console.log("Intentando recuperar los usuarios likes");

       var consulta="SELECT u.id, u.login, u.nombre, u.apellido, u.email, u.tlf, u.iddepartamento, u.idTipousuario from `Publicacion_likes` pl inner join Usuario u on pl.id_usuario=u.id where pl.id_publicacion="+id_post;
       mysql.nueva_consulta(con,consulta,null,function(UsuariosLikes){
          // var usuarios_likes={};

          // usuarios_likes.usuarios_likes=UsuariosLikes;
          // console.log(UsuariosLikes);
                response.send(UsuariosLikes);
        });

}