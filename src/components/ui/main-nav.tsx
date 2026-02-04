"use client"

import * as React from "react"
import Link from "next/link"

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/ui/icon";
import { ModeToggle } from "./mode-toggle"
import { PAGES } from "@/lib/constants"



export function MainNav({ className }: { className?: string }) {
    return (
        <nav className={cn("w-full border-b border-gray-200 dark:border-gray-800 bg-transparent relative z-[100]", className)}>
            <div className="flex items-center justify-between py-4 w-full max-w-screen-xl px-2.5 md:px-20px mx-auto">
                {/* Logo and Brand */}
                <Link href={"/"} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Icons.logo className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-semibold text-lg text-gray-900 dark:text-white">
                        Arun Krishnamoorthy
                    </span>
                </Link>
                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-6">
                    <NavigationMenu viewport={false}>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400">
                                    Library
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid w-[400px] gap-1 p-3 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                        {PAGES.map((page) => (
                                            <ListItem
                                                key={page.title}
                                                title={page.title}
                                                href={page.href}
                                            >
                                                {page.description}
                                            </ListItem>
                                        ))}
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link href="/courses" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-4 py-2">
                                        Explore Courses
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link href="/about" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-4 py-2">
                                        About Me
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-3">
                    <ModeToggle />
                    <Link href="/rss" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                        <Icons.rss className="h-5 w-5" />
                    </Link>
                    <Link
                        href="/courses"
                        className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                        Start Learning
                    </Link>
                </div>
            </div>
        </nav>
    )
}

function ListItem({
    title,
    children,
    href,
    ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
    return (
        <li {...props}>
            <NavigationMenuLink asChild>
                <Link
                    href={href}
                    className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 group"
                >
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        {title}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {children}
                    </p>
                </Link>
            </NavigationMenuLink>
        </li>
    )
}
