"use client";

import {
  fetchActiveUsers,
  sendPushMessageBatch,
  type BatchSendResult,
} from "@/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { getTableName } from "@/lib/table-names";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

const TEST_USERS = [
  { userKey: 518165018, name: "박종혁" },
  { userKey: 509114391, name: "선수빈" },
  { userKey: 82988571, name: "김진아" },
];

type SendMode = "all" | "test";

type PushMessageSendDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  messageId: string;
  templateSetCode: string;
  onSuccess?: () => void;
};

export function PushMessageSendDialog({
  isOpen,
  onOpenChange,
  messageId,
  templateSetCode,
  onSuccess,
}: PushMessageSendDialogProps) {
  const [sendMode, setSendMode] = useState<SendMode>("all");
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [result, setResult] = useState<BatchSendResult | null>(null);
  const [showFailedList, setShowFailedList] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryingUserKeys, setRetryingUserKeys] = useState<number[]>([]);
  const [activeUserCount, setActiveUserCount] = useState<number | null>(null);
  const [isLoadingUserCount, setIsLoadingUserCount] = useState(false);

  // 다이얼로그가 열릴 때 초기화 및 활성 유저 수 조회
  useEffect(() => {
    if (isOpen) {
      setSendMode("all");
      setIsSending(false);
      setProgress({ completed: 0, total: 0 });
      setResult(null);
      setShowFailedList(false);
      setIsRetrying(false);
      setRetryingUserKeys([]);
      setActiveUserCount(null);

      // 활성 유저 수 조회
      setIsLoadingUserCount(true);
      fetchActiveUsers()
        .then((users) => {
          setActiveUserCount(users.length);
        })
        .catch((error) => {
          console.error("Failed to fetch active users count:", error);
          setActiveUserCount(null);
        })
        .finally(() => {
          setIsLoadingUserCount(false);
        });
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!templateSetCode) {
      alert("템플릿 코드가 없습니다.");
      return;
    }

    setIsSending(true);
    setProgress({ completed: 0, total: 0 });
    setResult(null);
    setShowFailedList(false);

    try {
      let userKeys: Array<{ userKey: number; name?: string }> = [];

      if (sendMode === "all") {
        // 전체 발송: 활성 유저 조회
        const activeUsers = await fetchActiveUsers();
        userKeys = activeUsers.map((user) => ({
          userKey: Number(user.external_user_id),
          name: user.name || "",
        }));
      } else {
        // 테스트 발송: 하드코딩된 테스트 유저
        userKeys = TEST_USERS;
      }

      if (userKeys.length === 0) {
        alert("발송할 사용자가 없습니다.");
        setIsSending(false);
        return;
      }

      // 배치 발송 실행
      const batchResult = await sendPushMessageBatch(
        userKeys,
        templateSetCode,
        (completed, total) => {
          setProgress({ completed, total });
        }
      );

      setResult(batchResult);

      // 최소한 일부라도 성공하면 sent_at 업데이트
      if (batchResult.success > 0) {
        try {
          await supabase
            .from(getTableName("push_message"))
            .update({
              sent_at: new Date().toISOString(),
            })
            .eq("id", messageId);
        } catch (updateError) {
          console.error("Failed to update sent_at:", updateError);
          // sent_at 업데이트 실패는 무시 (발송은 성공했으므로)
        }
      }
    } catch (error) {
      alert(
        `발송 중 오류가 발생했습니다: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleRetry = async (userKey: number) => {
    if (!templateSetCode) return;

    setIsRetrying(true);
    setRetryingUserKeys((prev) => [...prev, userKey]);

    try {
      const user = result?.results.find((r) => r.userKey === userKey);
      await sendPushMessageBatch(
        [{ userKey, name: user?.name }],
        templateSetCode
      );

      // 결과 업데이트
      if (result) {
        const updatedResults = result.results.map((r) =>
          r.userKey === userKey ? { ...r, success: true, error: undefined } : r
        );
        const success = updatedResults.filter((r) => r.success).length;
        const failed = updatedResults.filter((r) => !r.success).length;

        setResult({
          success,
          failed,
          results: updatedResults,
        });
      }
    } catch (error) {
      alert(
        `재시도 중 오류가 발생했습니다: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`
      );
    } finally {
      setIsRetrying(false);
      setRetryingUserKeys((prev) => prev.filter((key) => key !== userKey));
    }
  };

  const handleRetryAll = async () => {
    if (!templateSetCode || !result) return;

    const failedUsers = result.results.filter((r) => !r.success);
    if (failedUsers.length === 0) return;

    setIsRetrying(true);
    setRetryingUserKeys(failedUsers.map((u) => u.userKey));

    try {
      await sendPushMessageBatch(
        failedUsers.map((u) => ({ userKey: u.userKey, name: u.name })),
        templateSetCode,
        (completed, total) => {
          setProgress({ completed, total });
        }
      );

      // 결과 업데이트
      const updatedResults = result.results.map((r) =>
        failedUsers.some((f) => f.userKey === r.userKey)
          ? { ...r, success: true, error: undefined }
          : r
      );
      const success = updatedResults.filter((r) => r.success).length;
      const failed = updatedResults.filter((r) => !r.success).length;

      setResult({
        success,
        failed,
        results: updatedResults,
      });
    } catch (error) {
      alert(
        `재시도 중 오류가 발생했습니다: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`
      );
    } finally {
      setIsRetrying(false);
      setRetryingUserKeys([]);
    }
  };

  const failedResults = result?.results.filter((r) => !r.success) || [];

  return (
    <Dialog open={isOpen} onOpenChange={isSending ? undefined : onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>푸시 메시지 발송</DialogTitle>
          <DialogDescription>
            발송 대상을 선택하고 메시지를 발송하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 발송 모드 선택 */}
          {!result && (
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-base font-semibold">발송 대상</Label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-md border border-gray-200 hover:bg-gray-50">
                    <input
                      type="radio"
                      name="sendMode"
                      value="all"
                      checked={sendMode === "all"}
                      onChange={(e) => setSendMode(e.target.value as SendMode)}
                      disabled={isSending}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium">
                        전체 발송
                        <span className="ml-0.5 text-sm text-gray-800">
                          ({activeUserCount?.toLocaleString()}명)
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        탈퇴하지 않은 모든 사용자에게 발송
                      </div>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-md border border-gray-200 hover:bg-gray-50">
                    <input
                      type="radio"
                      name="sendMode"
                      value="test"
                      checked={sendMode === "test"}
                      onChange={(e) => setSendMode(e.target.value as SendMode)}
                      disabled={isSending}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium">테스트 발송</div>
                      <div className="text-sm text-gray-500">
                        테스트 사용자 3명에게만 발송
                      </div>
                      {sendMode === "test" && (
                        <div className="mt-2 text-xs text-gray-600">
                          <ul className="list-disc list-inside space-y-1">
                            {TEST_USERS.map((user) => (
                              <li key={user.userKey}>
                                {user.name} ({user.userKey})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 진행률 표시 */}
          {isSending && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">발송 중...</span>
                <span className="font-medium">
                  {progress.completed} / {progress.total} 완료
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      progress.total > 0
                        ? (progress.completed / progress.total) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* 결과 표시 */}
          {result && !isSending && (
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-green-600 font-semibold">
                    ✅ 성공: {result.success}명
                  </span>
                  {result.failed > 0 && (
                    <span className="text-red-600 font-semibold">
                      ❌ 실패: {result.failed}명
                    </span>
                  )}
                </div>
              </div>

              {/* 실패한 사용자 목록 */}
              {failedResults.length > 0 && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowFailedList(!showFailedList)}
                    className="flex items-center justify-between w-full p-3 rounded-md border border-gray-200 hover:bg-gray-50 text-left"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      실패한 사용자 보기 ({failedResults.length}명)
                    </span>
                    {showFailedList ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  {showFailedList && (
                    <div className="border border-gray-200 rounded-md p-4 space-y-2 max-h-60 overflow-y-auto">
                      {failedResults.map((failed) => (
                        <div
                          key={failed.userKey}
                          className="flex items-center justify-between p-2 rounded bg-red-50"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {failed.name || `User ${failed.userKey}`}
                            </div>
                            <div className="text-xs text-gray-600">
                              ID: {failed.userKey}
                            </div>
                            {failed.error && (
                              <div className="text-xs text-red-600 mt-1">
                                {failed.error}
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRetry(failed.userKey)}
                            disabled={
                              isRetrying ||
                              retryingUserKeys.includes(failed.userKey)
                            }
                            className="ml-2"
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            재시도
                          </Button>
                        </div>
                      ))}
                      {failedResults.length > 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleRetryAll}
                          disabled={isRetrying}
                          className="w-full mt-2"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          모두 재시도
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {!result ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSending}
                >
                  취소
                </Button>
                <Button type="button" onClick={handleSend} disabled={isSending}>
                  {isSending ? "발송 중..." : "발송하기"}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onSuccess?.();
                }}
              >
                닫기
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
