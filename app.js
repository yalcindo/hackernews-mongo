
/**
 * Module dependencies.
 */
 var mongoose=require('mongoose');
var fs = require('fs');
var request=require("request");
var cheerio=require("cheerio");
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

mongoose.connect('mongodb://localhost/hackernews');
var scrapedDataSchema = mongoose.Schema({
    url: String,
    title:String
    
});
var ScrapedData=mongoose.model('ScrapedData',scrapedDataSchema);
var calltwice=function(){
	request("https://news.ycombinator.com",function(err,response,body)
	{
	  	if (!err && response.statusCode == 200) {
			$ =cheerio.load(body);
	       
			$("span.comhead").each(function(i,el){
				var a=$(this).prev();
				var url=a.attr('href');
				var title=a.text();
	            var scraped= new ScrapedData({url:url,title:title});
	            scraped.save();
			});  
		}  		
	});
};

calltwice();
calltwice();
ScrapedData.find({},function(err,data){
	console.log(data);
	for(var i=0;i<data.length;i++)
		for(var j=data.length-1;i<j;j--)
		{
			{
				if(data[i].title===data[j].title)
				{
					console.log("----------1 "+j+ data[j].title);
					console.log("----------2 "+ i+data[i].title);
					ScrapedData.findByIdAndRemove(data[j]._id);
				}
			}
		}

});




http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
