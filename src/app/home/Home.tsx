import React, { useState } from 'react'
import { TestChips } from '../../modules/chips/Chip'
import { TestMore, More } from '../../modules/more/More'
import { TestTab } from '../../modules/tabs/Tab'
import { pick } from '../../utils/random'

const registry: {[key: string]: ()=> React.ReactNode} = {
  'chips': () => {
    return <TestChips />;
  },
  'more': () => {
    return <TestMore />
  },
  'tabs': () => {
    return <TestTab />
  }
}

export default function Home() {
  const [egName, setEg] = useState(pick(Object.keys(registry)))
  return (
    <div style={{
      margin: '20px',
    }}>
      <select
        value={egName}
        onChange={e => {
          setEg(e.target.value)
        }}
      >
        {
          Object.keys(registry).map(e => (
            <option key={e} value={e}>{e}</option>
          ))
        }
      </select>
      {
        registry[egName]()
      }
    </div>
  )
}