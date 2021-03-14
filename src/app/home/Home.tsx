import React from 'react'
import { TestChipField } from '../../modules/chips/Chip'
import homeStyle from './Home.module.less'

export default function Home() {
  return (
    <div 
      className={homeStyle.playground}
      style={{
        width: '400px',
        height: '300px',
      }}
    >
      <TestChipField />
      <input className={homeStyle.test}></input>
    </div>
  )
}