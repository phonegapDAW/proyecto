
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
        db.transaction(eliminarTablaUsuario, errorCB);
    });
    $("#recargar").click( function(){

        //mostramos ventana de carga:
        $.mobile.loading( "show", {
            text: "Cargando...",
            textVisible: true,
            theme: "a",
            html: ""
        });

        sacarNoticiasServidor();
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
        //cerramos ventana de carga:
        $.mobile.loading( "hide" );
        //subir a la primera noticia:
        $.mobile.silentScroll(0);
        //alert('conseguido');
    }
    else{
        //alert('no hay noticias');
        sacarNoticiasServidor();
    }
}


function errorCB(err) {
    alert("Error processing SQL: "+err.code);
}


//-------------------------------------------------------------   SERVIDOR   ---------------------------------------------------------------

function sacarNoticiasServidor() {
    //alert('conectando al servidor');

    $.ajax({
        timeout: 5000, // Microseconds, for the laughs.  Guaranteed timeout.
        url:   'http://noticiasprogramacion.esy.es/damerss.php',
        type:  'post',
        beforeSend: function () {

        },
        success:  function (response) {
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
                //location.href = "#ventanarss";      //abrir ventana, dando atras volvemos
                location.replace("#ventanarss");      //reemplaza ventana, dando atras no vuelve
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
               db.transaction(querynoticias, errorCB);
               //mostramos usuario en el panel:
               $("#corr").html("Correo: "+$("#correo").val());
               $("#cont").html("Contra: "+$("#pass").val());
               //location.href = "#ventanarss";      //abrir ventana, dando atras volvemos
               location.replace("#ventanarss");      //reemplaza ventana, dando atras no vuelve
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