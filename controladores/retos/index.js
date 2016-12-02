//app es una variable global y esta definida en app.js
app.set('views', __dirname + '/views'); 

app.get('/retos', function(request, response) {

  response.render('inicio', {
    title: 'Hola, desde el controlador de home'
  });

});
//io es una variable global, esta definida en app.js
io.on('connection', function (socket) {

});

