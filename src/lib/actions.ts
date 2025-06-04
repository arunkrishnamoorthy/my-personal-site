"use server";

import { db } from "@/db";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const FormSchema = z.object({
    id: z.number(),
    email: z.string().min(1, { message: 'Email is required' }),
    isSubscribed: z.boolean()
});

const createSubscriberSchema = FormSchema.omit({id: true, isSubscribed: true});

export type State = {
    errors?: {
        email?: string[],
    };
    message: string;
}

export async function createSubscriber(prevState: State, formData: FormData):  Promise<State> {
    let mail = formData.get('email');
    const validatedField = createSubscriberSchema.safeParse({
        email: mail
    })

    if(!validatedField.success) {
        return {
            errors: validatedField.error.flatten().fieldErrors,
            message: "Email is required"
        }
    }

    const { email } = validatedField.data;

    try {
        
        const existingSubscriber = await db.subscriber.findFirst({
            where: {
                email: email
            }
        })

        if(existingSubscriber) {
            return {
                errors: { email: ['Already on the list']},
                message: "Email is required"
            }
        }

        await db.subscriber.create({
            data: {
                email: email, 

            }
        });
        revalidatePath("/");

        return {
            message: 'Thank you for subscribing!. '
        }
    } catch(err) {
        if(err) {
            if(err instanceof PrismaClientKnownRequestError) {
                if(err.code === 'P2002') {
                    return {
                        message: "Email already in the list"
                    }
                }
            }
        } 

        return {
            message: "Error unknown"
        }
    }

}