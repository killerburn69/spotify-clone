"use client"
import SongItem from '@/components/SongItem'
import useOnPlay from '@/hooks/useOnPlay'
import { Song } from '@/type'
import React from 'react'
interface PageContentProps{
  songs:Song[]
}
const PageContent = (props:PageContentProps) => {
  const onPlay = useOnPlay(props.songs)
  if(props.songs.length === 0){
    return(
      <div className='mt-4 text-neutral-400'>
        No songs available
      </div>
    )
  }
  return (
    <div className='
      grid
      grid-cols-2
      sm:grid-cols-3
      md:grid-cols-3
      lg:grid-cols-4
      xl:grid-cols-5
      2xl:grid-cols-8
      gap-x-4
    '>
      {props.songs.map((item)=>(
        <SongItem
          key={item.id}
          onClick={(id:string)=>onPlay(id)}
          data={item}
        />
      ))}
    </div>
  )
}

export default PageContent