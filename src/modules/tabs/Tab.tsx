import React, { DOMElement, useState } from 'react'
import classNames from 'classnames/bind'
import { Playground } from '../playground/Playground'
import tabStyle from './Tab.module.less'

const styles = classNames.bind(tabStyle)

export interface ITabProp {
  value: string,
  checked?: boolean,
  children?: React.ReactNode,
}

export function Tab(prop: ITabProp) {
  return (
    <div 
      className={styles({
        tab: true,
        active: prop.checked,
      })}
      data-value={prop.value}
    >
      {prop.children}
    </div>
  )
}

export interface ITabListProp {
  children?: React.ReactNode,
  value?: string,
  onChange?: (key: string) => void;
}

export function TabList(prop: ITabListProp) {
  const [currValue, setValue] = useState<string>('')
  const childrenWithProps = React.Children.map(prop.children, e => {
    if (
      React.isValidElement(e) && 
      typeof e.type !== 'string' &&
      e.type.name === 'Tab'
    ) {
      return React.cloneElement(e, {
        checked: currValue === e.props.value,
        ...e.props
      })
    }
    return e
  })
  return (
    <div
      onClick={(e) => {
        const newVal = (e.target as HTMLDivElement).dataset.value;
        if (newVal) {
          setValue(newVal)
        }
      }}
    >
      {childrenWithProps}
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
        <Tab value="home">Home</Tab>
        <Tab value="open-source">Open Source</Tab>
        <Tab value="about">About</Tab>
      </TabList>
    </Playground>
  )
}