"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";

const Navbr = () => {
  const { data: session } = useSession();

  // Get user details
  const userName = session?.user?.name || "Guest";
  const userRole = session?.user?.role as "admin" | "suser" | "user" || "user"; // Ensure type includes "admin"

  return (
    <div className="flex items-center justify-between p-4">
      {/* Search Bar */}
      <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2 py-1">
        <Image src="/search.png" alt="" width={14} height={14} />
        <input
          className="bg-transparent w-[200px] p-2 outline-none"
          type="text"
          placeholder="Search..."
        />
      </div>

      {/* Icons and User */}
      <div className="flex justify-end w-full items-center gap-6">
        <div className="bg-white rounded-full w-7 h-7 flex justify-center items-center cursor-pointer">
          <Image src="/message.png" alt="Messages" width={20} height={20} />
        </div>

        <div className="bg-white rounded-full w-7 h-7 flex justify-center items-center cursor-pointer relative">
          <Image src="/announcement.png" alt="Announcements" width={20} height={20} />
          <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
            1
          </div>
        </div>

        {/* User Info */}
        <div className="flex flex-col">
          <span className="text-xs leading-3 font-medium">{userName}</span>
          {userRole === "admin" && (
            <span className="text-[10px] text-gray-500 text-right">{userRole}</span>
          )}
        </div>

        {/* User Avatar */}
        <Image src="/avatar.png" alt="User Avatar" width={36} height={36} className="rounded-full" />
      </div>
    </div>
  );
};

export default Navbr;
