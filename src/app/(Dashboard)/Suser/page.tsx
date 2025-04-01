import Announcements from "@/components/Announcement";
import BigCalendar from "@/components/BigCalendar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import BigCalendarContainer from "@/components/BigCalendarContainer";

const SuserPage = async () => {
  // Retrieve the session
  const session = await getServerSession(authOptions);

  // If session doesn't exist or role isn't "suser", the middleware handles the redirection
  if (!session || session.user.role !== "suser") {
    // This is a fallback in case the middleware fails or is bypassed
    return (
      <div className="flex items-center justify-center h-screen">
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Schedule</h1>
          <BigCalendarContainer type="suserId" id={session.user.nic} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <Announcements />
      </div>
    </div>
  );
};

export default SuserPage;