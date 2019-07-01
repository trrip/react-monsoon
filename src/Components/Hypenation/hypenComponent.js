import React from "react";
import { supportedLanguages } from "./hypenation/Language";
import localStorage from "localStorage";
import { downloadHelperObject as downloadHelper } from "../DownloadHelper/downloadHelper";
import { hypenationObject as hypenator } from "./hypenProcessing";
import SOAPHandler from "../SOAPHandler/SOAPHandler.js";
// import { stripLeadingSlash } from "history/PathUtils";

let languageDetails = require("./hypenation/language.json");

export default class Hypen extends React.Component {
  render() {
    // console.log(JSON.stringify(this.props));

    if (this.props.data !== undefined)
      return <HyphenateUI data={this.props.data.match.params.data} />;
    else return <HyphenateUI />;
  }
}
//Regular expressions
const BodyPattern = /<body[^>]*>((.|[\n\r])*)<\/body>/im;
const EmptyPagePlaceHolder = "Null Page";
const LOCALSTORAGENAME = "hypen";
//const WordPattern = /([A-zÄÖÜäöüßâêîôûçœéèàî]{5,})(?![^<]*>|[^<>]<\\)/g;

class HyphenateUI extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      language: supportedLanguages[0],
      abbr: {},
      showloader: false
    };
  }
  //Component methods
  resetState = () => {
    this.setState({
      files: []
    });
    this.resetFile();
  };

  componentWillUnmount() {
    //localStorage.setItem("Hypen", JSON.stringify(this.state));
    //console.log(this.state);
  }

  unWrapData = () => {
    let fileData = JSON.parse(localStorage.getItem(LOCALSTORAGENAME));
    // console.log(fileData);
    if (fileData !== null) {
      let filesArray = fileData.files;
      let language = fileData.language === "" ? "en" : fileData.language;
      let finalArrayForState = [];

      for (let file of filesArray) {
        //console.log(file);

        let hypenatedContent = this.loadFileDataAndStoreInStateFromProps(
          file.page,
          file.info,
          language
        );

        if (hypenatedContent !== EmptyPagePlaceHolder)
          finalArrayForState.push(hypenatedContent);
      }
      // console.log(finalArrayForState);
      let abbr = fileData.abbr;
      this.setState({ files: finalArrayForState, abbr: abbr });
    }
    localStorage.removeItem(LOCALSTORAGENAME);
  };

  componentWillMount() {
    //const rehydrate = JSON.parse(localStorage.getItem("Hypen"));
    // console.log(this.props);

    if (this.props.data !== undefined) {
      // console.log(this.props.data);
      //this.setState(rehydrate);
      let data = this.props.data;
      if (data === "cuttingKeys") {
        //make something that will donwload toctree also
        this.unWrapData();
        localStorage.removeItem(LOCALSTORAGENAME);
      } else if (data === "abbrivation") {
        //do something about the abbrivation file also. make ot download that also.
        //also take care for making toctree also download if it has a toctree
        this.unWrapData();
        localStorage.removeItem(LOCALSTORAGENAME);
      }
    }
  }
  //Component methods

  loadFileDataAndStoreInStateFromProps = (fileContent, info, language) => {
    // let tempHolder = [...this.state.files];

    let fileInfo = { info: info };
    let originalContent = fileContent;
    // console.log(`HypenComponent : ${originalContent},language : ${language}`);
    if (originalContent !== "NO PAGE") {
      let bodyContent1 = BodyPattern.exec(originalContent);
      bodyContent1 = hypenator.hypenateContentWithLanguage(
        bodyContent1[1], //added this because of regex gives 2
        language
      );
      // console.log("******");
      // console.log(originalContent);
      originalContent = originalContent.replace(
        BodyPattern,
        `<body onload="_geturl1();">${bodyContent1}</body>`
      );
      // console.log(originalContent);
    }
    fileInfo.page = originalContent;
    // tempHolder.push(fileInfo);
    return fileInfo;
    //} else return EmptyPagePlaceHolder;
    // this.setState({ files: tempHolder });
  };

  loadFileDataAndStoreInState = (fileContent, fileName) => {
    let tempHolder = [...this.state.files];

    let fileInfo = { info: { htmlpage: fileName } };
    let originalContent = fileContent;

    let bodyContent1 = BodyPattern.exec(originalContent);
    bodyContent1 = hypenator.hypenateContentWithLanguage(
      bodyContent1[1], //added this because of regex gives 2
      this.state.language
    );
    originalContent = originalContent.replace(
      BodyPattern,
      `<body onload="_geturl1();">${bodyContent1}</body>`
    );

    fileInfo.page = originalContent;
    tempHolder.push(fileInfo);

    this.setState({ files: tempHolder });
  };

  fileSelectorHandler = fileNames => {
    //show loader
    // console.log(fileNames);
    if (fileNames.length !== 0) {
      let tempHolder = [...this.state.files];
      let flag = tempHolder.find(
        element => fileNames[0].name === element.info.htmlpage
      );
      let flag2 = true;
      if (fileNames[0].name.includes("(") || fileNames[0].name.includes(")")) {
        flag2 = false;
      }

      if (flag === undefined && flag2 === true) {
        for (let i in fileNames) {
          let reader = new FileReader();
          try {
            reader.readAsText(fileNames[i], "UTF-8");
            reader.onload = evt => {
              this.loadFileDataAndStoreInState(
                evt.target.result,
                fileNames[i].name
              );
            };
          } catch (err) {
            console.log(err);
          }
        }
      } else {
        //dose not exist
        alert(
          `You have already selected one file with that name OR you have '(' or ')' in the name of the file`
        );
      }
    }
  };

  changeLanguage = event => {
    //console.log(event.target.value);
    if (event.target.value !== "" || event.target.value === this.state.language)
      this.setState({ language: event.target.value });
  };

  async downloadAll(elements, downloadHelper) {
    var count = 0;
    for (let e in elements) {
      let file = elements[e];
      //console.log(file);
      if (file.info.htmlpage !== "null") {
        let nameOfFile = file.info.htmlpage;
        if (nameOfFile.indexOf(".html") > -1) {
        } else {
          nameOfFile += ".html";
        }
        downloadHelper.download_file(
          nameOfFile,
          file.page,
          "text/html",
          document,
          window
        );
      }
      // your custom download code here, click or whatever
      if (++count >= 8) {
        await this.pause(1000);
        count = 0;
      }
    }
  }

  donwloadTocTreeWithInformation = fileInfo => {
    downloadHelper.download_file(
      "toctree.json",
      JSON.stringify(fileInfo),
      "application/json",
      document,
      window
    );
  };

  extractTocTreeInformationFromFiles = stateFiles => {
    let tocTreeArray = [];
    for (let i of stateFiles) {
      // console.log(i);
      tocTreeArray.push(i.info);
    }
    console.log(tocTreeArray);
    return tocTreeArray;
  };

  downloadFiles = () => {
    this.downloadAll(this.state.files, downloadHelper);
    //also see in downloading toc tree and abbrjson files.

    if (this.state.abbr.length > 0) {
      //download abbr file
      downloadHelper.download_file(
        "abbr.json",
        JSON.stringify(this.state.abbr),
        "application/json",
        document,
        window
      );
    }

    //Download toc tree if the information is available.
    if (this.state.files.length > 0) {
      if (this.state.files[0].info.haspdf !== undefined) {
        this.donwloadTocTreeWithInformation(
          this.extractTocTreeInformationFromFiles(this.state.files)
        );
      }
    }

    //this.resetState(); //remvoed this because they want still to be on. issue no 4
  };

  resetFile = () => {
    const file = document.querySelector(".dropdown-trigger");
    console.log(file);
    if (file !== null) file.value = "";
  };

  uploadFile = () => {
    let service = new SOAPHandler("uploadTOC_HTML"); //method name
    //add method to add the header into the files
    let dataToUpload = {
      files: this.state.files,
      abbr: this.state.abbr,
      language: this.state.language
    };

    //{page: "<body onload="_geturl1();">↵	↵	<p class="h1">Autho…art Foundation of Australia</span></p>↵	↵	</body>", info: {…}}
    service.soap(
      "https://cpms.bbinfotech.com:443/CMS/handshake/react-monsoon/MonsoonRequestHandler.php",
      "urn:MonsoonRequestHandler#uploadTOC_HTML",
      JSON.stringify(dataToUpload)
    );
    // this.resetState() //remvoed this because they want still to be on. issue no 4
  };

  render() {
    let showDownloadButton = null;
    let listOfFiles = null;

    if (this.state.files.length > 0) {
      showDownloadButton = (
        <div>
          <button
            style={{ textAlign: "center" }}
            onClick={this.downloadFiles}
            className="button1">
            Download Hyphenated Files
          </button>
          <button
            className="button1"
            style={{ textAlign: "center" }}
            onClick={this.uploadFile}>
            Upload File to CMS
          </button>
        </div>
      );

      listOfFiles = this.state.files.map(file => {
        if (file.info.nametree !== null) {
          if (file.info.htmlpage !== "null")
            return (
              <li className="collection-item" key={JSON.stringify(file.info)}>
                Page Name : {file.info.htmlpage}
              </li>
            );
          else
            return (
              <li className="collection-item" key={JSON.stringify(file.info)}>
                This toc tree don't have page attached. Title:{" "}
                {file.info.nametree}
              </li>
            );
        } else {
          return (
            <li className="collection-item" key={JSON.stringify(file.info)}>
              PageName : {file.info.htmlpage}
            </li>
          );
        }
      });
    }

    this.pause = msec => {
      return new Promise((resolve, reject) => {
        setTimeout(resolve, msec || 1000);
      });
    };

    this.getLanguageName = code => {
      let langDetail = languageDetails.isoLangs[code];
      return langDetail.name;
    };

    this.language = supportedLanguages.map(languageCode => {
      return (
        <option value={languageCode} key={languageCode}>
          {this.getLanguageName(languageCode)}
        </option>
      );
    });
    return (
      <div
        style={{
          display: "flex",
          width: "100%",
          flexDirection: "column",
          flex: 1,
          alignItems: "center"
        }}>
        <p>
          Please select the files that you want to hyphenate Page is responsive.
          Please wait till the files appears.
        </p>
        <b>Select Language before you start uploading the files.</b>
        <br />
        <div
          style={{
            width: "40%"
          }}>
          <hr width="100%" />

          <select onChange={this.changeLanguage} className="browser-default">
            {this.language}
          </select>
        </div>
        <hr width="100%" />

        <br />
        <input
          type="file"
          id="file"
          className="upload"
          accept="text/html"
          multiple
          onChange={e => this.fileSelectorHandler(e.target.files)}
        />
        <label htmlFor="file">Choose a HTML File</label>
        <br />
        <button
          style={{ alignItems: "center" }}
          onClick={this.resetState}
          className="button1">
          Reset selection
        </button>
        <hr width="100%" />
        <br />
        <div
          style={{
            width: "55%"
          }}>
          <ul className="collection with-header">
            <li className="collection-header">
              <h5>Files selected for download</h5>
            </li>
            {listOfFiles}
          </ul>
        </div>
        <hr width="100%" />

        {showDownloadButton}
      </div>
    );
  }
}
