// const path = require("path");
// var fs = require("fs");

//list-react-files
export var supportedLanguages = [
  "en-us",
  "en-gb",
  "de",
  "fr",
  "es",
  "nl",
  "pt",
  "pl",
  "hy",
  "tr",
  "or",
  "sl",
  "tk",
  "hu",
  "mr",
  "lt",
  "is",
  "la",
  "bn",
  "sa",
  "ru",
  "uk",
  "fi",
  "ta",
  "eo",
  "ku",
  "sk",
  "ml",
  "rm",
  "be",
  "en",
  "ka",
  "pa",
  "ia",
  "it",
  "hr",
  "et",
  "kn",
  "cy",
  "ga",
  "oc",
  "cu",
  "gu",
  "el",
  "bg",
  "ro",
  "hi",
  "ca",
  "eu",
  "gl",
  "cs",
  "te",
  "as",
  "id",
  "lv",
  "af",
  "da",
  "th",
  "sv",
  "pi",
  "nn",
  "nb"
];

export var supportedLanguagesData = [];

for (let i in supportedLanguages) {
  supportedLanguagesData.push(
    require("./patterns/" + supportedLanguages[i] + ".json")
  );
}

class Language {
  constructor() {
    this.langSupport = {
      leftmin: {},
      rightmin: {},
      shortestPattern: {},
      longestPattern: {},
      specialChars: {},
      patterns: {}
    };
  }
}

export var Lang = new Language();

for (var temp in supportedLanguages) {
  var jsonContent = supportedLanguagesData[temp];
  //French Support
  let currentLang = jsonContent.language;
  if (!Lang.langSupport.leftmin.hasOwnProperty(currentLang)) {
    Lang.langSupport.leftmin[currentLang] = jsonContent.leftmin;
    Lang.langSupport.rightmin[currentLang] = jsonContent.rightmin;
    Lang.langSupport.shortestPattern[currentLang] = jsonContent.shortestPattern;
    Lang.langSupport.longestPattern[currentLang] = jsonContent.longestPattern;
    Lang.langSupport.specialChars[currentLang] = jsonContent.specialChars;
    Lang.langSupport.patterns[currentLang] = jsonContent.patterns;
  }
}
//French Support
