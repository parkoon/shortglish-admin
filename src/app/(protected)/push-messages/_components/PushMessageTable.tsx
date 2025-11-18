"use client";

import type { PushMessage } from "@/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Send, Trash2 } from "lucide-react";

type PushMessageTableProps = {
  messages: PushMessage[];
  isLoading: boolean;
  onSend: (id: string) => void;
  onDelete: (id: string) => void;
  isSending: boolean;
  isDeleting: boolean;
};

export function PushMessageTable({
  messages,
  isLoading,
  onSend,
  onDelete,
  isSending,
  isDeleting,
}: PushMessageTableProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-white border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200">
              <TableHead className="font-semibold text-gray-700">
                템플릿 코드
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                설명
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                액션
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-8 text-gray-500"
                >
                  로딩 중...
                </TableCell>
              </TableRow>
            ) : messages.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-8 text-gray-500"
                >
                  푸시 메시지가 없습니다
                </TableCell>
              </TableRow>
            ) : (
              messages.map((message) => (
                <TableRow
                  key={message.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <TableCell className="py-3 font-mono text-sm text-gray-900">
                    {message.template_code || "-"}
                  </TableCell>
                  <TableCell className="py-3 text-gray-600">
                    {message.description || "-"}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSend(message.id)}
                        disabled={isSending || isDeleting}
                        className="flex items-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        발송하기
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(message.id)}
                        disabled={isSending || isDeleting}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        삭제
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
