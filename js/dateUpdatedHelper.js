import * as fs from 'fs';
import {dateToString,twoDigits} from './dateHelpers.js'

// Extracts when tricoscraper/trico_scraped.json was most recently modified

//var fs = require('fs');
//var dH = require('');
//var dateToString = require('./dateHelpers');
//const months = ['January', 'February','March','April','May','June','July','August','September','October','November','December'];

function getLastUpdatedDate(){
	const stats = fs.statSync('tricoscraper/trico_scraped.json');
	
	var dateModified = stats.mtime
	// print file last modified date
	//console.log(`File Data Last Modified: ${dateModified}`);
	const dateStr = dateModified.toString();
	const timeZone = dateStr.substr(dateStr.indexOf('GMT'));
	//console.log(`Time: ${dateModified.getTime()}`);
	//console.log(`Date: ${dateModified.getDate()}`);
	//console.log(`Day: ${dateModified.getDay()}`);
	//console.log(`Month: ${dateModified.getMonth()}`);
	//console.log(`Year: ${dateModified.getFullYear()}`);
	var hour = dateModified.getHours();
	var timeLabel = 'AM';
	if(hour != hour%12){
		timeLabel = 'PM';
		hour = hour%12;
	}
	//console.log(`Hours: ${dateModified.getHours()%12}`);
	const minute = dateModified.getMinutes();
	//console.log(`Minutes: ${dateModified.getMinutes()}`);
	const seconds = dateModified.getSeconds();
	//console.log(`Seconds: ${dateModified.getSeconds()}`);
	const prettyStr = [dateToString(dateModified), ', ', twoDigits(hour), ':', twoDigits(minute), ':', twoDigits(seconds), ' ',timeLabel, ', ', timeZone].join('');
	//console.log(`Pretty Date: ${dateToString(dateModified)}, ${twoDigits(hour)}:${twoDigits(minute)}:${twoDigits(seconds)} ${timeLabel}, ${timeZone}`);
	console.log(prettyStr);
}

export {getLastUpdatedDate}