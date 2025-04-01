import prisma from "@/lib/prisma";
import BigCalendar from "./BigCalendar";
import { adjustScheduleToCurrentWeek } from "@/lib/utils";

const BigCalendarContainer = async ({
  type,
  id,
}: {
  type: "userId" | "suserId";
  id: string;
}) => {
  // Fetch both exams and events for the user
  const [exams, events] = await Promise.all([
    prisma.exam.findMany({
      where: {
        OR: [
          { users: { some: { NIC: id } } },
          { susers: { some: { NIC: id } } },
        ],
      },
      include: {
        subject: true,
      },
    }),
    prisma.event.findMany({
      where: {
        OR: [
          { exam: { users: { some: { NIC: id } } } },
          { exam: { susers: { some: { NIC: id } } } },
          { examid: null }, // Include standalone events not tied to exams
        ],
      },
    }),
  ]);

  // Combine and transform the data for the calendar
  const calendarData = [
    ...exams.map((exam) => ({
      id: `exam-${exam.id}`,
      title: `${exam.name} (${exam.subject.name})`,
      start: exam.startTime,
      end: exam.endTime,
      type: 'exam',
      color: '#FF6B6B', // Red for exams
    })),
    ...events.map((event) => ({
      id: `event-${event.id}`,
      title: event.title,
      start: event.startTime,
      end: new Date(new Date(event.startTime).getTime() + 60 * 60 * 1000), // Default 1 hour duration if no end time
      type: 'event',
      color: '#4ECDC4', // Teal for events
    })),
  ];

  const schedule = adjustScheduleToCurrentWeek(calendarData);

  return (
    <div className="">
      <BigCalendar data={schedule} />
    </div>
  );
};

export default BigCalendarContainer;