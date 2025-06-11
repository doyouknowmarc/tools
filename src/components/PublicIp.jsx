import React, { useEffect, useState } from 'react';
import { RefreshCcw } from 'lucide-react';

export default function PublicIp() {
  const [ip, setIp] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchIp = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      setIp(data.ip);
      setError(null);
    } catch (err) {
      setError('Failed to fetch IP');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIp();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="text-gray-700 text-lg">
        {loading ? 'Loading...' : error ? error : ip}
      </div>
      <button
        className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        onClick={fetchIp}
      >
        <RefreshCcw className="w-4 h-4" />
        <span>Refresh</span>
      </button>
    </div>
  );
}
