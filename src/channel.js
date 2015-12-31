var request = require('sync-request');

module.exports.getChannel = function(youtube_api_key, channelId, nextPageToken) {
  var response = request('GET', 'https://www.googleapis.com/youtube/v3/search?key=' + youtube_api_key + '&channelId=' + channelId + '&part=snippet,id&maxResults=50&pageToken=' + nextPageToken);

  return JSON.parse(response.getBody());
}

module.exports.getFirstChannel = function(youtube_api_key, channelId) {
  var response = request('GET', 'https://www.googleapis.com/youtube/v3/search?key=' + youtube_api_key + '&channelId=' + channelId + '&part=snippet,id&maxResults=50');

  return JSON.parse(response.getBody());
}

module.exports.getChannelInfo = function(youtube_api_key, channelId) {
  var response = request('GET', 'https://www.googleapis.com/youtube/v3/channels?part=snippet&id=' + channelId + '&key=' + youtube_api_key);

  return JSON.parse(response.getBody());
}