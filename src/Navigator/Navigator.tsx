import React, { Component } from "react";
import { HashRouter, Route, Link } from "react-router-dom";
import Hypenation from "../Components/Hypenation/Hypenation";
import Abbrivation from "../Components/Abbrivation/Abbrivation";
import BigHtml from "../Components/BigHtml/BigHtml";
import "../Navigator/Navigator.css";
const ulStyle = {
  "list-style-type": "none",
  margin: 0,
  padding: 0,
  overflow: "hidden",
  "background-color": "#333;"
};

class Navigator extends Component {
  render() {
    return (
      <HashRouter>
        <div>
          <nav>
            <ul className={"ulStyle"}>
              <li className={"liStyle"}>
                <Link
                  style={{
                    display: "block",
                    color: "black",
                    backgroundColor: "#ececec",
                    textAlign: "center",
                    padding: "14px",
                    textDecoration: "none"
                  }}
                  to="/">
                  BigHtml
                </Link>
              </li>
              <li className={"liStyle"}>
                <Link
                  style={{
                    display: "block",
                    color: "black",
                    backgroundColor: "#ececec",
                    textAlign: "center",
                    padding: "14px",
                    textDecoration: "none"
                  }}
                  to="/abbreviation/">
                  Abbreviation
                </Link>
              </li>
              <li className={"liStyle"}>
                <Link
                  style={{
                    display: "block",
                    color: "black",
                    backgroundColor: "#ececec",
                    textAlign: "center",
                    padding: "14px",
                    textDecoration: "none"
                  }}
                  to="/hypenation/">
                  Hypenation
                </Link>
              </li>
            </ul>
          </nav>
          <Route exact path="/" component={BigHtml} />
          <Route exact path="/abbreviation/" component={Abbrivation} />
          <Route exact path="/hypenation/" component={Hypenation} />
          <Route
            path="/abbreviation/:data" //this is for passing that full html data to abbrivation.
            render={props => <Abbrivation {...props} />}
          />
          <Route
            path="/hypenation/:data" //this is for passing that full html data from abbreviation to hypenation.
            render={props => <Hypenation {...props} />}
          />
        </div>
      </HashRouter>
    );
  }
}

export default Navigator;
