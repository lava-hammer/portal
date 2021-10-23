import React from 'react'
import { Playground } from '../playground/Playground'

////////////////////////////////////////
/// PART I: 这部分是为了模拟服务器实现 ///
////////////////////////////////////////

const FIRST_NUM = 10000;
const LAST_NUM =  99999;
const GROUP_SIZE = 1000;

function num2group(num: number): string {
  return `G${Math.floor(num/GROUP_SIZE)}XXX`;
}

function makeGroup(num: number): IGroup {
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
      currGroup = makeGroup(i);
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
      }, 500 + Math.random() * 1000);
    });
  }
}

const fetchGroupItems = remoteCall(getGroupItems);
const fetchNextGroupItems = remoteCall(getNextGroupItems);

////////////////////////////////////////
/// PART II: 这部分是为了写组件DEMO    ///
////////////////////////////////////////


export function GroupList() {
  return <div>GroupList</div>
}

export function TestGroupList() {
  return (
    <Playground width={300} height={400}>
      <GroupList />
    </Playground>
  )
}