var express = require('express');
var router = express.Router();
var request = require('request');
var domain = 'http://admin.kspu-museum.in.ua';
var pathToPlayer='/vendor/bower_components/webplayer/webplayer.html?load=';
var buildmodule = require('./build-module');
var parcedJson
    , url
    , categoriesJson
    , parentsId = new Array()
    , categoryList
    , thisCategoryName
    , thisCategoryId
    , thisParentIds = new Array()
    , thisParentNames = new Array();

var retina = global.devicePixelRatio > 1 ? true : false;

router.route('/*')
  .all(
    /**
     * get information about exhibit
     *
     */
    function(req, res, next){
      
      url = req.url.substr(1);
      request(domain + '/api/exhibit/' + url, function(error, response, body) {
        parcedJson = JSON.parse(body);
        thisCategoryName = parcedJson.exhibit.categories[0].name;
        next();
      });
    },
    /**
     * get list of categories
     *
     */
    function(req, res, next) {
      request(domain + '/api/category', function(error, response, body) {
        categoriesJson = JSON.parse(body);
        categoryList = buildmodule.BuildTree(categoriesJson, null , '');
        var i=0;
        categoriesJson.forEach(function(item){
          if (item.parent == null) {
            parentsId[i] = item._id;
            i++;
          }
          if(item.name == thisCategoryName){
            thisCategoryId = item._id;
            thisParentIds = buildmodule.FindAllParents(categoriesJson,thisCategoryId,0);
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
        req.breadcrumbs(thisCategoryName, '/gallery/id/'+parcedJson.exhibit.categories[0]._id+'?limit=15');
        req.breadcrumbs(parcedJson.exhibit.title, '/item/*');
        next();
      });
      
    })
    
  .get(function(req, res, next) {
    res.render('item', {
      title: 'Mузей Історії Техніки',
      parcedJson: parcedJson,
      catList: categoryList,
      catJson: categoriesJson,
      parentCategory: parentsId,
      mainCategoryName: thisCategoryName,
      domain: domain,
      size: retina,
      pathTo3D: pathToPlayer,
      crumbs: req.breadcrumbs()
      
    });
  })
  .post(function(req, res, next) {
      res.redirect('/search/='+encodeURIComponent(req.body.searchValue1));
  });
    
module.exports = router;