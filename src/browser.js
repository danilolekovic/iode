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
      if (elements[i].hasAttribute("src")) {
        src += httpGet(elements[i].src);
        eval(GenerateStripes(src + previousCode));
        elements[i].innerHTML = "/* Compiled by Stripes v0.0.82 */\n" + GenerateStripes(src + previousCode);
        elements[i].type = "text/javascript";
      } else {
        eval(GenerateStripes(previousCode));
        elements[i].innerHTML = "/* Compiled by Stripes v0.0.82 */\n" + GenerateStripes(previousCode);
        elements[i].type = "text/javascript";
      }
    } else if (elements[i].type == "text/litstripes") {
      var previousCode = elements[i].innerHTML;
      var reg = /<stps[^>]*>([\s\S]*?)<\/stps>/g;
      var matches = [], found;

      while (found = reg.exec(code)) {
        matches.push(found[0].substring(6, found[0].length - 7).replace(/\n/g, ""));
      }

      var src = "";
      if (elements[i].hasAttribute("src")) {
        src += httpGet(elements[i].src);
        eval(GenerateStripes(src + matches.join("")));
        elements[i].innerHTML = "/* Compiled by Stripes v0.0.82 */\n" + GenerateStripes(src + matches.join(""));
        elements[i].type = "text/javascript";
      } else {
        eval(GenerateStripes(matches.join("")));
        elements[i].innerHTML = "/* Compiled by Stripes v0.0.82 */\n" + GenerateStripes(matches.join(""));
        elements[i].type = "text/javascript";
      }
    } else if (elements[i].type == "text/sast") {
      var previousCode = elements[i].innerHTML;
      var src = "";
      if (elements[i].hasAttribute("src")) {
        src += httpGet(elements[i].src);
        eval(Generate(eval(previousCode)));
        elements[i].innerHTML = "/* Compiled by Stripes v0.0.82 */\n" + Generate(eval(src + previousCode));
        elements[i].type = "text/javascript";
      } else {
        eval(Generate(eval(previousCode)));
        elements[i].innerHTML = "/* Compiled by Stripes v0.0.82 */\n" + Generate(eval(src + previousCode));
        elements[i].type = "text/javascript";
      }
    }
}
