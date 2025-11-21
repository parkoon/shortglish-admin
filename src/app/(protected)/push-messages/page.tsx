"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { PushMessageTable } from "./_components/PushMessageTable";
import { PushMessageAddDialog } from "./_components/PushMessageAddDialog";
import { PushMessageSendDialog } from "./_components/PushMessageSendDialog";
import {
  usePushMessagesQuery,
  queryKeys,
  createPushMessageMutation,
  deletePushMessageMutation,
  type PushMessageFormData,
} from "@/api";

export default function PushMessagesPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<{
    id: string;
    templateSetCode: string;
  } | null>(null);
  const queryClient = useQueryClient();
  const { data: pushMessages, isLoading, error } = usePushMessagesQuery();

  const createMutation = useMutation({
    mutationFn: (data: PushMessageFormData) => createPushMessageMutation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.pushMessages.all,
      });
      setIsAddDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePushMessageMutation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.pushMessages.all,
      });
    },
  });

  const handleSendClick = (id: string, templateSetCode: string | null) => {
    if (!templateSetCode) {
      alert("템플릿 코드가 없습니다.");
      return;
    }
    setSelectedMessage({ id, templateSetCode });
    setIsSendDialogOpen(true);
  };

  const handleSendSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.pushMessages.all,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("정말 이 푸시 메시지를 삭제하시겠습니까?")) {
      try {
        await deleteMutation.mutateAsync(id);
        alert("푸시 메시지가 삭제되었습니다.");
      } catch (error) {
        alert(
          `푸시 메시지 삭제 실패: ${
            error instanceof Error ? error.message : "알 수 없는 오류"
          }`
        );
      }
    }
  };

  const handleCreate = (data: PushMessageFormData) => {
    createMutation.mutate(data);
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              푸시 메시지
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              푸시 메시지를 관리하고 발송할 수 있습니다
            </p>
          </div>
          <PushMessageAddDialog
            isOpen={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onSubmit={handleCreate}
            isPending={createMutation.isPending}
            error={createMutation.error as Error | null}
          />
        </div>

        <PushMessageTable
          messages={pushMessages || []}
          isLoading={isLoading}
          onSendClick={handleSendClick}
          onDelete={handleDelete}
          isDeleting={deleteMutation.isPending}
        />

        {selectedMessage && (
          <PushMessageSendDialog
            key={selectedMessage.id}
            isOpen={isSendDialogOpen}
            onOpenChange={setIsSendDialogOpen}
            messageId={selectedMessage.id}
            templateSetCode={selectedMessage.templateSetCode}
            onSuccess={handleSendSuccess}
          />
        )}
      </div>
    </div>
  );
}
