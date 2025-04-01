import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 

export type FormContainerProps = {
  table:
    | "Suser"  // ✅ Use PascalCase for "Suser"
    | "user"   // ✅ Use lowercase for "user"
    | "subject"
    | "exam"
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
  relatedData?: any;
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {};

  const session = await getServerSession(authOptions);
  const role = session?.user?.role as "admin" | "Suser" | "user" || "user"; // ✅ Fix role naming
  const currentUserId = session?.user?.nic;

  if (type !== "delete") {
    switch (table) {
      case "subject":
        const subjectSusers = await prisma.suser.findMany({
          select: { NIC: true, FirstName: true, LastName: true },
        });
        relatedData = { susers: subjectSusers };
        break;

      case "Suser": // ✅ Fixed PascalCase
        const suserSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        relatedData = { subjects: suserSubjects };
        break;

      case "user": // ✅ Fixed lowercase "user"
        const userSusers = await prisma.suser.findMany({
          select: { NIC: true, FirstName: true, LastName: true },
        });
        relatedData = { susers: userSusers };
        break;

      case "exam":
        const examSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        relatedData = { subjects: examSubjects };
        break;

      default:
        break;
    }
  }

  return (
    <div>
      <FormModal table={table} type={type} data={data} id={id} relatedData={relatedData} />
    </div>
  );
};

export default FormContainer;
