import { IPicture } from "music-metadata-browser";

export interface Song {
    title:string,
    path:string,
    artists?:string[],
    genres?:string[],
    cover?:IPicture
}