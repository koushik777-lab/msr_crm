import React from "react";
import BackHeader from "../../components/BackHeader";
import { Box } from "@mui/material";
import WhatsappForm from "./WhatsappForm";
import WhatsappChat from "./WhatsappChat";

export default function Whatsapp() {
  const [reRender, setReRender] = React.useState(1);
  return (
    <div style={{ width: "100%" }}>
      <BackHeader showBtn={false} title="Whatsapp" />

      {/* <div
className="w-full h-[80vh] "
>
  <iframe
    src="https://web.whatsapp.com/"
    width="100%"
    height="100%"
    style={{ border: "none" }}
    title="WhatsApp Web"
  ></iframe>
</div> */}
      <div
        style={{ display: "flex", gap: "16px", marginTop: "16px" }}
        className=" min-h-[75vh]"
      >
        <WhatsappForm renderFn={() => setReRender(reRender + 1)} />
        <WhatsappChat
          key={reRender}
          renderFn={() => setReRender(reRender + 1)}
        />
      </div>
    </div>
  );
}
