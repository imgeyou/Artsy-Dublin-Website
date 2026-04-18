import { Link } from "react-router-dom";

export default function AnimatedTextLink({ to, text, className = "" }) {
    return (
        <Link to={to} className={`slot-link ${className}`}>
            {text.split("").map((char, index) => {
                const safeChar = char === " " ? "\u00A0" : char;
                const shouldAnimate = index % 2 === 1; // 只有偶數位置動

                return (
                    <span key={`${char}-${index}`} className="slot-link__char-wrap">
                        {shouldAnimate ? (
                            <span className="slot-link__char-slot is-animated">
                                <span className="slot-link__char slot-link__char--default">
                                    {safeChar}
                                </span>
                                <span className="slot-link__char slot-link__char--accent">
                                    {safeChar}
                                </span>
                            </span>
                        ) : (
                            <span className="slot-link__char slot-link__char--default slot-link__char--static">
                                {safeChar}
                            </span>
                        )}
                    </span>
                );
            })}
        </Link>
    );
}