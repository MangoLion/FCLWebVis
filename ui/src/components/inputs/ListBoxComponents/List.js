import React from "react";
import ListItem from "./ListItem";

const List = props => {
    return (
        <div className = "mainlist">
            <ul class = "ulList">
                {props.list.map((item, index) => (
                    <ListItem
                        handleCheck = {props.handleCheck}
                        key={index}
                        itemIndex={index}
                        handleRemove={props.handleRemove}
                        item = {item}
                        handleEditClick = {props.handleEditClick}
                    />
                ))}
            </ul>
        </div>

    );
  };

export default List;