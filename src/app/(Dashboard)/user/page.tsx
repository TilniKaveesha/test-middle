import Announcements from "@/components/Announcement";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendar from "@/components/EventCalander";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

interface CalendarProps {
  userId: string;
}

interface AnnouncementsProps {
  userId: string;
}

const StudentPage = async () => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT - Main Calendar Section */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold">My Schedule</h1>
            <div className="text-sm text-gray-500">
              {session.user.firstName || "member Dashboard"}
            </div>
          </div>
          <BigCalendarContainer 
            type="userId" 
            id={session.user.nic} 
          />
        </div>
      </div>
      
      {/* RIGHT - Sidebar Section */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6">
        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-3">Upcoming Events</h2>
          <EventCalendar/>
        </div>
        
        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-3">Latest Announcements</h2>
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default StudentPage;