// Wait for device API libraries to load
//
document.addEventListener("deviceready", onDeviceReady, false);

// device APIs are available
//
function onDeviceReady() {
    var db = window.openDatabase("Database", "1.0", "SuperBD", 200000);
    db.transaction(populateDB, errorCB, successCB);
}

// Populate the database
//
function populateDB(tx) {
    tx.executeSql('DROP TABLE IF EXISTS TEMAS');
    tx.executeSql('CREATE TABLE IF NOT EXISTS TEMAS (id INTEGER PRIMARY KEY AUTOINCREMENT, correo TEXT, tema TEXT)');
    tx.executeSql('INSERT INTO TEMAS (correo, tema) VALUES ("hectorfg91", "css")');
    tx.executeSql('INSERT INTO TEMAS (correo, tema) VALUES ("hectorfg91", "java")');
    tx.executeSql('INSERT INTO TEMAS (correo, tema) VALUES ("hectorfg91", "android")');
    tx.executeSql('INSERT INTO TEMAS (correo, tema) VALUES ("ruben", "css")');
}

// Query the database
//
function queryDB(tx) {
    tx.executeSql('SELECT * FROM TEMAS', [], querySuccess, errorCB);
}

// Query the success callback
//
function querySuccess(tx, results) {
    var datos="";
    var len = results.rows.length;
    for (var i=0; i<len; i++){
        datos=datos+"<p>"+results.rows.item(i).id+"::"+results.rows.item(i).correo+"::"+results.rows.item(i).tema+"</p>"
    }
    $("#tem").html(datos);
}

// Transaction error callback
//
function errorCB(err) {
    console.log("Error processing SQL: "+err.code);
}

// Transaction success callback
//
function successCB() {
    var db = window.openDatabase("Database", "1.0", "SuperBD", 200000);
    db.transaction(queryDB, errorCB);
}