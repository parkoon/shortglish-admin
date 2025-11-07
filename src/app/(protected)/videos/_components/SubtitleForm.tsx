"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { subtitleFormInputSchema, type SubtitleFormInput } from "@/api";

type SubtitleFormProps = {
  onSubmit: (data: SubtitleFormInput) => void;
};

export function SubtitleForm({ onSubmit }: SubtitleFormProps) {
  const form = useForm<SubtitleFormInput>({
    resolver: zodResolver(subtitleFormInputSchema),
    defaultValues: {
      has_subtitle: true,
    },
  });

  const hasSubtitle = form.watch("has_subtitle");

  const handleSubmit = (data: SubtitleFormInput) => {
    onSubmit(data);
    form.reset({
      has_subtitle: true,
    });
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
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
      <div className="flex items-center justify-between space-x-2 py-2">
        <Label htmlFor="has-subtitle" className="text-xs">
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
        </>
      )}
      {Object.keys(form.formState.errors).length > 0 && (
        <div className="text-xs text-red-600">
          {Object.values(form.formState.errors).map(
            (error, idx) =>
              error?.message && <div key={idx}>{error.message}</div>
          )}
        </div>
      )}
      <Button type="submit" size="sm" variant="outline" className="w-full">
        자막 추가
      </Button>
    </form>
  );
}
