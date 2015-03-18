// For use with HTML files
var elements = document.getElementsByTagName("script");
var stpsElements = [];

for (var i = 0; i < elements.length; i++) {
    if (elements[i].type == "text/stripes") {
      stpsElements.push(elements[i]);
    }
}

for (e in stpsElements) {
  var code = stpsElements[e].innerHTML;
  stpsElements[e].innerHTML = GenerateStripes(code);
}
