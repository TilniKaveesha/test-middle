"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import {
  examSchema,
  ExamSchema,
} from "@/lib/formValidationSchemas";
import {
  createExam,
  updateExam,
} from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Day } from "@prisma/client"; // Import Day enum

// Define the type for the related data
interface RelatedData {
  subjects?: Array<{ id: number; name: string }>;
  admins?: Array<{ id: string; username: string }>;
}

const ExamForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: {
    id?: number;
    name?: string;
    date?: Date | string;
    startTime?: Date | string;
    endTime?: Date | string;
    Day?: Day;
    subjectId?: number;
    adminId?: string;
  };
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: RelatedData;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ExamSchema>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      name: data?.name || "",
      date: data?.date ? new Date(data.date).toISOString().slice(0, 10) : "",
      startTime: data?.startTime ? new Date(data.startTime).toISOString().slice(0, 16) : "",
      endTime: data?.endTime ? new Date(data.endTime).toISOString().slice(0, 16) : "",
      Day: data?.Day || undefined,
      subjectId: data?.subjectId || undefined,
      adminId: data?.adminId || "",
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createExam : updateExam,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((formData) => {
    console.log(formData);
    const payload = {
      ...formData,
      date: new Date(formData.date),
      startTime: new Date(formData.startTime),
      endTime: new Date(formData.endTime),
    };
    formAction(payload);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(`Exam has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error("Something went wrong!");
    }
  }, [state, router, type, setOpen]);

  const subjects = relatedData?.subjects || [];
  const admins = relatedData?.admins || [];

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new exam" : "Update the exam"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Exam title"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />
        <InputField
          label="Date"
          name="date"
          defaultValue={data?.date ? new Date(data.date).toISOString().slice(0, 10) : ""}
          register={register}
          error={errors?.date}
          type="date"
        />
        <InputField
          label="Start Time"
          name="startTime"
          defaultValue={
            data?.startTime ? new Date(data.startTime).toISOString().slice(0, 16) : ""
          }
          register={register}
          error={errors?.startTime}
          type="datetime-local"
        />
        <InputField
          label="End Time"
          name="endTime"
          defaultValue={
            data?.endTime ? new Date(data.endTime).toISOString().slice(0, 16) : ""
          }
          register={register}
          error={errors?.endTime}
          type="datetime-local"
        />
        {data?.id && (
          <div className="hidden">
            <InputField
              label="Id"
              name="id"
              defaultValue={data.id?.toString()}
              register={register}
              error={errors?.id}
            />
          </div>
        )}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Day</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("Day")}
            defaultValue={data?.Day}
          >
            <option value="">Select Day</option>
            {Object.values(Day).map((day) => (
              <option value={day} key={day}>
                {day}
              </option>
            ))}
          </select>
          {errors.Day?.message && (
            <p className="text-xs text-red-400">
              {errors.Day.message?.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Subject</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("subjectId")}
            defaultValue={data?.subjectId}
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option value={subject.id} key={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subjectId?.message && (
            <p className="text-xs text-red-400">
              {errors.subjectId.message?.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Admin</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("adminId")}
            defaultValue={data?.adminId}
          >
            <option value="">Select Admin</option>
            {admins.map((admin) => (
              <option value={admin.id} key={admin.id}>
                {admin.username}
              </option>
            ))}
          </select>
          {errors.adminId?.message && (
            <p className="text-xs text-red-400">
              {errors.adminId.message?.toString()}
            </p>
          )}
        </div>
      </div>
      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default ExamForm;