import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { Prisma, Exam, Subject, Suser, User } from "@prisma/client";
import Image from "next/image";
import { ITEM_PER_PAGE } from "@/lib/settings";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type ExamList = Exam & { subject?: Subject };

const ExamListPage = async ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role as "admin" | "suser" | "user" || "user";
  const currentUserId = session?.user?.nic;

  // Define table columns dynamically based on role
  const columns = [
    { header: "Exam Name", accessor: "name" },
    { header: "Subject", accessor: "subject", className: "hidden md:table-cell" },
    { header: "Date", accessor: "date", className: "hidden md:table-cell" },
    { header: "Day", accessor: "day", className: "hidden md:table-cell" },
    ...(role === "admin"
      ? [{ header: "Actions", accessor: "action" }]
      : []),
  ];

  // Render table rows
  const renderRow = (exam: ExamList) => (
    <tr key={exam.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="p-4">{exam.name}</td>
      <td className="hidden md:table-cell">{exam.subject?.name || "-"}</td>
      <td className="hidden md:table-cell">{new Date(exam.date).toLocaleDateString()}</td>
      <td className="hidden md:table-cell">{exam.Day}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/exams/${exam.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="View" width={16} height={16} />
            </button>
          </Link>
          {role === "admin" && (
            <>
              <FormContainer table="exam" type="update" data={exam} />
              <FormContainer table="exam" type="delete" id={exam.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // Query conditions
  const query: Prisma.ExamWhereInput = {};

  if (queryParams.search) {
    query.OR = [
      { name: { contains: queryParams.search, mode: "insensitive" } },
      { subject: { name: { contains: queryParams.search, mode: "insensitive" } } },
    ];
  }

  // Role-based filtering
  if (role === "suser") {
    query.susers = { some: { NIC: currentUserId } };
  } else if (role === "user") {
    query.users = { some: { NIC: currentUserId } };
  }

  // Fetch exams and count using Prisma transaction
  const [data, count] = await prisma.$transaction([
    prisma.exam.findMany({
      where: query,
      include: { subject: true },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.exam.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Exams</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
            {role === "admin" && <FormContainer table="exam" type="create" />}
          </div>
        </div>
      </div>

      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default ExamListPage;
