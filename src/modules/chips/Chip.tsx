import React, { useRef, useState } from 'react'
import chipStyle from './Chip.module.less'
import produce from 'immer'

export interface IChipProp {
  name: string;
  onDelete?: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
}

export function Chip(prop: IChipProp) {
  return (
    <div className={chipStyle.chip}>
      {prop.name}
      <div
        className={chipStyle.del}
        onClick={ e => {
          if (prop.onDelete) {
            prop.onDelete(e);
          }
        }}
      >
        X
      </div>
    </div>
  )
}

export interface IChipFieldProp {
  items: IChipProp[];
}

export function ChipField(prop: IChipFieldProp) {
  const [state, setState] = useState<IChipFieldProp>(prop)
  return (
    <div className={chipStyle.field}>
      {state.items.map((p, index) => 
      <Chip 
        key={index}
        name={p.name}
        onDelete={e => {
          setState(produce(state, draft => {
            draft.items.splice(index, 1);
          }))
        }}
      />)}
      <input className={chipStyle.text}
        onKeyDown={e => {
          const target = e.target as HTMLInputElement
          if (e.key === 'Backspace' && target.selectionStart === 0 && target.selectionEnd === 0) {
            setState(produce(state, draft => {
              draft.items.pop()
            }))
          }
          if (e.key === 'Enter' && target.value.length > 0) {
            setState(produce(state, draft => {
              draft.items.push({
                name: target.value
              })
              target.value = ''
            }))
          }
        }}
      />
    </div>
  )
}