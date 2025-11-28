"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

type SubtitleCreatorAddDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SubtitleCreatorAddDialog({
  isOpen,
  onOpenChange,
}: SubtitleCreatorAddDialogProps) {
  const [videoId, setVideoId] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoId.trim()) {
      return;
    }

    // 자막 관리 페이지로 이동 (페이지에서 API 호출)
    router.push(`/subtitle-creator/${videoId.trim()}`);
    onOpenChange(false);
    setVideoId("");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setVideoId("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          자막 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>자막 제작 시작</DialogTitle>
          <DialogDescription>
            YouTube 영상 ID를 입력하면 자막 제작 페이지로 이동합니다.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-id">YouTube 영상 ID *</Label>
            <Input
              id="video-id"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              placeholder="예: dQw4w9WgXcQ"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" disabled={!videoId.trim()}>
              시작하기
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

