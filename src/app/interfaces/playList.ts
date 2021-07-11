import { IPicture } from "music-metadata-browser";

export interface PlayList {
    id:string;
    name:string;
    songsPath:string[];
    cover?:IPicture
}