"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type BlankedTextEditorProps = {
  originText: string;
  initialBlankedText?: string;
  onChange: (blankedText: string) => void;
  className?: string;
};

type WordToken = {
  text: string;
  index: number;
  isSelected: boolean;
  isPunctuation: boolean;
};

/**
 * blanked_text를 파싱하여 선택된 단어 인덱스를 추출
 * 예: "i {am} a boy" -> [1] (두 번째 단어가 선택됨)
 */
function parseBlankedText(
  originText: string,
  blankedText: string
): Set<number> {
  const selectedIndices = new Set<number>();

  if (!originText || !blankedText) {
    return selectedIndices;
  }

  // 원본 텍스트를 토큰으로 분리 (구두점 제외)
  const originTokens = tokenizeText(originText);
  const originWords = originTokens
    .filter((t) => t.index !== -1)
    .map((t) => t.text);

  // blanked_text를 토큰으로 분리 (공백과 {word} 패턴 유지)
  // 정규식으로 {word} 패턴을 찾으면서 단어 단위로 분리
  const blankedTokens: Array<{ text: string; isBlanked: boolean }> = [];
  let currentIndex = 0;
  const pattern = /\{([^}]+)\}/g;
  let match;

  // blanked_text를 순회하면서 {word} 패턴과 일반 단어를 구분
  while ((match = pattern.exec(blankedText)) !== null) {
    // {word} 이전의 텍스트 추가
    if (match.index <= currentIndex) {
      // {word} 패턴 추가 (구두점 제거)
      const blankedWord = match[1].trim();
      // 구두점 제거하고 단어만 추출 (apostrophe는 제외 - I'm, don't 등은 단어의 일부)
      const wordOnly = blankedWord.replace(
        /^[\s,./?!;:\-()[\]{}"]+|[\s,./?!;:\-()[\]{}"]+$/g,
        ""
      );
      if (wordOnly) {
        blankedTokens.push({ text: wordOnly, isBlanked: true });
      }
      currentIndex = match.index + match[0].length;
      continue;
    }

    const beforeText = blankedText.slice(currentIndex, match.index);
    // 구두점을 제외하고 단어만 추출
    const beforeTokens = tokenizeText(beforeText);
    for (const token of beforeTokens) {
      if (token.index !== -1) {
        blankedTokens.push({ text: token.text, isBlanked: false });
      }
    }

    // {word} 패턴 추가 (구두점 제거, apostrophe는 제외 - I'm, don't 등은 단어의 일부)
    const blankedWord = match[1].trim();
    const wordOnly = blankedWord.replace(
      /^[\s,./?!;:\-()[\]{}"]+|[\s,./?!;:\-()[\]{}"]+$/g,
      ""
    );
    if (wordOnly) {
      blankedTokens.push({ text: wordOnly, isBlanked: true });
    }

    currentIndex = match.index + match[0].length;
  }

  // 남은 텍스트 추가
  if (currentIndex >= blankedText.length) {
    return selectedIndices;
  }

  const remainingText = blankedText.slice(currentIndex);
  const remainingTokens = tokenizeText(remainingText);
  for (const token of remainingTokens) {
    if (token.index !== -1) {
      blankedTokens.push({ text: token.text, isBlanked: false });
    }
  }

  // blankedTokens에서 isBlanked가 true인 단어들을 원본 텍스트와 매칭
  let originWordIndex = 0;
  for (const token of blankedTokens) {
    if (!token.isBlanked) {
      // 일반 단어는 인덱스만 증가
      if (
        originWordIndex < originWords.length &&
        originWords[originWordIndex] === token.text
      ) {
        originWordIndex++;
      }
      continue;
    }

    // 원본 텍스트에서 해당 단어 찾기 (순서대로, 구두점 제외)
    while (originWordIndex < originWords.length) {
      if (originWords[originWordIndex] === token.text) {
        selectedIndices.add(originWordIndex);
        originWordIndex++;
        break;
      }
      originWordIndex++;
    }
  }

  return selectedIndices;
}

/**
 * 선택된 단어 인덱스로부터 blanked_text 생성
 * 예: originText="i am a boy", selectedIndices=[1] -> "i {am} a boy"
 * 구두점은 {word} 밖에 위치
 */
function buildBlankedText(
  originText: string,
  selectedIndices: Set<number>
): string {
  if (!originText) {
    return "";
  }

  const tokens = tokenizeText(originText);
  let result = "";

  for (const token of tokens) {
    if (token.index === -1) {
      // 구두점 또는 공백은 그대로 유지
      result += token.text;
      continue;
    }

    // 단어인 경우
    if (selectedIndices.has(token.index)) {
      // 단어만 {word}로 감싸기 (구두점은 밖에 위치)
      result += `{${token.text}}`;
    } else {
      result += token.text;
    }
  }

  return result;
}

/**
 * 텍스트를 단어 토큰으로 분리 (구두점은 별도 처리)
 */
function tokenizeText(text: string): WordToken[] {
  if (!text) {
    return [];
  }

  const tokens: WordToken[] = [];
  // 구두점 패턴: , . / ? ! ; : - ( ) [ ] { } " 등 (apostrophe는 제외 - I'm, don't 등은 단어로 처리)
  const punctuationPattern = /([\s,./?!;:\-()[\]{}"]+)/;
  const parts = text.split(punctuationPattern);
  let wordIndex = 0;

  for (const part of parts) {
    if (part.length === 0) continue;

    // 구두점 또는 공백인지 확인 (apostrophe는 제외)
    const isPunctuationOrSpace = /^[\s,./?!;:\-()[\]{}"]+$/.test(part);

    if (isPunctuationOrSpace) {
      // 구두점 또는 공백
      tokens.push({
        text: part,
        index: -1,
        isSelected: false,
        isPunctuation: true,
      });
      continue;
    }

    // 단어
    tokens.push({
      text: part,
      index: wordIndex,
      isSelected: false,
      isPunctuation: false,
    });
    wordIndex++;
  }

  return tokens;
}

export function BlankedTextEditor({
  originText,
  initialBlankedText,
  onChange,
  className,
}: BlankedTextEditorProps) {
  // 초기 blanked_text가 있으면 파싱하여 선택 상태 복원
  // 원본 텍스트가 변경되면 선택 상태 초기화 (단, initialBlankedText가 있고 파싱 가능한 경우는 제외)
  const parsedIndices = useMemo(() => {
    if (!initialBlankedText || !originText) {
      return new Set<number>();
    }
    return parseBlankedText(originText, initialBlankedText);
  }, [initialBlankedText, originText]);

  const [selectedIndices, setSelectedIndices] =
    useState<Set<number>>(parsedIndices);

  // parsedIndices가 변경되면 selectedIndices 업데이트
  useEffect(() => {
    setSelectedIndices(parsedIndices);
  }, [parsedIndices]);

  // 단어 토큰 생성
  const tokens = useMemo(() => {
    return tokenizeText(originText);
  }, [originText]);

  // 선택 상태 변경 시 blanked_text 생성 및 전달
  // 초기 로드 시에는 파싱된 결과가 설정되므로 onChange를 호출하지 않음
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // 초기 로드 시에는 파싱된 결과를 그대로 사용
      if (originText && selectedIndices.size > 0) {
        const blankedText = buildBlankedText(originText, selectedIndices);
        onChange(blankedText);
      }
      return;
    }

    if (!originText) return;

    const blankedText = buildBlankedText(originText, selectedIndices);
    onChange(blankedText);
  }, [originText, selectedIndices, onChange]);

  const handleWordClick = (wordIndex: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(wordIndex)) {
        next.delete(wordIndex);
        return next;
      }
      next.add(wordIndex);
      return next;
    });
  };

  const handleSelectAll = () => {
    const allWordIndices = new Set<number>();
    tokens.forEach((token) => {
      if (token.index !== -1) {
        allWordIndices.add(token.index);
      }
    });
    setSelectedIndices(allWordIndices);
  };

  if (!originText) {
    return (
      <div
        className={cn(
          "min-h-[60px] rounded-md border border-gray-300 bg-gray-50 p-3 text-sm text-gray-500",
          className
        )}
      >
        원본 텍스트를 먼저 입력해주세요
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-[60px] rounded-md border border-gray-300 bg-white p-3 text-sm leading-relaxed",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-1">
        {tokens.map((token, idx) => {
          // 구두점 또는 공백은 클릭 불가
          if (token.index === -1) {
            return (
              <span key={idx} className="text-gray-600">
                {token.text}
              </span>
            );
          }

          const isSelected = selectedIndices.has(token.index);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleWordClick(token.index)}
              className={cn(
                "inline-block rounded px-1.5 py-0.5 transition-colors",
                "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                isSelected
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-900"
              )}
            >
              {token.text}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          단어를 클릭하여 빈칸 처리할 단어를 선택하세요
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
          className="h-7 text-xs"
        >
          모두 빈칸으로 처리
        </Button>
      </div>
    </div>
  );
}
