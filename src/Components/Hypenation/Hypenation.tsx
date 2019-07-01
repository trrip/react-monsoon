import React, { Component } from "react";
import Hypen from "./hypenComponent";
class Hypenation extends Component {
  render() {
    // console.log(JSON.stringify(this.props));
    return <Hypen data={this.props} />;
  }
}

export default Hypenation;
