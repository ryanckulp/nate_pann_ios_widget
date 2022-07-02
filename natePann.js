// name: natePann.js
// description: A scriptable widget that shows a top-ranking post on Nate Pann.
// original author: Ryan Kulp
// email: ryanckulp@gmail.com

var proxy = 'https://thingproxy.freeboard.io/fetch/'; // CORS workaround
var url = 'https://m.pann.nate.com/talk/today';

let webview = new WebView();
await webview.loadURL(proxy + url);

var getData = `
  var posts = document.getElementsByClassName('list_type2')[0];
  var topPost = posts.getElementsByTagName('li')[getRandomInt(9)];
  var stats = topPost.getElementsByClassName('sub')[0];

  var data = {title: '', url: '', comments: '', votes: '', views: ''};
  
  function getRandomInt(max){
    return Math.floor(Math.random() * max);
  }

  function getTitle(){
    let titleArea = topPost.getElementsByClassName('tit')[0];

    if (titleArea.getElementsByClassName('channel').length > 0) {
      titleArea.getElementsByClassName('channel')[0].remove();
    }

    if (titleArea.getElementsByClassName('count').length > 0) {
      titleArea.getElementsByClassName('count')[0].remove();
    }

    data.title = titleArea.innerText;
  }

  function getUrl(){
    let postId = topPost.getElementsByTagName('a')[0].href.split('/talk/')[1];
    data.url = 'https://m.pann.nate.com/talk/' + postId;
  }

  function getComments(){
    let comments = topPost.getElementsByClassName('count')[0].innerText;
    data.comments = comments.replace('(', '').replace(')', '');
  }

  function getVotes(){
    data.votes = stats.getElementsByClassName('num')[1].innerText;
  }

  function getViews(){
    data.views = stats.getElementsByClassName('num')[0].innerText;
  }

  function getEverything(){
    getComments(); // needs to be before title! (since getTitle() removes comment count)
    getUrl();
    getTitle();
    getVotes();
    getViews();
    return JSON.stringify(data);
  }

  getEverything();
  `;

// parse HTML page
let response = await webview.evaluateJavaScript(getData, false);
var parsedData = JSON.parse(response);
console.log(parsedData);

// create a widget
const w = new ListWidget();
w.url = parsedData.url;
w.backgroundColor = new Color("#fff");

// logo
let imageData = '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';
let image = Image.fromData(Data.fromBase64String(imageData));
let imageSize = new Size(65, 65);
const logo = w.addImage(image);
logo.imageSize = imageSize;

// title
const title = w.addText(parsedData.title);
title.textColor = new Color("#ff2c2e");
title.font = new Font("Avenir-Heavy", 24);
title.leftAlignText();
w.addSpacer(3);

// metadata
let metaText = "조회수: " + parsedData.views + " | 추천: " + parsedData.votes + " | 댓글: " + parsedData.comments;
const meta = w.addText(metaText);
meta.textColor = Color.gray();
meta.font = Font.systemFont(14);

Script.setWidget(w);
Script.complete();

w.presentMedium();
