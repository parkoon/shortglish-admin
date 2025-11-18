"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { UserListTable } from "./_components/UserListTable";
import { useUsersQuery, queryKeys } from "@/api";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useUsersQuery(page, pageSize);

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.users.all(page, pageSize),
    });
    refetch();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // 페이지 크기가 변경되면 첫 페이지로 이동
  };

  if (error) {
    return (
      <div className="flex min-h-full items-center justify-center bg-gray-50 p-8">
        <div className="text-lg text-red-600">
          에러가 발생했습니다: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">유저 관리</h1>
          <p className="mt-1 text-sm text-gray-600">
            총 {data?.total || 0}명의 유저가 있습니다
          </p>
        </div>

        <UserListTable
          users={data?.users || []}
          isLoading={isLoading}
          onRefresh={handleRefresh}
          page={page}
          pageSize={pageSize}
          total={data?.total || 0}
          totalPages={data?.totalPages || 0}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
}

