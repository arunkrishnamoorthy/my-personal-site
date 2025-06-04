import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fetchUrl = process.env.NODE_ENV === 'production' ?
                // return production api 
                `${process.env.DOMAIN_NAME}/api`
                : `http://localhost:3000/api`


export const fetcher = (...args: Parameters<typeof fetch>) => fetch(...args).then((res) => res.json());