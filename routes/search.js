var express = require('express');
var router = express.Router();
var request = require('request');
var domain = 'http://localhost:3005';
var buildmodule = require('./build-module');
var parcedJson;
var categoryList;
var categoriesJson;
var parentsId = new Array();
var parentsId;
var url;
var searchValue='';

router.route('/tags/*')
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
        req.breadcrumbs('Пошук', '/search/*');
        next();
      });
  })
    .get(function (req, res, next) {
      request(domain + '/api/' + req.url.substr(1), function (error, response, body) {
        res.render('search', { 
          title: 'Музей Історії Техніки',
          domain: domain,
          parcedJson: JSON.parse(body),
          parentCategory: parentsId,
          catJson: categoriesJson,
          catList: categoryList,
          crumbs: req.breadcrumbs(),
          mainCategoryName: 'Пошук',
          results: true,
          href: searchValue,
          tag: true
        });
      });
  });
  
  router.route('/=*')
    .all(function(req, res, next) {
      request(domain + '/api/category', function(error, response, body) {
        categoriesJson = JSON.parse(body);
        categoryList = buildmodule.BuildTree(categoriesJson, null, '');
        var i = 0;
        categoriesJson.forEach(function(item){
          if (item.parent === null) {
            parentsId[i] = item._id;
            i++;
          }
        });
        console.log(parentsId);
        req.breadcrumbs('Пошук', '/search/*');
        next();
      });
      
    })
    .post(function(req,res,next){
      searchValue = req.body.searchValue || req.body.searchValue1;
      request(domain + '/api/exhibit?search=' + encodeURIComponent(searchValue.toLowerCase()), function (error, response, body) {
        parcedJson = JSON.parse(body);
        res.render('search', { 
          title: 'Музей Історії Техніки',
          domain: domain,
          parcedJson: parcedJson,
          parentCategory: parentsId,
          catJson: categoriesJson,
          catList: categoryList,
          crumbs: req.breadcrumbs(),
          mainCategoryName: 'Пошук',
          results: true,
          href: searchValue
        });
      
        next();
      });
  })
    .get(function(req, res, next){
      request(domain + '/api/exhibit?search=' + req.url.substr(2), function (error, response, body) {
        res.render('search', { 
          title: 'Музей Історії Техніки',
          domain: domain,
          parcedJson: JSON.parse(body),
          parentCategory: parentsId,
          catJson: categoriesJson,
          catList: categoryList,
          crumbs: req.breadcrumbs(),
          mainCategoryName: 'Пошук',
          results: true,
          href: searchValue
        });
    
        next();
      });
  });
router.route('/*')
.all(
    function(req, res, next) {
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
        if(req.url.indexOf('&page=')>=0){
          searchValue = req.url.substring(2,req.url.indexOf('&page='));
        }else
          searchValue = req.url.substr(2);
        req.breadcrumbs('Пошук');
        next();
      });
    })
  .get(function(req, res, next){
    res.render('search',{
      title: 'Музей Історії Техніки',
        domain: domain,
        parcedJson: parcedJson,
        parentCategory: parentsId,
        catJson: categoriesJson,
        catList: categoryList,
        crumbs: req.breadcrumbs(),
        mainCategoryName: 'Пошук',
        results: false,
        href: searchValue
    });
  })
  .post(function(req, res, next) {
    searchValue = req.body.searchValue;
    request(domain + '/api/exhibit?search=' + encodeURIComponent(searchValue.toLowerCase()), function (error, response, body) {
      parcedJson = JSON.parse(body);
      res.render('search', { 
        title: 'Музей Історії Техніки',
        domain: domain,
        parcedJson: parcedJson,
        parentCategory: parentsId,
        catJson: categoriesJson,
        catList: categoryList,
        crumbs: req.breadcrumbs(),
        mainCategoryName: 'Пошук',
        results: true,
        href: searchValue
      });
    });
  });



module.exports = router;