import {NextRequest} from 'next/server';import {outboundGet} from '@/lib/charts/outbound';
export async function GET(r:NextRequest,{params}:{params:Promise<{id:string}>}){const {id}=await params;const url=new URL(r.url);url.searchParams.set('product_id',id);return outboundGet(new NextRequest(url));}
