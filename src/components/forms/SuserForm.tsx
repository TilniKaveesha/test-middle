"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { SuserSchema, suserSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createSuser, updateSuser } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";
import { Gender, Stream } from "@prisma/client";

// Extend SuserSchema to include id for updates
type SuserFormSchema = SuserSchema & { id?: string };

interface SuserFormProps {
  type: "create" | "update";
  data?: {
    NIC?: string;
    username?: string;
    email?: string;
    password?: string;
    FirstName?: string;
    LastName?: string;
    PhoneNumber?: string;
    Address?: string;
    gender?: Gender;
    img?: string;
    stream?: Stream;
    school?: string;
    id?: string;
  };
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    subjects?: Array<{ id: number; name: string }>;
  };
}

type FormState = {
  success: boolean;
  error?: string;
  message?: string;
};

const SuserForm = ({ type, data, setOpen, relatedData }: SuserFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<SuserFormSchema>({
    resolver: zodResolver(suserSchema),
    defaultValues: {
      NIC: data?.NIC || "",
      username: data?.username || "",
      Email: data?.email || "",
      Password: data?.password || "",
      FirstName: data?.FirstName || "",
      LastName: data?.LastName || "",
      PhoneNumber: data?.PhoneNumber || "",
      Address: data?.Address || "",
      gender: data?.gender || undefined,
      img: data?.img || "",
      stream: data?.stream || undefined,
      school: data?.school || "",
      id: data?.id || undefined,
    },
  });

  const [img, setImg] = useState(data?.img ? { secure_url: data.img } : null);
  const router = useRouter();

  const [state, formAction] = useFormState<FormState, FormData>(
    async (prevState: FormState, formData: FormData) => {
      try {
        const formValues = Object.fromEntries(formData.entries()) as unknown as SuserFormSchema;
        
        if (type === "create") {
          const result = await createSuser(prevState, formData);
          return result;
        } else {
          const result = await updateSuser(prevState, formData);
          return result;
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "An unknown error occurred",
        };
      }
    },
    { success: false }
  );

  const onSubmit = handleSubmit((formData) => {
    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formDataObj.append(key, value.toString());
      }
    });
    if (img?.secure_url) {
      formDataObj.append("img", img.secure_url);
    }
    formAction(formDataObj);
  });

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || `Suser has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router, type, setOpen]);

  const handleImageUpload = (result: any) => {
    setImg(result.info);
    setValue("img", result.info.secure_url);
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      {/* ... rest of your form JSX remains the same ... */}
      
      {/* Update the hidden id field to use the correct name */}
      {data?.id && (
        <input type="hidden" {...register("id")} />
      )}

      {/* ... rest of your form JSX ... */}
    </form>
  );
};

export default SuserForm;