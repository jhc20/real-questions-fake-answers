var socket = io.connect();

socket.on('connect', function () {
    $('#chat').addClass('connected');
});

socket.on('announcement', function (msg) {
    $('#lines').prepend($('<div class="announcement">').prepend($('<em>').text(msg)));
});

socket.on('nicknames', function (nicknames) {
    //$('#nicknames').empty().append($('<span>Online: </span>'));
    //for (var i in nicknames) {
        //$('#nicknames').append($('<b>').text(nicknames[i]));
    //}
});

socket.on('user message', message);
socket.on('reconnect', function () {
    $('#lines').remove();
    message('System', 'Reconnected to the server');
});

socket.on('reconnecting', function () {
    message('System', 'Attempting to re-connect to the server');
});

socket.on('error', function (e) {
    message('System', e ? e : 'A unknown error occurred');
});

function message (from, msg) {
    //$('#lines').append($('<div class="line">').append($('<b>').text(from), msg));
    $('#lines').prepend('<div class="line"> <div class="avatar"></div>  <div class="user-meta">'+from+' : </div> <div class="user-message">'+msg+'</div> </div>')
}

// dom manipulation
$(function () {


    $('.user-meta').live('click',function(){

        $('#message').val('@'+ $(this).html()).focus();


    });
    $('.user-meta').live('touchstart',function(){

        $('#message').val('@'+ $(this).html()).focus();


    });
    $('#set-nickname').submit(function (ev) {
        socket.emit('nickname', $('#nick').val(), function (set, err) {
            if (!set) {

                $('#set-nickname').slideUp();
                $('#send-message').slideDown();
                clear();
                return $('#chat').addClass('nickname-set');
            }
            alert(err);
            //$('#nickname-err').css('visibility', 'visible');
        });

        return false;
    });

    $('#send-message').submit(function () {
        //message('Me', $('#message').val());
        socket.emit('user message', $('#message').val());
        clear();
        //$('#lines').get(0).scrollTop = 10000000;
        return false;
    });

    function clear () {
        $('#message').val('').focus();
    };
});