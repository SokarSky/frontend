var express = require('express');
var router = express.Router();
var request = require('request');
var domain = 'http://admin.kspu-museum.in.ua';
var buildmodule = require('./build-module');
var parentsId = new Array();
// var parentsName = new Array();
// var parentCount;
var categoryList;
var categoriesJson,
    mainInfo;
// var i = 0;

router.route('/')
.all(function(req, res, next) {
      request(domain + '/api/category', function(error, response, body) {
        categoriesJson = JSON.parse(body);
        //console.log(body);
        categoryList = buildmodule.BuildTree(categoriesJson, null, '');
        var i=0;
        categoriesJson.forEach(function(item){
          if (item.parent === null) {
            parentsId[i] = item._id;
            i++;
          }
        });
        //console.log(categoryList);
        next();
      });
      
    },
    function(req, res, next){
      console.log(parentsId[0]);
      request(domain + '/api/museum/' + parentsId[0], function(error, response, body) {
          mainInfo = JSON.parse(body);
          next();
      });
    })
.get(function(req, res, next){
  req.breadcrumbs('Про музей');
  res.render('about', {
    title: 'Mузей Історії техніки',
    mainCategoryName: 'Про музей',
    catList: categoryList,
    catJson: categoriesJson,
    mainInfo: mainInfo,
    crumbs: req.breadcrumbs()
    });
})
.post(function(req, res, next) {
  res.redirect('/search/='+encodeURIComponent(req.body.searchValue1));
});

module.exports = router;
