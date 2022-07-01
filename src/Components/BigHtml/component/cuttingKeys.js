import React from "react";
import FileHander from "../processing/fileHandler";
import HtmlProcessor from "../processing/htmlProcessor";
import TocTreeHandler from "../processing/tableOfContentHandler";
import DataFileHandler from "../processing/dataFileHandler";
import localStorage from "localStorage";
import { Link, Redirect } from "react-router-dom";
import { supportedLanguages } from "../../Hypenation/hypenation/Language";
import SOAPHandler from "../../SOAPHandler/SOAPHandler.js";
import "../component/cuttinKeys.css";
import DownloadHelper from "../../DownloadHelper/downloadHelper";

import CMSHandler from "../component/CMSValueHandler";
//generate excel with same toctree code/data.
let languageDetails = require("../../Hypenation/hypenation/language.json");

export default class CuttingKeys extends React.Component {
  constructor(props) {
    super(props);
    this.count = false;
    this.currentTag = "";
    this.state = {
      CMSIDHandler: {
        CMSValue: ""
      },
      fileName: "",
      fileHolder: "",
      dataLanguage: "",
      treeHolder: [],
      orphanPages: [],
      downloadInformation: {
        downloadEnable: false,
        downloadData: {}
      }
    };
  }
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
  getLanguageName = code => {
    let langDetail = languageDetails.isoLangs[code];
    return langDetail.name;
  };

  language = supportedLanguages.map(languageCode => {
    return (
      <option value={languageCode} key={languageCode}>
        {this.getLanguageName(languageCode)}
      </option>
    );
  });

  fileReadingComplete = (fileContent, fileName) => {
    //this.extractHLabels(fileContent);
    let parserObj = new HtmlProcessor();
    let result = parserObj.extractHLabels(fileContent);
    //console.log(result);
    let treeObj = new TocTreeHandler(result, this.state.CMSIDHandler.CMSValue);

    if (!treeObj.isEverythingFine())
      this.setState({ orphanPages: treeObj.orhpanPages });
    else {
      //fileContent = this.removeExistingTags(fileContent);
      //fileContent = this.removeZerowidthJoiner(fileContent); // commented these lines because of issue no 6 that they wanted the data as it was

      let dataHanlder = new DataFileHandler(
        fileContent,
        treeObj.tocTreeArray,
        this.state.CMSIDHandler.CMSValue
      );
      let data = {};
      data.files = dataHanlder.seprateContentWithTag();
      if (data.files.length === 0) {
        //checks if the file is empty. if empty then the file have some issues.
        this.resetFile();
        alert(
          "There is some issues with the H classes in p tags. For more details open console."
        );
        return;
      }
      data.language =
        this.state.dataLanguage === "" ? "en" : this.state.dataLanguage;
      data.abbrJson = {};
      this.setState({
        fileName: fileName,
        downloadInformation: {
          downloadEnable: true,
          downloadData: data
        }
      });
    }
  };

  handleFile = files => {
    // this.resetFile(); // added this code because they wanted to reset the file when changed file again ISSUE NO
    let fileHandler = new FileHander();
    fileHandler.readFile(files[0], this.fileReadingComplete);
  };

  resetFile = () => {
    const file = document.querySelector(".upload");
    if (file !== null) file.value = "";
    this.setState({
      fileHolder: "",
      fileName: "",
      treeHolder: [],
      orphanPages: [],
      downloadInformation: {
        downloadEnable: false,
        downloadData: {}
      }
    });
  };

  async downloadTheDataProvided(filesInformation) {
    let count = 0;
    let helper = new DownloadHelper();
    let toctree = [];
    for (let i of filesInformation) {
      // console.log(i.info);
      if (i.page !== "NO PAGE") {
        console.log("this is the tree");
        helper.download_file(
          i.info.htmlpage + ".html",
          i.page,
          "text/html",
          document,
          window
        );
      }
      toctree.push(i.info);
      if (++count >= 10) {
        await this.pause(1000);
        count = 0;
      }
    }

    helper.download_file(
      "tocTree",
      JSON.stringify(toctree),
      "application/json",
      document,
      window
    );
  }

  pause = msec => {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, msec || 1000);
    });
  };

  downloadFileAfterCuttingKeys = () => {
    // download logic is still to be written
    /*      downloadHelper.download_file(
          nameOfFile,
          file.page,
          "text/html",
          document,
          window
        );*/
    this.downloadTheDataProvided(
      this.state.downloadInformation.downloadData.files
    );
  };

// This function is used for CMS
  uploadDirectlyToCMS = () => {
    let service = new SOAPHandler("uploadTOC_HTML"); //method name

    //{page: "<body onload="_geturl1();">↵	↵	<p class="h1">Autho…art Foundation of Australia</span></p>↵	↵	</body>", info: {…}}
    service.soap(
      "https://cpms.bbinfotech.com:443/CMS/handshake/react-monsoon/MonsoonRequestHandler.php",
      "urn:MonsoonRequestHandler#uploadTOC_HTML",
      JSON.stringify(this.state.downloadInformation.downloadData)
    );
  };

// This function is used for ACoMS
  uploadDirectlyToACOMS = () => {  	
    let service = new SOAPHandler("uploadTOC_HTML"); //method name

    //{page: "<body onload="_geturl1();">↵	↵	<p class="h1">Autho…art Foundation of Australia</span></p>↵	↵	</body>", info: {…}}
    service.soap(
      "https://acoms.bbinfotech.com:443/acoms/handshake/react-monsoon/MonsoonRequestHandler.php",
      "urn:MonsoonRequestHandler#uploadTOC_HTML",
      JSON.stringify(this.state.downloadInformation.downloadData)
    );
  };

  goToAbbrivations = () => {
    this.passOnToNextPage("abbr");
  };
  goToHypenation = () => {
    this.passOnToNextPage("hypen");
  };
  passOnToNextPage = type => {
    // console.log(this.state.downloadInformation.downloadData);
    localStorage.setItem(
      type,
      JSON.stringify(this.state.downloadInformation.downloadData)
    );
  };

  changeLanguage = event => {
    if (
      event.target.value !== "" ||
      event.target.value === this.state.dataLanguage
    )
      this.setState({ dataLanguage: event.target.value });
  };

  changeTheCMSValue = value => {
    this.setState({ CMSIDHandler: { CMSValue: value } });
  };

  render() {
    // console.log(this.state.CMSIDHandler.CMSValue);

    let informationOnProblems = this.state.orphanPages.map(temp => {
      return (
        <li key={`${temp.value}.${temp.tag}`}>
          {temp.tag} : with title : {temp.value}
        </li>
      );
    });
    let orphanTable = (
      <div>
        {this.state.orphanPages.length === 0 ? null : (
          <p>{informationOnProblems}</p>
        )}
      </div>
    );

    // let CMSId = (this.state.<p></p>)
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
        <p>Select the Language Test</p>
        <select onChange={this.changeLanguage} className="browser-default">
          {this.language}
        </select>
        <CMSHandler
          value={this.state.CMSIDHandler.CMSValue}
          CMSChangeHander={this.changeTheCMSValue}
        />
        <hr width="95%" />
        <input
          type="file"
          id="file"
          className="upload"
          accept="text/html"
          onChange={e => this.handleFile(e.target.files)}
        />
        <label
          style={{ paddingLeft: "5px", paddingRight: "5px" }}
          htmlFor="file">
          Choose a Big HTML File
        </label>
        <p>
          {this.state.fileName === ""
            ? "No File selected"
            : `Selected page : ${this.state.fileName}`}
        </p>
        <hr width="95%" />
        <p>Orphan pages list</p>
        {orphanTable}
        <hr width="95%" />
        <button className="button1" onClick={this.resetFile}>
          Reset
        </button>
        {this.state.downloadInformation.downloadEnable === true ? (
          <div
            style={{
              margin: "15px",
              display: "flex",
              height: "100%",
              width: "100%",
              flexDirection: "column",
              flex: 1,
              alignItems: "center"
            }}>
            <div
              style={{
                display: "flex",
                height: "100%",
                width: "100%",
                flexDirection: "row",
                justifyContent: "center",
                flex: 1,
                alignItems: "center"
              }}>
              <button
                className="button1"
                style={{
                  marginRight: "10px",
                  marginLeft: "10px",
                  width: "154px"
                }}
                onClick={this.downloadFileAfterCuttingKeys}>
                Download
              </button>
              <button
                style={{
                  marginRight: "10px",
                  marginLeft: "10px"
                }}
                className="button1"
                onClick={this.uploadDirectlyToCMS}>
                Upload directly on CMS
              </button>
              <button
                style={{
                  marginRight: "10px",
                  marginLeft: "10px"
                }}
                className="button1"
                onClick={this.uploadDirectlyToACOMS}>
                Upload directly on ACoMS
              </button>
            </div>
            <br />
            {"Take data and "}
            <Link to="/Hypenation/cuttingKeys" onClick={this.goToHypenation}>
              Go to Hypenation
            </Link>
            {" Or take it "}
            <Link
              to="/abbreviation/cuttingKeys"
              onClick={this.goToAbbrivations}>
              to Abbrivation
            </Link>
          </div>
        ) : null}
      </div>
    );
  }
}
