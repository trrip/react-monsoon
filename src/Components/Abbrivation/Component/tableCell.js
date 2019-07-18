import React from "react";
import "./abbr.css";

const PLACEHOLDER = "PlaceHolder";
class AbbrTableCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showTextBox: false,
      defination: this.props.defination,
      word: this.props.word
    };
  }

  componentWillReceiveProps(props) {
    this.setState({ defination: props.defination, word: props.word });
  }

  cellClickHandler = () => {
    //console.log(this.state.word);
    if (this.state.showTextBox === false) this.setState({ showTextBox: true });
  };
  valueChangeHandler = e => {
    this.setState({ defination: e.target.value });
  };

  saveChangeHandler = () => {
    this.props.definationChangeHangler(this.state.word, this.state.defination);
    this.setState({ showTextBox: false });
  };
  render() {
    let defination = !this.state.showTextBox ? (
      <div onClick={this.cellClickHandler}>
        {this.state.defination.length === 0 ? (
          <label style={{ backgroundColor: "#f03434", color: "#FFFFFF" }}>
            {PLACEHOLDER}
          </label>
        ) : (
          <p>{this.state.defination}</p>
        )}
      </div>
    ) : (
      <p>
        <input
          value={this.state.defination}
          onChange={this.valueChangeHandler}
        />
        <button onClick={this.saveChangeHandler}>Okay</button>
      </p>
    );
    return (
      <tr>
        <td className="key">welcome{this.state.word}</td>
        <td>{defination}</td>
      </tr>
    );
  }
}
export default AbbrTableCell;
