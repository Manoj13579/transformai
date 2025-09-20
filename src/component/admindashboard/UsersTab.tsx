"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exportToCsv } from "@/lib/exportToCsv";
import { Button } from "@/components/ui/button";
import axios from "axios";
import toast from "react-hot-toast";

interface User {
  _id: string;
  email: string;
  createdAt: string;
}



interface UsersTabProps {
  query: string;
}

export default function UsersTab({ query }: UsersTabProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [deleteButtonDisabled, setDeleteButtonDisabled] = useState(false);

  // Pagination states
  // Tracks the current page number (defaults to 1).
  const [currentPage, setCurrentPage] = useState(1);
  // Will store how many pages exist (based on API data).
  const [totalPages, setTotalPages] = useState(1);
  // Fixed number of users per page (10).
  const pageSize = 10;
console.log('users',users);

  const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/admindashboard/users-tab?page=${currentPage}&limit=${pageSize}&query=${query}`);
         if(response.data.success) {
           const data = response.data.data;
           setUsers(data.users);
           setTotalPages(data.totalPages);
         }
      } catch (error: any) {
        if (error.response?.status === 403) {
          toast.error(error.response.data.message);
        }
        else {
          toast.error("Failed to fetch users");
          console.error("Error fetching users in UsersTab in admindashboard", error);
        }
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, query]);// run this when next page/ previous page is clicked or search is done

  const handleExport = () => {
    setButtonDisabled(true);
    exportToCsv("users.csv", users); // export only current page
    setButtonDisabled(false);
  };

const handleDelete = (_id: string) => async () => {
  setDeleteButtonDisabled(true);
  try {
 const response = await axios.delete(`/api/admindashboard/users-tab`, {data: {_id }, withCredentials: true});
        if (response.data.success) {
      fetchUsers();
      toast.success("User deleted successfully");
    }
  } catch (error: any) {
    if (error.response?.status === 403 || error.response?.status === 404) {
      toast.error(error.response.data.message);
    } else {
    toast.error("Failed to delete user");
    console.error("Error deleting user in UsersTab in admindashboard", error);
    }
  }
    setDeleteButtonDisabled(false);
};

  if (loading) return <p>Loading users...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Button
            className={`cursor-pointer ${buttonDisabled ? "opacity-50" : ""}`}
            onClick={handleExport}
            disabled={buttonDisabled}
          >
            Export CSV
          </Button>
        </CardTitle>
      </CardHeader>

      <CardHeader>
        <CardTitle>Users</CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.email}</TableCell>
                <TableCell><Button variant="destructive" className="h-6 px-2 text-xs" onClick={handleDelete(user._id)} disabled={deleteButtonDisabled}>Delete</Button></TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination controls */}
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}// sets the page to currentPage - 1, but never below 1
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}