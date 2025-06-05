import Container from "@/components/Container";
import { MainNav } from "@/components/ui/main-nav";
import Image from "next/image";
import Link from "next/link";

const courseList = [
    {
        title: "ABAP Beginner Course",
        chapters: 12,
        color: "border-emerald-400",
        icon: (
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold text-lg">
                ABAP
            </span>
        ),
        description:
            "Start your ABAP journey with the basics. Learn syntax, data types, and essential programming concepts for SAP.",
        links: [
            { label: "Go to Learning", href: "/courses/abap-beginner-course" }
        ],
    },
    {
        title: "ABAP CDS",
        chapters: 8,
        color: "border-blue-400",
        icon: (
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-lg">
                CDS
            </span>
        ),
        description:
            "Master Core Data Services (CDS) in ABAP for advanced data modeling and analytics in SAP S/4HANA.",
        links: [
            { label: "View Course", href: "#" }
        ],
    },
    {
        title: "ABAP New Syntax",
        chapters: 7,
        color: "border-yellow-400",
        icon: (
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 text-yellow-700 font-bold text-lg">
                <span>⎇</span>
            </span>
        ),
        description:
            "Explore the latest ABAP syntax improvements, inline declarations, and modern best practices.",
        links: [
            { label: "View Course", href: "#" }
        ],
    },
    {
        title: "Restful ABAP Programming Model",
        chapters: 10,
        color: "border-pink-300",
        icon: (
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-pink-100 text-pink-600 font-bold text-lg">
                RAP
            </span>
        ),
        description:
            "Learn to build scalable RESTful services using the ABAP RESTful Application Programming Model (RAP).",
        links: [
            { label: "View Course", href: "#" }
        ],
    },
    {
        title: "SAP ABAP in BTP Environment",
        chapters: 6,
        color: "border-indigo-400",
        icon: (
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-lg">
                BTP
            </span>
        ),
        description:
            "Deploy and run ABAP in SAP BTP. Understand cloud deployment, service integration, and security.",
        links: [
            { label: "View Course", href: "#" }
        ],
    },
    {
        title: "SAP BTP, Introduction",
        chapters: 5,
        color: "border-blue-500",
        icon: (
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-lg">
                BTP
            </span>
        ),
        description:
            "Get started with SAP Business Technology Platform. Learn about its services, architecture, and use cases.",
        links: [
            { label: "View Course", href: "#" }
        ],
    },
    {
        title: "Beginners Guide to UI5",
        chapters: 9,
        color: "border-cyan-400",
        icon: (
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-cyan-100 text-cyan-700 font-bold text-lg">
                UI5
            </span>
        ),
        description:
            "A step-by-step guide to SAPUI5 for beginners. Build your first SAP Fiori apps with UI5 controls.",
        links: [
            { label: "View Course", href: "#" }
        ],
    },
    {
        title: "Fiori Elements",
        chapters: 7,
        color: "border-green-400",
        icon: (
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-700 font-bold text-lg">
                FE
            </span>
        ),
        description:
            "Accelerate app development with Fiori Elements. Learn templates, annotations, and extension points.",
        links: [
            { label: "View Course", href: "#" }
        ],
    },
    {
        title: "UI/UX Tooling",
        chapters: 4,
        color: "border-purple-400",
        icon: (
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold text-lg">
                UX
            </span>
        ),
        description:
            "Explore SAP's UI/UX tools for design and prototyping. Learn about SAP Fiori tools, Web IDE, and more.",
        links: [
            { label: "View Course", href: "#" }
        ],
    },
    {
        title: "Cloud Application Programming Model",
        chapters: 8,
        color: "border-emerald-500",
        icon: (
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold text-lg">
                CAP
            </span>
        ),
        description:
            "Develop full-stack cloud apps with SAP CAP. Covers service modeling, Node.js/Java, and deployment.",
        links: [
            { label: "View Course", href: "#" }
        ],
    },
];

export default function Courses() {
    return (
        <Container>
            <MainNav />
            <main className="flex flex-col items-center mt-10">
                {/* Heading and Search */}
                <section className="w-full max-w-4xl flex flex-col items-center mb-6">
                    <h1 className="text-xl md:text-xl font-semibold text-center mb-4 bg-gradient-to-r from-gray-300 to-gray-100 bg-clip-text">
                        What would you like to learn today?
                    </h1>
                    <div className="w-full flex justify-center mb-5">
                        <div className="relative w-full max-w-xl">
                            <input
                                type="text"
                                placeholder="Find self-paced learning content, certification guidance, and more"
                                className="w-full rounded-full border border-gray-300 px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm shadow-sm"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                                    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M21 21l-3.5-3.5" />
                                </svg>
                            </span>
                        </div>
                    </div>
                </section>
                {/* Welcome Banner */}
                <section className="w-full max-w-4xl">
                    <div className="flex items-center justify-between bg-gradient-to-r from-gray-200 to-gray-100 text-black rounded-2xl px-5 py-5 shadow mb-6">
                        <div className="flex items-center">
                            <Image
                                src="/myphoto.jpeg"
                                alt="Arun Krishnamoorthy"
                                width={48}
                                height={48}
                                className="rounded-full border-2 border-white shadow"
                            />
                            <div className="ml-4">
                                <div className="text-lg font-bold mb-0.5">Welcome back, Arun!</div>
                                <div className="text-sm opacity-90">
                                    Check your learning progress, achievements, and more.
                                </div>
                            </div>
                        </div>
                        <a
                            href="#"
                            className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-50 transition flex items-center text-sm"
                        >
                            Go to My Learning
                            <svg className="ml-2" width="16" height="16" fill="none" viewBox="0 0 24 24">
                                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </a>
                    </div>
                </section>
                {/* Courses List Section */}
                <section className="w-full max-w-6xl mt-6">
                    <h2 className="text-xl font-semibold mb-6 border-l-4 border-blue-600 pl-3">
                        Courses
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courseList.map((course, idx) => (
                            <div
                                key={course.title}
                                className="bg-white dark:bg-gray-900  shadow p-6 flex flex-col h-full"
                            >
                                <div className="flex items-center mb-2">
                                    <span className="text-2xl font-bold">{idx + 1}</span>
                                    <div
                                        className={`flex-1 h-[4px] ml-2 rounded ${course.color}`} // Changed h-2 to h-1 for a thinner line
                                        style={{
                                            backgroundColor: undefined,
                                            borderWidth: 0,
                                            ...(course.color === "border-emerald-400" && { backgroundColor: "#34d399" }),
                                            ...(course.color === "border-blue-400" && { backgroundColor: "#60a5fa" }),
                                            ...(course.color === "border-yellow-400" && { backgroundColor: "#fbbf24" }),
                                            ...(course.color === "border-pink-300" && { backgroundColor: "#f9a8d4" }),
                                            ...(course.color === "border-indigo-400" && { backgroundColor: "#818cf8" }),
                                            ...(course.color === "border-blue-500" && { backgroundColor: "#3b82f6" }),
                                            ...(course.color === "border-cyan-400" && { backgroundColor: "#22d3ee" }),
                                            ...(course.color === "border-green-400" && { backgroundColor: "#4ade80" }),
                                            ...(course.color === "border-purple-400" && { backgroundColor: "#a78bfa" }),
                                            ...(course.color === "border-emerald-500" && { backgroundColor: "#10b981" }),
                                        }}
                                    ></div>
                                </div>
                                <div className="flex items-center mb-2">
                                    {/* {course.icon} */}
                                    <span className="font-bold text-lg">{course.title}</span>
                                </div>
                                <div className="text-gray-500 dark:text-gray-300 text-xs mb-1">
                                    {course.chapters} chapters
                                </div>
                                <div className="text-gray-700 dark:text-gray-200 text-sm mb-4">
                                    {course.description}
                                </div>
                                <div className="mt-auto flex flex-wrap gap-4">
                                    {course.links.map((link, lidx) => (
                                        <Link
                                            key={lidx}
                                            href={link.href}
                                            className="text-blue-700 font-medium text-sm hover:underline flex items-center"
                                        >
                                            {link.label}
                                            <svg className="ml-1" width="14" height="14" fill="none" viewBox="0 0 24 24">
                                                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                {/* ...rest of your code if any... */}
            </main>
        </Container>
    );
}