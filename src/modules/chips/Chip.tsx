import React, { useState } from 'react'
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
  items?: string[];
  onAddItem: (value: string) => void;
  onRemoveItem: (index: number, item: string) => void;
}

export function ChipField(prop: IChipFieldProp) {
  const items = prop.items || []
  return (
    <div className={chipStyle.field}>
      {items.map((name, index) => 
      <Chip 
        key={index}
        name={name}
        onDelete={e => {
          prop.onRemoveItem(index, name);
        }}
      />)}
      <input className={chipStyle.text}
        onKeyDown={e => {
          const target = e.target as HTMLInputElement
          if (e.key === 'Backspace' && target.selectionStart === 0 && target.selectionEnd === 0) {
            const lastIndex = items.length-1
            prop.onRemoveItem(lastIndex, items[lastIndex])
          }
          if (e.key === 'Enter' && target.value.length > 0) {
            prop.onAddItem(target.value)
            target.value = ''
          }
        }}
      />
    </div>
  )
}

export function TestChipField(prop: {items?: string[]}) {
  const [state, setState] = useState(prop);
  return (
    <ChipField
      items={state.items}
      onAddItem={val => {
        setState(produce(state, draft => {
          if (!draft.items) {
            draft.items = []
          }
          draft.items.push(val)
        }))
      }}
      onRemoveItem={(index, val) => {
        setState(produce(state, draft => {
          if (!draft.items) {
            draft.items = []
          }
          draft.items.splice(index, 1)
        }))
      }}
    />
  )
}