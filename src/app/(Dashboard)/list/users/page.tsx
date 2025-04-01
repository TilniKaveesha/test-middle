import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma, User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const UserListPage = async ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role as "admin" | "suser" | "user" | undefined;

  const columns = [
    { header: "Info", accessor: "info" },
    { header: "NIC", accessor: "NIC", className: "hidden md:table-cell" },
    { header: "Stream", accessor: "stream", className: "hidden md:table-cell" },
    { header: "Phone", accessor: "PhoneNumber", className: "hidden lg:table-cell" },
    { header: "Address", accessor: "Address", className: "hidden lg:table-cell" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: User) => (
    <tr key={item.NIC} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="flex items-center gap-4 p-4">
        <Image src={"/avatar.png"} alt="User Avatar" width={40} height={40} className="md:hidden xl:block w-10 h-10 rounded-full object-cover" />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.FirstName} {item.LastName}</h3>
          <p className="text-xs text-gray-500">{item.Email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.NIC}</td>
      <td className="hidden md:table-cell">{item.stream}</td>
      <td className="hidden md:table-cell">{item.PhoneNumber}</td>
      <td className="hidden md:table-cell">{item.Address}</td>
      {role === "admin" && (
        <td>
          <div className="flex items-center gap-2">
            <Link href={`/list/users/${item.NIC}`}>
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
                <Image src="/view.png" alt="View" width={16} height={16} />
              </button>
            </Link>
            <FormModal table="user" type="delete" id={item.NIC} />
          </div>
        </td>
      )}
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;
  const query: Prisma.UserWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value) {
        switch (key) {
          case "search":
            query.OR = [
              { NIC: { contains: value, mode: "insensitive" } },
              { FirstName: { contains: value, mode: "insensitive" } },
              { LastName: { contains: value, mode: "insensitive" } },
              { Email: { contains: value, mode: "insensitive" } },
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

  const [data, count] = await prisma.$transaction([
    prisma.user.findMany({
      where: query,
      include: { subjects: true },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.user.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Users</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            {role === "admin" && <FormModal table="user" type="create" />}
          </div>
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default UserListPage;
