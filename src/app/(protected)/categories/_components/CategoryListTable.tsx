"use client";

import type { Category } from "@/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CategoryListTableProps = {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (categoryId: number) => void;
  isDeleting: boolean;
};

export function CategoryListTable({
  categories,
  onEdit,
  onDelete,
  isDeleting,
}: CategoryListTableProps) {
  return (
    <div className="rounded-lg bg-white border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-200">
            <TableHead className="w-[100px] font-semibold text-gray-700">
              ID
            </TableHead>
            <TableHead className="font-semibold text-gray-700">이름</TableHead>
            <TableHead className="w-[100px] font-semibold text-gray-700">
              순서
            </TableHead>
            <TableHead className="w-[200px] font-semibold text-gray-700" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories && categories.length > 0 ? (
            categories.map((category) => (
              <TableRow
                key={category.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <TableCell className="py-3 text-gray-600">
                  {category.id}
                </TableCell>
                <TableCell className="font-medium text-gray-900 py-3">
                  {category.name}
                </TableCell>
                <TableCell className="text-gray-600 py-3">
                  {category.order ?? "-"}
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(category)}
                    >
                      수정
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(category.id)}
                      disabled={isDeleting}
                    >
                      삭제
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-gray-500">
                카테고리가 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
