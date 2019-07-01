import Parser from "htmlparser2";

export default class HtmlProcessor {
  constructor() {
    this.pTagFlag = false;
    this.currentTag = "";
    this.stack = [];
    this.tempTextHolder = "";
  }

  removeZerowidthJoiner = content => {
    return content
      .split("&zwj;")
      .join("")
      .split("&#8203;")
      .join("");
  };

  removeHypenation = content =>
    this.removeZerowidthJoiner(content.split("&shy;").join("")); // removes hypenated code and zero width content.

  hasHValue = className => {
    switch (className) {
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
        return true;
      default:
        return false;
    }
  };

  extractHLabels = content => {
    // content = this.removeHypenation(content); // asked to remove this because of the issue #6 on gitlab
    let parserObj = new Parser.Parser(
      {
        onopentag: (name, attribs) => {
          if (name === "p" && this.hasHValue(attribs.class)) {
            this.pTagFlag = true;
            this.currentTag = attribs.class;
          }
        },
        ontext: text => {
          if (this.pTagFlag) {
            // this.count = false;
            this.tempTextHolder = this.tempTextHolder + text;
            //console.log("text : " + text + " class : " + this.currentTag);
          }
        },
        onclosetag: tagname => {
          if (this.pTagFlag) {
            if (tagname === "p") {
              this.pTagFlag = false;
              this.stack.push({
                tag: this.currentTag,
                value: this.tempTextHolder
              });
              this.tempTextHolder = "";
            }
          } else {
            //console.log(this.stack[this.stack.length - 1]);

            if (this.stack[this.stack.length - 1] !== "empty") {
              this.stack.push("empty");
            }
          }
        }
      },
      { decodeEntities: true }
    );
    parserObj.write(content);
    parserObj.end();
    return this.stack;
    // let array = [];
  };
}
