'use client'
import React, { useState } from 'react';

export default function JobScraperTrigger() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleScrape = async () => {
    setIsLoading(true);
    setResult('');
    setError('');
    try {
      const response = await fetch('/api/scrape');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setResult(data.message);
    } catch (error) {
      setError('An error occurred while scraping. Please check the console for more details.');
      console.error('Scraping error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Job Description Scraper</h1>
      <button
        onClick={handleScrape}
        disabled={isLoading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {isLoading ? 'Scraping...' : 'Start Scraping'}
      </button>
      {result && (
        <p className="mt-4 p-2 bg-green-100 text-green-700 rounded">
          {result}
        </p>
      )}
      {error && (
        <p className="mt-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </p>
      )}
      {isLoading && (
        <p className="mt-2 text-gray-600">
          Scraping is in progress. This may take several minutes. Check your server console for real-time updates.
        </p>
      )}
    </div>
  );
}