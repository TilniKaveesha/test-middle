import Image from "next/image";
import CountChart from "./CountChart";
import prisma from "@/lib/prisma";

const CountChartContainer = async () => {
  const [suserData, userData] = await Promise.all([
    prisma.suser.groupBy({ by: ["stream"], _count: true }),
    prisma.user.groupBy({ by: ["stream"], _count: true }),
  ]);

  const allStreams = new Set([
    ...suserData.map((d) => d.stream),
    ...userData.map((d) => d.stream),
  ]);

  const chartData = Array.from(allStreams).map((stream, index) => {
    const suserCount = suserData.find((d) => d.stream === stream)?._count || 0;
    const userCount = userData.find((d) => d.stream === stream)?._count || 0;
    const total = suserCount + userCount;

    return {
      name: stream,
      count: total,
      fill: ["#FAE27C", "#C3EBFA", "#A0E57D", "#FFB3BA"][index % 4],
    };
  });

  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      {/* TITLE */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Team leaders and members by Stream</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      {/* CHART */}
      <CountChart data={chartData} />
      {/* LIST */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full" style={{ background: item.fill }} />
            <div>
              <h1 className="font-bold">{item.count}</h1>
              <h2 className="text-xs text-gray-500">{item.name}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountChartContainer;