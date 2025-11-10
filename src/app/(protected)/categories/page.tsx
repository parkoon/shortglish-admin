"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CategoryAddDialog } from "./_components/CategoryAddDialog";
import { CategoryEditDialog } from "./_components/CategoryEditDialog";
import { CategoryListTable } from "./_components/CategoryListTable";
import {
  useCategoriesQuery,
  createCategoryMutation,
  updateCategoryMutation,
  deleteCategoryMutation,
  queryKeys,
} from "@/api";
import type { Category, CategoryFormData } from "@/api";

export default function CategoriesPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const queryClient = useQueryClient();

  const { data: categories, isLoading, error } = useCategoriesQuery();

  const createCategoryMutationHook = useMutation({
    mutationFn: createCategoryMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      setIsAddDialogOpen(false);
    },
  });

  const updateCategoryMutationHook = useMutation({
    mutationFn: ({
      categoryId,
      ...data
    }: { categoryId: number } & Partial<CategoryFormData>) =>
      updateCategoryMutation(categoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      setIsEditDialogOpen(false);
      setEditingCategory(null);
    },
  });

  const deleteCategoryMutationHook = useMutation({
    mutationFn: deleteCategoryMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });

  const handleCategorySubmit = (data: CategoryFormData) => {
    createCategoryMutationHook.mutate(data);
  };

  const handleCategoryEdit = (
    categoryId: number,
    data: Partial<CategoryFormData>
  ) => {
    updateCategoryMutationHook.mutate({ categoryId, ...data });
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (categoryId: number) => {
    if (confirm("정말 이 카테고리를 삭제하시겠습니까?")) {
      deleteCategoryMutationHook.mutate(categoryId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-600">에러: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">카테고리 관리</h1>
          <p className="mt-1 text-sm text-gray-600">
            영상 카테고리를 관리하세요.
          </p>
        </div>
        <CategoryAddDialog
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSubmit={handleCategorySubmit}
          isPending={createCategoryMutationHook.isPending}
          error={createCategoryMutationHook.error as Error | null}
        />
      </div>

      <CategoryListTable
        categories={categories || []}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        isDeleting={deleteCategoryMutationHook.isPending}
      />

      <CategoryEditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        category={editingCategory}
        onSubmit={handleCategoryEdit}
        isPending={updateCategoryMutationHook.isPending}
        error={updateCategoryMutationHook.error as Error | null}
      />
    </div>
  );
}
