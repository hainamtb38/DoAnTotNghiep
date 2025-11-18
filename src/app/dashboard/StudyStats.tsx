"use client";
import { useEffect, useState } from "react";

export default function StudyStats({ refreshKey }: { refreshKey: number }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = () => {
    setLoading(true);
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      setStats(null);
      setLoading(false);
      return;
    }
    const user = JSON.parse(userStr);
    fetch(`/api/stats?userId=${user.id || user._id}`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  if (!stats) return null;

  return null;
}
