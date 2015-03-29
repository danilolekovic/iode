// For use with HTML files
var elements = document.getElementsByTagName("script");

function httpGet(address) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', address, false);
  xhr.send(null);
  if (xhr.status === 200) {
    return xhr.responseText;
  }
}

for (var i = 0; i < elements.length; i++) {
    if (elements[i].type == "text/stripes") {
      var previousCode = elements[i].innerHTML;
      var src = "";
      if (elements[i].src != undefined && elements[i].src != null) {
        src = httpGet(elements[i].src);
        eval(GenerateStripes(src + previousCode));
      } else {
        eval(GenerateStripes(previousCode));
      }
    } else if (elements[i].type == "text/litstripes") {
      var previousCode = elements[i].innerHTML;
      var reg = /<stps[^>]*>([\s\S]*?)<\/stps>/g;
      var matches = [], found;

      while (found = reg.exec(code)) {
        matches.push(found[0].substring(6, found[0].length - 7).replace(/\n/g, ""));
      }

      var src = "";
      if (elements[i].src != undefined && elements[i].src != null) {
        src = httpGet(elements[i].src);
        eval(GenerateStripes(src + matches.join("")));
      } else {
        eval(GenerateStripes(matches.join("")));
      }
    } else if (elements[i].type == "text/sast") {
      var previousCode = elements[i].innerHTML;
      var src = "";
      if (elements[i].src != undefined && elements[i].src != null) {
        src = httpGet(elements[i].src);
        eval(Generate(eval(src + previousCode)));
      } else {
        eval(Generate(eval(previousCode)));
      }
    }
}
