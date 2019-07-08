import TocTreeHandler from "./tableOfContentHandler";

const OPENHEADDERTAG = `
  <!DOCTYPE html lang="EN">
  <html> 
  <head>
	<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
	<title><projectID></title>
	<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.5, user-scalable=1" name="viewport" />**
  <link charset="UTF-8" href="<projectID>.css" rel="STYLESHEET" type="text/css" />
  <link charset="UTF-8" href="HighLight.css" rel="STYLESHEET" type="text/css" />
  <script src="jquery-2.0.31.min.js"></script>
  <script type="text/javascript" src="HighlightSearch.js"></script>
  </head>`;
const CLOSEHEADDERTAG = `</html>`;
const REMOVETOCTREEFROMNAMETREE = true;
const BODYPATTERN = /<body[^>]*>((.|[\n\r])*)<\/body>/im;
class TocTree {
  numtree: string;
  id: string;
  nametree: string;
  tocnametree: string;
  htmlpage: string;
  haspdf: boolean;
  emailContent: boolean;

  constructor() {
    this.nametree = "";
    this.numtree = "";
    this.id = "";
    this.emailContent = false;
    this.htmlpage = "NULL";
    this.haspdf = false;
    this.tocnametree = "";
  }
} // Aorto-‍-‍-‍-‍iliac

class TreeAndDataHolder {
  page: string;
  info: TocTree;
  constructor() {
    this.page = "";
    this.info = new TocTree();
  }
}
export default class DataFileHandler {
  bodyTag = '<body onload="_geturl1();">BODY_TAG_HOLDER</body>';
  bigHtml: string;
  pageSeprated: Array<Object>;
  tocTree: Array<TocTree>;
  cmsID: string;

  constructor(bigHtml: string, tocTree: Array<TocTree>, cmsID: string) {
    // console.log(bigHtml);
    this.bigHtml = bigHtml;
    this.pageSeprated = [];
    this.tocTree = tocTree;
    this.cmsID = cmsID === "" ? "DUMMY" : cmsID;
    // console.log(tocTree);
  }
  seprateContentWithTag = (): Array<Object> => {
    let pagesArray: Array<TreeAndDataHolder> = [];
    let tempHolder = BODYPATTERN.exec(this.bigHtml);
    let wholePage = tempHolder![1];
    let topHeaderPart = OPENHEADDERTAG.replace(/<projectID>/g, this.cmsID);
    // console.log(topHeaderPart);
    /*    
    "numtree":"1.0.0.0",
    "id":"1",
    "nametree":"Recommendations",
    "tocnametree":"Recommendations",
    "htmlpage":"null",
    "haspdf":false,
    "emailContent":false 
    */
    for (let currentTree of this.tocTree) {
      let currentObjectHolder: TreeAndDataHolder = new TreeAndDataHolder();
      // console.log(`Name of the page ${currentTree.nametree}`);
      if (currentTree.htmlpage !== "null") {
        // console.log(`Name of the page ${currentTree.nametree}`);
        if (this.tocTree.indexOf(currentTree) !== this.tocTree.length - 1) {
          let breaker = this.tocTree[this.tocTree.indexOf(currentTree) + 1];
          let matchedPatternTitle = this.generateBreakerWithTagAndValue(
            breaker.numtree,
            breaker.nametree
          ).exec(wholePage);

          if (matchedPatternTitle === null) {
            console.log(
              "There is some issues with the -h- class tags. The tags should not have any tags in between the title tag. It does break the sequence that will cause the rest of the page come empty. So fix the issue and upload it again."
            );
            console.log(
              ` %c the issue is somewhere here : ${breaker.nametree}`,
              "background: #222; color: #bada55"
            );
            return [];
          }
          let currentPage = wholePage.split(matchedPatternTitle![0]);
          let temppage = currentPage[0];
          // console.log(temppage.length); // checking the length of the page.
          let restOfPage = "";
          for (let g in currentPage) {
            if (g !== "0") {
              restOfPage = restOfPage + matchedPatternTitle + currentPage[g];
            }
          }
          wholePage = restOfPage;
          currentObjectHolder.page =
            topHeaderPart +
            this.bodyTag.replace("BODY_TAG_HOLDER", temppage) +
            CLOSEHEADDERTAG;

          currentObjectHolder.info = currentTree;
          pagesArray.push(currentObjectHolder);
          //not last pages seprate pages out
        } else {
          //last game put everything in

          currentObjectHolder.page =
            topHeaderPart +
            this.bodyTag.replace("BODY_TAG_HOLDER", wholePage) +
            CLOSEHEADDERTAG;
          currentObjectHolder.info = currentTree;
          pagesArray.push(currentObjectHolder);
        }
      } else {
        currentObjectHolder.page = "NO PAGE";
        currentObjectHolder.info = currentTree;
        pagesArray.push(currentObjectHolder);
      }
    }
    // console.log(JSON.stringify(pagesArray));

    return REMOVETOCTREEFROMNAMETREE
      ? this.removeNumTreeFromNameTree(pagesArray)
      : pagesArray;
  };

  /**
   * This method retrun by timming num tree and spaces around the nametree and TOCNameTree
   */
  removeNumTreeFromNameTree = (tree: Array<TreeAndDataHolder>) => {
    let returningValue: Array<TreeAndDataHolder> = tree;
    for (let tempHolder of returningValue) {
      let info: TocTree = tempHolder.info;
      tempHolder.info.tocnametree = tempHolder.info.nametree = tempHolder.info.nametree
        .replace(/[0-9]\.[0-9]\.[0-9]\.[0-9]/g, "")
        .trim();
      // console.log(
      //   `DataFileHandler after changing : ${tempHolder.info.nametree}`
      // );
    }
    return tree;
  };

  formRegexCompatibleString = (str: String): String => {
    let tempStringHolder: String = str;
    let initialString = 'spanclas-s/abbr_textsupsub#href=<>&shy;zwj8203"'; // all the other types of string that can come
    initialString = initialString + tempStringHolder;
    let arr = initialString.split("");
    let newSet = new Set(arr);
    let finalArr = Array.from(newSet);
    // console.log(`this is the final array : ${finalArr}`);
    let finalString = finalArr.join("");
    finalString = finalString.replace("/", "\\/");
    finalString = finalString.replace("-", "\\-");
    // console.log(`this is the final string : ${finalString}`);
    return finalString;
  };

  generateBreakerWithTagAndValue = (numTree: string, value: string): RegExp => {
    //can be done that we need to create every possible combination of the sentence formation and then check about it.

    let re = new RegExp(
      '<p[ ]*class="' +
        this.getTheTagName(numTree) +
        '"[ ]*>[' +
        this.formRegexCompatibleString(value) +
        "]*</p>",
      "g"
    ); //new regex that is used to make or find the breaker for breaking the page.
    // return `<p class=\"${this.getTheTagName(numTree)}\" >${value}</p>`; //older code that used to match string.
    return re;
  };

  getTheTagName = (numTree: string): string => {
    let numberOfZero = numTree.split(".");
    let counter = 0;
    for (let i of numberOfZero) if (i === "0") counter++;
    switch (counter) {
      case 0:
        return "h4";
      case 1:
        return "h3";
      case 2:
        return "h2";
      case 3:
        return "h1";
      default:
        return "NotFound";
    }
  };
}
