var youtubedl = require('youtube-dl');
var fs = require('fs');
var process = require('process');

module.exports = function(items) {

  if (!fs.existsSync('vidrip')){
    fs.mkdirSync('vidrip');
  }

  items.forEach(function(item) {
    if(item.id.videoId != undefined) {
      console.log(item.id.videoId);
      var video = youtubedl('http://www.youtube.com/watch?v=' + item.id.videoId, ['--format=140']);

      video.on('info', function(info) {
        console.log('Downloading ', info._filename);
        video.pipe(fs.createWriteStream(process.cwd() + '/vidrip/' + info._filename + '.m4a'));
      });
    }
  });
}