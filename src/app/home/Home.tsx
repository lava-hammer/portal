import React from 'react'
import { TestChipField } from '../../modules/chips/Chip'
import { More } from '../../modules/more/More'
import homeStyle from './Home.module.less'

export default function Home() {
  return (
    <div 
      className={homeStyle.playground}
      style={{
        width: '300px',
        height: '200px',
      }}
    >
      {/* <TestChipField />
      <TestChipField
        items={['hello', 'world', 'lets', 'rock']}
        readonly={true}
      /> */}
      <More items={['AAAA', 'BBBBBB', 'CCCC', 'DDDDD', 'EEEEE']} />
    </div>
  )
}