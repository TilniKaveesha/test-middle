"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

const menuItems = [
  {
    title: "MENU",
    items: [
      { icon: "/home.png", label: "Home", href: "/", visible: ["admin", "suser", "user"] },
      { icon: "/teacher.png", label: "Susers", href: "/list/susers", visible: ["admin", "suser"] },
      { icon: "/student.png", label: "Users", href: "/list/users", visible: ["admin", "suser"] },
      { icon: "/subject.png", label: "Subjects", href: "/list/subjects", visible: ["admin"] },
      { icon: "/exam.png", label: "Exams", href: "/list/exams", visible: ["admin", "suser", "user"] },
      { icon: "/result.png", label: "Results", href: "/list/results", visible: ["admin", "suser", "user"] },
      { icon: "/calendar.png", label: "Events", href: "/list/events", visible: ["admin", "suser", "user"] },
      { icon: "/message.png", label: "Messages", href: "/list/messages", visible: ["admin", "suser", "user"] },
      { icon: "/announcement.png", label: "Announcements", href: "/list/announcements", visible: ["admin", "suser", "user"] },
    ],
  },
  {
    title: "OTHER",
    items: [
      { icon: "/profile.png", label: "Profile", href: "/profile", visible: ["admin", "suser", "user"] },
      { icon: "/setting.png", label: "Settings", href: "/settings", visible: ["admin", "suser", "user"] },
      { icon: "/logout.png", label: "Logout", href: "/logout", visible: ["admin", "suser", "user"] },
    ],
  },
];

const Menupg = () => {
  const { data: session } = useSession();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.role) {
      setRole(session.user.role.toLowerCase()); // Ensure lowercase for matching
    }
  }, [session]);

  return (
    <div className="mt-4 text-sm">
      {menuItems.map((section) => (
        <div className="flex flex-col gap-2" key={section.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {section.title}
          </span>
          {section.items.map((item) => {
            if (role && item.visible.includes(role)) {
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight"
                >
                  <Image src={item.icon} alt="" width={20} height={20} />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            }
          })}
        </div>
      ))}
    </div>
  );
};

export default Menupg;
