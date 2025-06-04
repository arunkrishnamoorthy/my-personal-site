"use client";

export default function Testimonials() {
  const testimonials = [
    {
      quote:
        "Arun is an exceptional SAP developer with deep expertise in BTP and Fiori. His solutions are always robust and innovative.",
      author: "Priya S., SAP Project Manager",
    },
    {
      quote:
        "Working with Arun was a pleasure. He consistently delivered high-quality work and was always willing to help the team.",
      author: "Michael T., Full Stack Developer",
    },
    {
      quote:
        "Arun’s technical leadership and problem-solving skills are outstanding. He played a key role in the success of our SAP projects.",
      author: "Sven K., Solution Architect",
    },
  ];

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 shadow mt-6">
      <h3 className="text-lg font-semibold mb-4">Testimonials</h3>
      <div className="space-y-4">
        {testimonials.map((t, idx) => (
          <blockquote key={idx} className="border-l-4 border-emerald-400 pl-4 italic text-gray-700 dark:text-gray-200">
            “{t.quote}”
            <footer className="mt-2 text-xs text-emerald-700 dark:text-emerald-200 font-semibold">— {t.author}</footer>
          </blockquote>
        ))}
      </div>
    </div>
  );
}