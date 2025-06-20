"use client";

import { Plus, MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { getFilteredRowModel, getSortedRowModel } from "@tanstack/react-table";
import Link from "next/link";
import React, { useMemo, useState, useEffect } from "react";
import DataTable, { createColumnHelper, useTable } from "@/components/DataTable";
import MainLayout from "@/components/layouts/Main";
import { Button } from "@/components/ui/button";
import Placeholder from "@/components/Placeholder";
import { formatDate } from "@/utils/time";

interface SupportTicket {
  id: string;
  subject: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  emailFrom: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessage: string;
  messageCount: number;
}

const statusNames = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
} as const;

const priorityNames = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
} as const;

const placeholderTickets: SupportTicket[] = [
  {
    id: "1",
    subject: "Unable to approve invoices",
    status: "open",
    priority: "high",
    emailFrom: "john.doe@company.com",
    createdAt: new Date("2024-12-19T10:30:00Z"),
    updatedAt: new Date("2024-12-19T14:15:00Z"),
    lastMessage: "I'm getting an error when trying to approve multiple invoices at once.",
    messageCount: 3,
  },
  {
    id: "2",
    subject: "Question about equity calculations",
    status: "in_progress",
    priority: "medium",
    emailFrom: "sarah.smith@startup.io",
    createdAt: new Date("2024-12-18T09:15:00Z"),
    updatedAt: new Date("2024-12-19T11:30:00Z"),
    lastMessage: "Thanks for the explanation. Could you clarify the vesting schedule?",
    messageCount: 7,
  },
  {
    id: "3",
    subject: "Bank account verification issues",
    status: "resolved",
    priority: "urgent",
    emailFrom: "finance@techcorp.com",
    createdAt: new Date("2024-12-17T16:45:00Z"),
    updatedAt: new Date("2024-12-18T10:20:00Z"),
    lastMessage: "Perfect! The verification went through successfully.",
    messageCount: 5,
  },
  {
    id: "4",
    subject: "How to set up contractor payments?",
    status: "closed",
    priority: "low",
    emailFrom: "hr@newstartup.com",
    createdAt: new Date("2024-12-16T13:20:00Z"),
    updatedAt: new Date("2024-12-17T09:45:00Z"),
    lastMessage: "Thank you for the detailed guide! This was very helpful.",
    messageCount: 4,
  },
  {
    id: "5",
    subject: "Document signing not working",
    status: "open",
    priority: "medium",
    emailFrom: "legal@techfirm.co",
    createdAt: new Date("2024-12-19T08:00:00Z"),
    updatedAt: new Date("2024-12-19T08:00:00Z"),
    lastMessage: "The DocuSeal integration seems to be failing when I try to sign contracts.",
    messageCount: 1,
  },
];

const StatusIcon = ({ status }: { status: SupportTicket["status"] }) => {
  switch (status) {
    case "open":
      return <AlertCircle className="size-4 text-red-500" />;
    case "in_progress":
      return <Clock className="size-4 text-yellow-500" />;
    case "resolved":
    case "closed":
      return <CheckCircle className="size-4 text-green-500" />;
  }
};

export default function SupportPage() {
  const [data, setData] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch("/api/support");
        const result: unknown = await response.json();

        if (result && typeof result === "object" && !Array.isArray(result)) {
          const resultObj = result;
          const tickets = "tickets" in resultObj ? resultObj.tickets : undefined;

          if (Array.isArray(tickets)) {
            setData(
              tickets.map((ticket: unknown) => {
                if (ticket && typeof ticket === "object" && !Array.isArray(ticket)) {
                  const ticketObj = ticket;
                  const getId = (obj: object): string => ("id" in obj && typeof obj.id === "string" ? obj.id : "");
                  const getSubject = (obj: object): string =>
                    "subject" in obj && typeof obj.subject === "string" ? obj.subject : "";
                  const getStatus = (obj: object): "open" | "in_progress" | "resolved" | "closed" => {
                    if ("status" in obj && typeof obj.status === "string") {
                      const validStatuses = ["open", "in_progress", "resolved", "closed"] as const;
                      const isValidStatus = (s: string): s is "open" | "in_progress" | "resolved" | "closed" =>
                        validStatuses.some((status) => status === s);
                      return isValidStatus(obj.status) ? obj.status : "open";
                    }
                    return "open";
                  };
                  const getPriority = (obj: object): "low" | "medium" | "high" | "urgent" => {
                    if ("priority" in obj && typeof obj.priority === "string") {
                      const validPriorities = ["low", "medium", "high", "urgent"] as const;
                      const isValidPriority = (p: string): p is "low" | "medium" | "high" | "urgent" =>
                        validPriorities.some((priority) => priority === p);
                      return isValidPriority(obj.priority) ? obj.priority : "medium";
                    }
                    return "medium";
                  };
                  const getEmailFrom = (obj: object): string =>
                    "emailFrom" in obj && typeof obj.emailFrom === "string" ? obj.emailFrom : "";
                  const getCreatedAt = (obj: object): Date =>
                    "createdAt" in obj && typeof obj.createdAt === "string" ? new Date(obj.createdAt) : new Date();
                  const getUpdatedAt = (obj: object): Date =>
                    "updatedAt" in obj && typeof obj.updatedAt === "string" ? new Date(obj.updatedAt) : new Date();
                  const getLastMessage = (obj: object): string =>
                    "lastMessage" in obj && typeof obj.lastMessage === "string" ? obj.lastMessage : "";
                  const getMessageCount = (obj: object): number =>
                    "messageCount" in obj && typeof obj.messageCount === "number" ? obj.messageCount : 0;

                  return {
                    id: getId(ticketObj),
                    subject: getSubject(ticketObj),
                    status: getStatus(ticketObj),
                    priority: getPriority(ticketObj),
                    emailFrom: getEmailFrom(ticketObj),
                    createdAt: getCreatedAt(ticketObj),
                    updatedAt: getUpdatedAt(ticketObj),
                    lastMessage: getLastMessage(ticketObj),
                    messageCount: getMessageCount(ticketObj),
                  };
                }
                return {
                  id: "",
                  subject: "",
                  status: "open" as const,
                  priority: "medium" as const,
                  emailFrom: "",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  lastMessage: "",
                  messageCount: 0,
                };
              }),
            );
          }
        }
      } catch (_error) {
        setData(placeholderTickets);
      } finally {
        setLoading(false);
      }
    };

    void fetchTickets();
  }, []);

  const columnHelper = createColumnHelper<SupportTicket>();
  const columns = useMemo(
    () => [
      columnHelper.simple("subject", "Subject", (subject) => <div className="font-medium">{subject}</div>),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          return (
            <div className="flex items-center gap-2">
              <StatusIcon status={status} />
              <span>{statusNames[status]}</span>
            </div>
          );
        },
        meta: {
          filterOptions: Object.values(statusNames),
        },
      }),
      columnHelper.accessor("priority", {
        header: "Priority",
        cell: (info) => {
          const priority = info.getValue();
          return (
            <span
              className={`rounded-sm px-2 py-1 text-xs font-medium ${
                priority === "urgent"
                  ? "bg-red-100 text-red-800"
                  : priority === "high"
                    ? "bg-orange-100 text-orange-800"
                    : priority === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
              }`}
            >
              {priorityNames[priority]}
            </span>
          );
        },
        meta: {
          filterOptions: Object.values(priorityNames),
        },
      }),
      columnHelper.simple("emailFrom", "From"),
      columnHelper.simple(
        "messageCount",
        "Messages",
        (count) => <span className="tabular-nums">{count}</span>,
        "numeric",
      ),
      columnHelper.simple("updatedAt", "Last updated", formatDate),
      columnHelper.simple("createdAt", "Created", formatDate),
    ],
    [],
  );

  const table = useTable({
    columns,
    data,
    getRowId: (ticket) => ticket.id,
    initialState: {
      sorting: [{ id: "updatedAt", desc: true }],
    },
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableGlobalFilter: true,
  });

  return (
    <MainLayout
      title="Support"
      headerActions={
        <Button asChild variant="outline" size="small">
          <Link href="/support/new">
            <Plus className="size-4" />
            New ticket
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4">
        {loading ? (
          <div className="py-8 text-center">Loading support tickets...</div>
        ) : data.length > 0 ? (
          <DataTable table={table} searchColumn="subject" />
        ) : (
          <Placeholder icon={MessageSquare}>No support tickets to display.</Placeholder>
        )}
      </div>
    </MainLayout>
  );
}
