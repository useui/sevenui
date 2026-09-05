"use client";

import { useForm } from "react-hook-form";

import { Button } from "@/registry/base/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/registry/base/ui/form-rhf";
import { Input } from "@/registry/base/ui/input";

type FormValues = { username: string };

export default function FormRhfDemo() {
  const form = useForm<FormValues>({
    defaultValues: { username: "" },
  });

  function onSubmit(values: FormValues) {
    console.log(values);
  }

  return (
    <div className="w-full max-w-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <FormField
            control={form.control}
            name="username"
            rules={{
              required: "Username is required",
              minLength: {
                value: 3,
                message: "Username must be at least 3 characters",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="shadcn" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
}
