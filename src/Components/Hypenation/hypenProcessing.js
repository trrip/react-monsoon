import { obj as hyphenate } from "./hypenation/hyphenate";

const BodyPattern = /<body[^>]*>((.|[\n\r])*)<\/body>/im; //not sending it with body tag
const WordPattern = /([A-Za-z\x7F-‡]{5,})(?![^<]*>|[^<>]<\\)(?![0-9])/g;
// const WordPattern = /([A-Za-z\x7F-ﬁ]{5,})(?![^<]*>|[^<>]<\\)(?![0-9])/g; to get 64000 kind os words

export default class HypenationHelper {
  //zero entity addition
  addZeroWidthEntity = content => {
    let re = /(-(?!\/))(?![^<]*>|[^<>] <\/)+/g;
    content = content.replace(re, "-&#8203;");
    re = /(\/(?!-))(?![^<]*>|[^<>] <\/)+/g;
    content = content.replace(re, "/&#8203;");
    return content;
  };

  //zero entity removal
  removeZerowidthJoiner = content => {
    return content
      .split("&zwj;")
      .join("")
      .split("&#8203;")
      .join("");
  };

  //removing existing &shy and zero
  removeExistingTags = content => {
    return this.removeZerowidthJoiner(content.split("&shy;").join(""));
  };

  //processing escape characters.
  getEscapedContent(content, shouldRevert) {
    const replace = {
      $1: "$//1",
      $2: "$//2",
      $3: "$//3",
      $4: "$//4",
      $5: "$//5",
      $6: "$//6",
      $7: "$//7",
      $8: "$//8",
      $9: "$//9"
    };

    for (const key in replace) {
      if (replace.hasOwnProperty(key)) {
        const value = replace[key];
        const search = key;
        const replacement = value;
        content = shouldRevert
          ? content.split(replacement).join(search)
          : content.split(search).join(replacement);
      }
    }
    return content;
  }

  //getting the hypenated word
  getHyphenatedWord = (word, language) => {
    return hyphenate.conv(word, language === "" ? "en" : language);
  };

  //actual hypenation working here
  hypenateAndReturnContent = (content, language) => {
    let word_matches_array = content.match(WordPattern);
    if (word_matches_array != null) {
      word_matches_array.forEach(element => {
        // Following Regex is used to avoid replacing text inside <> html tags.
        var re = new RegExp(
          "(?<![\\w\\d])" + element + "(?![\\w\\d])(?![^<]*>|[^<>] <)+",
          "g"
        );
        let hyphenatedWord = this.getHyphenatedWord(element, language);
        // console.log(`:${hyphenatedWord}:----:${element}:-----:${language}:`);
        content = content.replace(re, hyphenatedWord);

        // Increment our word counter
        // THIS.SCRIPT_ANALYTICS.SINGLE_FILE_HYPHENATED_WORDS_COUNT++;
        // // Increment total word counter
        // THIS.SCRIPT_ANALYTICS.TOTAL_HYPHENATED_WORDS_COUNT++;
      });
    } else {
      content = "";
      console.log(`somethign issue with the data`);
    }
    return content;
  };

  hypenateContentWithLanguage = (content, language) => {
    content = this.removeExistingTags(content);
    content = content.replace("&dagger;", "†"); //removed and added the dagger from files and form words.
    content = content.replace("&Dagger;", "‡");
    content = this.getEscapedContent(content, false);
    if (content != null) {
      content = this.hypenateAndReturnContent(content, language);
      content = this.addZeroWidthEntity(content);
      //console.log(`-----` + content);
    }

    this.getEscapedContent(content, true);
    content = content.replace("†", "&dagger;");
    content = content.replace("‡", "&Dagger;");
    return content;
  };

  hypenateContentWithTitleTagAndLanguage = (content, language) => {
    let bodyContent = BodyPattern.exec(content);
    let hypenatedBodyContent = this.hypenateContentWithLanguage(
      bodyContent[1],
      language
    );
    content = content.replace(
      BodyPattern,
      `<body onload="_geturl1();">${hypenatedBodyContent}</body>`
    );
    return content;
  };
}

export let hypenationObject = new HypenationHelper();
