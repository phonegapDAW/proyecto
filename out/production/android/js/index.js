
var db = window.openDatabase("Database", "1.0", "SuperBD", 200000);
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    $('#form').submit(function() {
       if($("#correo").val()!="" && $("#pass").val()!=""){

           //mostramos ventana de carga:
           $.mobile.loading( "show", {
               text: "Cargando...",
               textVisible: true,
               theme: "a",
               html: ""
           });

           comprobarUsuarioServidor($("#correo").val(),$("#pass").val());

       }
       else{
           alert('Correo o contra incorrecta');
       }
   });
    $('#formtemas').submit(function() {

        location.replace("#ventanarss");      //reemplaza ventana, dando atras no vuelve

        var numberOfChecked = $('input:checkbox:checked').length;
        var correo = $("#corr").html().replace("Correo: ", "");

        var array=[];

        $('input:checkbox:checked').each(function() {

            array.push($(this).val());

        });

        guardarTemasDeUsuServidor(correo, array);

    });
    $('#formtemas2').submit(function() {

        var numberOfChecked = $('input:checkbox:checked').length;
        var correo = $("#corr").html().replace("Correo: ", "");

        var array=[];

        $('input:checkbox:checked').each(function() {

            array.push($(this).val());

        });

        guardarTemasDeUsuServidor(correo, array);

    });
    $("#nuevo").click( function(){
        if($("#correo").val()!="" && $("#pass").val()!=""){

            //mostramos ventana de carga:
            $.mobile.loading( "show", {
                text: "Cargando...",
                textVisible: true,
                theme: "a",
                html: ""
            });

            crearUsuarioServidor($("#correo").val(),$("#pass").val());

        }
        else{
            alert('Correo o contra incorrecta');
        }
    });
    $("#cerrarSesion").click( function(){
        $("#tabla").empty();
        $("#tabla2").empty();
        db.transaction(eliminarTablaUsuario, errorCB);
        db.transaction(eliminarTablaNoticias, errorCB);
    });
    $("#recargar").click( function(){

        //mostramos ventana de carga:
        $.mobile.loading( "show", {
            text: "Cargando...",
            textVisible: true,
            theme: "a",
            html: ""
        });

        var correo = $("#corr").html().replace("Correo: ", "");
        sacarNoticiasServidor(correo);
        //alert("cargando");
    });

    //primera funcion del programa (comprobar usuario)
    db.transaction(queryusuario, errorCB);

}


//--------------------------   Consultas SQLITE   -------------------------------------


function queryusuario(tx) {
    //alert('comprobando usuario');
    //tx.executeSql('DROP TABLE IF EXISTS USUARIO');
    tx.executeSql('CREATE TABLE IF NOT EXISTS USUARIO (correo TEXT PRIMARY KEY, pass TEXT)');
    //tx.executeSql('INSERT INTO USUARIO (correo, pass) VALUES ("hectormola", "123456")');
    tx.executeSql('SELECT * FROM USUARIO', [], querySuccessUsuario, errorCB);
}

function querynoticias(tx) {
    //alert('Colocando noticias');
    //tx.executeSql('DROP TABLE IF EXISTS NOTICIAS');
    tx.executeSql('CREATE TABLE IF NOT EXISTS NOTICIAS (cod_noticia INTEGER PRIMARY KEY, titulo TEXT, cuerpo TEXT, enlace TEXT, tema TEXT)');
    //tx.executeSql('INSERT INTO NOTICIAS (cod_noticia, titulo, cuerpo, enlace, tema) VALUES (1,"prueba1", "123456", "caca","prueba")');
    //tx.executeSql('INSERT INTO NOTICIAS (cod_noticia, titulo, cuerpo, enlace, tema) VALUES (2,"prueba2", "sdfsdfsf", "feo","sql")');
    //tx.executeSql('INSERT INTO NOTICIAS (cod_noticia, titulo, cuerpo, enlace, tema) VALUES (3,"prueba3", "holahola", "rss","rss")');
    tx.executeSql('SELECT * FROM NOTICIAS order by cod_noticia DESC', [], querySuccessNoticias, errorCB);
}

function eliminarTablaUsuario(tx) {
    alert('Adios!');
    tx.executeSql('DROP TABLE IF EXISTS USUARIO');
    tx.executeSql('DROP TABLE IF EXISTS NOTICIAS');
    //quitamos las noticias
    $( "#rss" ).html("");
    //location.href = "#ventanalogin";      //abrir ventana, dando atras volvemos
    location.replace("#ventanalogin");      //reemplaza ventana, dando atras no vuelve
}
function eliminarTablaNoticias(tx) {
    //alert('eliminada tabla noticias');
    tx.executeSql('DROP TABLE IF EXISTS NOTICIAS');
}



//--------------------------   Resultado de consultas SQLITE   --------------------------------

function querySuccessUsuario(tx, results) {
    if(results.rows.length>0){
        //alert('hay usuario');
        //mostramos usuario en el panel:
        $("#corr").html("Correo: "+results.rows.item(0).correo);
        $("#cont").html("Contra: "+results.rows.item(0).pass);

        //existiendo usuario pasaremos a comprobar noticias
        db.transaction(querynoticias, errorCB);

    }
    else{
        //alert('no hay usuario');
        //location.href = "#ventanalogin";      //abrir ventana, dando atras volvemos
        location.replace("#ventanalogin");      //reemplaza ventana, dando atras no vuelve
    }
}

function querySuccessNoticias(tx, results) {
    if(results.rows.length>0){
        //alert('hay noticias');
        $( "#rss" ).html("");
        var datos="";
        var len = results.rows.length;
        for (var i=0; i<len; i++){
            var datos = "<div data-role='collapsible' data-icon='false'><h3>"+results.rows.item(i).titulo+"</h3><h4>"+results.rows.item(i).titulo+"</h4><p>"+results.rows.item(i).cuerpo+"</p><a HREF='http://"+results.rows.item(i).enlace+"'>"+results.rows.item(i).enlace+"</a><br>Tema: "+results.rows.item(i).tema+"</div>";
            $( "#rss" ).append( datos ).collapsibleset( "refresh" );
        }

        //subir a la primera noticia:
        $.mobile.silentScroll(0);
        //alert('conseguido');
        //obtenemos los temas
        var correo = $("#corr").html().replace("Correo: ", "");
        sacarTemasServidor2(correo);

    }
    else{
        //alert('no hay noticias');
        var correo = $("#corr").html().replace("Correo: ", "");
        sacarNoticiasServidor(correo);
    }
}


function errorCB(err) {
    alert("Error processing SQL: "+err.code);
}


//-------------------------------------------------------------   SERVIDOR   ---------------------------------------------------------------

function sacarNoticiasServidor(correo) {
    //alert('conectando al servidor');

    $.ajax({
        timeout: 5000, // Microseconds, for the laughs.  Guaranteed timeout.
        url:   'http://noticiasprogramacion.esy.es/damerss.php',
        data: "correo="+correo,
        type:  'post',
        beforeSend: function () {

        },
        success:  function (response) {
            //alert(response);
            db.transaction(function(tx) {
                //alert('guardando noticias');
                //eliminamos tabla:
                tx.executeSql('DROP TABLE IF EXISTS NOTICIAS');
                //guardamos datos:
                tx.executeSql('CREATE TABLE IF NOT EXISTS NOTICIAS (cod_noticia INTEGER PRIMARY KEY, titulo TEXT, cuerpo TEXT, enlace TEXT, tema TEXT)');
                var elem = response.split('<ULTRAcacaCasposa>');
                for(var i=0;i<elem.length-1;i++){
                    var valores=elem[i].split('<cacaCasposa>');
                    tx.executeSql("INSERT INTO NOTICIAS (cod_noticia, titulo, cuerpo, enlace, tema) VALUES ('"+valores[0]+"','"+valores[1]+"','"+valores[2]+"','"+valores[3]+"','"+valores[4]+"')");
                }
            });
            //sacamos la noticia de sqlite
            db.transaction(querynoticias, errorCB);
        },
        error: function(request, status, exception) {
            //cerramos ventana de carga:
            $.mobile.loading( "hide" );
            alert("Internet connection is down!");
        }
    });

}

function guardarTemasDeUsuServidor(correo, array) {
    //alert('conectando al servidor');
    timeout: 5000, // Microseconds, for the laughs.  Guaranteed timeout.
    $.ajax({
        url:   'http://noticiasprogramacion.esy.es/guardarTemas.php',
        data: "correo="+correo+"&array="+array,
        type: "post",
        beforeSend: function () {

        },
        success:  function (response) {
            $("#tabla").empty();
             //mostramos ventana de carga:
           $.mobile.loading( "show", {
               text: "Cargando...",
               textVisible: true,
               theme: "a",
               html: ""
                       });
            //procede a sacar y mostrar las noticias
            var correo = $("#corr").html().replace("Correo: ", "");
            sacarNoticiasServidor(correo);

        },
         error: function(request, status, exception) {
            //cerramos ventana de carga:
            $.mobile.loading( "hide" );
             alert("Internet connection is down!");
         }
    });
}

function sacarTemasServidor() {
    //alert('conectando al servidor');

    $.ajax({
        timeout: 5000, // Microseconds, for the laughs.  Guaranteed timeout.
        url:   'http://noticiasprogramacion.esy.es/obtenerTemas.php',
        type:  'post',
        beforeSend: function () {

        },
        success:  function (response) {

            $("#tabla").empty();
            $( "#tabla" ).append( response );
            $("#tabla").trigger("create");

            location.replace("#ventanaTemas");
            //cerramos ventana de carga:
            $.mobile.loading( "hide" );

        },
        error: function(request, status, exception) {
            //cerramos ventana de carga:
            $.mobile.loading( "hide" );
            alert("Internet connection is down!");
        }
    });

}

function sacarTemasServidor2(correo) {
    //alert('conectando al servidor');

    $.ajax({
        timeout: 5000, // Microseconds, for the laughs.  Guaranteed timeout.
        url:   'http://noticiasprogramacion.esy.es/obtenerTemas2.php',
        data: "correo="+correo,
        type:  'post',
        beforeSend: function () {

        },
        success:  function (response) {

            $("#tabla2").empty();
            $( "#tabla2" ).append( response );
            $("#tabla2").trigger("create");

            //cerramos ventana de carga:
            $.mobile.loading( "hide" );
            //alert("definitivamente conseguido");

        },
        error: function(request, status, exception) {
            //cerramos ventana de carga:
            $.mobile.loading( "hide" );
            alert("Internet connection is down!");
        }
    });

}


function comprobarUsuarioServidor(correo, pass) {
    //alert('conectando al servidor');
    $.ajax({
        timeout: 5000, // Microseconds, for the laughs.  Guaranteed timeout.
        url:   'http://noticiasprogramacion.esy.es/comprobarUsu.php',
        data: "correo="+correo+"&pass="+pass,
        type: "post",
        beforeSend: function () {

        },
        success:  function (response) {
            var resp = JSON.stringify(response);
            var n = resp.search("existe");
            if(n!=-1){
                db.transaction(function(tx) {
                    //alert('guardando usuario');
                    tx.executeSql('CREATE TABLE IF NOT EXISTS USUARIO (correo TEXT PRIMARY KEY, pass TEXT)');
                    tx.executeSql("INSERT INTO USUARIO (correo, pass) VALUES ('"+$("#correo").val()+"','"+$("#pass").val()+"')");
                });
                db.transaction(querynoticias, errorCB);
                //mostramos usuario en el panel:
                $("#corr").html("Correo: "+$("#correo").val());
                $("#cont").html("Contra: "+$("#pass").val());
                location.href = "#ventanarss";      //abrir ventana, dando atras volvemos
            }
            else{
                $.mobile.loading( "hide" );
                alert("El usurio no existe.");
            }
        },
        error: function(request, status, exception) {
            //cerramos ventana de carga:
            $.mobile.loading( "hide" );
            alert("Internet connection is down!");
        }
    });
}

function crearUsuarioServidor(correo, pass) {
    //alert('conectando al servidor');
    timeout: 5000, // Microseconds, for the laughs.  Guaranteed timeout.
    $.ajax({
        url:   'http://noticiasprogramacion.esy.es/crearUsu.php',
        data: "correo="+correo+"&pass="+pass,
        type: "post",
        beforeSend: function () {

        },
        success:  function (response) {
            var resp = JSON.stringify(response);
            var n = resp.search("Usuario creado");
            if(n!=-1){
               db.transaction(function(tx) {
                   //alert('guardando usuario');
                   tx.executeSql('CREATE TABLE IF NOT EXISTS USUARIO (correo TEXT PRIMARY KEY, pass TEXT)');
                   tx.executeSql("INSERT INTO USUARIO (correo, pass) VALUES ('"+$("#correo").val()+"','"+$("#pass").val()+"')");
               });

               //mostramos usuario en el panel:
               $("#corr").html("Correo: "+$("#correo").val());
               $("#cont").html("Contra: "+$("#pass").val());

               sacarTemasServidor();

            }
            else{
                $.mobile.loading( "hide" );
                alert("El usuario ya existe.");
            }
        },
         error: function(request, status, exception) {
            //cerramos ventana de carga:
            $.mobile.loading( "hide" );
             alert("Internet connection is down!");
         }
    });
}