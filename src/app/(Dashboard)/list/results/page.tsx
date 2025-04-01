import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { Prisma, result } from "@prisma/client";
import Image from "next/image";
import { ITEM_PER_PAGE } from "@/lib/settings";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


const session = await getServerSession(authOptions);
const role = session?.user?.role as "admin" | "suser" | "user" || "user";
// Define table columns
const columns = [
  { header: "Exam Name", accessor: "exam" },
  { header: "Score", accessor: "score", className: "hidden md:table-cell" },
  { header: "Status", accessor: "status", className: "hidden md:table-cell" },
  { header: "Team leader", accessor: "student_guardian" },
  { header: "Date", accessor: "date", className: "hidden md:table-cell" },
  ...(role === "admin"
    ? [
        {
          header: "Actions",
          accessor: "action",
        },
      ]
    : []),
];

// Render table row
const renderRow = (item: result & { exam: { name: string }, user?: { FirstName: string, LastName: string }, suser?: { FirstName: string, LastName: string } }) => (
  <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
    <td className="p-4">{item.exam?.name || "N/A"}</td>
    <td className="hidden md:table-cell">{item.score}</td>
    <td className="hidden md:table-cell">{item.status}</td>
    <td>{item.user ? `${item.user.FirstName} ${item.user.LastName}` : item.suser ? `${item.suser.FirstName} ${item.suser.LastName}` : "N/A"}</td>
    <td className="hidden md:table-cell">{new Date(item.createdAt).toLocaleDateString()}</td>
    <td>
      <div className="flex items-center gap-2">
        <Link href={`/list/results/${item.id}`}>
          <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
            <Image src="/view.png" alt="View" width={16} height={16} />
          </button>
        </Link>
      </div>
    </td>
  </tr>
);

const ResultListPage = async ({ searchParams }: { searchParams: { [key: string]: string } | undefined }) => {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role as "admin" | "suser" | "user" || "user";
  const currentUserId = session?.user?.nic;

  const { page, ...queryParams } = searchParams || {};
  const p = page ? parseInt(page) : 1;

  const query: Prisma.resultWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value) {
        switch (key) {
          case "search":
            query.OR = [
              { exam: { name: { contains: value, mode: "insensitive" } } },
              { user: { FirstName: { contains: value, mode: "insensitive" } } },
              { suser: { FirstName: { contains: value, mode: "insensitive" } } },
            ];
            break;
          case "status":
            query.status = value.toUpperCase() as "PASS" | "FAIL" | "ABSENT";
            break;
          default:
            break;
        }
      }
    }
  }

  // Role-based query filtering (Admin can see everything)
  if (role === "suser") {
    query.suser = { NIC: currentUserId }; // Suser sees only their results
  } else if (role === "user") {
    query.user = { NIC: currentUserId }; // User sees only their results
  }

  // Fetch results and count using Prisma transaction
  const [data, count] = await prisma.$transaction([  
    prisma.result.findMany({
      where: query,
      include: {
        exam: { select: { name: true } },
        user: { select: { FirstName: true, LastName: true } },
        suser: { select: { FirstName: true, LastName: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { createdAt: "desc" },
    }),
    prisma.result.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Results</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
          </div>
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default ResultListPage;
