var express = require('express');
var router = express.Router();
const fs = require("fs")
const path = require("path")

var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();

var request = require('request');

/* GET portfolio page. */
router.get('/', function(req, res, next) {
  let data = fs.readFileSync(path.resolve(__dirname, "../data/portfolio.json"));
  res.render('portfolio', { cakes: JSON.parse(data)});
});

/* POST portfolio request. */
router.post('/', jsonParser, function(req, res, next) {
  let rawdata = fs.readFileSync(path.resolve(__dirname, "../data/portfolio.json"));
  let portfoliosArray = JSON.parse(rawdata);
  
  const expectedAttributes = ["url", "name", "alt", "category", "header", "description"];
  Object.keys(req.body).forEach(param => {
    if(!(expectedAttributes.includes(param))){
      res.status(400).end("Wrong Atr");
      return;
    } else {
      if(req.body[param] == ''){
        res.status(400).end(param + " must have a value")
        return;
      }
    }
  })

  if (req.body.url == null || req.body.name == null) {
    res.status(400).end("Url/name not provided")
    return;
  }
  if (req.body.category != null) {
    if(!(["wedding", "christmas", "birthday", "anniversary"].includes(req.body.category))){
      res.status(400).end("Wrong category provided")
      return;
    }
  }

  if(portfoliosArray.filter(x => x.name === req.body.name).length == 0) {
    download(req.body.url, req.body.name, function(){
      console.log('done');
    });
    const newArray = portfoliosArray.concat([req.body])
    fs.writeFileSync(path.resolve(__dirname, "../data/portfolio.json"), JSON.stringify(newArray));
  }
  res.end();
});

/* Delete portfolio request. */
router.delete('/', jsonParser, function(req, res, next) {
  let rawdata = fs.readFileSync(path.resolve(__dirname, "../data/portfolio.json"));
  let portfoliosArray = JSON.parse(rawdata);
  const newArray = portfoliosArray.filter(x => x.name !== req.body.name)
  if(newArray.length !== portfoliosArray.length) {
    fs.unlink(path.resolve(__dirname, '../data/img/'+ req.body.name), () => {
      console.log(req.body.name + " deleted!");
    });
    fs.writeFileSync(path.resolve(__dirname, "../data/portfolio.json"), JSON.stringify(newArray));
  }
  res.end();
});


//download image to the server:
var download = function(url, filename, callback){
  request.head(url, function(err, res, body){
    request(url).pipe(fs.createWriteStream(path.resolve(__dirname, '../data/img/'+ filename))).on('close', callback);
  });
};

module.exports = router;