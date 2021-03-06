import React, { Component, Ref, RefObject } from 'react'
import { Chip } from '../chips/Chip'
import { Playground } from '../playground/Playground';
import './More.less'

export interface IMoreProp {
  items: string[];
}

interface IMoreState {
  hasMore: boolean;
}

export class More extends Component<IMoreProp, IMoreState> {

  container: RefObject<HTMLDivElement>;

  constructor(props: IMoreProp) {
    super(props)
    this.container = React.createRef();
    this.state = {
      hasMore: false,
    }
  }

  render() {
    return (
      <div 
        className="container"
        ref={this.container}
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
        {
          this.state.hasMore ? (
            <div className="more">
              <span>+more</span>
            </div>
          ) : null
        }
      </div>
    )
  }

  componentDidMount() {
    this.checkHasMore()
  }

  componentDidUpdate() {
    this.checkHasMore()
  }

  private checkHasMore() {
    const container = this.container.current;
    if (container) {
      const hasMore = container.scrollHeight > container.clientHeight
      if (hasMore !== this.state.hasMore) {
        this.setState({
          hasMore
        })
      }
    }
  }
}

export function TestMore() {
  return (
  <Playground width={300} height={200}>
    <More items={['AAAA', 'BBBBBB', 'CCCC', 'DDDDD', 'EEEEE']} />
  </Playground>
  )
}