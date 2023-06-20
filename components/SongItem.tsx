"use client"
import useLoadImage from '@/hooks/useLoadingImage';
import { Song } from '@/type'
import Image from 'next/image';
import React from 'react'
import PlayButton from './PlayButton';
interface SongItemProps {
    data:Song;
    onClick:(id:string)=>void;
}
const SongItem = (props:SongItemProps) => {
    const imagePath = useLoadImage(props.data)
  return (
    <div
        onClick={()=>props.onClick(props.data.id)}
        className='
            relative
            group
            flex
            flex-col
            items-center
            justify-center
            rounded-md
            overflow-hidden
            gap-x-4
            bg-neutral-400/5
            cursor-pointer
            hover:bg-neutral-400/10
            transition
            p-3
        '
    >
        <div
            className='
                relative
                aspect-square
                w-full
                h-full
                rounded-md
                overflow-hidden
            '
        >
            <Image className='object-cover' alt='Image' src={imagePath || '/images/liked.png'} fill/>
        </div>
        <div className='flex flex-col items-start w-full p-4 gap-y-1'>
            <p className='font-semibold truncate w-full'>
                {props.data.title}
            </p>
            <p className='text-neutral-400 text-sm pb-2 w-full truncate'>
                By {props.data.author}
            </p>
        </div>
        <div className='absolute bottom-24 right-5'>
            <PlayButton/>
        </div>
    </div>
  )
}

export default SongItem