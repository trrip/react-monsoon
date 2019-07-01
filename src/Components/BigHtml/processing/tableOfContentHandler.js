export default class TocTreeHandler {
  constructor(
    extractedData /*:Worksheet*/,
    CMSId /*:CMSID String*/
  ) /*:Tree Objects*/ {
    this.orhpanPages = [];
    this.CMSId = CMSId === "" ? "DUMMY" : CMSId; //Changed the default to DUMMY
    this.checkIfThereAreNoOrphanNodes(extractedData);
  }
  /**
   * this method return true if there is something wrong in the value
   */
  checkIfValueIsBigOrSmall = (value1, value2) => {
    let a = value1.replace("h", "");
    let b = value2.replace("h", "");
    if (a > b) return false;
    else return true; //working corret
  };

  isEverythingFine = () => {
    if (this.orhpanPages.length === 0) return true;
    else return false;
  };

  generateTocTree = dataArr => {
    /*{
    "numtree":"1.0.0.0",
    "id":"1",
    "nametree":"Recommendations",
    "tocnametree":"Recommendations",
    "htmlpage":"null",
    "haspdf":false,
    "emailContent":false
    } */
    let finalTocTree = [];
    let tree = [0, 0, 0, 0];
    for (let i in dataArr) {
      let temp = dataArr[i];
      if (temp !== "empty") {
        if (temp.tag === "h1") {
          tree[0]++;
          for (let i = 1; i < 4; i++) {
            tree[i] = 0;
          }
        } else if (temp.tag === "h2") {
          tree[1]++;
          for (let i = 2; i < 4; i++) {
            tree[i] = 0;
          }
        } else if (temp.tag === "h3") {
          tree[2]++;
          for (let i = 3; i < 4; i++) {
            tree[i] = 0;
          }
        } else if (temp.tag === "h4") {
          tree[3]++;
          for (let i = 4; i < 4; i++) {
            tree[i] = 0;
          }
        }
        // console.log(tree.join("."));
        finalTocTree.push({ numtree: tree.join("."), nametree: temp.value });
      }
    }

    let TocTree = []; //for now temperory
    let treeCouter = 0;
    for (let i in dataArr) {
      let temp = dataArr[i];
      if (temp !== "empty") {
        let tempTree = finalTocTree[treeCouter];
        let obj = {};
        //this is because for some reson its adding extra space before &

        // console.log(tempTree.nametree);

        tempTree.nametree = tempTree.nametree.replace(" &", "&");
        obj.numtree = tempTree.numtree;
        obj.nametree = obj.tocnametree = tempTree.nametree;
        obj.id = treeCouter + 1;
        obj.htmlpage = `null`;
        obj.haspdf = false;
        obj.emailContent = false;

        treeCouter++;
        TocTree.push(obj);
      } else {
        let tempObj = TocTree[TocTree.length - 1];
        if (tempObj !== undefined) {
          TocTree[TocTree.length - 1].htmlpage = `${this.CMSId}_${
            tempObj.numtree
          }`;
        }
      }
    }

    return TocTree;
  };

  getAppropriateTag = tag => {};

  checkIfThereAreNoOrphanNodes = (dataArray /*:Array */) => {
    let oldTreeValue = "";

    let errorArray = [];
    for (let i in dataArray) {
      let temp = dataArray[i];
      if (temp !== "empty") {
        if (oldTreeValue === "") {
          oldTreeValue = temp.tag;
        }
        if (oldTreeValue !== temp.tag) {
          let arr = dataArray[i - 1];
          if (arr === "empty") {
            if (this.checkIfValueIsBigOrSmall(oldTreeValue, temp.tag)) {
              // console.log(
              //   `this : ${oldTreeValue} and ${temp.tag}: ${temp.value}`
              // );
              errorArray.push(temp);
            }
          }
        }
        oldTreeValue = temp.tag;
      }
    }
    // console.log(errorArray);
    this.tocTreeArray = this.generateTocTree(dataArray);
    this.orhpanPages = errorArray;
  };

  //generate logic for the generation of toc tree and finding out the orphan pages.
}
