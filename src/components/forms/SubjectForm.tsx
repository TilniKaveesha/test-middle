"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchemas";
import { createSubject, updateSubject } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Subject, Stream, Suser } from "@prisma/client";

// Extend SubjectSchema to include susers
type SubjectFormValues = SubjectSchema & {
  susers?: string[];
  id?: number;
};

interface SubjectFormProps {
  type: "create" | "update";
  data?: Subject & { suers?: Suser[] };
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    susers?: Array<{
      id: string;
      firstName: string;
      lastName: string;
    }>;
  };
}

const SubjectForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: SubjectFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: data?.name || "",
      stream: data?.stream || undefined,
      id: data?.id,
      susers: data?.suers?.map(s => s.NIC) || [],
    },
  });

  const [state, formAction] = useFormState<{ success: boolean; error?: string }, FormData>(
    async (prevState, formData) => {
      return type === "create" 
        ? createSubject(prevState, formData)
        : updateSubject(prevState, formData);
    },
    { success: false }
  );

  const onSubmit = handleSubmit((formData) => {
    const payload = new FormData();
    payload.append("name", formData.name);
    if (formData.stream) {
      payload.append("stream", formData.stream);
    }

    if (type === "update" && formData.id) {
      payload.append("id", formData.id.toString());
    }

    if (formData.susers) {
      formData.susers.forEach(suserId => {
        payload.append("susers", suserId);
      });
    }

    formAction(payload);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(`Subject has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new subject" : "Update the subject"}
      </h1>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4">
          <InputField
            label="Subject name"
            name="name"
            register={register}
            error={errors?.name}
          />

          <div className="flex flex-col gap-2 w-full md:w-[48%]">
            <label className="text-xs text-gray-500">Stream</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("stream")}
            >
              <option value="">Select stream</option>
              {Object.values(Stream).map((stream) => (
                <option value={stream} key={stream}>
                  {stream}
                </option>
              ))}
            </select>
            {errors.stream?.message && (
              <p className="text-xs text-red-400">
                {errors.stream.message?.toString()}
              </p>
            )}
          </div>
        </div>

        {data?.id && (
          <input type="hidden" {...register("id")} />
        )}

        {relatedData?.susers && (
          <div className="flex flex-col gap-2 w-full">
            <label className="text-xs text-gray-500">Teachers</label>
            <select
              multiple
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full min-h-[100px]"
              {...register("susers")}
            >
              {relatedData.susers.map((suser) => (
                <option value={suser.id} key={suser.id}>
                  {suser.firstName} {suser.lastName}
                </option>
              ))}
            </select>
            {state.error && (
              <p className="text-xs text-red-400">{state.error}</p>
            )}
          </div>
        )}
      </div>

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition-colors"
      >
        {type === "create" ? "Create Subject" : "Update Subject"}
      </button>
    </form>
  );
};

export default SubjectForm;