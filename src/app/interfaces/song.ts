import { IPicture } from "music-metadata-browser";

export interface Song {
    title:string,
    path:string,
    artist?:string,
    genre?:string,
    cover?:IPicture
}