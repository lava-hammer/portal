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

function num2group(num: number): string {
  return `G${Math.floor(num/GROUP_SIZE)}XX`;
}

function initGroup(num: number): IGroup {
  return {
    group: num2group(num),
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

export function Group(props: {name: string, fold: boolean}) {
  return (
    <div className="group">{`${props.fold ? '+' : '-'} [${props.name}]`}</div>
  )
}

export function Loader(props: {loading: boolean, meta: IELoader}) {
  return (
    <div className="loader" data-meta={JSON.stringify(props.meta)} >{props.loading ? 'Loading...' : ''}</div>
  )
}

const LOAD_SIZE = 20;

interface IElement {
  type: 'group' | 'item' | 'loader',
  key: string;
}

interface IEGroup extends IElement {
  name: string;
}

interface IEItem extends IElement {
  value: number;
}

interface IELoader extends IElement {
  pos: number;
  dir: number;
}

type IEX = IEGroup | IEItem | IELoader;

interface IGroupListState {
  list: IEX[];
}

function makeItem(value: number): IEItem {
  return {
    type: 'item',
    key: `I${value}`,
    value,
  };
}

function makeGroup(name: string): IEGroup {
  return {
    type: 'group',
    name,
    key: name,
  };
}

function makeLoader(pos: number, dir: number): IELoader {
  return {
    type: 'loader',
    key: `L${pos}${dir > 0 ? '+' : '-'}`,
    pos,
    dir,
  };
}

function lastGroupKey(list: IEX[], fromIndex: number): string {
  for (let i=fromIndex-1; i>=0; --i) {
    const e = list[i];
    if (e.type === 'group') {
      return e.key;
    }
    if (e.type === 'item') {
      const item = e as IEItem;
      return num2group(item.value);
    }
  }
  return '';
}

function lastItemValue(list: IEX[]): number {
  for (let i = list.length-1; i >= 0; --i) {
    const e = list[i];
    if (e.type === 'item') {
      const item = e as IEItem;
      return item.value;
    }
  }
  return -1;
}

function nextItemValue(list: IEX[], fromIndex: number): number {
  for (let i=fromIndex+1; i<list.length; ++i) {
    const e = list[i];
    if (e.type === 'item') {
      const item = e as IEItem;
      return item.value;
    }
  }
  return Infinity;
}

export class GroupList extends React.Component<{}, IGroupListState> {

  constructor(props: any) {
    super(props);
    this.state = {
      list: [
        makeLoader(FIRST_NUM, 1),
      ],
    };
  }

  viewRef = createRef<HTMLDivElement>();
  isLoading = false;

  componentDidMount() {
    this.onScroll();
  }

  async loadItems(loaderKey: string, pos: number, dir: number) {
    console.log('load items:', pos, dir);
    // set loader to loading
    this.isLoading = true;
    const rsp = await fetchGroupItems({
      pos,
      len: LOAD_SIZE,
      dir,
    });
    this.setState(produce((draftState: IGroupListState) => {
      const index = draftState.list.findIndex(e => e.key === loaderKey);
      const insertList: IEX[] = [];
      const cutoffValue = nextItemValue(draftState.list, index);
      for (let gps of rsp.groups) {
        if (gps.group != lastGroupKey(draftState.list, index)) {
          insertList.push(makeGroup(gps.group));
        }
        insertList.push(...(gps.items.filter(e => e < cutoffValue).map(e => makeItem(e))));
      }
      insertList.push(makeLoader(lastItemValue(insertList)+1, 1));
      draftState.list.splice(index, 1, ...insertList);
    }, this.state));
    this.isLoading = false;
  }

  onScroll() {
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

      if (!(itemBeginY > viewEndY || itemEndY < viewBeginY)) {
        const meta = JSON.parse(loader.dataset['meta']!);
        this.loadItems(meta.key, meta.pos, meta.dir);
      }
    }
  }

  groupFold: {[key: string]: boolean} = {};

  render() {
    return (
      <div>
        <div>
          <input type="text" />
          <button onClick={() => {

          }}>GO</button>
        </div>
        <div className="listview" ref={this.viewRef} onScroll={this.onScroll.bind(this)}>
          {/* <Group name={'Test'} fold={false} />
          {...([
            123,
            345,
            2323,
            2323,
            3434,
            2323,
            4444,
            555,
            666,
            777,
            888,
            9999,
            110,
            11,
            12,
            13,
          ].map(e => (<Item value={e} />)))} */}
          {...(this.state.list.map(e => {
            switch(e.type) {
              case 'item': {
                const item = e as IEItem;
                return (<Item key={item.key} value={item.value} />);
              }
              case 'group': {
                const item = e as IEGroup;
                return (<Group key={item.key} name={item.name} fold={this.groupFold[item.name] || false} />);
              }
              case 'loader': {
                const item = e as IELoader;
                return (<Loader key={item.key} loading={true} meta={item} />);
              }
            }
          }))}
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