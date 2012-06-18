
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Real Questions, Fake Answers' })
};

exports.twitter= function(req, res){
    res.render('twitter', { title: 'Up Side Down Chat' })
};

exports.map= function(req, res){
    res.render('map', { title: 'Up Side Down Chat' })
};

