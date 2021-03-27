import React from 'react'
import playgroundStyle from './Playground.module.less'

export interface IPlaygroundProp {
  width: number;
  height: number;
  children?: React.ReactNode;
}

export function Playground(props: IPlaygroundProp) {
  return (
    <div
      className={playgroundStyle.playground}
      style={{
        width: props.width+'px',
        height: props.height+'px',
      }}
    >
      {props.children}
    </div>
  )
}