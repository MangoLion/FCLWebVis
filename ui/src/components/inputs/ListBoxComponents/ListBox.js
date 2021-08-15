// bobux
import React, { Component } from "react";

import InputForm from "./InputForm";

import List from './List';

import EditItem from "./EditItem";

class App extends Component {
  constructor(props) {
    super(props);

    // getInitialState
    this.state = {
      list: [],

      pendingItem: "",

      pendingEdit: {
        x: '',
        y: '',
        z: '',
      },

      pendingItemc: {
        x: '',
        y: '',
        z: '',
      },

      showEdit: false
    };
  }

  newItemSubmitHandler = e => {
    e.preventDefault();
    this.setState({
      list: [
        {
          name:this.state.pendingItem,
          check: false,
          highlight: false,
          coords: {
            x:this.state.pendingItemc.x,
            y:this.state.pendingItemc.y,
            z:this.state.pendingItemc.z,
          }
        },
        ...this.state.list
      ],
      pendingItemc: {
        x:"",
        y:"",
        z:"",
      },

      pendingItem:""
    });
    console.log(this.state.pendingItem);
  };

  editHandler = e => {
    e.preventDefault();
    const newState = this.state.list;

    for(let i = 0; i < newState.length; i++) {
      if(newState[i].highlight) {
        newState[i].coords.x = this.state.pendingEdit.x;
        newState[i].coords.y = this.state.pendingEdit.y;
        newState[i].coords.z = this.state.pendingEdit.z;
      }
    }

    this.setState({
      list: newState
    });
  }

  handleEditClick = index => {
    const newState = this.state.list;

    /*
    newState.forEach(item=>{
      item.highlight = false;
    })
    */
    let isHighlighted = false
    if(newState[index].highlight) {
      isHighlighted = true
    }

    for(let i = 0; i < newState.length; i++) {
      newState[i].highlight = false;
    }

    newState[index].highlight = !isHighlighted;

    this.state.showEdit = newState[index].highlight;

    this.setState({
      list: newState,
      pendingEdit: {
        x: newState[index].coords.x,
        y: newState[index].coords.y,
        z: newState[index].coords.z
      },
    });
  }

  handleItemInput = e => {
    let value = e.target.value
    let type = e.target.placeholder;
    if (type === "Item")
      this.setState({
        pendingItem: e.target.value
      });
    else
    //otherwise type can either be x, y, z
      this.setState(prevState => ({
        pendingItemc : {
          ...prevState.pendingItemc,
          [type]: value
        }
      }));
  }

  handleItemEdit = e => {
    let value = e.target.value
    let type = e.target.placeholder;
    this.setState(prevState => ({
      pendingEdit : {
        ...prevState.pendingEdit,
        [type]: value
      }
    }));
  }

  handlecRemove = e => {
    const newState = this.state.list.filter(item => item.check !== true);
    this.setState({
      list: newState
    });
  }

  handleRemove = index => {
    const newState = this.state.list.filter(item => this.state.list.indexOf(item) !== index);
    this.setState({
      list: newState
    });
  };

  /*handleRemove2 = index => {
    list: this.state.list.map(item => {
      if(box === 'checked') {
      }
    })
  });*/

  deleteall = e => {
    e.preventDefault();
    this.setState({
      list: []
    });
  };

  handleCheck = index => {
    var newlist = this.state.list;
    newlist[index].check = !newlist[index].check;
    this.setState({
      list: newlist
    });
  };

  /*handleSearch = e => {
    e.preventDefault();
    this.setState({
      list: this.state.list.map(item => {
        if(this.pendingItem2 === item.name) {
          return {...item, highlight: !item.highlight};
        }
        return item;
      })
    });
    console.log(this.state.list[0]);
  }*/

  render() {
    return (
      <div className="wrapperList">
        <InputForm
        newItemSubmitHandler = {this.newItemSubmitHandler}
        handleItemInput = {this.handleItemInput}
        pendingItem = {this.state.pendingItem}
        pendingItemc = {this.state.pendingItemc}
        />

        <EditItem
            showEdit = {this.state.showEdit}
            editHandler = {this.editHandler}
            handleItemEdit = {this.handleItemEdit}
            pendingEdit = {this.state.pendingEdit}
        />

        <List list = {this.state.list}
        handleRemove = {this.handleRemove}
        handleCheck = {this.handleCheck}
        handleEditClick = {this.handleEditClick}
        />

        <button class = "buttonList" onClick={this.handlecRemove}>
          Delete Checked
        </button>

        <br/>

        <button class = "buttonList" type = "submit" onClick={this.deleteall}>
          Delete All
        </button>

      </div>
    );
  }
}

export default App;  
