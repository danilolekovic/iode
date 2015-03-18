// For use with HTML files
var elements = document.getElementsByTagName("script");

for (var i = 0; i < elements.length; i++) {
    if (elements[i].type == "text/stripes") {
      var previousCode = elements[i].innerHTML;
      elements[i].innerHTML = GenerateStripes(previousCode);
      eval(elements[i].innerHTML);
    } else if (elements[i].type == "text/litstripes") {
      var previousCode = elements[i].innerHTML;
      var reg = /<stps[^>]*>([\s\S]*?)<\/stps>/g;
      var matches = [], found;

      while (found = reg.exec(code)) {
        matches.push(found[0].substring(6, found[0].length - 7).replace(/\n/g, ""));
      }

      elements[i].innerHTML = GenerateStripes(matches.join(""));
      eval(elements[i].innerHTML);
    } else if (elements[i].type == "text/sast") {
      var previousCode = elements[i].innerHTML;
      elements[i].innerHTML = Generate(eval(previousCode));
      eval(elements[i].innerHTML);
    }
}
