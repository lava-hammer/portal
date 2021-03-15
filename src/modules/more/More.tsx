import React, { Component, Ref } from 'react'
import { Chip } from '../chips/Chip'
import styleMore from './More.module.less'

export class More extends Component<{items: string[]}> {

  ref: Ref<HTMLDivElement> = null;

  render() {
    return (
      <div 
        className={styleMore.container}
        ref={this.ref}
      >
        {
          this.props.items.map( (e, i) => (
            <Chip
              key={i}
              name={e}
              readonly={true}
            />
          ))
        }
      </div>
    )
  }

  componentDidUpdate() {
    // todo:
  }
}