# Supabase 연동 설정

## 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=https://atkufyuiprxolawrbwta.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0a3VmeXVpcHJ4b2xhd3Jid3RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNDAzNjMsImV4cCI6MjA2NTYxNjM2M30.sG84L2Ne5dHnGxyzeJ-Y6rMCVLt0l5ZEVs_a9pej8Y0
```

## 확인된 Supabase 프로젝트

- **프로젝트 ID**: `atkufyuiprxolawrbwta`
- **프로젝트 이름**: `soobin@jobis.co's Project`
- **지역**: `ap-northeast-2` (서울)
- **상태**: `ACTIVE_HEALTHY`

## 데이터베이스 테이블

다음 테이블들이 확인되었습니다:

- `tdoc` - 개인정보 문서 (1,208 rows)
- `pricing_plans` - 가격 플랜 (136 rows)
- `plan_pricing` - 플랜 가격 (164 rows)
- `consultation_leads` - 상담 리드 (9 rows)
- `products` - 제품 (9 rows)
- `internet_support_consultations` - 인터넷 지원 상담 (770 rows)
- `gibu_daily_products` - 기부 일일 제품 (3 rows)
- `phone_notifications` - 전화 알림 (42 rows)
- `carrier_consultation_leads` - 통신사 상담 리드 (248 rows)
- `telecom_plans` - 통신 플랜 (18 rows)
- `application_flows` - 신청 플로우 (0 rows)
- `plan_recommendations` - 플랜 추천 (9 rows)
- `email_invoices` - 이메일 인보이스 (0 rows)
- `ceo_lean` - CEO 리드 (25 rows)
- `deals` - 딜 (50 rows)
- `crawl_logs` - 크롤 로그 (106 rows)
- `deals_raw` - 딜 원본 (0 rows)
- `work_records` - 근무 기록 (0 rows)
- `workplaces` - 근무지 (0 rows)
- `income_tax_table` - 소득세 테이블 (590 rows)

## 사용 방법

### Supabase 클라이언트 사용

```typescript
import { supabase } from "@/lib/supabase";

// 데이터 조회
const { data, error } = await supabase
  .from("products")
  .select("*");

// 데이터 삽입
const { data, error } = await supabase
  .from("products")
  .insert([{ title: "새 제품", price: 10000 }]);

// 데이터 업데이트
const { data, error } = await supabase
  .from("products")
  .update({ price: 15000 })
  .eq("id", "some-id");

// 데이터 삭제
const { data, error } = await supabase
  .from("products")
  .delete()
  .eq("id", "some-id");
```

### 연결 테스트

로그인 후 `/test-supabase` 페이지에서 연결 상태를 확인할 수 있습니다.

## 보안 참고사항

- 모든 테이블에 RLS (Row Level Security)가 활성화되어 있습니다.
- 어드민 페이지에서는 서버 사이드에서 Supabase 클라이언트를 사용하는 것을 권장합니다.
- 필요시 서비스 역할 키를 사용하여 RLS를 우회할 수 있습니다 (환경 변수에 추가 필요).

