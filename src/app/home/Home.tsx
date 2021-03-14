import React from 'react'
import { ChipField } from '../../modules/chips/Chip'
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
      <ChipField items={[
        { name: 'Hammer' },
        { name: 'Lisa' },
        { name: 'Green'},
        { name: 'Doris'},
      ]} />
      <input className={homeStyle.test}></input>
    </div>
  )
}