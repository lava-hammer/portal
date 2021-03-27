import React from 'react'
import classNames from 'classnames/bind'
import { Playground } from '../playground/Playground'
import tabStyle from './Tab.module.less'

const styles = classNames.bind(tabStyle)

export interface ITabProp {
  value: boolean,
  children?: React.ReactNode,
}

export function Tab(prop: ITabProp) {
  return (
    <div 
      className={styles({
        tab: true,
        active: prop.value,
      })}
    >
      {prop.children}
    </div>
  )
}

export interface ITabListProp {
  children?: React.ReactNode,
}

export function TabList(prop: ITabListProp) {
  return (
    <div
      onClick={(e) => {
        console.log(e.target)
      }}
    >
      {prop.children}
    </div>
  )
}

export function TestTab() {
  return (
    <Playground
      width={400}
      height={300}
    >
      <TabList>
        <Tab>Home</Tab>
        <Tab>Open Source</Tab>
        <Tab>About</Tab>
      </TabList>
    </Playground>
  )
}