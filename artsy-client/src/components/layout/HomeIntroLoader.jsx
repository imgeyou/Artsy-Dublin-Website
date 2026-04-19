import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/components/HomepageLoader.css";

const burstLayout = [
    { x: -280, y: -120, r: -8, w: 92, h: 120 },
    { x: 260, y: -170, r: 7, w: 86, h: 112 },
    { x: -380, y: 20, r: 3, w: 108, h: 142 },
    { x: 0, y: 40, r: -4, w: 112, h: 150 },
    { x: 330, y: 40, r: -2, w: 96, h: 66 },
    { x: 260, y: 180, r: 1, w: 136, h: 180 },
    { x: -300, y: 210, r: -6, w: 96, h: 126 },
];

export default function HomeIntroLoader({
    events = [],
    onFinish,
    playIntro = true,
    titleTop = "ARTSY DUBLIN",
    titleMiddle = "FIND YOUR",
    titleBottom = "NEXT EVENT",
}) {
    const [phase, setPhase] = useState(playIntro ? "shuffle" : "settled");
    const [centerIndex, setCenterIndex] = useState(0);
    const navigate = useNavigate();

    const posterEvents = useMemo(() => {
        const validEvents = events.filter(
            (event) => event?.posterUrl && event?.eventId !== undefined && event?.eventId !== null
        );

        const uniqueEvents = validEvents.filter(
            (event, index, arr) =>
                index === arr.findIndex((item) => item.posterUrl === event.posterUrl)
        );

        return uniqueEvents.length
            ? uniqueEvents
            : [
                { eventId: "fallback-1", posterUrl: "https://via.placeholder.com/300x420?text=Artsy+1" },
                { eventId: "fallback-2", posterUrl: "https://via.placeholder.com/300x420?text=Artsy+2" },
                { eventId: "fallback-3", posterUrl: "https://via.placeholder.com/300x420?text=Artsy+3" },
                { eventId: "fallback-4", posterUrl: "https://via.placeholder.com/300x420?text=Artsy+4" },
            ];
    }, [events]);

    const burstPosters = useMemo(() => {
        return burstLayout.map((item, i) => {
            const event = posterEvents[i % posterEvents.length];
            return {
                ...item,
                eventId: event.eventId,
                src: event.posterUrl,
                title: event.title ?? `Event ${i + 1}`,
                delay: i * 90,
            };
        });
    }, [posterEvents]);

    useEffect(() => {
        if (!playIntro) {
            setPhase("settled");
            return;
        }

        if (phase !== "shuffle") return;

        const shuffleTimer = setInterval(() => {
            setCenterIndex((prev) => (prev + 1) % posterEvents.length);
        }, 95);

        return () => clearInterval(shuffleTimer);
    }, [phase, posterEvents.length, playIntro]);

    useEffect(() => {
        if (!playIntro) {
            setPhase("settled");
            return;
        }

        const t1 = setTimeout(() => setPhase("title"), 1300);
        const t2 = setTimeout(() => setPhase("burst"), 2300);
        const t3 = setTimeout(() => setPhase("settled"), 3400);
        const t4 = setTimeout(() => {
            onFinish?.();
        }, 3600);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
        };
    }, [playIntro, onFinish]);

    return (
        <section className={`home-intro-loader phase-${phase}`}>
            <div className="home-intro-loader__stage">
                <div className="home-intro-loader__center-line" />

                <button
                    type="button"
                    className={`home-intro-loader__center-card ${phase !== "shuffle" ? "is-hidden" : ""}`}
                    onClick={() => navigate(`/events/${posterEvents[centerIndex].eventId}`)}
                    aria-label={`Open ${posterEvents[centerIndex].title || "event"} details`}
                >
                    <img
                        src={posterEvents[centerIndex].posterUrl}
                        alt={posterEvents[centerIndex].title || "Event poster preview"}
                        className="home-intro-loader__center-image"
                    />
                </button>

                <div
                    className={`home-intro-loader__headline ${phase === "title" || phase === "burst" || phase === "settled"
                        ? "is-visible"
                        : ""
                        }`}
                >
                    <div className="home-intro-loader__headline-top">{titleTop}</div>
                    <div className="home-intro-loader__headline-middle">{titleMiddle}</div>
                    <div className="home-intro-loader__headline-bottom">{titleBottom}</div>

                    <p className="home-intro-loader__subcopy">
                        Discover music, theatre, film, comedy and more across Dublin
                    </p>
                </div>

                {/* <div
                    className={`home-intro-loader__burst-center ${phase === "burst" || phase === "settled" ? "is-visible" : ""
                        }`}
                >
                    <img
                        src={posters[(centerIndex + 1) % posters.length]}
                        alt="Featured poster"
                    />
                </div> */}

                {burstPosters.map((poster, index) => (
                    <button
                        type="button"
                        key={`${poster.eventId}-${index}`}
                        className={`home-intro-loader__burst-poster ${phase === "burst" || phase === "settled" ? "is-visible" : ""}`}
                        style={{
                            "--x": `${poster.x}px`,
                            "--y": `${poster.y}px`,
                            "--r": `${poster.r}deg`,
                            "--w": `${poster.w}px`,
                            "--h": `${poster.h}px`,
                            "--delay": `${poster.delay}ms`,
                        }}
                        onClick={() => navigate(`/events/${poster.eventId}`)}
                        aria-label={`Open ${poster.title || "event"} details`}
                    >
                        <img src={poster.src} alt={poster.title || `Event poster ${index + 1}`} />
                    </button>
                ))}

                <div
                    className={`home-intro-loader__scroll-hint ${phase === "settled" ? "is-visible" : ""
                        }`}
                >
                    Scroll to explore
                </div>
            </div>
        </section>
    );
}