/**
 * Module dependencies.
 */

var express = require('express')
    , routes = require('./routes')
    , check = require('validator').check
    , sanitize = require('validator').sanitize;

var app = module.exports = express.createServer(), io = require('socket.io').listen(app);
;

// Configuration


app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    app.use(express.cookieParser());
    app.use(express.session({ secret: "crazysecretstuff"}));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function () {
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});

app.configure('production', function () {
    app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/twitter', routes.twitter);
app.get('/map', routes.map);

app.listen(9000, function () {
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

/**
 * Socket.IO server (single process only)
 */
var nicknames = {};

io.sockets.on('connection', function (socket) {
    socket.on('user message', function (msg) {
        var new_msg = sanitize(msg).entityEncode();
        console.log(new_msg);
        socket.emit('user message', socket.nickname, new_msg);
        socket.broadcast.emit('user message', socket.nickname, new_msg);
        if (new_msg.toLowerCase().indexOf('@siri') !== -1) {
            if (new_msg.toLowerCase().indexOf('help') !== -1) {
                var message = 'Try out these keywords in combination: weather, burnaby, new, food'
                    ;
                socket.emit('user message', 'Siri', message);
                socket.broadcast.emit('user message', message);
            }

            else if (new_msg.toLowerCase().indexOf('weather') !== -1 && new_msg.toLowerCase().indexOf('burnaby') !== -1) {
                var message = '<p>Why not take a look yourself?</p><p></p>'
                        + '<img class="webcam" width="220" height="140" border="0" alt="University Drive North" src="http://www.sfu.ca/%7Enetops/webcams/libcam.jpg">'
                        + '<img class="webcam" width="220" height="140" border="0" alt="Convocation Mall" src="http://www.sfu.ca/~netops/webcams/mallcam.jpg">'
                        + '<img class="webcam" width="220" height="140" border="0" alt="Gaglardi Intersection" src="http://www.sfu.ca/~netops/webcams/gaglardicam.jpg">'
                    ;
                socket.emit('user message', 'Siri', message);
                socket.broadcast.emit('user message', 'Siri', message);
            }

            else if (new_msg.toLowerCase().indexOf('new') !== -1) {
                var message = '<p>This is what people are takling about recently:</p>'
                    + '<iframe class="twitter" src="./twitter" scrolling="no"></iframe>'
                socket.emit('user message', 'Siri', message);
                socket.broadcast.emit('user message', 'Siri', message);
            }

            else if (new_msg.toLowerCase().indexOf('food') !== -1 && new_msg.toLowerCase().indexOf('burnaby') !== -1) {
                var message = '<p>Sadly, not much good food can be found around Burnaby campus:</p>'
                    + '<iframe class="map" src="./map" scrolling="no"></iframe>'
                socket.emit('user message', 'Siri', message);
                socket.broadcast.emit('user message', 'Siri', message);
            }

            else if (new_msg.toLowerCase().indexOf('meaning') !== -1 && new_msg.toLowerCase().indexOf('life') !== -1) {

                var message = '42'
                socket.emit('user message', 'Siri', message);
                socket.broadcast.emit('user message', 'Siri', message);

            }
            else if (new_msg.toLowerCase().indexOf('hi') !== -1 || new_msg.toLowerCase().indexOf('hello') !== -1) {

                var message = 'Hi, How can I help you?'
                socket.emit('user message', 'Siri', message);
                socket.broadcast.emit('user message', 'Siri', message);

            }
            else if (new_msg.toLowerCase().indexOf('chick') !== -1 || new_msg.toLowerCase().indexOf('waterm') !== -1) {

                var message = 'I will not answer a racist question'
                socket.emit('user message', 'Siri', message);
                socket.broadcast.emit('user message', 'Siri', message);

            }
            else if (new_msg.toLowerCase().indexOf('thank') !== -1) {

                var message = 'You are welcome';
                socket.emit('user message', 'Siri', message);
                socket.broadcast.emit('user message', 'Siri', message);

            }
            else if (new_msg.toLowerCase().indexOf('joke') !== -1) {

                var message = 'Ted and John walk into a bar... I forget the rest...';
                socket.emit('user message', 'Siri', message);
                socket.broadcast.emit('user message', 'Siri', message);

            }
            else if (new_msg.toLowerCase().indexOf('sandwich') !== -1) {

                var message = 'I prefer making Chinese food, do you want me make some?';
                socket.emit('user message', 'Siri', message);
                socket.broadcast.emit('user message', 'Siri', message);

            }
            else if (new_msg.toLowerCase().indexOf('yes') !== -1) {

                var message = 'Ok, just a second.';
                socket.emit('user message', 'Siri', message);
                socket.broadcast.emit('user message', 'Siri', message);

            }
            else {
                var message = 'I do not know the answer of that question. For more information, click my name first and enter "help"'
                socket.emit('user message', 'Siri', message);
                socket.broadcast.emit('user message', 'Siri', message);
            }

        }


    });

    socket.on('nickname', function (nick, fn) {

        var new_nick = sanitize(nick).entityEncode();
        console.log(new_nick);


        try {
            check(new_nick).notNull().len(1, 15);
        } catch (e) {
            fn(true, e.message); //Invalid integer
            return;
        }

        if (nicknames[new_nick]) {
            fn(true);
        } else {
            fn(false);
            nicknames[new_nick] = socket.nickname = new_nick;
            socket.broadcast.emit('announcement', new_nick + ' connected');

            socket.emit('user message', 'Siri', 'Hello ' + socket.nickname + '! Welcome to Real Questions, Fake Answers.');
            socket.emit('user message', 'Siri', 'Click my name and enter "help" for more information');
            io.sockets.emit('nicknames', nicknames);
        }
    });

    socket.on('disconnect', function () {
        if (!socket.nickname) return;

        delete nicknames[socket.nickname];
        socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
        socket.broadcast.emit('nicknames', nicknames);
    });
});