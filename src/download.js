var youtubeStream = require('youtube-audio-stream');
var jsesc = require('jsesc');
var fs = require('fs');
var process = require('process');

module.exports = function(items) {

  if (!fs.existsSync('vidrip')){
    fs.mkdirSync('vidrip');
  }

  items.forEach(function(item) {
    if(item.id.videoId != undefined) {     
      getAudio(item.id.videoId, item, function(err, data) {
        console.log('Downloading: ' + jsesc(data.item.snippet.title.toString()) + ' (' + item.id.videoId + ')');
      });
    }
  });

}

var getAudio = function (videoId, item, cb) {
  var requestUrl = 'http://youtube.com/watch?v=' + videoId
  try {
    youtubeStream(requestUrl).pipe(fs.createWriteStream(process.cwd() + '/vidrip/' + item.snippet.title.replace(/\//ig, ' ') + '.mp3'));
    cb(null, {item: item, requestUrl: requestUrl});
  } catch (exception) {
    console.error(exception);
  }
}