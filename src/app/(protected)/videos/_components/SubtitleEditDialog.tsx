"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  subtitleFormInputSchema,
  subtitleSchema,
  type SubtitleFormData,
  type SubtitleFormInput,
} from "@/api";
import type { Subtitle } from "@/api";
import { z } from "zod";

type SubtitleDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  subtitle: Subtitle | null;
  onSave: (
    subtitleId: number | null,
    data: Partial<SubtitleFormData>
  ) => void;
  isSaving: boolean;
};

export function SubtitleEditDialog({
  isOpen,
  onOpenChange,
  subtitle,
  onSave,
  isSaving,
}: SubtitleDialogProps) {
  const isEditMode = subtitle !== null;
  const form = useForm<SubtitleFormInput>({
    resolver: zodResolver(subtitleFormInputSchema),
    defaultValues: {
      start_time: 0,
      end_time: 0,
      has_subtitle: true,
      origin_text: "",
      blanked_text: "",
      translation: "",
    },
  });

  const hasSubtitle = form.watch("has_subtitle");

  useEffect(() => {
    if (!isOpen) {
      // 다이얼로그가 닫힐 때 폼 초기화
      form.reset({
        start_time: 0,
        end_time: 0,
        has_subtitle: true,
        origin_text: "",
        blanked_text: "",
        translation: "",
      });
      return;
    }

    // 다이얼로그가 열릴 때 폼 초기화 또는 데이터 로드
    if (subtitle) {
      // 수정 모드: 기존 데이터 로드
      form.reset({
        start_time: subtitle.start_time,
        end_time: subtitle.end_time,
        has_subtitle: true,
        origin_text: subtitle.origin_text,
        blanked_text: subtitle.blanked_text,
        translation: subtitle.translation,
      });
    } else {
      // 추가 모드: 빈 폼으로 초기화
      form.reset({
        start_time: 0,
        end_time: 0,
        has_subtitle: true,
        origin_text: "",
        blanked_text: "",
        translation: "",
      });
    }
  }, [isOpen, subtitle, form]);

  const handleSubmit = (data: SubtitleFormInput) => {
    if (!data.has_subtitle) {
      return;
    }

    const { has_subtitle, ...subtitleData } = data;
    const subtitleId = subtitle?.id || null;
    onSave(subtitleId, subtitleData);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "자막 수정" : "자막 추가"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "자막 정보를 수정할 수 있습니다."
              : "새로운 자막을 추가할 수 있습니다."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="dialog-start">시작 (초)</Label>
              <Input
                id="dialog-start"
                type="number"
                step="0.1"
                {...form.register("start_time", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="dialog-end">종료 (초)</Label>
              <Input
                id="dialog-end"
                type="number"
                step="0.1"
                {...form.register("end_time", { valueAsNumber: true })}
              />
            </div>
          </div>
          <div className="flex items-center justify-between space-x-2 py-2">
            <Label htmlFor="has-subtitle" className="text-sm">
              자막 여부
            </Label>
            <Controller
              name="has_subtitle"
              control={form.control}
              render={({ field }) => (
                <Switch
                  id="has-subtitle"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
          {hasSubtitle && (
            <>
              <div className="space-y-1">
                <Label htmlFor="dialog-origin">원본 텍스트 *</Label>
                <Input
                  id="dialog-origin"
                  {...form.register("origin_text")}
                  placeholder="원본 텍스트를 입력하세요"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dialog-blanked">빈칸 처리된 텍스트 *</Label>
                <Input
                  id="dialog-blanked"
                  {...form.register("blanked_text")}
                  placeholder="빈칸 처리된 텍스트를 입력하세요"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dialog-translation">번역 *</Label>
                <Input
                  id="dialog-translation"
                  {...form.register("translation")}
                  placeholder="번역을 입력하세요"
                />
              </div>
            </>
          )}
          {Object.keys(form.formState.errors).length > 0 && (
            <div className="text-sm text-red-600">
              {Object.values(form.formState.errors).map(
                (error, idx) =>
                  error?.message && <div key={idx}>{error.message}</div>
              )}
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
            <Button type="submit" disabled={isSaving || !hasSubtitle}>
              {isSaving ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

