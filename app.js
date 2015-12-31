#! /usr/bin/env node

var vidrip = require('./src/index.js').vidrip;
var program = require('commander');
var packageinfo = require('./package');
 
program
  .version(packageinfo.version)
  .option('-k, --key [key]', 'Set the API key')
  .option('-c, --channel [channel]', 'Set the channel ID')

program.on('--help', function(){
  console.log('  Example:');
  console.log('');
  console.log('    $ vidrip -k AIzaSyCAvkcMM_rknmX7a6wWazAAXmEajXtCosM -c UC6ICrrRekLMOdj_ZuVGLNQw');
  console.log('');
});
  
program.parse(process.argv);

if(program.key == undefined || program.channel == undefined) {
  console.log('Incorrent usage! Try --help');
} else {
  if(program.key == true || program.key == true) {
    console.log('Incorrent usage! Try --help');
  } else {
    vidrip(program.channel, program.key)
  }
}