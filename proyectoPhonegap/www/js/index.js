
var db = window.openDatabase("Database", "1.0", "SuperBD", 200000);
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    db.transaction(queryusuario, errorCB);
}

function queryusuario(tx) {
    alert('comprobando usuario');
    tx.executeSql('DROP TABLE IF EXISTS USUARIO');
    tx.executeSql('CREATE TABLE IF NOT EXISTS USUARIO (correo TEXT PRIMARY KEY, pass TEXT)');
    tx.executeSql('INSERT INTO USUARIO (correo, pass) VALUES ("hectormola", "123456")');
    tx.executeSql('SELECT * FROM USUARIO', [], querySuccessUsuario, errorCB);
}

function querynoticias(tx) {
    alert('comprobando noticias');
    //tx.executeSql('DROP TABLE IF EXISTS NOTICIAS');
    tx.executeSql('CREATE TABLE IF NOT EXISTS NOTICIAS (cod_noticia INTEGER PRIMARY KEY, titulo TEXT, cuerpo TEXT, enlace TEXT, tema TEXT)');
    //tx.executeSql('INSERT INTO NOTICIAS (cod_noticia, titulo, cuerpo, enlace, tema) VALUES (1,"prueba1", "123456", "caca","prueba")');
    //tx.executeSql('INSERT INTO NOTICIAS (cod_noticia, titulo, cuerpo, enlace, tema) VALUES (2,"prueba2", "sdfsdfsf", "feo","sql")');
    //tx.executeSql('INSERT INTO NOTICIAS (cod_noticia, titulo, cuerpo, enlace, tema) VALUES (3,"prueba3", "holahola", "rss","rss")');
    tx.executeSql('SELECT * FROM NOTICIAS', [], querySuccessNoticias, errorCB);
}

function querySuccessUsuario(tx, results) {
    if(results.rows.length>0){
        alert('hay usuario');
        db.transaction(querynoticias, errorCB);
    }
    else{
        alert('no hay usuario');
        location.href = "#ventanalogin";
    }
}

function querySuccessNoticias(tx, results) {
    if(results.rows.length>0){
        alert('hay noticias');
        $( "#rss" ).html("");
        var datos="";
        var len = results.rows.length;
        for (var i=0; i<len; i++){
            var datos = "<div data-role='collapsible' data-iconpos='right'><h3>"+results.rows.item(i).titulo+"</h3><h4>"+results.rows.item(i).titulo+"</h4><p>"+results.rows.item(i).cuerpo+"</p><a HREF='http://"+results.rows.item(i).enlace+"'>"+results.rows.item(i).enlace+"</a><br>Tema: "+results.rows.item(i).tema+"</div>";
            $( "#rss" ).append( datos ).collapsibleset( "refresh" );
        }
        alert('conseguido');
    }
    else{
        alert('no hay noticias');
        sacarNoticiasServidor();
    }
}

function errorCB(err) {
    alert("Error processing SQL: "+err.code);
}

function sacarNoticiasServidor() {
    alert('conectando al servidor');
    $.ajax({
        url:   'http://noticiasprogramacion.esy.es/damerss.php',
        type:  'post',
        beforeSend: function () {
            $("#rss").html("<center>Procesando, espere por favor...</center>");
        },
        success:  function (response) {
            db.transaction(function(tx) {
                alert('guardando noticias');
                var elem = response.split('<ULTRAcacaCasposa>');
                for(var i=0;i<elem.length-1;i++){
                    var valores=elem[i].split('<cacaCasposa>');
                    tx.executeSql("INSERT INTO NOTICIAS (cod_noticia, titulo, cuerpo, enlace, tema) VALUES ('"+valores[0]+"','"+valores[1]+"','"+valores[2]+"','"+valores[3]+"','"+valores[4]+"')");
                }
            });
            db.transaction(querynoticias, errorCB);
        }
    });
}