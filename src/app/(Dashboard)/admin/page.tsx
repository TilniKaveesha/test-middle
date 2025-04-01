import UserCard from "@/components/usercard";
import Announcements from "@/components/Announcement";
import CountChartContainer from "@/components/CountChartContainer"; // Use the container component
import EventCalendar from "@/components/EventCalander";
import EventCalendarContainer from "@/components/EventCalanderContainer";

const AdminPage = ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* Left */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8 ">
        {/* USER CARD */}
        <div className="flex gap-4 justify-between">
          <UserCard type="user" />
          <UserCard type="Suser" />
          <UserCard type="Admin" />
        </div>
        {/* MIDDLE CHARTS */}
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* COUNT CHART */}
          <div className="w-full lg:w-1/3 h-[450px]">
            <CountChartContainer /> {/* Use the container component */}
          </div>
        </div>
      </div>
      {/* Right */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendarContainer searchParams={searchParams} />
        <Announcements />
      </div>
    </div>
  );
};

export default AdminPage;
