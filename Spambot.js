const fs = require("fs")
const util = require('util');
const https = require("https")
const { spawn } = require('child_process');
const filenamify = require("filenamify")
const download = require("image-downloader")
const GoogleImages = require('google-images');
const imageSearchClient = new GoogleImages(process.env['GOOGLE_IMG_KEY'], process.env['GOOGLE_IMG_SECRET']);
const axios = require("axios")
var parseString = require('xml2js').parseString;
const textToSpeech = require('@google-cloud/text-to-speech');
const ttsClient = new textToSpeech.TextToSpeechClient();
const path = require("path")

if (require.main === module) {
    (async () => {
        init(await getWebsiteUrls(3))
    })()
} else {
    module.exports = { getWebsiteUrls, init }
}

//MAIN FUNCTIONS
async function init(urls){ //Creates a folde. Runs getSiteData(), synthesizeVideo(), upload()
    var jobFolder = path.resolve('job/job-'+hash())
    console.log("jobfolder: ",jobFolder)
    var dirs = [jobFolder+"/",jobFolder+"/audio_segments",jobFolder+"/raw_images",jobFolder+"/resized",jobFolder+"/logs"]
    dirs.map(createFolder)
    console.log("recent urls: "+ urls.join("\n"))
    let siteData = await getSiteData(urls,jobFolder)
    await synthesizeVideo(jobFolder)
    await uploadVideo(jobFolder,siteData)
}
async function getSiteData(urls,jobFolder){ //Diffbots two urls, combines their data. Converts TTS, googles images.
    await Promise.all(urls.map((url,i) => diffbot(url,jobFolder,i+1)))
    var dir = jobFolder+"/";
    let massaged_data = await massage(jobFolder)
    await convertTTS(massaged_data.text,dir)
    await downloadNewImages(massaged_data.images,dir)
    return massaged_data
}
async function synthesizeVideo(folder){ // Runs ffmpeg script to gen video from TTS audio, images
    return new Promise((resolve,reject)=> {
        var cmd = path.resolve('./perform_job.sh')
        var proc = spawn(cmd, [folder.split("/")[6]]);
        proc.stdout.on('data',console.log);
        proc.stderr.setEncoding("utf8")
        proc.stderr.on('data', console.log);
        proc.on('close', function() {
            console.log('Finished job in folder ',folder);
            resolve(folder)
        });
    })
}
//HELPER FUNCTIONS
async function getWebsiteUrls(offset){ // Finds recent posts, follows their 301s and gets article links
    let regexp = /https:\/\/www.zergnet.com\/o\/[0-9]*\/[0-9]\/[0-9]\/[0-9]/g;
    let raw = await axios.get("http://zergnet.com/ajax/load_results.php")
    let matches = raw.data.matchAll(regexp)

    let list = Array.from(matches).toString().split(",")
    let response1 = await axios.get(list[offset])
    let response2 = await axios.get(list[offset+1])
    return [response1.request.res.responseUrl.split("?")[0],response2.request.res.responseUrl.split("?")[0]]
}
async function diffbot(url,folder,i=""){ // Uses the diffbot service to parse webpage content
    return new Promise(function(success,fail){
        const token = process.env["DIFFBOT_TOKEN"]
        const requestURL = "https://api.diffbot.com/v3/article"
        const params = '?token='+token+"&url="+url;
        const request = requestURL+params;
        https.get(request, function(res) {
            let body = []
            res.on('data', function(d) {
                body.push(d)
            }).on('end', function(d) {
                var filename = folder+"/site-data-"+i+".json"
                console.log("diffbot filename: ",filename)
                var data = Buffer.concat(body).toString()
                fs.writeFile(filename, data, 'utf-8', function(err) {
                    if(err){ fail(err) } else { success(filename); }
                });
            });
            }).on('error', function(e) {
                fail(e)
                console.error(e);
            });
    })
}
async function searchImages(query,opts={}){ // Gets 10 imgs w metadata from Google based on search term
    return await imageSearchClient.search(query,opts)
}
function convertTTS(txt,jobDirectory) { // Converts text to speech using Google service
    function combineAudio(filenames,dir){
        console.log("combining filenames",filenames)
        return new Promise(function(success,fail){
          var cmd = '/usr/local/bin/ffmpeg';
          var outputFileName = dir+'out-master.mp3'
          var args = '-loglevel warning -i '+combineAudioChunks(filenames.length,dir)+outputFileName
          var proc = spawn(cmd, args.split(" "));
          proc.stderr.setEncoding("utf8")
          proc.stderr.on('data', function(data) {
              console.log(data);
            //   fail(data)
          });
          proc.on('close', function() {
              console.log('Converted TTS in',jobDirectory);
              success(outputFileName)
          });
        })
      }

    let text = splitChars(txt,5000)
    let chunks = text.map(function(chunk,i){
      return new Promise(async function(success,fail){
        const request = {
          input: {text: chunk},
          voice: {languageCode: 'en-US', ssmlGender: ['MALE','FEMALE','NEUTRAL'][Math.floor(Math.random()*3)]},
          audioConfig: {audioEncoding: 'MP3'},
        };
        const filename = 'output'+i+'.mp3';
        const [response] = await ttsClient.synthesizeSpeech(request);
        const writeFile = util.promisify(fs.writeFile);
        try {
          await writeFile(jobDirectory+"audio_segments/"+filename, response.audioContent, 'binary');
        } catch (error) {
          fail(error)
        }
        console.log('Text-to-speech segment finished: '+filename);
        success(filename)
      })
    })
    return Promise.all(chunks).then((filenames)=> {
      combineAudio(filenames,jobDirectory)
    })
}
async function massage(jobFolder){ //Composes title, description, images, tags from 2 articles, + bonus images from tags
    let folder = jobFolder
    let data = [JSON.parse(fs.readFileSync(jobFolder+"/site-data-1.json").toString()),
    JSON.parse(fs.readFileSync(jobFolder+"/site-data-2.json").toString())]
    console.log("massaging here: ",jobFolder+"/site-data-1.json",'fixed?: ',path.resolve(jobFolder+"/site-data-1.json"))
    let out = {};
    let d = [];
    try { d[0] = data[0].objects[0]; }
    catch (error) { throw new Error("Invalid diffbot data file :(") }
    try { d[1] = data[1].objects[0]; }
    catch (error) { throw new Error("Invalid diffbot data file :(") }
    out.title = synthesizeStrings(d[0].title,d[1].title)
    out.description = synthesizeStrings(d[0].text.split(". ").slice(0,3).join(". "),d[1].text.split(". ").slice(0,3).join(". "),". ")
    out.text = synthesizeStrings(d[0].text,d[1].text,". ")
    out.tags = [jobFolder.replace('job/job-','')]
    out.images = []
    d.forEach((dd,i) => {
        if(dd.hasOwnProperty("tags"))
            out.tags = out.tags.concat(dd.tags.filter(function(e){
                return e.score < 0.65
            }).map(function(e){
                return e.label
            }))
        if(dd.hasOwnProperty("images")){
            out.images = out.images.concat(dd.images.map(function(img){
                return {
                    url: img.url,
                    width: img.width,
                    height: img.height,
                    title: img.title
                }
            }));
        }
    })
    fs.writeFile(folder+"/combined-data.json", JSON.stringify(out), function(err) {
        if(err){ throw err }
    });
    const images = await findNewImages(out.tags.slice(1))
    for(var im in images){
        out.images = out.images.concat(images[im])
    }
    return out
}
async function findNewImages(tags){ //Gets images from google related to list of tags
    var images = []
    for(var tag in tags){
        images = images.concat(searchImages(tags[tag],{
            start: Math.floor(Math.random()*100),
            filter: "1"
        })).sort(() => Math.floor(Math.random()*2)*2-1)
    }
    return Promise.all(images)
}
async function downloadNewImages(images,dir){ // Downloads images from URLs to "project folder"
    return Promise.all(images.map(function(img,i){
        return download.image({
            url: img.url,
            dest: dir+"raw_images/image"+i+".jpg"
        }).catch((err) => err)
    }))
}
async function uploadVideo(folder,data){ //Uploads video to youtube, using massaged data
    return new Promise((resolve,reject)=> {
        var cmd = 'python'
        var args =  ['upload_video.py3']
        args = args.concat([
        '--file',folder+"/master.mp4",
        '--title', data.title.slice(0,99).toUpperCase(),
        '--description', data.description+" "+ data.tags.map(t => "#"+t).join(" "),
        '--category',"22",
        '--keywords',  data.tags.join(","),
        '--privacyStatus', "unlisted"
        ])
        var proc = spawn(cmd, args);
        proc.stdout.on('data',d => console.log(d.toString()));
        proc.stderr.setEncoding("utf8")
        proc.stderr.on('data', d => console.log(d.toString()));
        proc.on('close', function() {
            console.log('Uploaded video from ',folder);
            resolve(folder)
        });
    })
}
//UTILITY FUNCTIONS
function splitChars(text,limit){ //Chunks text within limit. Used for TTS service.
    if(text.length<limit)
      return [text]
    let splitter = "."
    var sentences = text.split(splitter)
    let counter = 0;
    let lastMove = 0
    while(counter<limit){
      lastMove = splitter.length + sentences.shift().length
      counter += lastMove
    }
    return [text.slice(0,counter-lastMove)].concat(splitChars(text.slice(counter-lastMove,text.length),limit))
  }
function combineAudioChunks(len,dir){ //Combines chunks of TTS audio into one.
var concat = 'concat:'
for (let i = 0; i < len; i++) {
    concat+=(i!==0? "|" : "")+dir+"audio_segments/output"+i+".mp3"
}
concat+=' -acodec copy '
console.log("concat is ",concat)
return concat
}
function synthesizeStrings(str1,str2, delimiter = " "){  //Merges two texts. Splits each by delimiter and threads them back.
    let out = []
    let words = []
    words[0] = str1.split(delimiter)
    words[1] = str2.split(delimiter)
    while(words[0].length>0 || words[1].length > 0){
        // this craziness is, add a word from random choice unless one has run out, in which case add other
        let nextWord = words[Math.random() > .5 ? (words[1].length ? 1 : 0) : (words[0].length ? 0 : 1)].shift()
        out.push(nextWord)
    }
    return out.join(delimiter)
}
function hash(){ // Create random hash for project folder.
    return Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
}
function createFolder(dir){ // Create folder if it doesnt exist.
    if (!fs.existsSync(path.resolve(dir))){
        fs.mkdirSync(path.resolve(dir));
    }
}
