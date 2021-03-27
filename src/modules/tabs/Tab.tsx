import React from 'react'
import { Playground } from '../playground/Playground'

export interface ITabProp {
  children?: React.ReactNode,
}

export function Tab(prop: ITabProp) {
  return (
    <div>
      <div>
        {prop.children}
      </div>
    </div>
  )
}

export interface ITabListProp {
  children?: React.ReactNode,
}

export function TabList(prop: ITabListProp) {
  return (
    <div></div>
  )
}

export function TestTab() {
  return (
    <Playground
      width={300}
      height={200}
    >
      <TabList>
        <Tab>Home</Tab>
        <Tab>Open Source</Tab>
        <Tab>About</Tab>
      </TabList>
    </Playground>
  )
}