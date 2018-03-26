var express = require('express');
var router = express.Router();
var request = require('request');
var domain = 'http://admin.kspu-museum.in.ua';
var buildmodule = require('./build-module');

var url
  , parcedJson
  , thisCategoryName
  , catId
  , categoryList
  , categoriesJson
  , thisCategoryId;
/**
 * checkin for RETINA screens
 *
 */
var retina = global.devicePixelRatio > 1 ? true : false;

router.route('/id/*')
  /**
   * use API requests as a spesific middleware for all requests to current path
   *
   */
  .all(
    function(req, res, next) {
      /**
      * get current path
      *
      */
      var a = req.url.indexOf('/id/')+1;
      var b = req.url.indexOf('?')+1;
      if(a & b){
        catId = req.url.substring(4,b-1);
      }
      url = req.url.substr(4);
      /**
      * get current category name
      *
      */
      request(domain + '/api/category/' + url, function(error, response, body) {
        thisCategoryName = JSON.parse(body).name;
         
        /**
         * go to the next middleware function
         *
         */
        next();
      });
    },
    function(req, res, next) {
      /**
       * get list of exhibits
       *
       */
      request(domain + '/api/exhibit/category/' + url + '&img=1',
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
            parcedJson = JSON.parse(body);
          }
          /**
           *  go to the next middleware function
           *
           */
          next();
        });
    },
   function(req, res, next) {
      request(domain + '/api/category', function(error, response, body) {
        categoriesJson = JSON.parse(body);
        var thisParentIds;
        var thisParentNames = new Array();
        categoryList = buildmodule.BuildTree(categoriesJson, null, '');
        var i=0;
        categoriesJson.forEach(function(item){
           if(item.name == thisCategoryName){
            thisCategoryId = item._id;
            thisParentIds = buildmodule.FindAllParents(categoriesJson,thisCategoryId,0);
            i++;
          }
        });
        categoriesJson.forEach(function(item){
          for(i = 0; i < thisParentIds.length; i++)
            if (item._id == thisParentIds[i]){
              thisParentNames[i] = item.name;
            }
        });
        /**
          * adding breadcrumbs
          *
          */
          for(i = thisParentIds.length; i >= 0;i--){
            if (thisParentIds != null){
              if (thisParentNames[i] == 'Музей Історії Обчислювальної Техніки'){
                req.breadcrumbs('МІТ', '/gallery/id/'+ thisParentIds[i]);
              }else{
                req.breadcrumbs(thisParentNames[i], '/gallery/id/'+ thisParentIds[i]);
              }
            }
          }
        req.breadcrumbs(thisCategoryName, '/gallery');
        next();
      });
      
    })
    
  /**
   * process GET request to server
   * render gallery page
   *
   */
  .get(function(req, res, next) {
    res.render('gallery', {
      title: 'Mузей Історії Техніки',
      size: retina,
      parcedJson: parcedJson,
      mainCategoryName: thisCategoryName,
      mainCategoryId: thisCategoryId,
      catList: categoryList,
      catJson: categoriesJson,
      catId: catId,
      domain: domain,
      crumbs: req.breadcrumbs()
    });
  })
  .post(function(req, res, next) {
      res.redirect('/search/='+encodeURIComponent(req.body.searchValue1));
  });

module.exports = router;