/**
 * Module dependencies.
 */

var express = require('express')
    , routes = require('./routes')
    , util = require('util')
    , connect = require('express/node_modules/connect')
    , parseCookie = connect.utils.parseCookie
    , MemoryStore = connect.middleware.session.MemoryStore
    , check = require('validator').check
    , sanitize = require('validator').sanitize
    , store;

var app = module.exports = express.createServer(), io = require('socket.io').listen(app);
;

// Configuration 6


app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    app.use(express.cookieParser());
    app.use(express.session({ secret:'secret', key:'express.sid', store:store = new MemoryStore()}));
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
io.set('authorization',
    function (data, accept) {
        if (!data.headers.cookie)
            return accept('No cookie transmitted.', false);

        data.cookie = parseCookie(data.headers.cookie);
        data.sessionID = data.cookie['express.sid'];

        store.load(data.sessionID, function (err, session) {
            if (err || !session) return accept('Error', false);

            data.session = session;
            return accept(null, true);
        });
    }).on('connection', function (socket) {
        var sess = socket.handshake.session;
        socket.log.info(
            'a socket with sessionID'
            , socket.handshake.sessionID
            , 'connected'
        );


        socket.on('user message', function (msg) {
            var new_msg = sanitize(msg).entityEncode();
            console.log(new_msg);
            socket.emit('user message', socket.nickname, new_msg);
            socket.broadcast.emit('user message', socket.nickname, new_msg);
            if (new_msg.toLowerCase().indexOf('@siri') !== -1) {
                if (new_msg.toLowerCase().indexOf('help') !== -1) {
                    var message = 'Try out these keywords in combination: weather, burnaby, new, food'
                        ;
                    socket.emit('speech',message);
                    socket.broadcast.emit('speech',message);
                    socket.emit('user message', 'Siri', message);
                    socket.broadcast.emit('user message', message);
                }

                else if (new_msg.toLowerCase().indexOf('weather') !== -1 && new_msg.toLowerCase().indexOf('burnaby') !== -1) {
                    var message = 'Why not take a look yourself?' ;
                    var extra =  '<img class="webcam" width="220" height="140" border="0" alt="University Drive North" src="http://www.sfu.ca/%7Enetops/webcams/libcam.jpg">'
                            + '<img class="webcam" width="220" height="140" border="0" alt="Convocation Mall" src="http://www.sfu.ca/~netops/webcams/mallcam.jpg">'
                            + '<img class="webcam" width="220" height="140" border="0" alt="Gaglardi Intersection" src="http://www.sfu.ca/~netops/webcams/gaglardicam.jpg">'
                        ;
                    socket.emit('speech',message);
                    socket.broadcast.emit('speech',message);
                    socket.emit('user message', 'Siri', '<p>'+message+'</p><p></p>'+extra);
                    socket.broadcast.emit('user message', 'Siri', '<p>'+message+'</p><p></p>'+extra);
                }

                else if (new_msg.toLowerCase().indexOf('new') !== -1) {
                    var message = 'This is what people are talking about recently:'   ;
                    var extra =  '<iframe class="twitter" src="./twitter" scrolling="no"></iframe>'
                    socket.emit('speech',message);
                    socket.broadcast.emit('speech',message);
                    socket.emit('user message', 'Siri', '<p>'+message+'</p>' + extra);
                    socket.broadcast.emit('user message', 'Siri', '<p>'+message+'</p>' + extra);
                }

                else if (new_msg.toLowerCase().indexOf('food') !== -1 && new_msg.toLowerCase().indexOf('burnaby') !== -1) {
                    var message = 'Sadly, not much good food can be found around Burnaby campus</p>'
                    var extra =  ':<iframe class="map" src="./map" scrolling="no"></iframe>'
                    socket.emit('speech',message);
                    socket.broadcast.emit('speech',message);
                    socket.emit('user message', 'Siri', message);
                    socket.broadcast.emit('user message', 'Siri', '<p>'+message+'</p>'+extra);
                }

                else if (new_msg.toLowerCase().indexOf('meaning') !== -1 && new_msg.toLowerCase().indexOf('life') !== -1) {

                    var message = '42'
                    socket.emit('speech',message);
                    socket.broadcast.emit('speech',message);
                    socket.emit('user message', 'Siri', message);
                    socket.broadcast.emit('user message', 'Siri', message);

                }
                else if (new_msg.toLowerCase().indexOf('hi') !== -1 || new_msg.toLowerCase().indexOf('hello') !== -1) {

                    var message = 'Hi, How can I help you?'
                    socket.emit('speech',message);
                    socket.broadcast.emit('speech',message);
                    socket.emit('user message', 'Siri', message);
                    socket.broadcast.emit('user message', 'Siri', message);

                }
                else if (new_msg.toLowerCase().indexOf('waterm') !== -1) {

                    var message = 'I will not answer a racist question'
                    socket.emit('speech',message);
                    socket.broadcast.emit('speech',message);
                    socket.emit('user message', 'Siri', message);
                    socket.broadcast.emit('user message', 'Siri', message);

                }
                else if (new_msg.toLowerCase().indexOf('thank') !== -1) {

                    var message = 'You are welcome';
                    socket.emit('speech',message);
                    socket.broadcast.emit('speech',message);
                    socket.emit('user message', 'Siri', message);
                    socket.broadcast.emit('user message', 'Siri', message);

                }
                else if (new_msg.toLowerCase().indexOf('spacedick') !== -1) {

                    var message = 'I\'d rather not talk about that';
                    socket.emit('speech',message);
                    socket.broadcast.emit('speech',message);
                    socket.emit('user message', 'Siri', message);
                    socket.broadcast.emit('user message', 'Siri', message);

                }
                else if (new_msg.toLowerCase().indexOf('joke') !== -1) {

                    var message = 'Ted and John walk into a bar... I forget the rest...';
                    socket.emit('speech',message);
                    socket.broadcast.emit('speech',message);
                    socket.emit('user message', 'Siri', message);
                    socket.broadcast.emit('user message', 'Siri', message);

                }
                else if (new_msg.toLowerCase().indexOf('sandwich') !== -1) {

                    var message = 'I prefer making Chinese food, do you want me make some?';
                    socket.emit('speech',message);
                    socket.broadcast.emit('speech',message);
                    socket.emit('user message', 'Siri', message);
                    socket.broadcast.emit('user message', 'Siri', message);

                }
                else if (new_msg.toLowerCase().indexOf('yes') !== -1) {

                    var message = 'Ok, just a second.';
                    socket.emit('speech',message);
                    socket.broadcast.emit('speech',message);
                    socket.emit('user message', 'Siri', message);
                    socket.broadcast.emit('user message', 'Siri', message);

                }
                else {
                    var message = 'I do not know the answer of that question. For more information, click my name first and enter help' ;
                    socket.emit('speech',message);
                    socket.broadcast.emit('speech',message);
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

                sess.reload(function () {
                    sess.nickname = new_nick;
                    sess.touch().save();
                });

                socket.broadcast.emit('announcement', new_nick + ' connected');

                var greeting =   'Hello ' + socket.nickname + ' Welcome to Real Questions, Fake Answers ';
                var extra = 'Click my name and enter help for more information'
                socket.emit('user message', 'Siri', greeting);
                socket.emit('speech',  greeting + extra);


                socket.emit('user message', 'Siri', extra);
                io.sockets.emit('nicknames', nicknames);
            }
        });

        socket.on('disconnect', function () {
            if (!socket.nickname) return;

            delete nicknames[socket.nickname];
            socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
            socket.broadcast.emit('nicknames', nicknames);
        });

        if (sess.nickname)   {
            nicknames[sess.nickname] = socket.nickname = sess.nickname;
           // socket.broadcast.emit('announcement', sess.nickname + ' connected');



        }

//        socket.emit('user message', 'Siri', 'Welcome back ' + socket.nickname + '! ');
//        socket.emit('user message', 'Siri', 'Click my name and enter "help" for more information');
    });