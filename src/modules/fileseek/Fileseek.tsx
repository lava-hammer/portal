import React, { useState } from 'react'
import { Playground } from '../playground/Playground'



export function FileSeek() {
  const [text, setText] = useState(['']);
  function append(log: string) {
    text.push(log);
    setText(text.slice());
  }
  return (
    <div>
      <input type="file" onChange={async (e)=> {
        const file = e.target?.files?.[0] as File;
        console.log('onChange:', file.name);
        append(`file="${file.name}" type="${file.type}" size=${file.size}`);
        const sliceSize = 1024 * 8;
        const REPEAT_COUNT = 2000;
        const beginRange = file.size - sliceSize - 1;
        
        let readCost = 0;
        
        const slices: Blob[] = [];
        
        console.log('beginSlice');
        const ts0Slice = Date.now();
        for (let i=0; i<REPEAT_COUNT; ++i) {
          const beginPos = Math.floor(Math.random() * beginRange);
          slices.push(file.slice(beginPos, beginPos+Math.floor(Math.random() * sliceSize)+1));
        }
        const costSlice = Date.now() - ts0Slice;
        console.log('endSlice');

        const ts0Read = Date.now();
        for (let i=0; i<REPEAT_COUNT; ++i) {
          const blob = slices[i];
          const buffer = await blob.arrayBuffer();
        }
        const costRead = Date.now() - ts0Read;
        console.log('endRead');

        append(`slice cost=${costSlice}`);
        append(`read cost=${costRead}`);
      }} />
    <div>
      { text.map((e, i) => (<p key={i}>{e}</p>)) }
    </div>
    </div>
  )
}

export function TestFileSeek() {
  return (
    <Playground width={500} height={400}>
      <FileSeek />
    </Playground>
  ) 
}