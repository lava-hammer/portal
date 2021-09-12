import React, { ReactChild, ReactNode } from "react";
import { Playground } from "../playground/Playground";
import "./Popup.less";

export function Alert(prop: {
  text: string;
  onDismiss?: ()=>void;
}) {
  return (
    <div className="popwin">
      <div className="content">
        {prop.text}
      </div>
      <div>
        <button onClick={prop.onDismiss}>Dismiss</button>
      </div>
    </div>
  )
}

export function Modal(prop: {
  text: string,
  onDismiss: () => void;
}) {
  return (
    <div className="modal-bg">
      <div className="modal-content">
        <Alert text={prop.text} onDismiss={()=>{
          prop.onDismiss(); 
        }} />
      </div>
    </div>
  )
}

export function TestPopup() {
  return (
    <Playground width={600} height={400}>
      <Modal  text="Greetings..." onDismiss={() => {console.log('Modal dismiss!')}} />
    </Playground>
  )
}