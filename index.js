#!/usr/bin/env node

const chalk = require('chalk');
const program = require('commander');
const request = require('request-promise-native');
const filenamify = require('filenamify');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

const { version } = require('./package');

let OUTPUT_PATH = 'output';
let BATCH = 5;

program
    .version(version)
    .option('-k, --key [key]', 'set the google authentication key')
    .option('-c, --channel [channel]', 'set the channel identifier')
    .option('-o, --channel [output]', 'set the output folder')
    .option('-b, --batch [batch]', 'set the batch size');

program.on('--help', () => {
    console.log('\n  Example:\n');
    console.log('    $ vidrip -k \'GOOGLE_API_KEY` -c \'CHANNEL_IDENTIFIER`\n');
});

program.parse(process.argv);

if(program.key == undefined || program.channel == undefined) {
    console.log(`vidrip: Must specify both of -k, -c`);
} else {
    if(program.key == true) {
        console.log(`vidrip: Must specify both of -k, -c`);
    } else {
        if(program.batch != undefined && program.batch >= 1) BATCH = program.batch;
        if(program.output != undefined && program.output.length >= 1) DEFAULT_PATH = program.output

        main(program.key, program.channel)
        .then(_ => { })
        .catch((e) => { console.log(e) });
    }
}

async function getChannel(key, channelId, nextPageToken) {
    const response = await request(`https://www.googleapis.com/youtube/v3/search?=key${key}&channelId=${channelId}&part=snippet,id&maxResults=50&pageToken=${nextPageToken}`);
    return JSON.parse(response);
}

async function getFirstChannel(key, channelId) {
    const response = await request(`https://www.googleapis.com/youtube/v3/search?key=${key}&channelId=${channelId}&part=snippet,id&maxResults=50`);
    return JSON.parse(response);
}

async function getChannelInfo(key, channelId) {
    const response = await request(`https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${key}`);
    return JSON.parse(response);
}

async function getChannelId(key, channelId) {
    const response = await request(`https://www.googleapis.com/youtube/v3/channels?key=${key}&forUsername=${channelId}&part=id`);
    return JSON.parse(response);
}

async function download(items) {
    if (!fs.existsSync(OUTPUT_PATH)){
      fs.mkdirSync(OUTPUT_PATH);
    }

    let counter = 0;

    console.log(chalk.green(`==>`), chalk`Working in increments of {bold ${BATCH}}`);

    let videos = new Array(BATCH);

    for(let i = 0; i < Math.ceil(items.length / BATCH); i++) {
        for(let i = 0; i < BATCH; i++) {
            let item = items[i + counter];

            try {
                console.log(chalk.green(`==>`), `Downloading '${item.snippet.title.toString()}'`);
                videos[i] = getAudio(item.id.videoId, item, videos, i);
            } catch(e) { console.log(chalk.red(`==>`), 'Error occured during retrieval of audio'); }

            counter++;
        }

        await Promise.all(videos);
        videos = new Array(BATCH);
        console.log(chalk.green(`==>`), chalk`Completed {bold ${counter}}/${items.length}`);
    }
}

function getAudio(video, item, videos, i) {
    if(video == undefined) return;

    let url = `http://www.youtube.com/watch?v=${video}`;
    let options = { filter: (format) => format.container === 'webm' };
    let loc = path.join(process.cwd(), OUTPUT_PATH, filenamify(item.snippet.title.replace(/\//ig, ' ')) + '.mp3');

    return new Promise((resolve, reject) => {
        try {
            ffmpeg({ source: ytdl(url, options) })
                .noVideo()
                .audioCodec('libmp3lame')
                .toFormat('mp3')
                .on('error', function(err, stdout, stderr) {
                    console.log('Error: ' + err.message);
                    console.log('ffmpeg output:\n' + stdout);
                    console.log('ffmpeg stderr:\n' + stderr);
                })
                .on('end', () => {
                    resolve(true);
                })
                .pipe(fs.createWriteStream(loc));
        } catch(e) {
            console.log(chalk.red('==>'), `Error occured when downloading ${video}`);
            console.log(e);
            resolve(false);
        }
    });
}

async function main(key, channel) {
    let id = await getChannelId(key, channel);
    if(id.items.lenth <= 0) {
        console.log(chalk.red('==>'), 'Unable to find channel!');
        process.exit(-1);
    }

    channel = id.items[0].id;

    let channelInfo = await getChannelInfo(key, channel);

    console.log(chalk.green(`==>`), `Selected '${channelInfo.items[0].snippet.title}'`);

    let { items, nextPageToken, pageInfo: { totalResults } } = await getFirstChannel(key, channel);
    console.log(chalk.green(`==>`), chalk`Found {bold ${totalResults}} result(s)`);

    if(nextPageToken != undefined) {
      while(true) {
        let page = await getChannel(key, channel, nextPageToken);
        if(page.nextPageToken == undefined) {
          break;
        } else {
          nextPageToken = page.nextPageToken;

          page.items.forEach((item) => {
            items.push(item);
          });
        }
      }
    }

    if(totalResults - items.length > 1) {
        console.log(chalk.yellow(`==>`), chalk`Missed {bold ${totalResults - items.length}} result(s)`);
    }

    await download(items);

    console.log(chalk.green('==>'), 'Done!');
}
