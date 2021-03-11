import React from 'react'
import chipStyle from './Chip.module.less'

export interface IChipProp {
  name: string;
  address: string;
}

export function Chip(prop: IChipProp) {
  return (
    <div className={chipStyle.chip}>
      {prop.name ? prop.name : prop.address}
    </div>
  )
}

export interface IChipFieldProp {
  items: IChipProp[];
}

export function ChipField(prop: IChipFieldProp) {
  return (
    <div className={chipStyle.field}>
      {prop.items.map(p => <Chip name={p.name} address={p.address} />)}
      <Chip name='Hammer' address='add'/>
      <input/>
    </div>
  )
}