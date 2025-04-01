import { RouteAccessMap } from "@/types/auth";

export const ITEM_PER_PAGE = 10;

export const routeAccessMap: RouteAccessMap = { 
  "/admin": ["admin"],
  "/suser": ["suser"],
  "/user": ["user"],
  "/list/susers": ["admin", "suser"],
  "/list/users": ["admin", "suser"],
  "/list/subjects": ["admin"],
  "/list/classes": ["admin", "suser"],
  "/list/exams": ["admin", "suser", "user"],
  "/list/assignments": ["admin", "suser", "user"],
  "/list/results": ["admin", "suser", "user"],
  "/list/attendance": ["admin", "suser", "user"],
  "/list/events": ["admin", "suser", "user"],
  "/list/announcements": ["admin", "suser", "user"],
};