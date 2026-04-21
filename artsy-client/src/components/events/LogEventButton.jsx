// Two-step: pick attendance date → log → unlock Write a Review

import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faCalendarCheck, faXmark, faSpinner } from "@fortawesome/free-solid-svg-icons";

function LogEventButton({ eventId, dbUser, eventDates = [], onAttendChange, onLoginRequired }) {
    const wrapperRef = useRef(null);

    const [eventAttendId, setEventAttendId] = useState(null);
    const [loadingStatus, setLoadingStatus] = useState(true);
    const [showPicker, setShowPicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [logging, setLogging] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState(null);

    // Check if user already logged this event
    useEffect(() => {
        if (!dbUser) { setLoadingStatus(false); return; }
        async function checkAttendance() {
            try {
                const res = await fetch(`/ad-posts/${eventId}/attend`, { credentials: "include" });
                if (res.ok) {
                    const data = await res.json();
                    if (data?.eventAttendId) {
                        setEventAttendId(data.eventAttendId);
                        onAttendChange?.(data.eventAttendId, false);
                    }
                }
            } finally {
                setLoadingStatus(false);
            }
        }
        checkAttendance();
    }, [eventId, dbUser]);

    // Close picker when clicking outside
    useEffect(() => {
        if (!showPicker) return;
        function onOutside(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowPicker(false);
                setError(null);
            }
        }
        document.addEventListener("mousedown", onOutside);
        return () => document.removeEventListener("mousedown", onOutside);
    }, [showPicker]);

    async function handleConfirm() {
        if (!selectedDate) return;
        setLogging(true);
        setError(null);
        try {
            const res = await fetch(`/ad-posts/${eventId}/attend`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ attendedAt: selectedDate }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(typeof data?.error === "string" ? data.error : data?.message ?? "Failed to log attendance");
            setEventAttendId(data.eventAttendId);
            onAttendChange?.(data.eventAttendId, true);
            setShowPicker(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setLogging(false);
        }
    }

    async function handleCancel() {
        setCancelling(true);
        try {
            const res = await fetch(`/ad-posts/${eventAttendId}/attend`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to cancel");
            setEventAttendId(null);
            onAttendChange?.(null);
            setSelectedDate("");
        } catch (err) {
            setError(err.message);
        } finally {
            setCancelling(false);
        }
    }

    if (loadingStatus) return null;

    // Already attended — use display:contents so children sit directly in the
    // parent flex row without adding an extra flex container
    if (eventAttendId) {
        return (
            <div className="log-event--attended">
                <button className="btn btn-attendance is-active btn-12" onClick={handleCancel} disabled={cancelling} title="Cancel attendance">
                    <FontAwesomeIcon icon={cancelling ? faSpinner : faCheckCircle} spin={cancelling} />
                    <span>Attended</span>
                    <span className="log-event__cancel-x"><FontAwesomeIcon icon={faXmark} /></span>
                </button>
            </div>
        );
    }

    // Trigger button + floating picker — wrapper stays in flow, picker floats
    return (
        <div className="log-event__anchor" ref={wrapperRef}>
            <button
                className="btn btn-outline btn-12"
                onClick={() => dbUser ? setShowPicker((v) => !v) : onLoginRequired?.("Log in to record your attendance")}
            >
                <FontAwesomeIcon icon={faCalendarCheck} /><span>Log Attendance</span>
            </button>

            {showPicker && (
                <div className="log-event__picker">
                    <div className="log-event__picker-header">
                        <span>When did you attend?</span>
                        <button
                            className="log-event__close"
                            onClick={() => { setShowPicker(false); setError(null); }}
                            aria-label="Close"
                        >
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>

                    {eventDates.length > 0 ? (
                        <div className="log-event__date-list">
                            {eventDates.map((d) => {
                                const label = new Date(d).toLocaleString("en-GB", {
                                    weekday: "short", day: "2-digit",
                                    month: "short", hour: "2-digit", minute: "2-digit",
                                });
                                return (
                                    <button
                                        key={d}
                                        type="button"
                                        className={`log-event__date-option ${selectedDate === d ? "log-event__date-option--active" : ""}`}
                                        onClick={() => setSelectedDate(d)}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <input
                            type="date"
                            className="log-event__date-input"
                            value={selectedDate}
                            max={new Date().toISOString().split("T")[0]}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    )}

                    {error && <p className="log-event__error">{error}</p>}

                    <div className="log-event__picker-actions">
                        <button
                            className="btn btn-primary btn-12"
                            onClick={handleConfirm}
                            disabled={!selectedDate || logging}
                        >
                            {logging ? "Logging…" : "Confirm"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LogEventButton;
