import { Song } from "@/type";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/dist/client/components/headers";
import getSongs from "./getSongs";

const getSongsByTitle = async(title:string):Promise<Song[]> =>{
    const supabase = createServerComponentClient({
        cookies:cookies
    })
    if(!title){
        const allSongs = await getSongs()
        return allSongs
    }
    const {data, error} = await supabase
        .from('songs')
        .select('*')
        .like("title",`%${title}%`)
        .order('created_at', {ascending:false});

        if(error){
            console.log(error)
        }

        return (data as any) || []
}
export default getSongsByTitle;