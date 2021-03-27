import React, { useState } from 'react'
import chipStyle from './Chip.module.less'
import produce from 'immer'
import { Playground } from '../playground/Playground';

export interface IChipProp {
  name: string;
  readonly?: boolean;
  onDelete?: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
}

export function Chip(prop: IChipProp) {
  const closeButton = prop.readonly ? null : (
    <div className={chipStyle.del}
      onClick={ e => {
        if (prop.onDelete) {
          prop.onDelete(e);
        }
      }}
    >
    X
    </div>
  )
  return (
    <div className={chipStyle.chip}>
      {prop.name}
      {closeButton}
    </div>
  )
}

export interface IChipFieldProp {
  items?: string[];
  readonly?: boolean;
  onAddItem?: (value: string) => void;
  onRemoveItem?: (index: number, item: string) => void;
}

export function ChipField(prop: IChipFieldProp) {
  const items = prop.items || []
  const textInput = prop.readonly ? null : (
    <input className={chipStyle.text}
      onKeyDown={e => {
        const target = e.target as HTMLInputElement
        if (e.key === 'Backspace' && target.selectionStart === 0 && target.selectionEnd === 0) {
          const lastIndex = items.length-1
          if (prop.onRemoveItem) {
            prop.onRemoveItem(lastIndex, items[lastIndex])
          }
        }
        if (e.key === 'Enter' && target.value.length > 0) {
          if (prop.onAddItem) {
            prop.onAddItem(target.value)
          }
          target.value = ''
        }
      }}
    />
  )
  return (
    <div className={chipStyle.field}>
      {items.map((name, index) => 
      <Chip 
        key={index}
        name={name}
        readonly={prop.readonly}
        onDelete={e => {
          if (prop.onRemoveItem) {
            prop.onRemoveItem(index, name);
          }
        }}
      />)}
      {textInput}
    </div>
  )
}

export function TestChipField(prop: {items?: string[], readonly?: boolean}) {
  const [state, setState] = useState(prop);
  return (
    <ChipField
      items={state.items}
      readonly={prop.readonly}
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

export function TestChips() {
  return (
    <Playground width={300} height={200}>
      <TestChipField
        items={['hello', 'world', 'lets', 'rock']}
        // readonly={true}
      />
    </Playground>
  )
}