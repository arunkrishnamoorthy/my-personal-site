import Link from "next/link";

export default function NotFound() {
    return (
        <section className="grid place-content-center h-screen">
            <h1 className="mb-8 text-2xl font-semibold tracking-tighter">404-Page Not Found</h1>
            <p className="mb-4">The page you are looking for does not exists</p>
            <Link href={"/"}>Go Home</Link>
        </section>
    )
}