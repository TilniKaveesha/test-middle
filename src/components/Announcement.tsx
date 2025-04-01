import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const Announcements = async () => {
  // Get the current session to check user role and NIC
  const session = await getServerSession(authOptions);
  const role = session?.user?.role as "admin" | "suser" | "user" | undefined;
  const nic = session?.user?.nic;

  // Role-based filtering conditions
  const roleConditions = {
    suser: { NIC: nic! },  // For Suser, filter by NIC
    user: { NIC: nic! },    // For User, filter by NIC
  };

  // Query announcements
  const data = await prisma.announcement.findMany({
    take: 3,  // Limiting to 3 announcements
    orderBy: { createdAt: "desc" },  // Assuming `createdAt` is the field for sorting announcements
    where: {
      ...(role !== "admin" && {
        OR: [
          { exam: { susers: { some: roleConditions[role as keyof typeof roleConditions] } } },  // For Suser and User, filter by exam relation
          { examid: null },  // Filter announcements with no exam assigned
        ],
      }),
    },
  });

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Announcements</h1>
        <span className="text-xs text-gray-400">View All</span>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {data[0] && (
          <div className="bg-lamaSkyLight rounded-md p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">{data[0].title}</h2>
              <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                {new Intl.DateTimeFormat("en-GB").format(data[0].createdAt)}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{data[0].description}</p>
          </div>
        )}
        {data[1] && (
          <div className="bg-lamaPurpleLight rounded-md p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">{data[1].title}</h2>
              <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                {new Intl.DateTimeFormat("en-GB").format(data[1].createdAt)}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{data[1].description}</p>
          </div>
        )}
        {data[2] && (
          <div className="bg-lamaYellowLight rounded-md p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">{data[2].title}</h2>
              <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                {new Intl.DateTimeFormat("en-GB").format(data[2].createdAt)}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{data[2].description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
