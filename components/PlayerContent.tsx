import { Song } from '@/type'
import React, { useEffect, useState } from 'react'
import MediaItem from './MediaItem';
import LikeButton from './LikeButton';
import {BsPauseFill, BsPlayFill} from 'react-icons/bs'
import { AiFillStepBackward, AiFillStepForward  } from 'react-icons/ai';
import { HiSpeakerWave, HiSpeakerXMark } from 'react-icons/hi2';
import Slider from './Slider';
import usePlayer from '@/hooks/usePlayer';
import useSound from 'use-sound';
interface PlayerContentProps {
    song:Song;
    songUrl:string;
}
const PlayerContent:React.FC<PlayerContentProps> = ({song,songUrl}) => {
    const player = usePlayer()
    const [volumn, setVolumn] = useState(1)
    const [isPlaying, setIsPlaying] = useState(false)
    const Icon = isPlaying ? BsPauseFill : BsPlayFill
    const VolumnIcon = volumn === 0 ? HiSpeakerXMark:HiSpeakerWave
    const onPlayNext = ()=>{
        if(player.ids.length === 0){
            return
        }
        const currentIndex = player.ids.findIndex((id)=>id === player.activeId)
        const previousSong = player.ids[currentIndex - 1]
        if(!previousSong){
            return player.setId(player.ids[player.ids.length - 1])
        }
        player.setId(previousSong)
    }
    const onPlayPrevious = ()=>{
        if(player.ids.length === 0){
            return
        }
        const currentIndex = player.ids.findIndex((id)=>id === player.activeId)
        const nextSong = player.ids[currentIndex + 1]
        if(!nextSong){
            return player.setId(player.ids[0])
        }
        player.setId(nextSong)
    }
    const [play, {pause, sound}] = useSound(
        songUrl,
        {
            volume:volumn,
            onplay:()=> setIsPlaying(true),
            onend:()=>{
                setIsPlaying(false)
                onPlayNext()
            },
            onpause:()=>setIsPlaying(false),
            format:['mp3']
        }
    )
    useEffect(()=>{
        sound?.play()
        return ()=>{
            sound?.unload()
        }
    },[sound])
    const handlePlay = ()=>{
        if(!isPlaying){
            play()
        }else{
            pause()
        }
    }
    const toggleMute = ()=>{
        if(volumn === 0){
            setVolumn(1)
        }else{
            setVolumn(0)
        }
    }
  return (
    <div className='grid w-full grid-cols-2 md:grid-cols-3 h-full'>
        <div className='flex w-full justify-start'>
            <div className='flex item gap-x-4'>
                <MediaItem data={song}/>
                <LikeButton songId={song.id}/>
            </div>
        </div>
        <div className='flex md:hidden col-auto w-full justify-center items-center'>
            <div onClick={handlePlay} className='
                h-10
                w-10
                flex
                items-center
                justify-center
                rounded-full
                bg-white
                p-1
                cursor-pointer
            '>
                <Icon size={30} className='text-black'/>
            </div>
        </div>
        <div className='
            hidden
            h-full
            md:flex
            justify-center
            items-center
            w-full
            max-w-[720px]
            gap-x-6
        '>
            <AiFillStepBackward
                onClick={onPlayPrevious}
                size={30} className='text-neutral-400 cursor-pointer hover:text-white transition'
            />
            <div 
                onClick={handlePlay}
                className='
                    flex
                    items-center
                    justify-center
                    h-10
                    w-10
                    rounded-full
                    bg-white
                    p-1
                    cursor-pointer              
                '
            >
                <Icon size={30} className='text-black'/>
            </div>
            <AiFillStepForward className='
                text-neutral-400
                cursor-pointer
                hover:text-white
                transition
            ' onClick={onPlayNext} size={30}/>
        </div>
        <div className='hidden items-center md:flex w-full justify-end pr-2'>
            <div className='flex items-center gap-x-2 w-[120px]'>
                <VolumnIcon onClick={toggleMute} className='cursor-pointer' size={34}/>
            </div>
            <Slider value={volumn} onChange={(value)=>setVolumn(value)}/>
        </div>
    </div>
  )
}

export default PlayerContent