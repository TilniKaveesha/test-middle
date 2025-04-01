"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState, ReactElement } from "react";
import { usePathname, useRouter } from "next/navigation";

// Lazy load forms for better performance
const SuserForm = dynamic(() => import("./forms/SuserForm"), {
  loading: () => <h1>Loading...</h1>,
});
const UserForm = dynamic(() => import("./forms/userForm"), {
  loading: () => <h1>Loading...</h1>,
});
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ExamForm = dynamic(() => import("./forms/examForm"), {
  loading: () => <h1>Loading...</h1>,
});
/*const EventForm = dynamic(() => import("./forms/eventForm"), {
  loading: () => <h1>Loading...</h1>,
});
const AnnouncementForm = dynamic(() => import("./forms/announcementForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ResultForm = dynamic(() => import("./forms/resultForm"), {
  loading: () => <h1>Loading...</h1>,
});*/

type FormTable = "Suser" | "user" | "subject" | "exam"; // | "result" | "event" | "announcement";

// Define forms dynamically for each table
const forms: Record<FormTable, (props: any) => ReactElement> = {
  Suser: (props) => <SuserForm {...props} />,
  user: (props) => <UserForm {...props} />,
  subject: (props) => <SubjectForm {...props} />,
  exam: (props) => <ExamForm {...props} />,
  /*result: (props) => <ResultForm {...props} />,
  event: (props) => <EventForm {...props} />,
  announcement: (props) => <AnnouncementForm {...props} />,*/
};

type FormModalProps = {
  table: FormTable;
  type: "create" | "update" | "delete";
  data?: any;
  id?: string | number;
  relatedData?: any;
};

const FormModal = ({ table, type, data, id, relatedData }: FormModalProps) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-lamaYellow"
      : type === "update"
      ? "bg-lamaSky"
      : "bg-lamaPurple";

  // Handle delete action
  const handleDelete = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/${table}/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert(`${table} deleted successfully!`);
        setOpen(false);
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(`Failed to delete. Error: ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Error occurred while deleting.");
    }
  };

  const Form = () => {
    if (type === "delete" && id) {
      return (
        <form className="p-4 flex flex-col gap-4" aria-labelledby="deleteFormTitle">
          <h2 id="deleteFormTitle" className="text-center font-medium">
            All data will be lost. Are you sure you want to delete this {table}?
          </h2>
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center"
          >
            Delete
          </button>
        </form>
      );
    }

    if (type === "create" || type === "update") {
      const FormComponent = forms[table];
      if (FormComponent) {
        return <FormComponent type={type} data={data} relatedData={relatedData} setOpen={setOpen} />;
      }
      return <h1>Form not found!</h1>;
    }

    return <h1>Form not found!</h1>;
  };

  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
        onClick={() => setOpen(true)}
        aria-label={`Open ${type} form for ${table}`}
      >
        <Image src={`/${type}.png`} alt={`${type} icon`} width={16} height={16} />
      </button>
      {open && (
        <div
          className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center"
          aria-hidden={!open}
        >
          <div
            className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]"
            role="dialog"
            aria-labelledby="formModalTitle"
            aria-describedby="formModalDescription"
          >
            <h2 id="formModalTitle" className="text-xl font-semibold text-center">
              {type === "create" ? "Create New" : type === "update" ? "Update" : "Delete"} {table}
            </h2>
            <div id="formModalDescription" className="mt-4">
              <Form />
            </div>
            <div
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setOpen(false)}
              aria-label="Close form modal"
            >
              <Image src="/close.png" alt="Close" width={14} height={14} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;