import React, { useState } from 'react'
import { TestChips } from '../../modules/chips/Chip'
import { TestMore } from '../../modules/more/More'
import { TestTab } from '../../modules/tabs/Tab'
import { TestFileSeek } from '../../modules/fileseek/Fileseek'
import { pick } from '../../utils/random'
import { TestPopup } from '../../modules/popup/Popup'
import { TestGroupList } from '../../modules/grouplist/GroupList'

const registry: {[key: string]: ()=> React.ReactNode} = {
  'chips': () => {
    return <TestChips />;
  },
  'more': () => {
    return <TestMore />
  },
  'tabs': () => {
    return <TestTab />
  },
  'file_seek': () => {
    return <TestFileSeek />
  },
  'popup': () => {
    return <TestPopup />
  },
  'group_list': () => {
    return <TestGroupList />
  }
}

const LAST_EG = 'last-eg';

export default function Home() {
  const last_eg = localStorage.getItem(LAST_EG);
  const [egName, setEg] = useState(last_eg || pick(Object.keys(registry)))
  return (
    <div style={{
      margin: '20px',
    }}>
      <select
        value={egName}
        onChange={e => {
          setEg(e.target.value);
          localStorage.setItem(LAST_EG, e.target.value);
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