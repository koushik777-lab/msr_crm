import React from "react";
import BackHeader from "../../components/BackHeader";

export default function Sheet() {
  return (
    <div>
      <BackHeader
        title="Client Sheet"
        showBtn={true}
        addbuttonText={"Add Manual Lead"}
        onClick={() => {
          console.log("Add Manual Lead");
        }}
      />
    </div>
  );
}
