var express = require('express');
var router = express.Router();
var request = require('request');
var domain = 'http://admin.kspu-museum.in.ua';
var buildmodule = require('./build-module');
var parcedJson;
var categoryList;
var categoriesJson;
var comment;
var parentsId = new Array();
var parentsName = new Array();
var parentCount;
var i = 0;

var retina = global.devicePixelRatio > 1 ? true : false;
//----------------------
// get list all categories with imgs
//----------------------
router.route('/')
  .all(
    function(req, res, next){
      parentCount = 0;
      i = 0;
      request(domain + '/api/category?img=1', 
        function(error, response, body) {
          //console.log(error);
          if(!error && response.statusCode === 200) {
            parcedJson = JSON.parse(body);
            /**
            * get count of parens and parent categores
            * 
            */
            categoryList = buildmodule.BuildTree(parcedJson, null, '');
            parcedJson.forEach(function(item) {
              if (item.parent == null) {
                parentsId[i] = item._id;
                parentsName[i] = item.name;
                parentCount++;
                i++;
              }
              
            });
            
          
            next();
          }
          
        });
    },
    function(req, res, next){
      request(domain + '/api/comment', 
        function(error, response, body) {
          comment = JSON.parse(body);
          //console.log(comment);
          console.log(comment.count);
        });
        next();
    })
    /**
    * render home page
    * 
    */
  .get(
    function(req, res, next) {
      res.render('index', {
        title: 'Mузей Історії техніки',
        domain: domain,
        json: parcedJson,
        parentCount: parentCount,
        parentsId: parentsId,
        catList: categoryList,
        parentsName: parentsName,
        comments: comment,
        size: retina
      });
        next();        
    })
  .post(function(req, res, next) {
      res.redirect('/search/='+encodeURIComponent(req.body.searchValue1));
  });

    
  

module.exports = router;
