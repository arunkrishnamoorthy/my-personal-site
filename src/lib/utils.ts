import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fetchUrl = process.env.NODE_ENV === 'production' ?
                // return production api 
                `${process.env.domain_name}/api`
                : `http://localhost:3000/api`