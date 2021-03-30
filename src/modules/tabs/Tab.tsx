import React, { DOMElement, useRef, useState } from 'react'
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
  const [index, setIndex] = useState<null | {left: string, width: string}>(null)
  const indexEl = useRef(null)
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
        const tabEl = e.target as HTMLDivElement
        const newVal = tabEl.dataset.value;
        if (newVal) {
          setValue(newVal)
          setIndex({
            left: tabEl.offsetLeft - (tabEl.parentElement?.offsetLeft || 0) + 'px',
            width: tabEl.offsetWidth + 'px',
          })
        }
      }}
    >
      {childrenWithProps}
      <div
        className={tabStyle['tab-index']}
        ref={indexEl}
        style={{
          display: index === null ? 'none' : 'block',
          left: index ? index.left : '0px',
          width: index ? index.width : '0px',
        }}
      ></div>
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