import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = ({ url }) => {

    console.log("uu", url);
    return json({ msg: "hie" })

}