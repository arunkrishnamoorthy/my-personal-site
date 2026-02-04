import Container from "@/components/Container";
import { MainNav } from "@/components/ui/main-nav";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";

export default function CourseLanding() {
    // Example SAP UI5 course content
    const courseUnits = [
        {
            id: "unit1",
            title: "Introduction to SAP UI5",
            lessons: 2,
            duration: "40 mins",
            objectives: [
                "Understand the basics of SAP UI5 and its architecture.",
                "Set up the development environment.",
                "Explore the MVC concept in UI5.",
            ],
            lectures: [
                { title: "What is SAP UI5?", completed: true },
                { title: "Setting up your first UI5 App", completed: false },
                { title: "Quiz", completed: false },
            ],
        },
        {
            id: "unit2",
            title: "UI5 Controls and Data Binding",
            lessons: 3,
            duration: "1 hr",
            objectives: [
                "Learn about standard UI5 controls.",
                "Implement data binding in UI5 applications.",
                "Understand aggregation binding.",
            ],
            lectures: [
                { title: "Standard Controls Overview", completed: false },
                { title: "Data Binding Basics", completed: false },
                { title: "Aggregation Binding", completed: false },
            ],
        },
        {
            id: "unit3",
            title: "Routing and Navigation",
            lessons: 2,
            duration: "45 mins",
            objectives: [
                "Configure routing in UI5.",
                "Implement navigation between views.",
            ],
            lectures: [
                { title: "Routing Configuration", completed: false },
                { title: "Navigation Patterns", completed: false },
            ],
        },
        {
            id: "unit4",
            title: "Consuming OData Services",
            lessons: 2,
            duration: "50 mins",
            objectives: [
                "Connect UI5 app to OData services.",
                "Perform CRUD operations using OData.",
            ],
            lectures: [
                { title: "OData Model in UI5", completed: false },
                { title: "CRUD Operations", completed: false },
            ],
        },
        {
            id: "unit5",
            title: "UI5 App Deployment",
            lessons: 1,
            duration: "30 mins",
            objectives: [
                "Build and deploy UI5 apps to SAP BTP.",
            ],
            lectures: [
                { title: "Deployment to SAP BTP", completed: false },
            ],
        },
    ];

    return (
        <Container>
            <MainNav />

            {/* Course Heading Section */}
            <section className="w-full max-w-6xl mx-auto mt-8 mb-2">
                <div className="flex flex-col">
                    <div className="flex items-center">
                        <span className="text-xl md:text-xl font-bold text-emerald-200 dark:text-white mr-4">4</span>
                        <div
                            className="flex-1 h-2 rounded"
                            style={{ backgroundColor: "#f9a8b4", maxWidth: 370 }}
                        ></div>
                    </div>
                    <h1 className="mt-4 text-xl md:text-xl font-bold text-gray-900 dark:text-white">
                        Beginners Guide to SAP UI5
                    </h1>
                </div>
            </section>

            {/* Hero Section */}
            <main className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 mt-8">
                {/* Left: Course Video Placeholder */}
                <div className="flex-1">
                    <div className="bg-emerald-500 dark:bg-emerald-300 rounded-xl overflow-hidden shadow flex items-center justify-center h-[220px] md:h-[340px]">
                        <div className="flex flex-col items-center justify-center w-full h-full">
                            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white/80 shadow-lg">
                                <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 48 48">
                                    <circle cx="24" cy="24" r="24" fill="#e0e7ef" />
                                    <polygon points="20,16 34,24 20,32" fill="#2563eb" />
                                </svg>
                            </div>
                            <span className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Course Introduction Video</span>
                        </div>
                    </div>
                </div>
                {/* Right: Course Details */}
                <aside className="flex-1 flex flex-col gap-6">
                    {/* Overview */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Overview</h2>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                            This course introduces SAP UI5, SAP&aopos;s framework for building modern web applications. You&aopos;ll learn the fundamentals, controls, data binding, routing, OData integration, and deployment to SAP BTP.
                        </p>
                    </div>
                    {/* Learning Objectives */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Learning objectives</h2>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 text-sm pl-4">
                            <li>Understand SAP UI5 architecture and setup</li>
                            <li>Build apps using UI5 controls and data binding</li>
                            <li>Implement routing and navigation</li>
                            <li>Integrate OData services</li>
                            <li>Deploy UI5 apps to SAP BTP</li>
                        </ul>
                    </div>
                    {/* Roles */}
                    <div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Roles</h2>
                        <div className="text-gray-700 dark:text-gray-300 text-sm">Developer, Consultant</div>
                    </div>
                    {/* Prerequisites */}
                    <div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Prerequisites</h2>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 text-sm pl-4">
                            <li>Basic knowledge of JavaScript and web development</li>
                            <li>Familiarity with HTML and CSS</li>
                            <li>Access to an SAP system or trial environment (recommended)</li>
                        </ul>
                    </div>
                    {/* Start Learning Button */}
                    <div>
                        <Link href={`/courses/abap-beginner-course/unit1-introduction`}>
                            <button className="bg-gray-100 hover:bg-gray-300 font-semibold px-5 py-2 rounded transition">
                                Start learning
                            </button>
                        </Link>
                    </div>
                </aside>
            </main>

            {/* Course Units Section */}
            <section className="w-full max-w-6xl mx-auto mt-10 mb-16">
                <Accordion type="multiple" className="space-y-6">
                    {courseUnits.map((unit, idx) => (
                        <AccordionItem
                            key={unit.id}
                            value={unit.id}
                            className="bg-gray-100 dark:bg-gray-900 rounded-2xl shadow px-6 py-6"
                        >
                            <AccordionTrigger className="flex items-center gap-4">
                                <div className="flex flex-col items-start gap-1 px-0 py-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">Unit {idx + 1}</span>
                                    </div>
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">{unit.title}</span>
                                    <span className="flex items-center gap-0 text-gray-500 dark:text-gray-400 text-sm">
                                        <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path d="M17 20H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2z" strokeWidth="2" />
                                            <path d="M9 10h6M9 14h6" strokeWidth="2" />
                                        </svg>
                                        {unit.lessons} Lessons
                                        <svg className="w-4 h-4 ml-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                            <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        {unit.duration}
                                    </span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="flex flex-col md:flex-row gap-8 mt-4">
                                    {/* Objectives */}
                                    <div className="flex-1">
                                        <div className="mb-2 text-gray-700 dark:text-gray-300 text-base">
                                            After completing this unit, you will be able to:
                                        </div>
                                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 text-sm pl-4">
                                            {unit.objectives.map((obj, i) => (
                                                <li key={i}>{obj}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    {/* Lectures/Progress */}
                                    <div className="flex-1 flex flex-col gap-2">
                                        {unit.lectures.map((lecture, lidx) => (
                                            <div key={lidx} className="flex items-center gap-2">
                                                {lecture.completed ? (
                                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                ) : (
                                                    <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                                                )}
                                                <span className={lecture.completed ? "text-base text-gray-700 dark:text-gray-300" : " text-base text-gray-700 dark:text-gray-300 "}>
                                                    {lecture.title}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-end mt-6">
                                    <Link href={`/courses/abap-beginner-course/unit1-introduction`}>
                                        <button className="bg-gray-100 hover:bg-gray-300 font-semibold px-5 py-2 rounded transition">
                                            Go to learning
                                        </button>
                                    </Link>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </section>
        </Container >
    );
}