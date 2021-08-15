import React from "react";

const ListItem = props => {
  //props.highlight
    return (
      <li style={{backgroundColor: ( props.item.highlight ) ? "yellow":"white"}}>

          <button className="buttonlistitem" onClick={() => {props.handleEditClick(props.itemIndex)}}>
              {Number.parseFloat(props.item.coords.x).toExponential()},
              <br/>
              {Number.parseFloat(props.item.coords.y).toExponential()},
              <br/>
              {Number.parseFloat(props.item.coords.z).toExponential()}

              <input className="input" type="checkbox" checked={props.item.check} className="input" value={props.itemIndex} onChange={() => {props.handleCheck(props.itemIndex)}}/>
              <button className="buttondelete" onClick={
                () => {props.handleRemove(props.itemIndex)}
              }>
              X
            </button>
          </button>

          

      </li>
    );
};

export default ListItem;
