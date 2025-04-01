"use client";

import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Suser, Subject, Prisma } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { ITEM_PER_PAGE } from "@/lib/settings";

const SuserListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  // Get session to check user role
  const session = await getServerSession(authOptions);
  const role = session?.user?.role as "admin" | "suser" | "user" | undefined;

  const columns = [
    { header: "Info", accessor: "info" },
    { header: "NIC", accessor: "NIC", className: "p-1 hidden md:table-cell" },
    { header: "Stream", accessor: "stream", className: "hidden md:table-cell" },
    { header: "School", accessor: "school", className: "hidden md:table-cell" },
    { header: "Phone", accessor: "PhoneNumber", className: "hidden lg:table-cell" },
    { header: "Address", accessor: "address", className: "hidden lg:table-cell" },
    ...(role === "admin"
      ? [{ header: "Actions", accessor: "action" }]
      : []),
  ];

  const renderRow = (item: Suser & { subjects: Subject[] }) => (
    <tr
      key={item.NIC}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      {/* INFO COLUMN */}
      <td className="flex items-center gap-4 p-5">
        <Image
          src={item.img || "/assets/images/avatar.png"}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.FirstName} {item.LastName}</h3>
          <p className="text-xs text-gray-500">{item?.Email}</p>
        </div>
      </td>

      {/* OTHER COLUMNS */}
      <td className="hidden md:table-cell">{item.NIC}</td>
      <td className="hidden md:table-cell">{item.stream}</td>
      <td className="hidden md:table-cell">{item.school}</td>
      <td className="hidden md:table-cell">{item.PhoneNumber}</td>
      <td className="hidden md:table-cell">{item.Address}</td>

      {/* ACTION BUTTONS (Only for Admin) */}
      {role === "admin" && (
        <td>
          <div className="flex items-center gap-2">
            <Link href={`/list/Susers/${item.NIC}`}>
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
                <Image src="/view.png" alt="View" width={16} height={16} />
              </button>
            </Link>
            <FormModal table="Suser" type="delete" id={item.NIC} />
          </div>
        </td>
      )}
    </tr>
  );

  const { page, ...queryParams } = searchParams || {};
  const p = page ? parseInt(page) : 1;

  // QUERY CONDITIONS
  const query: Prisma.SuserWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.OR = [
              { NIC: { contains: value, mode: "insensitive" } },
              { username: { contains: value, mode: "insensitive" } },
              { school: { contains: value, mode: "insensitive" } },
              { PhoneNumber: { contains: value, mode: "insensitive" } },
            ];
            break;
          case "id":
            query.NIC = { equals: value };
            break;
          case "stream":
            query.stream = value === "MATHS" ? "MATHS" : value === "BIO" ? "BIO" : undefined;
            break;
          default:
            break;
        }
      }
    }
  }

  // FETCH DATA FROM PRISMA
  const [data, count] = await prisma.$transaction([
    prisma.suser.findMany({
      where: query,
      include: { subjects: true, users: true },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.suser.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP SECTION */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Susers</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && <FormModal table="Suser" type="create" />}
          </div>
        </div>
      </div>

      {/* LIST TABLE */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default SuserListPage;
