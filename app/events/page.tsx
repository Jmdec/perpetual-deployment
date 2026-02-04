"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch events from the backend
    const fetchEvents = async () => {
      try {
        const response = await axios.get('/api/events');
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleResponse = async (eventId, response) => {
    try {
      await axios.post(`/api/events/${eventId}/response`, { response });
      alert(`You have ${response} the event.`);
    } catch (error) {
      console.error('Error responding to event:', error);
      alert('Failed to respond to the event.');
    }
  };

  if (loading) return <p>Loading events...</p>;

  return (
    <div>
      <h1>Upcoming College Events</h1>
      {events.length === 0 ? (
        <p>No events available.</p>
      ) : (
        <ul>
          {events.map((event) => (
            <li key={event.id}>
              <h2>{event.title}</h2>
              <p>{event.description}</p>
              <p>Date: {event.date}</p>
              <p>Time: {event.time}</p>
              <p>Location: {event.location}</p>
              <button onClick={() => handleResponse(event.id, 'accepted')}>Accept</button>
              <button onClick={() => handleResponse(event.id, 'declined')}>Decline</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EventsPage;