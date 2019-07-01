import React from "react";

const PLACEHOLDER = "EMPTY Value";

export default class CMSHandler extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showTextBox: false,
      value: this.props.value
    };
  }
  componentWillReceiveProps(props) {
    this.setState({ value: props.value });
  }

  cellClickHandler = () => {
    //console.log(this.state.word);
    if (this.state.showTextBox === false) this.setState({ showTextBox: true });
  };

  valueChangeHandler = e => {
    this.setState({ value: e.target.value });
  };

  saveChangeHandler = () => {
    this.props.CMSChangeHander(this.state.value);
    this.setState({ showTextBox: false });
  };

  render() {
    let defination = !this.state.showTextBox ? (
      <div onClick={this.cellClickHandler}>
        {this.state.value.length === 0 ? (
          <label style={{ backgroundColor: "#f03434", color: "#FFFFFF" }}>
            CMS ID :{PLACEHOLDER}
          </label>
        ) : (
          <p>CMS ID :{this.state.value}</p>
        )}
      </div>
    ) : (
      <div>
        <input value={this.state.value} onChange={this.valueChangeHandler} />
        <button onClick={this.saveChangeHandler}>Okay</button>
      </div>
    );

    return (
      <div>
        {/* {this.state.value} */}
        <br />
        {defination}
      </div>
    );
  }
}
