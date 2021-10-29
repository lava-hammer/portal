import produce from 'immer';
import React, { createRef, ReactNode, useRef } from 'react'
import { Playground } from '../playground/Playground'
import './GroupList.less'

////////////////////////////////////////
/// PART I: 这部分是为了模拟服务器实现 ///
////////////////////////////////////////

const FIRST_NUM = 10000;
const LAST_NUM =  99999;
const GROUP_SIZE = 100;
const FORWARD = -1;
const BACKWARD = 1;

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

function sortItem(a: number, b: number) {
  return a - b;
}

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

enum LoaderType {
  ITEM = 'item',
  GROUP = 'group',
}
interface ILoaderMeta {
  type: LoaderType;
  group: string;
  key: string;
  pos: number;
  dir: number;
}

function itemKey(value: number): string {
  return `I${value}`;
}

function loaderKey(pos: number, dir: number, type: LoaderType): string {
  return `L${type === LoaderType.ITEM ? 'I' : 'G' }${pos}${dir > 0 ? '+' : '-'}`
}

interface IItemSet {
  items: number[],
  firstItem: number;
  lastItem: number;
  moreForward: boolean;
  moreBackward: boolean;
}

function initItemSet(items: number[]): IItemSet {
  const ia = items[0];
  const ib = items[items.length - 1];
  return {
    items: items.sort(sortItem),
    firstItem: Math.min(ia, ib),
    lastItem: Math.max(ia, ib),
    moreForward: false,
    moreBackward: false,
  }
}

function mergeItemSet(itemSet: IItemSet[]): IItemSet[] {

}

interface IGroupSet {
  group: string;
  firstItem: number;
  lastItem: number;
  itemSet: IItemSet[];
  fold: boolean;
  moreForward: boolean;
  moreBackward: boolean;
}

function initGroupSet(): IGroupSet {
  return {
    group: '',
    firstItem: FIRST_NUM,
    lastItem: FIRST_NUM,
    itemSet: [
      {
        items: [],
        firstItem: FIRST_NUM,
        lastItem: LAST_NUM,
        moreForward: true,
        moreBackward: true,
      }
    ],
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

  async loadMoreItems(meta: ILoaderMeta) {
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
          const newItems = initItemSet(gp.items);
          gset.itemSet = mergeItemSet(gset.itemSet, newItems);
          const itemSet = new Set(gset.items);
          for (let iv of gp.items) {
            itemSet.add(iv);
          }
          const itemList = [...itemSet].sort((a, b) => a - b);
          gset.items = itemList;
          gset.firstItem = gset.items[0];
          gset.lastItem = gset.items[gset.items.length-1];
          
          // update loader flags
          if (meta.dir === FORWARD) {
            if (isFirstGroup) {
              gset.moreForward = rsp.more;
            } else {
              gset.moreForward = false;
            }
          }
          if (meta.dir === BACKWARD && !isLastGroup) {
            if (isLastGroup) {
              gset.moreBackward = rsp.more;
            } else {
              gset.moreBackward = false;
            }
          }
        } else {
          const newItems = initItemSet(gp.items);
          if (meta.dir === BACKWARD && (!isFirstGroup)) {
            newItems.moreForward = false;
          }
          if (meta.dir === FORWARD && (!isLastGroup)) {
            newItems.moreBackward = false;
          }
          gset = {
            group: gp.group,
            firstItem: newItems.firstItem,
            lastItem: newItems.lastItem,
            itemSet: [newItems],
            fold: false,
            moreForward: isFirstGroup && rsp.more && meta.dir === FORWARD,
            moreBackward: isLastGroup && rsp.more && meta.dir === BACKWARD,
          };
          draftState.list.push(gset);
        }
      }
    }, this.state));
  }

  async loadMoreGroups(meta: ILoaderMeta) {

  }

  async loadMore(meta: ILoaderMeta) {
    console.log('load items:', meta.key);
    this.isLoading = true;
    this.setState(produce((draftState) => {
      draftState.loadingKey = meta.key;
    }, this.state));
    switch(meta.type) {
      case LoaderType.ITEM: {
        await this.loadMoreItems(meta);
      } break;
      case LoaderType.GROUP: {
        await this.loadMoreGroups(meta);
      } break;
    }
    this.isLoading = false;
  }

  async jumpItem(pos: number) {
    console.log('jump:', pos);
    // TODO: jump
    // this.state.list.find(g => {

    // })
  }

  onScroll() {
    //console.log(this.isLoading, this.viewRef.current);
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
      //console.log(itemBeginY, viewEndY, itemEndY, viewBeginY);
      if (!(itemBeginY > viewEndY || itemEndY < viewBeginY)) {
        const meta = JSON.parse(loader.dataset['meta']!);
        this.loadMore(meta);
      }
    }
  }

  renderItemSet(group: string, iset: IItemSet, listItems: ReactNode[]) {
    if (iset.moreForward) {
      const pos = iset.firstItem;
      const dir = -1;
      const type = LoaderType.ITEM;
      const key = loaderKey(pos, dir, type);
      listItems.push(<Loader key={key} loading={this.state.loadingKey === key} meta={{ group, pos, dir, key, type }} />);
    }
    for (let i of iset.items) {
      listItems.push(<Item key={itemKey(i)} value={i} />);
    }
    if (iset.moreBackward) {
      const pos = iset.lastItem;
      const dir = 1;
      const type = LoaderType.ITEM;
      const key = loaderKey(pos, dir, type);
      listItems.push(<Loader key={key} loading={this.state.loadingKey === key} meta={{ group, pos, dir, key, type }} />);
    }
  }

  renderGroupSet(gset: IGroupSet, listItems: ReactNode[]) {
    const group = gset.group;
    if (group) {
      if (gset.moreForward) {
        const pos = gset.firstItem;
        const dir = -1;
        const type = LoaderType.GROUP;
        const key = loaderKey(pos, dir, type);
        listItems.push(<Loader key={key} loading={this.state.loadingKey === key} meta={{group, pos, dir, key, type}} />);
      }
      listItems.push(<Group key={group} name={group} fold={gset.fold} onClick={() => {
        this.setState(produce(draftState => {
          const gss = draftState.list.find(e => e.group === group);
          if (gss) {
            gss.fold = !gss.fold;
          }
        }, this.state));
      }} />);
      for (let iset of gset.itemSet) {
        this.renderItemSet(group, iset, listItems);
      }
      if (gset.moreBackward) {
        const pos = gset.lastItem;
        const dir = 1;
        const type = LoaderType.GROUP;
        const key = loaderKey(pos, dir, type);
        listItems.push(<Loader key={key} loading={this.state.loadingKey === key} meta={{group, pos, dir, key, type}} />);
      }
    } else {
      // init group
      const pos = gset.firstItem;
      const dir = 1;
      const type = LoaderType.ITEM;
      const key = loaderKey(pos, dir, type);
      listItems.push(<Loader key={key} loading={this.state.loadingKey === key} meta={{group, pos, dir, key, type}} />);
    }
  }

  render() {
    const listItems: ReactNode[] = [];
    for (let gset of this.state.list) {
      // render each gset
      this.renderGroupSet(gset, listItems);
    }
    setTimeout(this.onScroll.bind(this), 0); // schedule check
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