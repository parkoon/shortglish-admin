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
import { categorySchema, type CategoryFormData } from "@/api";

type CategoryAddDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CategoryFormData) => void;
  isPending: boolean;
  error: Error | null;
};

export function CategoryAddDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  isPending,
  error,
}: CategoryAddDialogProps) {
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  const handleSubmit = async (data: CategoryFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          카테고리 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>카테고리 추가</DialogTitle>
          <DialogDescription>새로운 카테고리를 추가하세요.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">카테고리 이름 *</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="예: 애니, VLOG, 영화"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="order">순서</Label>
            <Input
              id="order"
              type="number"
              {...form.register("order", {
                setValueAs: (v) => {
                  if (v === "" || v === null || v === undefined) {
                    return undefined;
                  }
                  const num = Number(v);
                  return isNaN(num) ? undefined : num;
                },
              })}
              placeholder="예: 1, 2, 3 (선택사항)"
            />
            {form.formState.errors.order && (
              <p className="text-sm text-red-600">
                {form.formState.errors.order.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              순서가 낮을수록 먼저 표시됩니다. 비워두면 마지막에 표시됩니다.
            </p>
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
