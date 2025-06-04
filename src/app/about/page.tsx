import Container from "@/components/Container";
import { MainNav } from "@/components/ui/main-nav";
import Image from "next/image";

function Timeline() {
  const experiences = [
    {
      title: "SAP BTP Solution Architect",
      company: "Global IT Consulting Firm",
      period: "2018 - Present",
      description:
        "Leading SAP BTP projects, designing cloud-native architectures, and mentoring teams on modern SAP technologies.",
    },
    {
      title: "Full Stack Developer",
      company: "Enterprise Software Company",
      period: "2012 - 2018",
      description:
        "Developed enterprise web applications, integrated SAP systems, and contributed to open-source projects.",
    },
  ];

  return (
    <ol className="relative border-l border-gray-300 dark:border-gray-700 ml-2">
      {experiences.map((exp, idx) => (
        <li key={idx} className="mb-10 ml-6">
          <span className="absolute flex items-center justify-center w-4 h-4 bg-blue-600 rounded-full -left-2 ring-4 ring-white dark:ring-gray-900"></span>
          <h4 className="text-md font-semibold">{exp.title}</h4>
          <span className="block text-gray-600 dark:text-gray-400 text-sm mb-1">{exp.company}</span>
          <span className="block text-xs text-gray-500 mb-2">{exp.period}</span>
          <p className="text-gray-700 dark:text-gray-300">{exp.description}</p>
        </li>
      ))}
    </ol>
  );
}

export default function About() {
  return (
    <Container>
      <MainNav />
      <main className="flex flex-col items-start justify-between mt-16 md:flex-row">
        <div className="flex-1 pr-8">
          <div className="flex items-center mb-6">
            <Image
              src="/profile.jpg"
              alt="Arun Krishnamoorthy"
              width={80}
              height={80}
              className="rounded-full border-2 border-gray-300 dark:border-gray-700"
            />
            <div className="ml-4">
              <h1 className="text-2xl font-bold">Arun Krishnamoorthy</h1>
              <p className="text-gray-600 dark:text-gray-400">SAP BTP Specialist & Full Stack Developer</p>
              <div className="flex space-x-3 mt-2">
                <a
                  href="https://www.linkedin.com/in/arun-krishnamoorthy-49263a35/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="text-blue-600 hover:underline"
                >
                  LinkedIn
                </a>
                <a
                  href="https://github.com/arunkrishnamoorthy"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="text-gray-800 dark:text-gray-200 hover:underline"
                >
                  GitHub
                </a>
                <a
                  href="mailto:arunmba.rec@gmail.com"
                  className="text-red-600 hover:underline"
                >
                  Email
                </a>
              </div>
            </div>
          </div>
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">About Me</h2>
            <p className="text-gray-700 dark:text-gray-300">
              I am a passionate developer with over a decade of experience in building enterprise solutions, specializing in SAP BTP (Business Technology Platform), cloud-native applications, and modern web technologies. My journey spans architecting scalable systems, leading technical teams, and delivering impactful digital solutions for global clients.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Skills</h2>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
              <li>SAP BTP, SAP CAP, SAP Fiori/UI5</li>
              <li>Node.js, TypeScript, JavaScript</li>
              <li>React, Next.js, REST APIs</li>
              <li>Cloud Platforms: SAP BTP, AWS, Azure</li>
              <li>CI/CD, DevOps, Docker</li>
              <li>Agile Methodologies & Technical Leadership</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">Experience</h2>
            <Timeline />
          </section>
        </div>
        <aside className="w-full md:w-1/3 mt-10 md:mt-0">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold mb-2">Profile</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <span className="font-semibold">Location:</span> Chennai, India
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <span className="font-semibold">Languages:</span> English, Tamil
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Interests:</span> Cloud Computing, Open Source, Blogging, Mentoring
            </p>
          </div>
        </aside>
      </main>
    </Container>
  );
}