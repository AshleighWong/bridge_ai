'use client'
import React, { useState } from 'react';

const DynamicQuiz: React.FC = () => {
  const [careerPath, setCareerPath] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!careerPath.trim()) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/quiz2generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ careerPath }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error('Error fetching message:', error);
      setError('Failed to load message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Career Path Info</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={careerPath}
          onChange={(e) => setCareerPath(e.target.value)}
          placeholder="Enter career path"
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded" disabled={loading}>
          {loading ? 'Loading...' : 'Get Info'}
        </button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
};

export default DynamicQuiz;