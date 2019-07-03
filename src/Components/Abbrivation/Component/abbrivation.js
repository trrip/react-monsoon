import React from "react";
import AbbrTableCell from "./tableCell";
import "./abbr.css";
import { ExcelHandlerObj } from "./excelHandler";
import { downloadHelperObject as downloadHelper } from "../../DownloadHelper/downloadHelper";
import { Link } from "react-router-dom";

//handle taking multiple input method that big html is sending

// eslint-disable-next-line
const CAPSPATTERN = /\b[A-Z]{2,}[s]\b|\b[A-Z]{1,}[\-]{1}[A-Z]{1,}\b|\b[A-Z]{2,}\b|\b[0-9]{1,}[A-Z]{1,}\b|\b[A-Z]{1,}[0-9]{1}\b|\b[A-Z]{1,}[a-z0-9]{1,}[A-Z]{1,}\b/g;
const BodyPattern = /<body[^>]*>((.|[\n\r])*)<\/body>/im;
const ABBRIVATIONSTORECONSTANT = "abbr";
// const LOCALSTORAGENAME = "hypen";

class Abbrivation extends React.Component {
  constructor() {
    super();
    this.state = {
      language: "",
      fileName: [],
      files: [],
      abbrStore: [],
      definations: []
    };
  }

  getBodyOfPage = content => BodyPattern.exec(content);

  getAllWords = content => content.match(CAPSPATTERN);

  getUniqueSetsOfWords = contentArr => Array.from(new Set(contentArr));

  getDefinationFromState = word => {
    let tempObj = this.state.definations.find(e => e.word === word);
    if (tempObj !== undefined) return tempObj.defination;
    else return "";
  };

  filterAbbrStoreForDuplication = abbrStore => {
    let secondStore = [];
    let tempStore = [];
    for (let i = abbrStore.length - 1; i >= 0; i--) {
      let abbr = abbrStore[i];
      if (tempStore.indexOf(abbr.word) === -1) {
        tempStore.push(abbr.word);
        secondStore.push(abbr);
      }
    }
    return secondStore;
  };

  filterAbbrJsonForDuplication = abbrStore => {
    let secondStore = [];
    let tempStore = [];
    for (let i = abbrStore.length - 1; i >= 0; i--) {
      let abbr = abbrStore[i];
      if (tempStore.indexOf(abbr.abbr) === -1) {
        tempStore.push(abbr.abbr);
        secondStore.push(abbr);
      }
    }
    return secondStore;
  };

  componentDidMount = () => {
    if (this.props.data !== undefined) {
      // console.log(this.props.data);
      //this.setState(rehydrate);
      let data = this.props.data;
      if (data === "cuttingKeys") {
        let fileData = JSON.parse(
          localStorage.getItem(ABBRIVATIONSTORECONSTANT)
        );

        console.log(fileData);

        if (fileData !== null) {
          let filesArray = fileData.files;
          let language = fileData.language;
          // let finalArrayForState = [];
          let finalData = {};
          let files = [];
          let abbrStore;
          let fileName = [];
          for (let file of filesArray) {
            let temp = this.readFileAndSaveStateFromProps(file.page, file.info);
            files.push(temp.files);
            if (abbrStore !== undefined) {
              abbrStore = abbrStore.concat(temp.abbrStore);
            } else abbrStore = [...temp.abbrStore];
            fileName.push(temp.fileName);
          }
          abbrStore = this.filterAbbrStoreForDuplication(abbrStore);
          finalData.files = files;
          finalData.abbrStore = abbrStore;
          finalData.fileName = fileName;
          finalData.language = language;
          console.log(finalData);
          this.setState(finalData);
        }
        localStorage.removeItem(ABBRIVATIONSTORECONSTANT);
      }
    }
  };

  readFileAndSaveStateFromProps = (fileDataOriginal, info) => {
    // let newFileData = { page: "", info: { name: "" } };
    // do the processing here.
    let fileData = fileDataOriginal;
    let allWordsFromPage = this.getUniqueSetsOfWords(
      this.getAllWords(fileData)
    );

    let abbstoreCopy = [];
    for (let i in allWordsFromPage) {
      // console.log(`this is the data :${JSON.stringify(abbstoreCopy)}`);
      let temp = {};
      temp.word = allWordsFromPage[i];
      temp.defination = this.getDefinationFromState(temp.word);
      abbstoreCopy.push(temp);
    }
    //do the processing here.
    //final execution.
    return {
      files: fileDataOriginal,
      abbrStore: abbstoreCopy,
      fileName: info
    };
  };

  readFileAndSaveState = (fileDataOriginal, name) => {
    // console.log(`this is the find ${fileData}`);
    name = name.replace(".html", "");
    let tempStateHolder = [...this.state.files];
    //rework this logic
    // do the processing here.
    let fileData = this.getBodyOfPage(fileDataOriginal)[1];
    let allWordsFromPage = this.getUniqueSetsOfWords(
      this.getAllWords(fileData)
    );
    let abbstoreCopy = [...this.state.abbrStore];
    for (let i in allWordsFromPage) {
      let temp = {};
      temp.word = allWordsFromPage[i];
      temp.defination = this.getDefinationFromState(temp.word);
      abbstoreCopy.push(temp);
    }
    tempStateHolder.push(fileData);
    //do the processing here.

    abbstoreCopy = this.filterAbbrStoreForDuplication(abbstoreCopy);
    //final execution.
    let allFiles = [...this.state.files];
    allFiles.push(fileDataOriginal);
    let allNames = [...this.state.fileName];
    allNames.push({ htmlpage: name, numtree: name, nametree: name });
    this.setState({
      files: allFiles,
      abbrStore: abbstoreCopy,
      fileName: allNames
    });
  };

  fileSelectorHandler = files => {
    if (files.length !== 0) {
      try {
        for (let i in files) {
          let reader = new FileReader();
          let currentFile = files[i];
          let fileName = files[i].name;
          // console.log(`----${files[i].name}`);
          reader.readAsText(currentFile, "UTF-8");
          reader.onload = event => {
            this.readFileAndSaveState(event.target.result, fileName);
          };
        }
      } catch (err) {
        //console.log(err);
      }
    }
  };

  removeAbbrivation = data => {
    let tempDataHolder = data;
    let regex = /<a href="abbr_(.*?)">(.*?)<\/a>/g;
    tempDataHolder = tempDataHolder.replace(regex, "$2");
    // tempDataHolder = tempDataHolder.replace(regex, "superman");
    return tempDataHolder;
  };

  changeDefinationHandler = (word, defination) => {
    let temp = [...this.state.abbrStore];

    let index = temp.findIndex(element => element.word === word);
    if (index !== undefined) {
      temp[index].defination = defination;
    }
    this.setState({ abbrStore: temp });
    console.log(`defination changed`);
  };

  assignDefinationToAbbrivationFromResponse = response => {
    let tempArr = [...this.state.abbrStore];
    for (let i in tempArr) {
      let tempHolder = response.find(e => e.word === tempArr[i].word);
      if (tempHolder !== undefined)
        tempArr[i].defination = tempHolder.defination;
      else tempArr[i].defination = "";
    }
    return tempArr;
  };

  handleResponseFromExcel = response => {
    let tempArr = this.assignDefinationToAbbrivationFromResponse(response);
    this.setState({
      abbrStore: tempArr,
      definations: response
    });
  };

  uploadExcel = file => {
    ExcelHandlerObj.getJsonFileFile(file, this.handleResponseFromExcel);
  };

  getCurrentWordsInExcel = () => {
    let fileToDownload = [];

    for (let i in this.state.abbrStore) {
      let temp = [];
      temp.push(this.state.abbrStore[i].word);
      temp.push(
        this.state.abbrStore[i].defination === ""
          ? " "
          : this.state.abbrStore[i].defination
      );
      fileToDownload.push(temp);
    }
    if (this.state.abbrStore.length > 0)
      ExcelHandlerObj.downloadXlsxFileFromData(fileToDownload);
    else alert("the store is empty");
  };

  downloadFileAfterProcessing = () => {
    // {
    //   "abbr": "1",
    //     "description": "Strong recommendation"
    // }

    let jsonToDownload = [];
    for (let i in this.state.files) {
      if (this.state.files.length > 0) {
        let originalFile = this.state.files[i];
        let fileName = this.state.fileName[i].htmlpage;
        if (originalFile !== "NO PAGE") {
          // console.log(originalFile);
          let bodyData = this.getBodyOfPage(originalFile)[1];
          bodyData = this.removeAbbrivation(bodyData); //this line is to remove older abbreviation
          // if(body does contain that don't execute)
          for (let i in this.state.abbrStore) {
            let element = this.state.abbrStore[i];
            if (element.defination !== "") {
              jsonToDownload.push({
                abbr: element.word,
                description: element.defination
              });
              var re = new RegExp(
                "(?<![\\w\\d])" +
                  element.word +
                  "(?![\\w\\d])(?![^<]*>|[^<>] <)+",
                "g"
              );

              let changingWord = `<a href='abbr_${element.word}'>${
                element.word
              }</a>`;
              bodyData = bodyData.replace(re, changingWord);
            }
          }

          originalFile = originalFile.replace(
            BodyPattern,
            `<body onload="_geturl1();">${bodyData}</body>`
          );
          //do this or send it to the other side.
          downloadHelper.download_file(
            fileName + ".html",
            originalFile,
            "text/html",
            document,
            window
          );
        } else {
          //console.log(`file wasnt found`);
        }
      }
    }
    jsonToDownload = this.filterAbbrJsonForDuplication(jsonToDownload);
    let jsonFileName = "abbr";
    downloadHelper.download_file(
      jsonFileName,
      JSON.stringify(jsonToDownload),
      "application/json",
      document,
      window
    );
  };

  downloadFiles = () => {
    //genrate html file
    this.downloadFileAfterProcessing();
    // generate JsonFile
  };

  sendDataToHypenation = () => {
    //convert data from
    let dataToSende = {};
    let jsonToDownload = [];
    let filesArray = [];
    for (let i in this.state.files) {
      if (this.state.files.length > 0) {
        let originalFile = this.state.files[i];
        if (originalFile !== "NO PAGE") {
          let bodyData = this.getBodyOfPage(originalFile)[1];
          bodyData = this.removeAbbrivation(bodyData); //this line is remove older abbreviation
          for (let i in this.state.abbrStore) {
            let element = this.state.abbrStore[i];

            if (element.defination !== "") {
              // console.log(element);
              jsonToDownload.push({
                abbr: element.word,
                description: element.defination
              });
              var re = new RegExp(
                "(?<![\\w\\d])" +
                  element.word +
                  "(?![\\w\\d])(?![^<]*>|[^<>] <)+",
                "g"
              );
              let changingWord = `<a href='abbr_${element.word}'>${
                element.word
              }</a>`;
              bodyData = bodyData.replace(re, changingWord);
            }
          }
          originalFile = originalFile.replace(
            BodyPattern,
            `<body onload="_geturl1();">${bodyData}</body>`
          );
        } else {
          console.log("File has no page dounf");
        }
        filesArray.push({ page: originalFile, info: this.state.fileName[i] });
        //do this or send it to the other side.
      }
    }
    jsonToDownload = this.filterAbbrJsonForDuplication(jsonToDownload);
    dataToSende.files = filesArray;
    dataToSende.abbr = [...jsonToDownload];
    dataToSende.language =
      this.state.language === "" ? "en" : this.state.language;
    console.log(dataToSende);
    localStorage.setItem("hypen", JSON.stringify(dataToSende));
  };

  render() {
    // console.log(this.state);
    let wordsTable = this.state.abbrStore.map(def => {
      return (
        <AbbrTableCell
          key={def.word}
          word={def.word}
          defination={def.defination}
          definationChangeHangler={this.changeDefinationHandler}
        />
      );
    });
    return (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          flexDirection: "column",
          flex: 1,
          alignItems: "center"
        }}>
        <h4>abbreviation</h4>
        <hr width="100%" />
        <p>Please select html Page to get abbreviation from</p>
        <input
          type="file"
          className="upload"
          accept="text/html"
          id="file1"
          name="file"
          multiple
          onChange={e => this.fileSelectorHandler(e.target.files)}
        />
        <label htmlFor="file1">Choose a Html file</label>{" "}
        <div>
          <input
            type="file"
            id="file"
            name="file"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="upload"
            onChange={event => this.uploadExcel(event.target.files)}
          />
          <label htmlFor="file">Choose a Excel File</label>{" "}
          <button className="button1" onClick={this.getCurrentWordsInExcel}>
            Download Excel
          </button>
          <hr width="100%" />
        </div>
        <div
          style={{
            alignItems: "center",
            flexDirection: "column",
            height: "100%",
            width: "100%",
            display: "flex"
          }}>
          <br />
          <table className="fixed_header">
            <colgroup>
              <col style={{ width: "30%" }} />
              <col style={{ width: "70%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>
                  <b>Words</b>
                </th>
                <th>
                  <b>Defination</b>
                </th>
              </tr>
            </thead>
            <tbody>{wordsTable}</tbody>
          </table>
        </div>
        <br />
        <div
          style={{
            display: "flex",
            height: "100%",
            width: "100%",
            flexDirection: "column",
            flex: 1
          }}>
          <hr width="100%" />

          <button
            style={{ width: "40%", alignSelf: "center" }}
            className="button1"
            onClick={this.downloadFiles}>
            Download Both Files
          </button>

          <Link
            style={{ width: "40%", alignSelf: "center" }}
            to={"/hypenation/abbrivation"}
            onClick={this.sendDataToHypenation}>
            {this.state.files.length > 0 ? (
              <p className="goToNextLink">Go To hypenation</p>
            ) : null}
          </Link>
          <br />
        </div>
      </div>
    );
  }
}

export default class AbbrivationWrapper extends React.Component {
  render() {
    if (this.props.data !== undefined)
      return <Abbrivation data={this.props.data.match.params.data} />;
    else return <Abbrivation />;
  }
}
