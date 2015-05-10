$(document).ready(function() {
    $.ajax({
        url:   'http://noticiasprogramacion.esy.es/damerss.php',
        type:  'post',
        beforeSend: function () {
            $("#rss").html("<center>Procesando, espere por favor...</center>");
        },
        success:  function (response) {
            $("#rss").html(response);
        }
    });
});
