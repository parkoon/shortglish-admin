"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { subtitleSchema, type SubtitleFormData } from "@/api";

type SubtitleFormProps = {
  onSubmit: (data: SubtitleFormData) => void;
};

export function SubtitleForm({ onSubmit }: SubtitleFormProps) {
  const form = useForm<SubtitleFormData>({
    resolver: zodResolver(subtitleSchema),
  });

  const handleSubmit = (data: SubtitleFormData) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label htmlFor="subtitle-index" className="text-xs">
            순서
          </Label>
          <Input
            id="subtitle-index"
            type="number"
            {...form.register("index", {
              valueAsNumber: true,
            })}
            placeholder="0"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="subtitle-start" className="text-xs">
            시작 (초)
          </Label>
          <Input
            id="subtitle-start"
            type="number"
            step="0.1"
            {...form.register("start_time", {
              valueAsNumber: true,
            })}
            placeholder="0.0"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="subtitle-end" className="text-xs">
            종료 (초)
          </Label>
          <Input
            id="subtitle-end"
            type="number"
            step="0.1"
            {...form.register("end_time", {
              valueAsNumber: true,
            })}
            placeholder="0.0"
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="subtitle-origin" className="text-xs">
          원본 텍스트 *
        </Label>
        <Input
          id="subtitle-origin"
          {...form.register("origin_text")}
          placeholder="원본 텍스트를 입력하세요"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="subtitle-blanked" className="text-xs">
          빈칸 처리된 텍스트 *
        </Label>
        <Input
          id="subtitle-blanked"
          {...form.register("blanked_text")}
          placeholder="빈칸 처리된 텍스트를 입력하세요"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="subtitle-translation" className="text-xs">
          번역 *
        </Label>
        <Input
          id="subtitle-translation"
          {...form.register("translation")}
          placeholder="번역을 입력하세요"
        />
      </div>
      {Object.keys(form.formState.errors).length > 0 && (
        <div className="text-xs text-red-600">
          {Object.values(form.formState.errors).map(
            (error, idx) =>
              error?.message && <div key={idx}>{error.message}</div>
          )}
        </div>
      )}
      <Button type="submit" size="sm" variant="outline" className="w-full">
        목록에 추가
      </Button>
    </form>
  );
}

