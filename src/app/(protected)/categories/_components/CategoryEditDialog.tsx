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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { categorySchema, type CategoryFormData } from "@/api";
import type { Category } from "@/api";

type CategoryEditDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onSubmit: (categoryId: number, data: Partial<CategoryFormData>) => void;
  isPending: boolean;
  error: Error | null;
};

export function CategoryEditDialog({
  isOpen,
  onOpenChange,
  category,
  onSubmit,
  isPending,
  error,
}: CategoryEditDialogProps) {
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset();
      return;
    }

    if (category) {
      form.reset({
        name: category.name,
        order: category.order ?? undefined,
      });
    }
  }, [isOpen, category, form]);

  const handleSubmit = async (data: CategoryFormData) => {
    if (!category) return;
    onSubmit(category.id, data);
  };

  if (!category) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>카테고리 수정</DialogTitle>
          <DialogDescription>카테고리 정보를 수정하세요.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">카테고리 이름 *</Label>
            <Input
              id="edit-name"
              {...form.register("name")}
              placeholder="예: 초급, 중급, 고급"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-order">순서</Label>
            <Input
              id="edit-order"
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
              {isPending ? "수정 중..." : "수정"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
