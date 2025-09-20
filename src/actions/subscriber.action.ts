'use server'

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Subscription from "@/models/Subscription";
import { getServerSession } from "next-auth";

/* actions are less secured coz it will return data, middleware won't protect it like it protects api. so we need to use session for auth. it can't send error as in catch to frontend and overall error handling is not good. here no error handling needed in frontend so perfectly matched to use it here*/

export const getSubscriber = async () => {
    try {
         const session = await getServerSession(authOptions);
                 if (!session) {
                 throw new Error("Unauthorized");}
                 const id = session.user.id;
                 await connectToDatabase();
                 const subscriber = await Subscription.findOne({ userId: id });
                 if (subscriber) {
                    return JSON.parse(JSON.stringify(subscriber));
                 }
        
    } catch (error) {
        console.error(error);
    }
}