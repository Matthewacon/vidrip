var youtubeStream = require('youtube-audio-stream')
var fs = require('fs');
var process = require('process');

module.exports = function(items) {

  if (!fs.existsSync('vidrip')){
    fs.mkdirSync('vidrip');
  }

  items.forEach(function(item) {
    if(item.id.videoId != undefined) {
      console.log('Downloading: ' + item.snippet.title + ' (' + item.id.videoId + ')');
      
      getAudio(item.id.videoId, item)
    }
  });
}

var getAudio = function (videoId, item) {
  var requestUrl = 'http://youtube.com/watch?v=' + videoId
  try {
    youtubeStream(requestUrl).pipe(fs.createWriteStream(process.cwd() + '/vidrip/' + item.snippet.title + '.mp3'));
  } catch (exception) {
    console.error(exception);
  }
}