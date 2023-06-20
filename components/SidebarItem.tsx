import Link from 'next/link';
import React from 'react'
import { twMerge } from 'tailwind-merge';
import { IconType } from 'react-icons'
interface SidebarProps{
    icon:IconType;
    label:string;
    active?:boolean;
    href:string;
}
const SidebarItem = (props:SidebarProps) => {
  return (
    <Link href={props.href} className={twMerge(`
        flex flex-row h-auto items-center w-full gap-x-4 text-md font-medium cursor-pointer hover:text-white transition text-neutral-400
    `, props.active && "text-white")}>
        <props.icon size={26}/>
        <p className='truncate w-full'>{props.label}</p>
    </Link>
  )
}

export default SidebarItem