import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { event, Prisma } from "@prisma/client";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // NextAuth config
import Link from "next/link";

type EventList = event & { exam?: { name: string } };

const EventListPage = async ({
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
    { header: "Description", accessor: "description", className: "hidden md:table-cell" },
    { header: "Exam", accessor: "exam", className: "hidden md:table-cell" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  // Render table rows
  const renderRow = (item: EventList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">{item.title}</td>
      <td className="hidden md:table-cell">{item.description}</td>
      <td className="hidden md:table-cell">{item.exam?.name ?? "N/A"}</td>
      {role === "admin" && (
        <td>
          <div className="flex items-center gap-2">
            <Link href={`/list/events/${item.id}`}>
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
                <Image src="/view.png" alt="View" width={16} height={16} />
              </button>
            </Link>
           {/*<FormContainer table="event" type="update" data={item} />
            <FormContainer table="event" type="delete" id={item.id} />*/}
          </div>
        </td>
      )}
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // Construct query filters
  const query: Prisma.eventWhereInput = {};

  // Apply search filter
  if (queryParams.search) {
    query.OR = [
      { title: { contains: queryParams.search, mode: "insensitive" } },
      { description: { contains: queryParams.search, mode: "insensitive" } },
    ];
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

  // Fetch events and count using Prisma transaction
  const [data, count] = await prisma.$transaction([
    prisma.event.findMany({
      where: query,
      include: { exam: true },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.event.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Events</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
            {/*role === "admin" && <FormContainer table="event" type="create" />*/}
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

export default EventListPage;
