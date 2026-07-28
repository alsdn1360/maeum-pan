# 메인 헤더 스크롤 레이아웃 통일 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 메인 페이지를 설교 페이지와 동일한 스크롤 레이아웃으로 옮겨, 오버스크롤 시 헤더가 밀리는 문제를 없애고 두 헤더의 시각 톤을 통일한다.

**Architecture:** 설교 페이지에만 있던 `SermonScrollLayout`(문서 대신 내부 컨테이너가 스크롤 주체)을 `src/components/common/scroll-layout.tsx`의 공용 `ScrollLayout`으로 승격한다. 두 페이지 모두 서버 컴포넌트라 render prop을 넘길 수 없으므로, `ScrollLayout`이 스크롤 컨테이너의 `ref`를 React context로 내려주고 헤더는 `header={<MainHeader />}` 형태의 `ReactNode`로 받는다. `useScrollProgress` 훅도 두 헤더가 공유하므로 `src/lib`로 승격한다.

**Tech Stack:** Next.js 16.1.6 (App Router, RSC), React 19.2.3, Tailwind v4, framer-motion 12

설계 문서: [docs/superpowers/specs/2026-07-29-main-header-scroll-layout-design.md](../specs/2026-07-29-main-header-scroll-layout-design.md)

## Global Constraints

- **테스트 프레임워크가 없다.** 각 태스크의 검증은 `pnpm lint` + `pnpm --filter web build` + 개발 서버 실제 확인으로 한다. 테스트 파일을 새로 만들지 않는다.
- 명령은 저장소 루트에서 Turborepo로 실행한다.
- 파일명은 kebab-case. 컴포넌트는 `function` 선언 + named export, 훅/유틸은 화살표 함수 + named export.
- 타입 임포트는 인라인: `import { type RefObject } from 'react'`.
- ESLint `padding-line-between-statements`: 모든 구문 사이에 빈 줄(연속 import, 연속 const/let 등은 예외).
- import 정렬(`simple-import-sort`): side effect → react → 외부(`@/` 별칭 포함, 알파벳순) → 상대 경로 → 에셋.
- Prettier: 작은따옴표, 80자, `bracketSameLine: true`(JSX 닫는 `>`를 마지막 속성과 같은 줄에).
- 사용자에게 보이는 문구는 전부 한국어.
- 커밋 메시지: `Refactor: ` / `Fix: ` 접두사 + 한국어 본문, 불릿 5개 이하.
- 브랜치는 현재 `refactor/overall-code`를 그대로 쓴다.

---

## File Structure

| 파일 | 책임 |
| --- | --- |
| `apps/web/src/components/common/scroll-layout.tsx` | 신규. `h-dvh` 셸 + 내부 스크롤 컨테이너를 소유하고, 컨테이너 `ref`를 context로 공개한다. `ScrollLayout`과 `useScrollContainer`를 export한다. |
| `apps/web/src/lib/use-scroll-progress.ts` | 이동. 주어진 컨테이너의 스크롤 진행률과 스크롤 여부를 추적한다. context를 알지 못하는 순수한 훅으로 유지한다. |
| `apps/web/src/app/(main)/_components/main-header.tsx` | 수정. 클라이언트 컴포넌트로 전환하고 설교 헤더와 동일한 클래스·전환을 갖는다. |
| `apps/web/src/app/(main)/page.tsx` | 수정. `ScrollLayout`으로 감싼다. |
| `apps/web/src/app/sermon/[id]/_components/sermon-header.tsx` | 수정. `scrollRef` prop 대신 `useScrollContainer()`를 쓴다. |
| `apps/web/src/app/sermon/[id]/page.tsx` | 수정. `ScrollLayout`으로 감싼다. |
| `apps/web/src/app/sermon/[id]/_components/sermon-scroll-layout.tsx` | 삭제. |
| `apps/web/src/app/sermon/[id]/_hooks/use-scroll-progress.ts` | 삭제(`git mv`로 이동). |

---

## Task 1: 공용 ScrollLayout 추출 및 설교 페이지 전환

이 태스크의 산출물은 **화면 변화가 전혀 없는 리팩터링**이다. 설교 페이지의 렌더 결과가 변경 전과 픽셀 단위로 같아야 한다. 메인 페이지는 아직 건드리지 않는다.

**Files:**
- Create: `apps/web/src/components/common/scroll-layout.tsx`
- Move: `apps/web/src/app/sermon/[id]/_hooks/use-scroll-progress.ts` → `apps/web/src/lib/use-scroll-progress.ts` (내용 변경 없음)
- Delete: `apps/web/src/app/sermon/[id]/_components/sermon-scroll-layout.tsx`
- Modify: `apps/web/src/app/sermon/[id]/_components/sermon-header.tsx`
- Modify: `apps/web/src/app/sermon/[id]/page.tsx`
- Test: 없음(프레임워크 부재). 검증은 lint + build + 브라우저 확인.

**Interfaces:**
- Consumes: 없음(첫 태스크).
- Produces:
  - `ScrollLayout({ header, children }: { header: ReactNode } & PropsWithChildren): JSX.Element` — `@/components/common/scroll-layout`
  - `useScrollContainer(): RefObject<HTMLDivElement | null>` — `@/components/common/scroll-layout`. `ScrollLayout` 바깥에서 호출하면 throw한다.
  - `useScrollProgress({ scrollRef, threshold? }: { scrollRef: RefObject<HTMLElement | null>; threshold?: number }): { scrollYProgress: MotionValue<number>; isScrolled: boolean }` — `@/lib/use-scroll-progress`
  - `SermonHeader({ videoId }: { videoId: string }): JSX.Element` — `scrollRef` prop이 사라진다.

---

- [ ] **Step 1: 훅을 `src/lib`로 이동한다**

`git mv`를 써서 히스토리를 보존한다. 파일 내용은 손대지 않는다.

```bash
git mv "apps/web/src/app/sermon/[id]/_hooks/use-scroll-progress.ts" apps/web/src/lib/use-scroll-progress.ts
```

이동 후 `apps/web/src/app/sermon/[id]/_hooks/`에는 `use-capture-sermon.ts`, `use-sermon-data.ts`, `use-share-sermon.ts`만 남는다.

- [ ] **Step 2: `ScrollLayout`을 만든다**

`apps/web/src/components/common/scroll-layout.tsx`를 새로 만든다.

```tsx
'use client';

import {
  createContext,
  type PropsWithChildren,
  type ReactNode,
  type RefObject,
  useContext,
  useRef,
} from 'react';

const ScrollContainerContext =
  createContext<RefObject<HTMLDivElement | null> | null>(null);

/** ScrollLayout이 소유한 스크롤 컨테이너의 ref를 꺼낸다.
 *  헤더는 스크롤 컨테이너 바깥에 있고 페이지가 서버 컴포넌트라
 *  ref를 prop으로 내릴 수 없어 context로 전달한다. */
export const useScrollContainer = () => {
  const scrollRef = useContext(ScrollContainerContext);

  if (!scrollRef) {
    throw new Error('useScrollContainer는 ScrollLayout 안에서만 쓸 수 있다.');
  }

  return scrollRef;
};

interface ScrollLayoutProps extends PropsWithChildren {
  header: ReactNode;
}

export function ScrollLayout({ header, children }: ScrollLayoutProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <ScrollContainerContext value={scrollRef}>
      <main className="flex h-dvh w-full flex-col overflow-hidden">
        {header}

        {/* 스크롤 주체를 헤더 아래 컨테이너로 두어야 스크롤바가 헤더를 덮지 않고,
            문서가 스크롤되지 않아 오버스크롤 시 헤더가 밀리지 않는다. */}
        <div
          ref={scrollRef}
          className="scrollbar-thin flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </main>
    </ScrollContainerContext>
  );
}
```

주의할 점:
- React 19이므로 `<ScrollContainerContext.Provider>`가 아니라 `<ScrollContainerContext value={...}>`를 쓴다.
- `main`/`div`의 클래스 문자열은 삭제될 `sermon-scroll-layout.tsx`에서 그대로 가져온 것이다. 한 글자도 바꾸지 않는다.
- eslint에 `react-refresh/only-export-components` 규칙이 없으므로 컴포넌트와 훅을 한 파일에서 export해도 된다.

- [ ] **Step 3: `SermonHeader`가 context를 쓰도록 고친다**

`apps/web/src/app/sermon/[id]/_components/sermon-header.tsx`를 수정한다. 변경은 네 곳이다.

1. `import { type RefObject } from 'react';` 줄과 그 아래 빈 줄을 통째로 지운다(이 파일에서 `RefObject`를 더는 쓰지 않는다).
2. 외부 import 그룹에 두 줄을 추가하고 훅 import 경로를 바꾼다.
3. `SermonHeaderProps`에서 `scrollRef`를 뺀다.
4. 컴포넌트 본문 첫 줄에서 `useScrollContainer()`를 호출한다.

수정 후 파일 상단(1~40행)은 정확히 이렇게 된다.

```tsx
'use client';

import { homeIcon, imageDownloadIcon } from '@/components/common/icons/icons';
import { useScrollContainer } from '@/components/common/scroll-layout';
import { SermonListSheet } from '@/components/common/sermon-list-sheet';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { APP_BASE_URL, APP_PATH } from '@/constants/app-path';
import { buildUrlWithParams } from '@/lib/build-url-with-params';
import { extractSermonTitle } from '@/lib/extract-sermon-title';
import { useScrollProgress } from '@/lib/use-scroll-progress';
import { cn } from '@/lib/utils';
import { m } from 'framer-motion';
import Link from 'next/link';

import { useCaptureSermon } from '../_hooks/use-capture-sermon';
import { useSermonData } from '../_hooks/use-sermon-data';
import { SermonDeleteDialog } from './sermon-delete-dialog';
import { SermonShareDialog } from './sermon-share-dialog';

interface SermonHeaderProps {
  videoId: string;
}

export function SermonHeader({ videoId }: SermonHeaderProps) {
  const scrollRef = useScrollContainer();
  const { scrollYProgress, isScrolled } = useScrollProgress({ scrollRef });
  const { data } = useSermonData({ videoId });

  const { isCapturing, handleCaptureSermonCard } = useCaptureSermon();
```

상대 경로 그룹에서 `import { useScrollProgress } from '../_hooks/use-scroll-progress';` 줄이 빠지므로 다섯 줄에서 네 줄(`use-capture-sermon`, `use-sermon-data`, 두 다이얼로그)로 줄어든다.

**41행 이후 `return (` 부터의 JSX는 한 글자도 바꾸지 않는다.** 스크롤 진행 바(`m.div#scroll-indicator`)도 그대로 둔다.

- [ ] **Step 4: 설교 페이지가 `ScrollLayout`을 쓰도록 고친다**

`apps/web/src/app/sermon/[id]/page.tsx`를 아래 내용으로 교체한다.

```tsx
import { ScrollLayout } from '@/components/common/scroll-layout';

import KakaoScript from './_components/kakao-script';
import { SermonContent } from './_components/sermon-content';
import { SermonFooter } from './_components/sermon-footer';
import { SermonHeader } from './_components/sermon-header';
import { SERMON_CAPTURE_AREA_ID } from './_constants/sermon-capture';

interface SermonPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SermonPage({ params }: SermonPageProps) {
  const { id } = await params;

  return (
    <ScrollLayout header={<SermonHeader videoId={id} />}>
      <div
        id={SERMON_CAPTURE_AREA_ID}
        className="bg-background mx-auto flex w-full max-w-prose flex-col px-4 pt-5 pb-4 sm:px-0">
        <SermonContent videoId={id} />
        <SermonFooter />
      </div>
      <KakaoScript />
    </ScrollLayout>
  );
}
```

`SermonHeader`는 클라이언트 컴포넌트지만 `videoId`가 문자열이라 서버 컴포넌트에서 엘리먼트로 만들어 넘길 수 있다.

- [ ] **Step 5: 낡은 레이아웃 파일을 지운다**

```bash
git rm "apps/web/src/app/sermon/[id]/_components/sermon-scroll-layout.tsx"
```

- [ ] **Step 6: 남은 참조가 없는지 확인한다**

```bash
cd apps/web && grep -rn "SermonScrollLayout\|_hooks/use-scroll-progress\|scrollRef=" src/
```

기대: 출력 없음. 무언가 나오면 그 파일을 고친 뒤 다시 실행한다.

- [ ] **Step 7: lint를 돌린다**

```bash
pnpm lint
```

기대: 통과. import 정렬이나 빈 줄 관련 오류가 나오면 `pnpm lint:fix`와 `pnpm format`으로 정리한 뒤 다시 돌린다.

- [ ] **Step 8: 빌드한다**

```bash
pnpm --filter web build
```

기대: 성공. `useScrollContainer` 관련 타입 오류나 "Functions cannot be passed directly to Client Components" 오류가 나오면 Step 2~4를 다시 확인한다.

- [ ] **Step 9: 개발 서버로 설교 페이지 회귀를 확인한다**

```bash
pnpm dev
```

이미 요약된 설교 URL(`/sermon/<videoId>`) 하나를 연 뒤 확인한다. 모두 **변경 전과 동일**해야 한다.

1. 헤더 좌측(목록 시트, 홈)과 우측(카드 저장, 공유, 삭제) 버튼이 모두 보이고 동작한다.
2. 아래로 스크롤하면 헤더 하단 구분선이 나타나고, 최상단으로 돌아오면 사라진다.
3. 헤더 하단의 스크롤 진행 바가 스크롤에 따라 좌→우로 채워진다.
4. 스크롤바가 헤더를 덮지 않는다.
5. 최상단에서 위로 당겨도 헤더가 움직이지 않는다.
6. 라이트/다크 모드 모두에서 1~5를 확인한다.

콘솔에 `useScrollContainer는 ScrollLayout 안에서만 쓸 수 있다.` 에러가 뜨면 Step 4의 `header` prop 배선을 확인한다.

- [ ] **Step 10: 커밋한다**

```bash
git add -A apps/web/src
git commit -m "$(cat <<'EOF'
Refactor: 스크롤 레이아웃을 공용 ScrollLayout으로 추출

- SermonScrollLayout을 components/common/scroll-layout으로 승격하고 스크롤 컨테이너 ref를 context로 전달
- 페이지가 서버 컴포넌트라 render prop을 못 쓰므로 헤더를 ReactNode prop으로 받도록 설계
- useScrollProgress를 lib으로 옮기고 SermonHeader가 context에서 ref를 얻도록 변경
- 설교 페이지 렌더 결과는 그대로 유지
EOF
)"
```

---

## Task 2: 메인 페이지를 ScrollLayout으로 전환

이 태스크의 산출물은 **원래 증상의 해결**이다. 메인 최상단에서 위로 당겨도 헤더가 밀리지 않아야 하고, 콘텐츠의 세로 위치는 변경 전과 같아야 한다.

**Files:**
- Modify: `apps/web/src/app/(main)/_components/main-header.tsx`
- Modify: `apps/web/src/app/(main)/page.tsx`
- Test: 없음(프레임워크 부재). 검증은 lint + build + 브라우저 확인.

**Interfaces:**
- Consumes: Task 1의 `ScrollLayout`, `useScrollContainer` (`@/components/common/scroll-layout`), `useScrollProgress` (`@/lib/use-scroll-progress`).
- Produces: `MainHeader(): JSX.Element` — prop 없음. `ScrollLayout` 안에서만 렌더할 수 있다.

---

- [ ] **Step 1: `MainHeader`를 설교 헤더와 같은 톤으로 바꾼다**

`apps/web/src/app/(main)/_components/main-header.tsx`를 아래 내용으로 교체한다.

```tsx
'use client';

import { useScrollContainer } from '@/components/common/scroll-layout';
import { SermonListSheet } from '@/components/common/sermon-list-sheet';
import { useScrollProgress } from '@/lib/use-scroll-progress';
import { cn } from '@/lib/utils';

export function MainHeader() {
  const scrollRef = useScrollContainer();
  const { isScrolled } = useScrollProgress({ scrollRef });

  return (
    <header
      className={cn(
        'bg-background relative z-10 flex h-16 w-full shrink-0 items-center border-b p-4 transition-all duration-200 ease-in-out',
        isScrolled
          ? 'border-border dark:border-border/80'
          : 'border-transparent',
      )}>
      <SermonListSheet />
    </header>
  );
}
```

설교 헤더와 다른 점 두 가지를 의도적으로 유지한다.
- 오른쪽 버튼 그룹이 없으므로 `justify-between`을 붙이지 않는다.
- 메인은 콘텐츠가 뷰포트에 맞아 진행률이 항상 0이므로 `scrollYProgress`를 쓰지 않고 스크롤 진행 바도 넣지 않는다.

- [ ] **Step 2: 메인 페이지를 `ScrollLayout`으로 감싼다**

`apps/web/src/app/(main)/page.tsx`를 아래 내용으로 교체한다.

```tsx
import { ScrollLayout } from '@/components/common/scroll-layout';

import { MainContent } from './_components/main-content';
import { MainFooter } from './_components/main-footer';
import { MainHeader } from './_components/main-header';

export default function MainPage() {
  return (
    <ScrollLayout header={<MainHeader />}>
      <div className="flex min-h-full flex-col">
        <MainContent />
        <MainFooter />
      </div>
    </ScrollLayout>
  );
}
```

**`main-content.tsx`는 건드리지 않는다.** `-mt-16`을 그대로 둬야 콘텐츠 세로 중심이 기존과 같은 `(dvh - 푸터높이) / 2`에 남는다. 근거는 설계 문서 4절에 있다.

`min-h-full`은 부모인 `flex-1` 스크롤 컨테이너가 `h-dvh` 플렉스 칼럼 안에 있어 높이가 확정되므로 정상 해석된다.

- [ ] **Step 3: lint를 돌린다**

```bash
pnpm lint
```

기대: 통과.

- [ ] **Step 4: 빌드한다**

```bash
pnpm --filter web build
```

기대: 성공.

- [ ] **Step 5: 개발 서버로 원래 증상이 사라졌는지 확인한다**

```bash
pnpm dev
```

`http://localhost:3000`을 열고 확인한다.

1. **최상단에서 위로 당겨도 헤더가 움직이지 않는다.** (원래 증상. macOS 트랙패드 또는 모바일에서 확인)
2. 제목·설명·입력 폼의 세로 위치가 변경 전과 같다. 변경 전 화면을 캡처해 두고 비교하면 확실하다.
3. 헤더에 구분선이 보이지 않는다(스크롤이 없으므로 `isScrolled`가 false).
4. 브라우저 창 높이를 콘텐츠가 넘칠 만큼 좁히면 스크롤이 생기고, 이때 스크롤하면 구분선이 나타난다.
5. 가로 스크롤바가 생기지 않는다(기존 `overflow-x-hidden`을 대신해 `ScrollLayout`의 `overflow-hidden`이 막는다).
6. 목록 시트를 열고 설교 항목으로 이동한 뒤 홈 버튼으로 돌아오는 왕복이 정상 동작한다.
7. 라이트/다크 모드 모두에서 1~6을 확인한다.

- [ ] **Step 6: 설교 페이지가 여전히 정상인지 확인한다**

Task 1 Step 9의 확인 항목 1~6을 다시 한 번 훑는다. Task 2는 설교 페이지를 건드리지 않았으므로 모두 통과해야 한다.

- [ ] **Step 7: 커밋한다**

```bash
git add -A "apps/web/src/app/(main)"
git commit -m "$(cat <<'EOF'
Fix: 메인 헤더가 오버스크롤 시 밀리는 문제 수정

- 메인 페이지를 ScrollLayout으로 옮겨 문서 대신 내부 컨테이너가 스크롤하도록 변경
- 문서가 스크롤되지 않아 최상단 오버스크롤에도 헤더가 고정된다
- MainHeader에 설교 헤더와 동일한 구분선 전환 적용
- MainContent의 -mt-16을 유지해 콘텐츠 세로 위치는 그대로 둠
EOF
)"
```

---

## Self-Review

**1. Spec coverage**

| 스펙 항목 | 구현 태스크 |
| --- | --- |
| 1. 공용 `ScrollLayout` 추출 (context 방식) | Task 1 Step 2 |
| 2. `useScrollProgress` → `src/lib` 승격 | Task 1 Step 1 |
| 3. `MainHeader` 시각 톤 + 클라이언트 전환 | Task 2 Step 1 |
| 4. 메인 페이지 재구성, `-mt-16` 유지 | Task 2 Step 2 |
| 5. `SermonHeader` / 설교 페이지 배선 | Task 1 Step 3~4 |
| `sermon-scroll-layout.tsx` 삭제 | Task 1 Step 5 |
| 스펙 "검증" 6개 항목 | Task 1 Step 9, Task 2 Step 5~6 |

누락 없음.

**2. Placeholder scan**

TBD/TODO 없음. 모든 코드 단계에 실제 코드 블록이 있고, "적절히 처리한다" 류의 문장 없음. "Task N과 비슷하게" 참조 없이 각 파일 전문을 실었다.

**3. Type consistency**

- `useScrollContainer(): RefObject<HTMLDivElement | null>` — Task 1이 정의하고 Task 2가 같은 이름·같은 반환 타입으로 쓴다.
- `useScrollProgress({ scrollRef })`의 `scrollRef`는 `RefObject<HTMLElement | null>`을 받으므로 `RefObject<HTMLDivElement | null>`을 넘길 수 있다.
- `ScrollLayout`의 prop 이름은 두 태스크 모두 `header`로 일치한다.
- `SermonHeader`의 prop은 Task 1에서 `{ videoId }`로 좁혀지고, 같은 태스크 Step 4에서 그대로 호출된다.
