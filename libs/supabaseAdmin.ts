import Stripe from "stripe";
import {createClient} from '@supabase/supabase-js'
import { Database } from "@/types_db";
import { Price, Product } from "@/type";

import {stripe} from './stripe'
import { toDateTime } from "./helper";
export const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
)
const upsertProductRecord = async (product:Stripe.Product) =>{
    const productData:Product = {
        id: product.id,
        active: product.active,
        name: product.name,
        description:product.description ?? undefined,
        image:product.images?.[0],
        metadata:product.metadata
    }
    const {error} = await supabaseAdmin
        .from('products')
        .upsert([productData])
    if(error){
        throw error;
    }
    console.log(`Product inserted/updated: ${product.id}`)
}
const upsertPriceRecord = async (price:Stripe.Price) =>{
    const priceData:Price = {
        id:price.id,
        product_id:typeof price.product === 'string' ? price.product : '',
        active:price.active,
        currency:price.currency,
        description:price.nickname ?? undefined,
        type:price.type,
        unit_amount:price.unit_amount ?? undefined,
        interval:price.recurring?.interval,
        interval_count:price.recurring?.interval_count,
        trial_period_days:price.recurring?.trial_period_days,
        metadata:price.metadata
    }
    const {error} = await supabaseAdmin
        .from('prices')
        .upsert([priceData])

    if(error){
        throw error
    }
    console.log(`Price insert/updated: ${price.id}`);
    
}
const createOrRetrieveACustomer = async ({
    email,uuid
}:{
    email:string,
    uuid:string
})=>{
    const {data, error} = await supabaseAdmin
        .from('customers')
        .select('stripe_customer_id')
        .eq('id', uuid)
        .single()
    if(error || !data.stripe_customer_id){
        const customerData:{metadata :{supabaseUUID:string};email?:string}={
            metadata:{
                supabaseUUID:uuid
            }
        }
        if(email) customerData.email = email
        const customer = await stripe.customers.create(customerData)
        const {error:supabaseError} = await supabaseAdmin
            .from('customers')
            .insert([{id:uuid, stripe_customer_id:customer.id}])
        if(supabaseError){
            throw supabaseError
        }
        console.log(`New customer created and inserted for ${uuid}`)
        return customer.id
    }
    return data.stripe_customer_id
}
const copyBillingDetailsToCustomer = async (uuid:string, payment_method:Stripe.PaymentMethod)=>{
    const customer = payment_method.customer as string;
    const {name,phone,address} = payment_method.billing_details
    if(!name || !phone || !address) return;
    //@ts-ignore
    await stripe.customers.update(customer,{name, phone,address})
    const {error} = await supabaseAdmin
        .from('users')
        .update({
            billing_address:{...address},
            payment_method:{...payment_method[payment_method.type]}
        })
        .eq('id',uuid)
    if(error) throw error
}

const manageSubcriptionStatusChange = async(
    subcriptionId:string,
    customerId:string,
    createAction = false
) =>{
    const {data: customerData, error:noCustomerError} = await supabaseAdmin
        .from('customers')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()
    if(noCustomerError) throw noCustomerError;
    const {id:uuid} = customerData!
    const subcription = await stripe.subscriptions.retrieve(
        subcriptionId,
        {
            expand:["default_payment_method"]
        }
    ) 
    const subcriptionData:Database["public"]["Tables"]["subscriptions"]["Insert"] = {
        id:subcription.id,
        user_id:uuid,
        metadata:subcription.metadata,
        //@ts-ignore
        status: subcription.status,
        price_id:subcription.items.data[0].price.id,
        //@ts-ignore
        quantity:subcription.quanity,
        cancel_at_period_end:subcription.cancel_at_period_end,
        cancel_at:subcription.cancel_at ? toDateTime(subcription.cancel_at).toISOString():null,
        canceled_at:subcription.canceled_at ? toDateTime(subcription.canceled_at).toISOString():null,
        current_period_start:toDateTime(subcription.current_period_start).toISOString(),
        current_period_end:toDateTime(subcription.current_period_end).toISOString(),
        created:toDateTime(subcription.created).toISOString(),
        ended_at:subcription.ended_at ? toDateTime(subcription.ended_at).toISOString() : null,
        trial_start:subcription.trial_start ? toDateTime(subcription.trial_start).toISOString():null,
        trial_end:subcription.trial_end ? toDateTime(subcription.trial_end).toISOString():null,

    }
    const {error} = await supabaseAdmin
        .from('subscriptions')
        .upsert([subcriptionData])

    if(error) throw error;
    console.log(`Insert / updated subcription [${subcription.id} for ${uuid}]`)
    if(createAction && subcription.default_payment_method && uuid){
        await copyBillingDetailsToCustomer(
            uuid,
            subcription.default_payment_method as Stripe.PaymentMethod
        )
    }
}

export {
    upsertPriceRecord,
    upsertProductRecord,
    createOrRetrieveACustomer,
    manageSubcriptionStatusChange
}