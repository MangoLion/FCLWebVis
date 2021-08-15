import React from "react";

const InputForm = props => {
    return (
        <form onSubmit={props.newItemSubmitHandler} className = "todoinputList">
            

            <input
            className = "inputList"
            type = "number"
            onChange = {props.handleItemInput}
            value = {props.pendingItemc.x}
            placeholder = "x"
            />

            <input
                className = "inputList"
                type = "number"
                onChange = {props.handleItemInput}
                value = {props.pendingItemc.y}
                placeholder = "y"
            />

            <input
                className = "inputList"
                type = "number"
                onChange = {props.handleItemInput}
                value = {props.pendingItemc.z}
                placeholder = "z"
            />
            <button className = "buttonsubmitList" type = "submit" name = "submit" value = "submit" onSubmit={props.newItemSubmitHandler}>
                Add
            </button>
        </form>
    );
};

export default InputForm;