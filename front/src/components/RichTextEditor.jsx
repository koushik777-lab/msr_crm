import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const RichTextEditor = ({ value, setValue, className = "h-52" }) => {
  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={setValue}
      className={className}
    />
  );
};

export default RichTextEditor;
