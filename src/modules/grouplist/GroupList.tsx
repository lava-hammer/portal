import produce from 'immer';
import React, { createRef, useRef } from 'react'
import { Playground } from '../playground/Playground'
import './GroupList.less'

////////////////////////////////////////
/// PART I: 这部分是为了模拟服务器实现 ///
////////////////////////////////////////

const FIRST_NUM = 10000;
const LAST_NUM =  99999;
const GROUP_SIZE = 100;

// 测试数据长这样：
// [G100XX]:
// - 10000
// - 10001
// ...
// - 10099
// [G101XX]:
// - 10100
// ...
// ...
// - 99999

function groupKey(num: number): string {
  return `G${Math.floor(num/GROUP_SIZE)}XX`;
}

function initGroup(num: number): IGroup {
  return {
    group: groupKey(num),
    items: [],
  }
}

function inSameGroup(num1: number, num2: number): boolean {
  return Math.floor(num1 / GROUP_SIZE) === Math.floor(num2 / GROUP_SIZE);
}

interface IGroup {
  group: string,
  items: number[],
}

interface IGroupItemReq {
  /** first item */
  pos: number;
  /** count for items */
  len: number;
  /** forward = -1 or backward = 1 */
  dir: number;
}

interface IGroupItemRsp {
  groups: IGroup[],
  more: boolean,
}

function getGroupItems(req: IGroupItemReq): IGroupItemRsp {
  let lastNum: number = -1;
  let currGroup!: IGroup;
  const groups: IGroup[] = [];
  let count = 0;
  for (let i=req.pos; count < req.len && i >= FIRST_NUM && i <= LAST_NUM; i += req.dir) {
    if (!inSameGroup(lastNum, i)) {
      currGroup = initGroup(i);
      groups.push(currGroup);
    }
    currGroup.items.push(i);
    lastNum = i;
    count++;
  }
  const nextNum = lastNum + req.dir;
  return {
    groups,
    more: nextNum >= FIRST_NUM && nextNum <= LAST_NUM,
  }
}

function getNextGroupItems(req: IGroupItemReq): IGroupItemRsp {
  let beginPos = -1;
  if (req.dir > 0) {
    beginPos = (Math.floor(req.pos / GROUP_SIZE) + req.dir) * GROUP_SIZE;
  } else {
    beginPos = Math.floor(req.pos / GROUP_SIZE) * GROUP_SIZE - 1;
  }
  return getGroupItems({
    pos: beginPos,
    len: req.len,
    dir: req.dir,
  });
}

function remoteCall<T extends (...args: any[]) => any>(func: T): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return (...args: Parameters<T>) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(func(...args));
      }, 1000);
    });
  }
}

const fetchGroupItems = remoteCall(getGroupItems);
const fetchNextGroupItems = remoteCall(getNextGroupItems);

////////////////////////////////////////
/// PART II: 这部分是为了写组件DEMO    ///
////////////////////////////////////////

export function Item(props: {value: number}) {
  return (
    <div className="item">{props.value}</div>
  )
}

export function Group(props: {name: string, fold: boolean, onClick: ()=>void}) {
  return (
    <div className="group" onClick={props.onClick}>{`${props.fold ? '+' : '-'} [${props.name}]`}</div>
  )
}

export function Loader(props: {loading: boolean, meta: ILoaderMeta}) {
  return (
    <div className="loader" data-meta={JSON.stringify(props.meta)} >{props.loading ? 'Loading...' : '...'}</div>
  )
}

const LOAD_SIZE = 20;

interface ILoaderMeta {
  group: string;
  key: string;
  pos: number;
  dir: number;
}

function itemKey(value: number): string {
  return `I${value}`;
}

function loaderKey(pos: number, dir: number): string {
  return `L${pos}${dir > 0 ? '+' : '-'}`
}

interface IGroupSet {
  group: string;
  firstItem: number;
  lastItem: number;
  items: number[];
  fold: boolean;
  moreForward: boolean;
  moreBackward: boolean;
}

function initGroupSet(): IGroupSet {
  return {
    group: '',
    firstItem: FIRST_NUM,
    lastItem: FIRST_NUM,
    items: [],
    fold: false,
    moreForward: false,
    moreBackward: false,
  }
}

interface IGroupListState {
  loadingKey: string;
  list: IGroupSet[];
}

export class GroupList extends React.Component<{}, IGroupListState> {

  constructor(props: any) {
    super(props);
    this.state = {
      loadingKey: '',
      list: [
        initGroupSet(),
      ],
    };
  }

  viewRef = createRef<HTMLDivElement>();
  inputRef = createRef<HTMLInputElement>();
  isLoading = false;

  componentDidMount() {
    this.onScroll();
  }

  async loadItems(meta: ILoaderMeta) {
    console.log('load items:', meta.key);
    this.isLoading = true;
    this.setState(produce((draftState) => {
      draftState.loadingKey = meta.key;
    }, this.state));
    const rsp = await fetchGroupItems({
      pos: meta.pos,
      len: LOAD_SIZE,
      dir: meta.dir,
    });
    // extend group set
    this.setState(produce(draftState => {
      if (meta.group === '') {
        // init load, clear list
        draftState.list = []; 
      }
      for (let i=0; i<rsp.groups.length; ++i) {
        const gp = rsp.groups[i];
        const isFirstGroup = i === 0;
        const isLastGroup = i === rsp.groups.length - 1;
        let gset = draftState.list.find(e => e.group === gp.group);
        if (gset) {
          // extend existing group set
          const itemSet = new Set(gset.items);
          for (let iv of gp.items) {
            itemSet.add(iv);
          }
          const itemList = [...itemSet].sort((a, b) => a - b);
          gset.items = itemList;
          gset.firstItem = gset.items[0];
          gset.lastItem = gset.items[gset.items.length-1];
          
          // update loader flags
          if (meta.dir === -1) {
            if (isFirstGroup) {
              gset.moreForward = rsp.more;
            } else {
              gset.moreForward = false;
            }
          }
          if (meta.dir === 1 && !isLastGroup) {
            if (isLastGroup) {
              gset.moreBackward = rsp.more;
            } else {
              gset.moreBackward = false;
            }
          }
        } else {
          gset = {
            group: gp.group,
            firstItem: gp.items[0],
            lastItem: gp.items[gp.items.length-1],
            items: gp.items,
            fold: false,
            moreForward: isFirstGroup && rsp.more && meta.dir === -1,
            moreBackward: isLastGroup && rsp.more && meta.dir === 1,
          };
          draftState.list.push(gset);
        }
      }
    }, this.state));
    this.isLoading = false;
    this.onScroll();
  }

  async jumpItem(pos: number) {
    console.log('jump:', pos);
    this.state.list.find(g => {

    })
  }

  onScroll() {
    console.log(this.isLoading, this.viewRef.current);
    if (this.isLoading) return;
    if (this.viewRef.current === null) return;
    const view = this.viewRef.current;
    const viewBeginY = view.scrollTop;
    const viewEndY = view.scrollTop + view.clientHeight; 
    const loaders = document.getElementsByClassName('loader');
    for (let i of loaders) {
      const loader = i as HTMLDivElement;
      const itemBeginY = loader.offsetTop - view.offsetTop;
      const itemEndY = itemBeginY + loader.clientHeight;
      console.log(itemBeginY, viewEndY, itemEndY, viewBeginY);
      if (!(itemBeginY > viewEndY || itemEndY < viewBeginY)) {
        const meta = JSON.parse(loader.dataset['meta']!);
        this.loadItems(meta);
      }
    }
  }

  render() {
    const listItems = [];
    for (let gset of this.state.list) {
      // render each gset
      const group = gset.group;
      if (group) {
        // normal group
        if (gset.moreForward) {
          const pos = gset.firstItem;
          const dir = -1;
          const key = loaderKey(pos, dir);
          listItems.push(<Loader key={key} loading={this.state.loadingKey === key} meta={{ group, pos, dir, key }} />);
        }
        if (gset.group) {
          listItems.push(<Group key={gset.group} name={gset.group} fold={gset.fold} onClick={() => {
            this.setState(produce(draftState => {
              const gss = draftState.list.find(e => e.group === group);
              if (gss) {
                gss.fold = !gss.fold;
                setTimeout(this.onScroll.bind(this), 0);
              }
            }, this.state));
          }} />);
        }
        if (gset.items.length > 0 && !gset.fold) {
          for (let val of gset.items) {
            listItems.push(<Item key={itemKey(val)} value={val} />);
          }
        }
        if (gset.moreBackward) {
          const pos = gset.lastItem;
          const dir = 1;
          const key = loaderKey(pos, dir);
          listItems.push(<Loader key={key} loading={this.state.loadingKey === key} meta={{ group, pos, dir, key }} />);
        }
        // TODO: 连续的GroupSet之后要加一个GroupLoader
      } else {
        // init group
        const pos = gset.firstItem;
        const dir = 1;
        const key = loaderKey(pos, dir);
        listItems.push(<Loader key={key} loading={this.state.loadingKey === key} meta={{group, pos, dir, key}} />)
      }
    }
    
    return (
      <div>
        <div>
          <input type="text" ref={this.inputRef} />
          <button onClick={() => {
            if (this.inputRef.current) {
              const val = Number(this.inputRef.current.value);
              if (!isNaN(val) && val >= FIRST_NUM && val <= LAST_NUM) {
                this.jumpItem(Math.floor(val));
              }
            }
          }}>GO</button>
        </div>
        <div className="listview" ref={this.viewRef} onScroll={this.onScroll.bind(this)}>
          {...listItems}
        </div>
      </div>
    )
  }
}

export function TestGroupList() {
  return (
    <Playground width={300} height={400}>
      <GroupList />
    </Playground>
  )
}