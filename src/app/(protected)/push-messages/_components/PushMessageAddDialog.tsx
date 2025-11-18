"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { pushMessageFormSchema, type PushMessageFormData } from "@/api";
import type { z } from "zod";

type PushMessageAddDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PushMessageFormData) => void;
  isPending: boolean;
  error: Error | null;
};

type FormData = z.infer<typeof pushMessageFormSchema>;

export function PushMessageAddDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  isPending,
  error,
}: PushMessageAddDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(pushMessageFormSchema),
    defaultValues: {
      description: "",
      template_code: "",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        description: "",
        template_code: "",
      });
    }
  }, [isOpen, form]);

  const handleSubmit = async (data: FormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          푸시 메시지 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>푸시 메시지 추가</DialogTitle>
          <DialogDescription>
            새로운 푸시 메시지를 추가하세요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template_code">템플릿 코드 *</Label>
            <Input
              id="template_code"
              {...form.register("template_code")}
              placeholder="템플릿 코드를 입력하세요"
            />
            {form.formState.errors.template_code && (
              <p className="text-sm text-red-600">
                {form.formState.errors.template_code.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Input
              id="description"
              {...form.register("description")}
              placeholder="푸시 메시지 설명 (선택사항)"
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              에러: {error.message}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "추가 중..." : "추가"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
