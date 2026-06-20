"use client";

import { useState } from "react";
import { Controller, Control, FieldValues, Path } from "react-hook-form";

import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "password";
}

const FormField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
}: FormFieldProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordField = type === "password";
  const inputType = isPasswordField && showPassword ? "text" : type;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="gap-2">
          <FormLabel className="label text-sm font-medium text-light-100">
            {label}
          </FormLabel>

          <div className="relative">
            <FormControl>
              <Input
                className={`input pr-14 ${isPasswordField ? "" : ""}`}
                type={inputType}
                placeholder={placeholder}
                {...field}
              />
            </FormControl>

            {isPasswordField && (
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-xs font-semibold uppercase tracking-[0.16em] text-light-400 transition-colors hover:text-light-100"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            )}
          </div>

          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FormField;
