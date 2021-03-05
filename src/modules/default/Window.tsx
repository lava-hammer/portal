import React, { Component } from 'react'
import frameStyle from './frame.module.css'

interface IWindowProp {
  title: string,
  content?: Component,
}

export default function Window(prop: IWindowProp) {
  return (
    <div className={frameStyle.window}>
      <div>
        {prop.title}
      </div>
      <div>
        {prop.content}
      </div>
    </div>
  )
}