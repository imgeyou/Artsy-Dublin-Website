import "../styles/pages/team.css";

export default function TeamPage() {
    const teamMembers = [
        {
            id: 1,
            number: "01/",
            name: "GE YOU",
            role: "BACKEND",
            intro: "Worked on APIs, data flow, and backend logic.",
            location: "Based in Dublin",
            description: "Worked on core feature planning, posts, diary logs, comments, and event-related backend functions.",
            image: "https://github.com/imgeyou.png",
            links: [
                { label: "GitHub", url: "#" },
                { label: "LinkedIn", url: "#" },
                { label: "Email", url: "#" },
            ],
        },
        {
            id: 2,
            number: "02/",
            name: "SENGUL",
            role: "API / DATA",
            intro: "Led backend structure, API integration, branch coordination, and deployment planning.",
            location: "Based in Dublin",
            description:
                "Focused on API integration, events data structure, backend coordination, and deployment workflow.",
            image: "https://github.com/SengulC.png",
            links: [
                { label: "GitHub", url: "#" },
                { label: "LinkedIn", url: "#" },
                { label: "Email", url: "#" },
            ],
        },
        {
            id: 3,
            number: "03/",
            name: "ASTRID",
            role: "AUTH",
            intro: "Focused on user login, authentication flow, local server setup, and user-related backend features.",
            location: "Based in Dublin",
            description:
                "Focused on authentication, login systems, user setup, and account-related backend features.",
            image: "https://github.com/astridasi.png",
            links: [
                { label: "GitHub", url: "#" },
                { label: "LinkedIn", url: "#" },
                { label: "Email", url: "#" },
            ],
        },
        {
            id: 4,
            number: "04/",
            name: "EMMA",
            role: "UI / FRONTEND",
            intro: "Worked on wireframes, user pages, login and signup design, and frontend structure.",
            location: "Based in Dublin",
            description: "Focused on wireframes, user page design, and frontend layout for registration and profile flows.",
            image: "https://github.com/tianyisunn.png",
            links: [
                { label: "GitHub", url: "#" },
                { label: "LinkedIn", url: "#" },
                { label: "Email", url: "#" },
            ],
        },
        {
            id: 5,
            number: "05/",
            name: "BRIAN",
            role: "UI / FRONTEND",
            intro: "Worked on wireframes and frontend implementation for the homepage, event page, and event detail page.",
            location: "Based in Dublin",
            description:
                "Focused on frontend development, event page layout, and interface structure using mock data.",
            image: "https://github.com/borixiao.png",
            links: [
                { label: "GitHub", url: "#" },
                { label: "LinkedIn", url: "#" },
                { label: "Email", url: "#" },
            ],
        },
        {
            id: 6,
            number: "06/",
            name: "KRYSTYNA",
            role: "INTERACTION",
            intro: "Worked on interaction planning, diary and comment features, and messaging-related functionality.",
            location: "Based in Dublin",
            description: "Focused on interaction planning, comment features, diary systems, and messaging-related ideas.",
            image: "https://github.com/mikavak1.png",
            links: [
                { label: "GitHub", url: "#" },
                { label: "LinkedIn", url: "#" },
                { label: "Email", url: "#" },
            ],
        },
    ];

    return (
        <main className="team-slider">
            <div className="team-slider__track">
                {teamMembers.map((member) => (
                    <section className="team-slide" key={member.id}>
                        <div className="team-slide__inner">
                            <header className="team-topbar">
                                <div className="team-logo">Artsy Dublin</div>

                                <nav className="team-nav">
                                    <a href="/#works">Works</a>
                                    <a href="/about">About</a>
                                    <a href="/contact">Contact</a>
                                </nav>

                                <div className="team-links">
                                    {member.links.map((link) => (
                                        <a key={link.label} href={link.url}>
                                            {link.label}
                                        </a>
                                    ))}
                                </div>
                            </header>

                            <div className="team-layout">
                                <aside className="team-side">
                                    <p className="team-number">{member.number}</p>
                                    <p className="team-intro">{member.intro}</p>
                                </aside>

                                <section className="team-main">
                                    <div className="team-role-wrap">
                                        <h1 className="team-role">{member.role}</h1>
                                    </div>

                                    <div className="team-image-wrap">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="team-image"
                                        />
                                    </div>

                                    <div className="team-bottom">
                                        <div className="team-name-wrap">
                                            <h2 className="team-name">{member.name}</h2>
                                        </div>

                                        <div className="team-arrow">→</div>

                                        <div className="team-info">
                                            <p className="team-location">{member.location}</p>
                                            <p className="team-description">{member.description}</p>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <footer className="team-footer">
                                <p>© 2026 Artsy Dublin</p>
                                <p>
                                    {member.id} / {teamMembers.length}
                                </p>
                            </footer>
                        </div>
                    </section>
                ))}
            </div>
        </main>
    );
}