import Stripe from "stripe";
import { NextResponse } from "next/server";
import {headers} from 'next/headers'

import {stripe} from "@/libs/stripe"
import { upsertPriceRecord, upsertProductRecord, manageSubcriptionStatusChange } from "@/libs/supabaseAdmin";

const relativeEvents = new Set([
    'product.created',
    'product.updated',
    'price.created',
    'price.uploaded',
    'checkout.session.completed',
    'customer.subcription.created',
    'customer.subcription.updated',
    'customer.subcription.deleted',
])
export async function POST(request:Request){
    const body = await request.text()
    const sig = headers().get('Stripe-Signature');
    const webhookSocket = process.env.STRIPE_WEBHOOK_SECRET
    let event:Stripe.Event
    try{
        if(!sig || !webhookSocket) return
        event = stripe.webhooks.constructEvent(body,sig,webhookSocket)
    }catch(error:any){
        console.log('Error messages: ' + error.messages);
        return new NextResponse(`Webhook Error: ${error.messages}`, {status:400})
    }
    if(relativeEvents.has(event.type)){
        try{
            switch(event.type){
                case 'product.created':
                case 'product.updated':
                    await upsertProductRecord(event.data.object as Stripe.Product)
                    break;
                case 'price.created':
                case 'price.updated':
                    await upsertPriceRecord(event.data.object as Stripe.Price)
                    break
                case 'customer.subcription.created':
                case 'customer.subcription.updated':
                case 'customer.subcription.deleted':
                    const subcription = event.data.object as Stripe.Subscription
                    await manageSubcriptionStatusChange(
                        subcription.id,
                        subcription.customer as string,
                        event.type === "customer.subcription.created"
                    )
                    break
                case 'checkout.session.completed':
                    const checkoutSession = event.data.object as Stripe.Checkout.Session
                    if(checkoutSession.mode === 'subscription'){
                        const subcriptionId = checkoutSession.subscription
                        await manageSubcriptionStatusChange(
                            subcriptionId as string,
                            checkoutSession.customer as string,
                            true
                        )
                    }
                    break
                default:
                    throw new Error('Unhandle relevant event!')
            }
        }catch(error:any){
            console.log(error);
            return new NextResponse('Webhook error', {status:400})
        }
    }
    return NextResponse.json({received:true},{status:200})
}