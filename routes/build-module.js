module.exports = {
  BuildTree: function (json, parent, str) {
  var str = str || '',
    item,
    childs=0;
    
  str += '<ul>';
  for (item in json) {
    if(FindParent(json, parent) == null || parent == null){
      if (json[item].parent === parent) {
          str += '<li> <a href=\"/gallery/id/'+json[item]._id+'?limit=15\"'+ '>';
          str += json[item].name;
          str += '</a>';
          str = this.BuildTree(json, json[item]._id, str);
          str +='</li>';
          childs++;
        }
    }
  }
  str += '</ul>';
  return str;
},
    FindAllParents: function(json, id, i, parents){
      var parents = parents || new Array();
      parents[i] = FindParent(json, id);
      // console.log(parents);
      if(parents[i]!=null)
      	this.FindAllParents(json,parents[i],++i,parents);
      return parents;
    }
};
var FindParent = function(json, id){
  var item;
	for (item in json)
  	if(json[item]._id == id)
    	return json[item].parent;
  }
