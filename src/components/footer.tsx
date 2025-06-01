import { Icons } from "@/components/ui/icon"
import { PAGES } from "@/lib/constants"
import Link from "next/link"
import { Input } from "./ui/input"
import { Button } from "./ui/button"

export default function Footer() {

    return (
        <footer className="bg-gray-100 py-8 dark:bg-gray-800 mt-10">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <Icons.logo className="h-6 w-6" />
                            <span className="text-md font-semibold">run Krishnamoorthy</span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Stay up to date with latest on the SAP BTP Technology platform
                        </p>
                        <div className="flex space-x-4">
                            <a href="https://www.linkedin.com/in/arun-krishnamoorthy-49263a35/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="LinkedIn">
                                <Icons.linkedIn className="w-6 h-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" />
                            </a>
                            <a href="https://github.com/arunkrishnamoorthy"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Github">
                                <Icons.github className="w-6 h-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" />
                            </a>
                            <a href="https://www.youtube.com/@arunmbarec"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="LinkedIn">
                                <Icons.youtube className="w-6 h-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" />
                            </a>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-md font-semibold">Topics</h3>
                        <ul className="space-y-2 text-sm">
                            {PAGES.map((page) => (
                                <li key={page.title}>
                                    <Link href={page.href}>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">{page.title}</p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-md font-semibold">Links</h3>
                        <ul className="text-sm space-y-2">
                            <li>
                                <a href="mailto:arunmba.rec@gmail.com"
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                                    Contact
                                </a>
                            </li>
                            <li>
                                <Link
                                    href="/terms-of-services"
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                >
                                    Terms of Services
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/privacy-policy"
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/sitemap.xml"
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                >
                                    Sitemap
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-md font-semibold">Newsletter</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Subscribe to our newsletter to stay upto date with my content.
                        </p>
                        <form>
                            <div className="flex space-x-2">
                                <Input type="email" placeholder="Enter your email"
                                    className="flex-1"
                                    name="email" 
                                    defaultValue=""
                                    aria-describedby="email-error"/>
                                <Button>Subscribe</Button>
                            </div>
                        </form>
                    </div>
                </div>
                {/* copyright */}
                <div className="mt-8 border-t border-gray-200 pt-4 text-center text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    &copy; 2025 Arun Krishnamoorthy. All rights reserved.
                </div>
            </div>
        </footer>
    )
}