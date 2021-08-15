import React from "react";

const EditItem = props => {
    if (props.showEdit)
    return (
        <form onSubmit={props.editHandler} className = "todoinputList">
            <input
                className = "inputList"
                type = "number"
                onChange = {props.handleItemEdit}
                value = {props.pendingEdit.x}
                placeholder = "x"
            />

            <input
                className = "inputList"
                type = "number"
                onChange = {props.handleItemEdit}
                value = {props.pendingEdit.y}
                placeholder = "y"
            />

            <input
                className = "inputList"
                type = "number"
                onChange = {props.handleItemEdit}
                value = {props.pendingEdit.z}
                placeholder = "z"
            />
            <button class = "buttonList" type = "submit" name = "submit" value = "submit">
                Edit
            </button>
        </form>
    );

    return null;
};


export default EditItem;
