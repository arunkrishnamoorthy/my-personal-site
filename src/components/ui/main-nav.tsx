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
        <div className={cn("flex flex-col items-start justify-start md:flex-row md:items-center md:justify-between pt-10 z-50",className)}>
            <Link href={"/"}>
                <div className="flex items-center justify-between">
                    <Icons.logo className="h-6 w-6" />
                    <p>run Krishnamoorthy</p>
                </div>
            </Link>
            <NavigationMenu viewport={false}>
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>Topics</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px] z-10">
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
                        <NavigationMenuLink  asChild className={navigationMenuTriggerStyle()}>
                            <Link href="/about">About</Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>

            <div className="flex items-center justify-between w-20">
                <ModeToggle />
                <Link href="/rss">
                    <Icons.rss className="h-6 w-6" />
                </Link>
            </div>
        </div>

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
                <Link href={href}>
                    <div className="text-sm leading-none font-medium">{title}</div>
                    <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                        {children}
                    </p>
                </Link>
            </NavigationMenuLink>
        </li>
    )
}
