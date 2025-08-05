import React, { useEffect, useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import Button from './ui/Button';

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
      <div className="text-lg">
        {loading ? 'Loading...' : error ? error : ip}
      </div>
      <Button className="flex items-center space-x-2" onClick={fetchIp}>
        <RefreshCcw className="w-4 h-4" />
        <span>Refresh</span>
      </Button>
    </div>
  );
}
