var getFirstChannel = require('./channel').getFirstChannel;
var getChannel = require('./channel').getChannel;
var getChannelInfo = require('./channel').getChannelInfo;
var downloader = require('./download');

module.exports.vidrip = function(channelId, apikey) {
  var items = [];

  var channelInfo = getChannelInfo(apikey, channelId);
  console.log('Chosen channel:', channelInfo.items[0].snippet.title);

  var initial = getFirstChannel(apikey, channelId); 
  var totalResults = initial.pageInfo.totalResults;

  initial.items.forEach(function(item) {
    items.push(item);
  });

  var nextPageToken = initial.nextPageToken;

  if(nextPageToken != undefined) {
    while(true) {
      var page = getChannel(apikey, channelId, nextPageToken);
      if(page.nextPageToken == undefined) {
        break;
      } else {
        nextPageToken = page.nextPageToken;
        console.log(nextPageToken);

        page.items.forEach(function(item) {
          items.push(item);
        });
      }
    }
  }

  if(totalResults - items.length > 1) {
    console.log('I missed', totalResults - items.length, 'result(s). Are they private?');
  }

  downloader(items);
}