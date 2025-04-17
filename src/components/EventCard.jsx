import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Calendar, Clock, MapPin } from 'lucide-react';
import '../styles/Calendar.css'
import dayjs from 'dayjs';
import { format } from "date-fns";

const EventCard = ({ event, index }) => {
    const [isHovered, setIsHovered] = useState(false);
    const cardRef = useRef(null);
    const expandedRef = useRef(null);
    const [position, setPosition] = useState({ top: 'auto', left: 'auto', right: 'auto' });

    // Format time from ISO string
    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    // Format time range
    const formatTimeRange = (startIso, endIso) => {
        return `${formatTime(startIso)} - ${formatTime(endIso)}`;
    };

    // Get event number (for display purposes)
    const getEventNumber = (title) => {
        if (title.includes('BOS')) {
            return '8th';
        }
        if (title.includes('Grievance')) {
            return 'Monthly';
        }
        if (title.includes('Academic')) {
            return 'Weekly';
        }
        return '';
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const eventNumber = getEventNumber(event.title);
    const timeRange = formatTimeRange(event.start, event.end);
    const eventDate = new Date(event.start);
    const formattedDate = `${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][eventDate.getDay()]},${eventDate.getDate()} ${monthNames[eventDate.getMonth()]},${eventDate.getFullYear()}`;

    useEffect(() => {
        if (isHovered && cardRef.current && expandedRef.current) {
            const cardRect = cardRef.current.getBoundingClientRect();
            const expandedRect = expandedRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let newPosition = { top: 'auto', left: 'auto', right: 'auto' };

            // Check if expanded card would go beyond right edge
            if (cardRect.right + expandedRect.width > viewportWidth) {
                newPosition.right = '0';
            } else {
                newPosition.left = '100%';
            }

            // Check if expanded card would go beyond bottom edge
            if (cardRect.bottom + expandedRect.height > viewportHeight) {
                newPosition.top = 'auto';
                newPosition.bottom = '0';
            } else {
                newPosition.top = '0';
            }

            setPosition(newPosition);
        }
    }, [isHovered]);

    return (
        <div
            ref={cardRef}
            className={`calendar-event-item ${event.color}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Compact view (always visible) */}
            <div className="calendar-event-compact">
                {event.title}
                <div>{format(new Date(event.start), "h:mm a")} - {format(new Date(event.end), "h:mm a")}</div>

            </div>

            {/* Expanded view (visible on hover) */}
            {isHovered && (
                <div
                    ref={expandedRef}
                    className="calendar-event-expanded"
                    style={{
                        position: 'absolute',
                        ...position,
                        zIndex: 1000,
                        minWidth: '300px',
                        maxWidth: '400px'
                    }}
                >
                    <div className="event-title">{eventNumber} {event.title}</div>

                    <div className="event-meta">
                        <div className="meta-item">
                            <Calendar size={16} />
                            {formattedDate}
                        </div>
                        <div className="meta-item">
                            <Clock size={16} />
                            {event.duration}
                        </div>
                        <div className="meta-item">
                            <MapPin size={16} />
                            {event.location}
                        </div>
                    </div>

                    <div className="event-description">
                        {event.description}
                    </div>

                    <div className="event-host">
                        <div className="host-avatar">
                            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Host" />
                        </div>
                        <div className="host-name">
                            <span className="host-label">HOST : </span>
                            <span className="host-value">{event.host_name}</span>
                        </div>
                    </div>

                    <div className="event-deadline">
                        Deadline: 6 Days Left
                    </div>

                    <div className="event-priority">
                        <div className="priority-dot"></div>
                        {event.priority}
                    </div>
                </div>
            )}
        </div>
    );
};

EventCard.propTypes = {
    event: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        start: PropTypes.string.isRequired,
        end: PropTypes.string.isRequired,
        color: PropTypes.oneOf(['blue', 'green', 'purple', 'orange', 'gray']).isRequired,
        description: PropTypes.string,
        location: PropTypes.string,
        host: PropTypes.string,
        priority: PropTypes.oneOf(['high', 'medium', 'low']),
        deadline: PropTypes.string
    }).isRequired,
    index: PropTypes.number.isRequired
};

export default EventCard;