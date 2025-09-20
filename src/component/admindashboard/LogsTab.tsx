"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";
import toast from "react-hot-toast";
// only eventType is required in models log.ts.
interface Log {
  _id: string;
  createdAt: string;
  userId?: string;
  userEmail?: string;
  eventType: string;
  level: string;
  details?: string;
  ip?: string;
  browser?: string;
}

export default function LogsTab() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchLogs = async (pageNum: number) => {
    try {
       const response = await axios.get(`/api/admindashboard/logstab?page=${pageNum}&limit=10`);
    if (response.data.success) {
      setLogs(response.data.data.logs);
      setPages(response.data.data.pages);
    }
    } catch (error: any) {
        if (error.response?.status === 403) {
          toast.error(error.response.data.message);
        }
        else {
          toast.error("Failed to fetch users");
          console.error("Error fetching logs in LogsTab in admindashboard", error);
        }
      }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-muted text-left">
                <th className="p-2">Timestamp</th>
                <th className="p-2">User</th>
                <th className="p-2">Event Type</th>
                <th className="p-2">Level</th>
                <th className="p-2">Details</th>
                <th className="p-2">ip</th>
                <th className="p-2">Browser</th>
              </tr>
            </thead>
            <tbody>
              {logs?.map((log) => (
                <tr key={log._id} className="border-b">
                  <td className="p-2">
                    {new Date(log.createdAt).toISOString().replace("T", " ").slice(0, 16)} UTC
                  </td>
                  <td className="p-2">
                    {log.userEmail || log.userId || "System"}
                  </td>
                  <td className="p-2">{log.eventType}</td>
                  <td className={`p-2 ${log.level === "Error" ? "text-red-500" : "text-blue-500"}`}>
                    {log.level}
                  </td>
                  <td className="p-2">{log.details || "-"}</td>
                  <td className="p-2">{log.ip || "-"}</td>
                  <td className="p-2">{log.browser || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span>
            Page {page} of {pages}
          </span>
          <Button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}>
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}