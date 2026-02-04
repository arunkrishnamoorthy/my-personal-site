import Container from "@/components/Container";
import { MainNav } from "@/components/ui/main-nav";
import Image from "next/image";
import clsx from "clsx";
import ContactForm from "@/components/ContactForm";
import Testimonials from "@/components/Testimonials";

// TimelineExperience component
function TimelineExperience() {
  const experiences = [
    {
      organization: "Aarini Consulting",
      title: "SAP Consultant",
      type: "Full-time",
      period: "Mar 2022 – Present · 3 yrs 4 mos",
      location: "Utrecht, Netherlands",
      skills: ["BTP", "UI5", "Fiori Elements", "Cloud Application Programming", "Restful ABAP Programming"],
    },
    {
      organization: "S P A Enterprise Services Ltd.",
      title: "Independent Consultant",
      type: "Freelance",
      period: "Jan 2020 – Mar 2022 · 2 yrs 3 mos",
      location: "India · Remote",
      skills: ["UI5", "Fiori Elements", "ABAP CDS", "BOPF", "Core ABAP"],
      description: [
        "Worked as a freelance consultant for VWorks, Bangalore and SPAPLC, Hyderabad.",
      ],
    },
    {
      organization: "ITC Infotech",
      title: "Lead Consultant",
      type: "",
      period: "Sep 2018 – Jan 2020 · 1 yr 5 mos",
      location: "Bangalore",
      skills: ["UI5", "Fiori Elements", "CPI", "Ariba", "C4C"],
    },
    {
      organization: "DXC Technology",
      title: "Professional 1",
      type: "",
      period: "Jan 2017 – Sep 2018 · 1 yr 9 mos",
      location: "Bangalore",
      skills: ["UI5", "Fiori Elements", "OData", "ABAP CDS", "BOPF"],
    },
    {
      organization: "YASH Technologies",
      title: "Associate Consultant",
      type: "",
      period: "Aug 2013 – Jan 2017 · 3 yrs 6 mos",
      location: "",
      skills: ["UI5", "Fiori Elements", "OData", "Gateway Builder"],
      description: [
        "Worked for client SAP Labs India Pvt Ltd as part of Central support team, providing support and maintenance to projects delivered by SAP Labs.",
        "Integrated with the development team and developed artifacts to support the team.",
      ],
    },
    {
      organization: "Enteg Infotech Pvt Ltd",
      title: "Developer Trainee",
      type: "",
      period: "Apr 2012 – Jul 2013 · 1 yr 4 mos",
      location: "Bangalore",
      skills: ["Webdynpro ABAP", "ABAP", "Object Oriented Programming"],
      description: [
        "ABAP Consultant involved in the development of objects using ABAP, Webdynpro ABAP and ABAP Objects.",
      ],
    },
    {
      organization: "ICICI Securities",
      title: "Relationship Manager",
      type: "",
      period: "Jan 2011 – Apr 2011 · 4 mos",
      location: "",
      skills: ["Beginner", "Stock Broker"],
      description: [
        "Helped clients by providing knowledge on various investment options, life or medical benefits.",
        "Guided clients in trading in the share market.",
      ],
    },
  ];

  return (
    <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-4">
      {experiences.map((exp, idx) => (
        <div key={idx} className="mb-10 ml-6 relative">
          <span className="absolute -left-4 top-2 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-900"></span>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-semibold">{exp.title}</span>
            {exp.type && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {exp.type}
              </span>
            )}
            <span className="text-gray-600 dark:text-gray-400">
              {exp.period}
            </span>
          </div>
          <div className="text-gray-800 dark:text-gray-200 font-medium">
            {exp.organization}
          </div>
          {exp.location && (
            <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">
              {exp.location}
            </div>
          )}
          {/* Skills tokens */}
          <div className="flex flex-wrap gap-2 mb-1">
            {exp.skills &&
              exp.skills.map((skill, i) => (
                <span
                  key={i}
                  className="bg-emerald-100 text-emerald-800 dark:bg-emerald-700 dark:text-emerald-100 px-2 py-0.5 rounded-full text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
          </div>
          {exp.description && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {Array.isArray(exp.description)
                ? exp.description.map((item, i) => (
                  <div key={i}>{item}</div>
                ))
                : exp.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function About() {
  // Define the top skills array
  const topSkills = [
    "UI5",
    "Fiori Elements",
    "Cloud Application Programming Model",
    "Typescript",
    "ABAP",
    "RAP",
    "CAP",
    "React",
    "Next.js"
  ];

  return (
    <Container>
      <MainNav />

      {/* Background gradient for light mode */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-emerald-50/30 via-white to-white dark:from-background dark:via-background dark:to-background pointer-events-none"></div>

      <main className="flex flex-col items-start justify-between mt-16 md:flex-row">
        <div className="flex-1 pr-8">
          <div className="flex items-center mb-6">
            <Image
              src="/myphoto.jpeg"
              alt="Arun Krishnamoorthy"
              width={80}
              height={80}
              className="rounded-full border-2 border-gray-300 dark:border-gray-700"
            />
            <div className="ml-4">
              <h1 className="text-2xl font-bold">Arun Krishnamoorthy</h1>
              <p className="text-gray-600 dark:text-gray-400">
                SAP BTP Specialist & Full Stack Developer
              </p>
              <div className="flex space-x-3 mt-2">
                <a
                  href="https://www.linkedin.com/in/arun-krishnamoorthy-49263a35/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-medium flex items-center hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                >
                  LinkedIn
                </a>
                <a
                  href="https://github.com/arunkrishnamoorthy"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-xs font-medium flex items-center hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  GitHub
                </a>
                <a
                  href="mailto:arunmba.rec@gmail.com"
                  className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 px-3 py-1 rounded-full text-xs font-medium flex items-center hover:bg-red-200 dark:hover:bg-red-800 transition"
                >
                  Email
                </a>
              </div>
            </div>
          </div>
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">About Me</h2>
            <p className="text-gray-700 dark:text-gray-300">
              I am a passionate developer with over a decade of experience in
              building enterprise solutions, specializing in SAP BTP (Business
              Technology Platform), cloud-native applications, and modern web
              technologies. My journey spans architecting scalable systems, leading
              technical teams, and delivering impactful digital solutions for
              global clients.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Skills</h2>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
              <li>
                <span className="font-semibold">SAP Modules:</span> Professional Services, Sales and Distribution (SD), Materials Management (MM), Commercial Project Management (CPM)
              </li>
              <li>
                <span className="font-semibold">Tools:</span> SAP Business Application Studio, Visual Studio Code, Postman
              </li>
              <li>
                <span className="font-semibold">SAP Technology Stack:</span> ABAP, OO ABAP, Webdynpro ABAP, Fiori, UI5, RAP, CAP, Cloud SDK
              </li>
              <li>
                <span className="font-semibold">JavaScript Frameworks:</span> React, Next JS
              </li>
              <li>
                <span className="font-semibold">Programming Languages:</span> HTML, CSS3, JavaScript, Node JS, Typescript
              </li>
              <li>
                <span className="font-semibold">Standards and Frameworks:</span> SAP Mobile Services
              </li>
              <li>
                <span className="font-semibold">Databases:</span> SAP HANA
              </li>
              <li>
                <span className="font-semibold">Containers:</span> Docker, Dev Containers
              </li>
              <li>
                <span className="font-semibold">Git:</span> Basic understanding and ability to create Github Actions and workflows
              </li>
            </ul>
          </section>
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Certifications</h2>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
              <li>
                SAP Certified Associate - Implementation Consultant - SAP S/4HANA
                Cloud Public Edition - Sales
              </li>
              <li>
                SAP Certified Associate - SAP Build Work Zone - Implementation and
                Administration
              </li>
              <li>SAP Certified Associate - SAP Fiori Application Developer</li>
              <li>SAP Certified Professional - Solution Architect - SAP BTP</li>
              <li>
                SAP Certified Associate - Backend Developer - SAP Cloud Application
                Programming Model
              </li>
              <li>SAP Certified Associate - Back-End Developer - ABAP Cloud</li>
            </ul>
          </section>
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Key Achievements</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2 mt-1">🏆</span>
                Awarded Gladiator award in 2016 for my contributions from Yash
                Technologies Pinnacle Awards.
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2 mt-1">🏆</span>
                Awarded the Best Partner colleague during the 2016 RNR Event by SAP
                Labs.
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2 mt-1">🏆</span>
                Awarded Pole Star Award in 2015 for outstanding contribution in
                Daimler Project, SAP Labs during RNR Event.
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2 mt-1">🏆</span>
                Awarded Best Mentor of the year 2014 by Yash Technologies Pvt
                Ltd.
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2 mt-1">🏆</span>
                Awarded Spot award for contribution in Daimler UI5 Development
                (SAP Labs).
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2 mt-1">🏆</span>
                Part of BPW Team, which received the Best Constellation award
                during the RNR Event.
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2 mt-1">🏆</span>
                SAP NetWeaver Certified Associate 7.01.
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2 mt-1">🏆</span>
                Certified on different HANA and UX Strategy courses from Open SAP.
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2 mt-1">🏆</span>
                Recognized for contribution in 2018 to Cloud Integration Works at
                SAP Labs.
              </li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">Experience</h2>
            <TimelineExperience />
          </section>
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Roles and Responsibilities</h2>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>
                <span className="font-semibold">Full Stack SAP Development:</span> Designed and implemented end-to-end business applications using SAP CAP (Cloud Application Programming Model) and UI5/Fiori, leveraging both Node.js and TypeScript runtimes with HANA and Postgres databases.
              </li>
              <li>
                <span className="font-semibold">Custom Module & Workflow Creation:</span> Built custom modules such as Absence Planner and Timesheet, integrated with SAP BTP services (Application Logging, Job Scheduler, Alert Notification), and automated business processes using SAP Business Process Automation.
              </li>
              <li>
                <span className="font-semibold">Fiori Elements & Freestyle Apps:</span> Developed Fiori elements applications for master data, approvals, and reporting, as well as freestyle UI5 apps for specialized business needs and integrations with S/4HANA Public Cloud.
              </li>
              <li>
                <span className="font-semibold">Integration & Extensibility:</span> Integrated external services (DMS, OData, Adobe Forms), implemented custom OData middleware, and extended SAP Fiori apps with custom filters, actions, and multi-view support.
              </li>
              <li>
                <span className="font-semibold">DevOps & Documentation:</span> Configured and deployed MTA applications to BTP Cloud Foundry, documented CAP and UI projects using Swagger UI and Docisfy, and contributed to DevOps automation.
              </li>
              <li>
                <span className="font-semibold">Advanced SAP Programming:</span> Generated RAP services, CDS Views, and RFC modules for S/4HANA and C4C integration, supporting complex calculations and custom business processes.
              </li>
              <li>
                <span className="font-semibold">Innovation & AI:</span> Explored SAP AI Core and agent frameworks for automation, and created analytical reports (ALP) for business insights.
              </li>
              <li>
                <span className="font-semibold">Collaboration & Leadership:</span> Delivered solutions for global clients (H&M, Oxya, Ordina, Kaust, Vitens), led technical implementation, and ensured alignment with customer requirements and SAP best practices.
              </li>
            </ul>
          </section>

        </div>
        <aside className="w-full md:w-1/3 mt-10 md:mt-0">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold mb-2">Profile</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <span className="font-semibold">Location:</span> Amsterdam,
              Netherlands.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <span className="font-semibold">Languages:</span> English, Tamil
            </p>
            <div>
              <span className="font-semibold">Top Skills:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {topSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-emerald-100 text-emerald-800 dark:bg-emerald-700 dark:text-emerald-100 px-2 py-0.5 rounded-full text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <Testimonials />
          <ContactForm />
        </aside>
      </main>
    </Container>
  );
}