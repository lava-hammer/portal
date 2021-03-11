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
        { name: 'Hammer', address: '12321321321' },
        { name: 'Lisa', address: '12321321321' },
        { name: 'Green', address: '12321321321' },
        { name: 'Doris', address: '12321321321' },
      ]} />
    </div>
  )
}