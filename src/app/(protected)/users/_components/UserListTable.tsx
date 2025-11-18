"use client";

import type { User } from "@/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw } from "lucide-react";

type UserListTableProps = {
  users: User[];
  isLoading: boolean;
  onRefresh: () => void;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export function UserListTable({
  users,
  isLoading,
  onRefresh,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: UserListTableProps) {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch {
      return "-";
    }
  };

  const formatArray = (arr: string[] | null) => {
    if (!arr || arr.length === 0) return "-";
    return arr.join(", ");
  };

  const formatBoolean = (value: boolean | null) => {
    if (value === null) return "-";
    return value ? "예" : "아니오";
  };

  const columnCount = 18; // database.ts의 users 테이블 모든 컬럼 수

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-white border border-gray-200 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200">
              <TableHead className="font-semibold text-gray-700">ID</TableHead>
              <TableHead className="font-semibold text-gray-700">
                이메일
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                전화번호
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                이름
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                닉네임
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                인증 제공자
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                외부 유저 ID
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                생년월일
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                성별
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                국적
              </TableHead>
              <TableHead className="font-semibold text-gray-700">CI</TableHead>
              <TableHead className="font-semibold text-gray-700">
                마케팅 동의
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                알림 활성화
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                동의한 약관
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                가입일
              </TableHead>

              <TableHead className="font-semibold text-gray-700">
                마지막 로그인
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                삭제일
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className="text-center py-8 text-gray-500"
                >
                  로딩 중...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className="text-center py-8 text-gray-500"
                >
                  유저가 없습니다
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <TableCell className="py-3 font-mono text-sm text-gray-600">
                    {user.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="py-3 text-gray-900">
                    {user.email || "-"}
                  </TableCell>
                  <TableCell className="py-3 text-gray-600">
                    {user.phone || "-"}
                  </TableCell>
                  <TableCell className="py-3 text-gray-900">
                    {user.name || "-"}
                  </TableCell>
                  <TableCell className="py-3 text-gray-600">
                    {user.nickname || "-"}
                  </TableCell>
                  <TableCell className="py-3 text-gray-600 text-sm">
                    {user.auth_provider || "-"}
                  </TableCell>
                  <TableCell className="py-3 font-mono text-sm text-gray-600">
                    {user.external_user_id || "-"}
                  </TableCell>
                  <TableCell className="py-3 text-gray-600 text-sm">
                    {user.birthday || "-"}
                  </TableCell>
                  <TableCell className="py-3 text-gray-600 text-sm">
                    {user.gender || "-"}
                  </TableCell>
                  <TableCell className="py-3 text-gray-600 text-sm">
                    {user.nationality || "-"}
                  </TableCell>
                  <TableCell className="py-3 font-mono text-sm text-gray-600">
                    {user.ci || "-"}
                  </TableCell>
                  <TableCell className="py-3 text-gray-600 text-sm">
                    {formatBoolean(user.marketing_consent)}
                  </TableCell>
                  <TableCell className="py-3 text-gray-600 text-sm">
                    {formatBoolean(user.notification_enabled)}
                  </TableCell>
                  <TableCell className="py-3 text-gray-600 text-xs">
                    {formatArray(user.agreed_terms)}
                  </TableCell>
                  <TableCell className="py-3 text-gray-600 text-sm">
                    {formatDate(user.created_at)}
                  </TableCell>

                  <TableCell className="py-3 text-gray-600 text-sm">
                    {formatDate(user.last_login_at)}
                  </TableCell>
                  <TableCell className="py-3 text-gray-600 text-sm">
                    {formatDate(user.deleted_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 및 컨트롤 */}
      <div className="flex items-center justify-between">
        {/* 페이지 크기 선택 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">페이지당 항목 수:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>10개</option>
            <option value={30}>30개</option>
            <option value={50}>50개</option>
            <option value={100}>100개</option>
          </select>
        </div>

        {/* 페이지네이션 */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || isLoading}
          >
            이전
          </Button>
          <span className="text-sm text-gray-600">
            {total > 0 ? `${(page - 1) * pageSize + 1}` : 0} -{" "}
            {Math.min(page * pageSize, total)} / 총 {total}개
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
          >
            다음
          </Button>
        </div>

        {/* 새로고침 버튼 */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          새로고침
        </Button>
      </div>
    </div>
  );
}
