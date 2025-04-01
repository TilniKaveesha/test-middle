import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import { Prisma, Subject, Stream } from "@prisma/client";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

interface SubjectWithStream extends Subject {
  streamLabel: string;
}

const SubjectListPage = async ({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string } | undefined 
}) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/sign-in");
  }

  const role = session.user.role as "admin" | "suser" | "user" || "user";
  
  // Define columns with better type safety
  const columns = [
    { 
      header: "Subject Name", 
      accessor: "name",
      className: "font-medium text-gray-900"
    },
    { 
      header: "Stream", 
      accessor: "streamLabel", 
      className: "hidden md:table-cell text-gray-600"
    },
    ...(role === "admin"
      ? [{
          header: "Actions",
          accessor: "action",
          className: "text-right"
        }]
      : []),
  ];

  // Enhanced renderRow with better UI
  const renderRow = (item: SubjectWithStream) => (
    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="p-4 align-middle">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            item.stream === Stream.MATHS ? 'bg-blue-500' : 'bg-green-500'
          }`}></div>
          {item.name}
        </div>
      </td>
      <td className="hidden md:table-cell p-4 align-middle">
        <span className={`px-2 py-1 rounded-full text-xs ${
          item.stream === Stream.MATHS 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {item.streamLabel}
        </span>
      </td>
      {role === "admin" && (
        <td className="p-4 align-middle">
          <div className="flex justify-end gap-2">
            <FormModal 
              table="subject" 
              type="update" 
              data={item} 
            />
            <FormModal 
              table="subject" 
              type="delete" 
              id={item.id}

            />
          </div>
        </td>
      )}
    </tr>
  );

  const { page, search, stream, ...otherParams } = searchParams || {};
  const currentPage = Math.max(1, parseInt(page as string) || 1);

  // Build query with better type safety
  const query: Prisma.SubjectWhereInput = {};
  
  if (search) {
    query.OR = [
      { name: { contains: search, mode: "insensitive" } },
    ];
  }

  if (stream && Object.values(Stream).includes(stream as Stream)) {
    query.stream = stream as Stream;
  }

  // Fetch data with count in transaction
  const [subjects, totalCount] = await prisma.$transaction([
    prisma.subject.findMany({
      where: query,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (currentPage - 1),
      orderBy: { name: 'asc' }
    }),
    prisma.subject.count({ where: query }),
  ]);

  // Enhance subjects data with stream labels
  const enhancedData: SubjectWithStream[] = subjects.map(subject => ({
    ...subject,
    streamLabel: subject.stream === Stream.MATHS ? "Mathematics" : "Biology"
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Subject Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalCount} subjects found
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <TableSearch/>
          
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
              <Image 
                src="/filter.png" 
                alt="Filter" 
                width={16} 
                height={16} 
                className="opacity-70"
              />
            </button>
            <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
              <Image 
                src="/sort.png" 
                alt="Sort" 
                width={16} 
                height={16} 
                className="opacity-70"
              />
            </button>
            {role === "admin" && (
              <FormModal 
                table="subject" 
                type="create" 
              />
            )}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <Table 
          columns={columns} 
          renderRow={renderRow} 
          data={enhancedData}
        />
      </div>

      {/* Pagination */}
      {totalCount > ITEM_PER_PAGE && (
        <div className="mt-6">
          <Pagination 
            page={currentPage} 
            count={totalCount} 
          />
        </div>
      )}
    </div>
  );
};

export default SubjectListPage;