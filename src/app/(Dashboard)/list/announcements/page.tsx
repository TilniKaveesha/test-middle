import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { announcement, Prisma } from "@prisma/client";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // NextAuth config

type AnnouncementList = announcement & { exam: { name: string } | null };

const AnnouncementListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role as "admin" | "suser" | "user" || "user"; // Default role
  const currentUserId = session?.user?.nic; // Using NIC as user ID

  // Define table columns dynamically based on role
  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Exam", accessor: "exam" },
    ...(role === "admin"
      ? [{ header: "Actions", accessor: "action" }]
      : []),
  ];

  // Render table rows
  const renderRow = (item: AnnouncementList) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="flex items-center gap-4 p-4">{item.title}</td>
      <td>{item.exam?.name || "-"}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
             {/* <FormContainer table="announcement" type="update" data={item} />
              <FormContainer table="announcement" type="delete" id={item.id} />*/}
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // Construct query filters
  const query: Prisma.announcementWhereInput = {};

  // Apply search filter
  if (queryParams.search) {
    query.title = { contains: queryParams.search, mode: "insensitive" };
  }

  // Apply role-based filtering
  if (role !== "admin") {
    query.OR = [
      { examid: null },
      {
        exam: {
          OR: [
            role === "suser" ? { susers: { some: { NIC: currentUserId } } } : {},
            role === "user" ? { users: { some: { NIC: currentUserId } } } : {},
          ],
        },
      },
    ];
  }

  // Fetch announcements and count using Prisma transaction
  const [data, count] = await prisma.$transaction([
    prisma.announcement.findMany({
      where: query,
      include: { exam: true },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.announcement.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Announcements</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
            {/*role === "admin" && <FormContainer table="announcement" type="create" />*/}
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

export default AnnouncementListPage;
