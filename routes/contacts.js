var express = require('express');
var router = express.Router();
var request = require('request');
var domain = 'http://admin.kspu-museum.in.ua';
var secret = '6LcLNyATAAAAAPnCNVZKyMRh2_GwReqq-gq76RkA';
var buildmodule = require('./build-module');
var postComment;
var categoryList;
var categoriesJson;
var parentsId = new Array();
var success, mainInfo;
var i = 0;

router.route('/')
.all(function(req, res, next) {
      request(domain + '/api/category', function(error, response, body) {
        categoriesJson = JSON.parse(body);
        categoryList = buildmodule.BuildTree(categoriesJson, null, '');
        var i=0;
        categoriesJson.forEach(function(item){
          if (item.parent === null) {
            parentsId[i] = item._id;
            i++;
          }
        });
        next();
      });
      
    },
    function(req, res, next){
      request(domain + '/api/museum/' + parentsId[0], function(error, response, body) {
        mainInfo = JSON.parse(body);
        next();
      });
  })
.get(function(req, res, next) {
  req.breadcrumbs('Контакти');
  res.render('contacts', {
    title: 'Mузей Історії техніки',
    mainCategoryName: 'Контакти',
    catList: categoryList,
    catJson: categoriesJson,
    mainInfo: mainInfo,
    crumbs: req.breadcrumbs()
  });
});

router.route('/*')
  .all(
    function(req, res, next){
      request(domain + '/api/category', function(error, response, body) {
        categoriesJson = JSON.parse(body);
        categoryList = buildmodule.BuildTree(categoriesJson, null, '');
        categoriesJson.forEach(function(item){
          i=0;
          if (item.parent === null) {
            parentsId[i] = item._id;
          }
        });
        next();
    });
  },
    function(req, res, next) {
      request.post(
        {
          url: 'https://www.google.com/recaptcha/api/siteverify?secret=' + secret + '&response=' + req.body['g-recaptcha-response']
        }
        , function(error, response, body) {
          if(JSON.parse(body).success != false){
            success = JSON.parse(body).success;
          }else{
            console.log('error: ' + error);
            console.log('success ? :' + JSON.parse(body).success);
          }
          
          next();
        });
  })
  .post(function(req, res, next) {
    
    if(req.body.searchValue1 != undefined){
      res.redirect('/search/='+encodeURIComponent(req.body.searchValue1));
    }else{
      /**
      * send POST comment
      *
      */

      if(success == true){
        request.post({
          url: domain + '/api/comment',
          json:true,
          body:{  
              'author': req.body.author,
              'body': req.body.body
            }
          }, function(error, httpResponse, body) {
              postComment = httpResponse.statusCode == 200 ? true: false;
              console.log(mainInfo);
              req.breadcrumbs('Контакти');
              res.render('contacts', {
                title: 'Mузей Історії техніки',
                mainCategoryName: 'Контакти',
                postSuccess: postComment,
                mainInfo: mainInfo,
                catList: categoryList,
                catJson: categoriesJson,
                crumbs: req.breadcrumbs()
              });
              next();
            });
        }else{
          postComment = false;
          console.log(mainInfo);
        req.breadcrumbs('Контакти');
        res.render('contacts', {
          title: 'Mузей Історії техніки',
          mainCategoryName: 'Контакти',
          postSuccess: postComment,
          mainInfo: mainInfo,
          catList: categoryList,
          catJson: categoriesJson,
          crumbs: req.breadcrumbs()
        });
      }
    }
  });

module.exports = router;