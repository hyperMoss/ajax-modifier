// const elt = document.createElement("script");
// elt.innerHTML = "window.test = 1"
// document.head.appendChild(elt);

// 在页面上插入代码
// const s1 = document.createElement('script');
// s1.setAttribute('type', 'text/javascript');
// s1.setAttribute('src', chrome.runtime.getURL('defaultSettings.js'));
// document.documentElement.appendChild(s1);

// 在页面上插入代码
const script = document.createElement('script');
script.setAttribute('type', 'text/javascript');
script.setAttribute('src', chrome.runtime.getURL('main.js'));
document.documentElement.appendChild(script);

script.addEventListener('load', () => {
  chrome.storage.local.get(['ajaxInterceptor_switchOn', 'ajaxInterceptor_rules'], (result) => {
    if (result.hasOwnProperty('ajaxInterceptor_switchOn')) {
      postMessage({type: 'ajaxInterceptor', to: 'pageScript', key: 'ajaxInterceptor_switchOn', value: result.ajaxInterceptor_switchOn});
    }
    if (result.ajaxInterceptor_rules) {
      postMessage({type: 'ajaxInterceptor', to: 'pageScript', key: 'ajaxInterceptor_rules', value: result.ajaxInterceptor_rules});
    }
  });
});


let iframe;
let iframeLoaded = false;

// 只在最顶层页面嵌入iframe
if (window.self === window.top) {

  document.onreadystatechange = () => {
    if (document.readyState === 'complete') {
      let show = false;

      chrome.runtime.onMessage.addListener((msg, sender) => {
        if (msg == 'toggle') {
          show = !show;
        }
        return true;
      });
    }
  }
}


// 接收background.js传来的信息，转发给pageScript
chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === 'ajaxInterceptor' && msg.to === 'content') {
    if (msg.hasOwnProperty('iframeScriptLoaded')) {
      if (msg.iframeScriptLoaded) iframeLoaded = true;
    } else {
      postMessage({...msg, to: 'pageScript'});
    }
  }
});

// 接收pageScript传来的信息，转发给iframe
window.addEventListener("pageScript", function(event) {
  if (iframeLoaded) {
    chrome.runtime.sendMessage({type: 'ajaxInterceptor', to: 'iframe', ...event.detail});
  } else {
    let count = 0;
    const checktLoadedInterval = setInterval(() => {
      if (iframeLoaded) {
        clearInterval(checktLoadedInterval);
        chrome.runtime.sendMessage({type: 'ajaxInterceptor', to: 'iframe', ...event.detail});
      }
      if (count ++ > 500) {
        clearInterval(checktLoadedInterval);
      }
    }, 10);
  }
}, false);

window.addEventListener("message", function(event) {
console.log(event.data)
}, false);

window.parent.postMessage({ type: "CONTENT", text: "Hello from the webpage!" }, "*");


// var s = document.createElement('script');
// s.setAttribute('type', 'text/javascript');
// s.innerText = `console.log('test')`;
// document.documentElement.appendChild(s);

