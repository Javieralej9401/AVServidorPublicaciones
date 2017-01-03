// Para decir que las vistas de este modulo se encuentran en la direccion actual-> en la carpeta views.
//app es una variable global y esta definida en app.js
app.set('views', __dirname + '/views'); 
var post = require('./post'); // Consultas 

//Rutas de los posts
app.get('/publicacionesGrupo/:id_grupo/:CantPostMostrados/:idUsuario_logeado', post.postsDeUnGrupo );
app.get('/publicaciones', post.todosPosts );
app.get('/publicaciones/:id', post.unPost );
app.post('/publicaciones',post.crearPost );
app.put('/publicaciones/:id', post.actualizarPost );
app.delete('/publicaciones/:id', post.borrarPost );


//Rutas de los grupo de Usuarios

app.get('/GrupoUsuario/:id_grupo', post.GrupoUsuario );
app.get('/GrupoUsuario/publicacion_likes/:id_post', post.UsuariosLikes);


//io es una variable global, esta definida en app.js
io.on('connection', function (socket) {
  var maxPostDiarios=3;

  if(!socket){return};
  
  socket.on('conectar', function (datos) {

      var resultado = {};
      try {
          
          console.log("%s quiere conectarse ", datos.id_usuario);
          resultado={"accion":"Conetarse", "datos": datos};
          /*========== Registar informacion en el socket (registarlo en la sala del grupo) =========*/
          socket.idusuario= datos.id_usuario; // Todo se maneja con el idusuario (el usuario logeado)
          socket.idgrupo= datos.id_grupo;
          socket.join(socket.idgrupo);
          console.log("registrado exitosamente en el grupo: "+ socket.idgrupo);
          /*================ Verificar que puede publicar (consultar en bd) ========================*/
          socket.cantPostHoy=0; // Aqui va el valor que se obtuvo en la consulta

          /*========== Obtener los puntos que tiene en ese grupo(seccion) ==========*/
          /*============= Enviar json con los datos consultados  + resultado de la accion =============*/
          resultado.mensaje="Se ha conectado exitosamente";
          resultado.exito=true;

      } catch(e){
    
          resultado["exito"] = false;
          socket.emit("resultadoAccion", resultado );
          return;
      }

      socket.emit("resultadoAccion",resultado );
      socket.emit('conectado',datos);

  });
  socket.on('nuevoPost', function(datos){
    // console.log("%s quiere realizar un nuevo post ", datos.idusuario);
      try{

          var resultado= {"accion": "Nuevo Post","datos" : datos};
          /*================ Verificar que puede publicar ========================*/
          socket.cantPostHoy=0; // Aqui va el valor que se obtuvo en la consulta
          // if(socket.cantPostHoy<=maxPostDiarios){

          /*=========== Enviar el post a todos lo de la sala + resultado de la accion ====================*/
            resultado.exito=true;
            resultado.mensaje="Se ha realizado el post exitosamente";
            socket.emit("resultadoAccion", resultado);
            io.sockets.in(socket.idgrupo).emit("nuevoPostAjeno", datos);

          // }else{
            // resultado.exito=false;
            // resultado.mensaje="Se ha superado los intentos de post por hoy (Max "+maxPostDiarios+")";
            // socket.emit("resultadoAccion", resultado);

          // }
      }catch(e){
          console.log('Ocurrio un error al publicar una publicación');
      }

  });
  socket.on("editarPost", function(datos){

    console.log("%s quiere editar el post (insertar idpost)", datos.idusuario);
    var resultado={"accion":"Editar Post","datos":datos};
      /*================ Persistir en la bd el post ========================*/

      /*========== Enviar post modificado a los miembros del grupo + resultado de la accion ===========*/
       io.sockets.in(socket.idgrupo).emit("cambioEnPost", datos);
        // si fue exitoso colocar exito true sino false.
       socket.emit("resultadoAccion", resultado)
  });
  socket.on("likePost",function(datos){

      /*================ Persistir en la bd el post ========================*/
      /*========== Enviar post modificado a los miembros del grupo + resultado de la accion ===========*/
      try{
            console.log("%s quiere hacer like a la publicacion (Inserte idpost)", datos.id_usuario);
            var resultado={"accion":"Like Post","datos":datos};
            var consulta="INSERT into publicacion_likes(id_publicacion,id_usuario) values('"+ datos.id+"'"+", '"+ datos.id_usuario+"')";
            console.log(consulta);

             mysql.nueva_consulta(con,consulta,null,function(publicacionLike){
               
               io.sockets.in(socket.idgrupo).emit("cambioEnPost", datos);
                // si fue exitoso colocar exito true sino false.
                resultado.exito=true;
                resultado.mensaje="Se ha realizado hecho like correctamente";
               socket.emit("resultadoAccion", resultado)
               console.log( resultado.mensaje);

             });

      }catch(e){
          console.log('Error al acción LIke');
      }

  });
  socket.on("cambiarCalidadPost",function(datos){
    var resultado={"accion":"Cambiar calidad del post","datos": {}};

    try {

         console.log("%s quiere cambiar la caliad del post (Inserte idpost)", datos.idusuario);
        resultado = {"accion":"Cambiar calidad del post","datos":datos};
        /*================ Persistir en la bd el post ========================*/
        /*========== Enviar post modificado a los miembros del grupo + resultado de la accion ===========*/
         io.sockets.in(socket.idgrupo).emit("cambioEnPost", datos);
          // si fue exitoso colocar exito true sino false.
         socket.emit("resultadoAccion", resultado)

    }catch(e){
      
    }

  });
  socket.on("borrarPost",function(datos){
     try{
        console.log("%s quiere borar el post (Inserte idpost)", datos.idusuario);
        var resultado={"accion":"Borrar post","datos":datos};
        /*================ Persistir en la bd el post ========================*/
        /*========== Enviar post eliminado a los miembros del grupo + resultado de la accion ===========*/
         io.sockets.in(socket.idgrupo).emit("eliminarPost", datos);
          // si fue exitoso colocar exito true sino false.
         socket.emit("resultadoAccion", resultado)

     }catch(e){
         console.log('Error al eliminar publicacion');
     }
  });


});

