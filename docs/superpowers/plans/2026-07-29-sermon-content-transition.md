# 설교 본문 등장 전환 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 설교 페이지에서 스피너가 페이드아웃된 뒤 요약 본문이 블록 단위로 순차 등장하게 하고, 로딩 중 발생하는 불필요한 스크롤을 없앤다.

**Architecture:** `SermonContent`가 로딩/에러/빈값/성공 네 갈래를 `AnimatePresence mode="wait"`로 감싼다. 성공 분기는 `staggerChildren`을 가진 `m.div` 컨테이너 하나이고, `SermonBody`의 마크다운 블록·구분선·출처 정보·푸터가 모두 이 컨테이너의 자식으로 등록되어 하나의 평평한 stagger 체인을 이룬다. framer-motion의 variants는 React context로 전파되므로 `ReactMarkdown` 내부의 일반 DOM 요소를 사이에 두어도 끊기지 않는다.

**Tech Stack:** Next.js 16 (App Router), React 19, framer-motion 12 (`LazyMotion strict` + `domAnimation`), react-markdown 10, Tailwind v4, SWR 2.

## Global Constraints

- 사용자에게 보이는 문구는 전부 한국어.
- 파일명은 kebab-case, 컴포넌트는 `function` 선언 + named export, 훅/유틸은 화살표 함수 + named export.
- 라우트 전용 코드는 `app/sermon/[id]/_components/`, `_constants/`에 코로케이션한다. 두 곳 이상에서 쓰일 때만 `src/lib`, `src/components`로 올린다.
- `LazyMotion strict` 모드이므로 `motion.*`이 아니라 반드시 `m.*`을 쓴다.
- ESLint `padding-line-between-statements`: 모든 구문 사이에 빈 줄. import 연속, const/let 연속은 예외.
- 타입 임포트는 인라인 형태: `import { type Components } from 'react-markdown'`.
- import 정렬: side effect → react → 외부 → 상대 경로 → 에셋.
- Prettier: 작은따옴표, 80자, `bracketSameLine: true`.
- 테스트 프레임워크가 없다. 각 태스크의 검증은 `pnpm lint` + `pnpm --filter web build` + dev 서버 수동 확인이다.
- 커밋 메시지는 `Feat: `/`Fix: `/`Refactor: `/`Chore: `/`Design: ` 접두사 + 한국어 본문, 불릿 5개 이하.

---

### Task 1: 모션 상수 정의와 로딩 영역 정리

로딩 표시가 라우트 세그먼트용 `app/loading.tsx`(`min-h-screen w-screen`)를 재사용하고 있어 `max-w-prose` 컨테이너 안에서 가로·세로로 넘친다. 여기에 `SermonFooter`가 로딩 중에도 렌더되어 화면 밖에 접혀 있다. 로딩·에러·빈값이 공유하는 상태 영역 컴포넌트를 만들고 푸터를 성공 분기로 옮긴다.

**Files:**
- Modify: `apps/web/src/lib/motion.ts`
- Create: `apps/web/src/app/sermon/[id]/_constants/sermon-motion.ts`
- Create: `apps/web/src/app/sermon/[id]/_components/sermon-status.tsx`
- Modify: `apps/web/src/app/sermon/[id]/_components/sermon-content.tsx`
- Modify: `apps/web/src/app/sermon/[id]/page.tsx`

**Interfaces:**
- Consumes: `createTransition` from `@/lib/motion` (현재 시그니처: `createTransition(options?: { delay?: number }): Transition`)
- Produces:
  - `createTransition(options?: { delay?: number; duration?: number }): Transition` — `duration` 옵션 추가, 기본값은 기존 `0.5`
  - `SERMON_CONTENT_VARIANTS: Variants` — `hidden` / `visible`, `visible`에 `staggerChildren`
  - `SERMON_BLOCK_VARIANTS: Variants` — `hidden: { opacity: 0, y: 12 }` / `visible: { opacity: 1, y: 0 }`
  - `SERMON_STATUS_TRANSITION: Transition` — `duration: 0.25`
  - `function SermonStatus({ children }: PropsWithChildren): JSX.Element`

- [ ] **Step 1: `createTransition`에 `duration` 옵션 추가**

`apps/web/src/lib/motion.ts` 전체를 아래로 교체한다. `EASE_OUT`을 재사용하려면 옵션을 받는 편이 상수를 중복 정의하는 것보다 낫다.

```ts
import type { Transition } from 'framer-motion';

const EASE_OUT = [0, 0, 0.2, 1] as const;
const DEFAULT_DURATION = 0.5;

interface CreateTransitionOptions {
  delay?: number;
  duration?: number;
}

export function createTransition(
  options?: CreateTransitionOptions,
): Transition {
  return {
    duration: options?.duration ?? DEFAULT_DURATION,
    ease: EASE_OUT,
    ...(options?.delay !== undefined && { delay: options.delay }),
  };
}
```

- [ ] **Step 2: 모션 상수 파일 생성**

`apps/web/src/app/sermon/[id]/_constants/sermon-motion.ts`를 새로 만든다.

```ts
import { createTransition } from '@/lib/motion';
import { type Transition, type Variants } from 'framer-motion';

/** 블록 하나가 다음 블록보다 앞서 등장하는 간격(초).
 *  본문 블록 12~16개 + 구분선·출처·푸터 3개 기준 전체 캐스케이드가 약 0.75~0.95초. */
const BLOCK_STAGGER = 0.05;
const BLOCK_DISTANCE = 12;
const STATUS_DURATION = 0.25;

export const SERMON_CONTENT_VARIANTS: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: BLOCK_STAGGER },
  },
};

export const SERMON_BLOCK_VARIANTS: Variants = {
  hidden: { opacity: 0, y: BLOCK_DISTANCE },
  visible: { opacity: 1, y: 0, transition: createTransition() },
};

export const SERMON_STATUS_TRANSITION: Transition = createTransition({
  duration: STATUS_DURATION,
});
```

- [ ] **Step 3: 상태 영역 컴포넌트 생성**

`apps/web/src/app/sermon/[id]/_components/sermon-status.tsx`를 새로 만든다. 로딩 스피너와 에러·빈값 문구가 같은 마크업을 쓰므로 하나로 묶는다. `app/loading.tsx`는 라우트 세그먼트 로딩용으로 그대로 둔다.

`exit`은 Task 2에서 `AnimatePresence`를 넣기 전까지는 동작하지 않는다. 미리 넣어둔다.

```tsx
'use client';

import { type PropsWithChildren } from 'react';

import { m } from 'framer-motion';

import { SERMON_STATUS_TRANSITION } from '../_constants/sermon-motion';

/** 로딩·에러·빈값 상태를 담는 영역.
 *  헤더 h-16(64px) + 캡처 영역 pt-5(20px) + pb-4(16px) = 100px(6.25rem)를 빼면
 *  스크롤 컨테이너의 보이는 영역과 높이가 같아져 로딩 중 스크롤이 생기지 않는다. */
export function SermonStatus({ children }: PropsWithChildren) {
  return (
    <m.div
      className="flex min-h-[calc(100dvh-6.25rem)] w-full items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={SERMON_STATUS_TRANSITION}>
      {children}
    </m.div>
  );
}
```

- [ ] **Step 4: `SermonContent`의 상태 분기 교체와 푸터 이동**

`apps/web/src/app/sermon/[id]/_components/sermon-content.tsx` 전체를 아래로 교체한다. 이 단계에서는 아직 `AnimatePresence`를 넣지 않는다(Task 2). `Loading` 임포트를 지우고 `SermonFooter`를 성공 분기 마지막에 넣는다.

```tsx
'use client';

import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';

import { useSermonData } from '../_hooks/use-sermon-data';
import { SermonBody } from './sermon-body';
import { SermonContentInfo } from './sermon-content-info';
import { SermonFooter } from './sermon-footer';
import { SermonStatus } from './sermon-status';

interface SermonContentProps {
  videoId: string;
}

export function SermonContent({ videoId }: SermonContentProps) {
  const { data, isLoading, error } = useSermonData({ videoId });

  if (isLoading) {
    return (
      <SermonStatus>
        <Spinner className="text-muted-foreground size-6" />
      </SermonStatus>
    );
  }

  if (error) {
    console.error(`설교 데이터 로딩 실패: ${error}`);

    return (
      <SermonStatus>
        <p>말씀을 불러오는 중에 문제가 발생했어요</p>
      </SermonStatus>
    );
  }

  if (!data) {
    return (
      <SermonStatus>
        <p>아직 마음판에 새겨진 말씀이 없어요</p>
      </SermonStatus>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <SermonBody summary={data.summary} />
      <Separator className="mt-16 mb-4" />
      <SermonContentInfo
        originalUrl={data.originalUrl}
        savedAt={data.savedAt}
      />
      <SermonFooter />
    </div>
  );
}
```

- [ ] **Step 5: `page.tsx`에서 푸터 제거**

`apps/web/src/app/sermon/[id]/page.tsx`에서 `SermonFooter` 임포트와 JSX 사용을 지운다. `SermonContent`가 `#sermon-capture-area` 안에 있으므로 푸터는 여전히 캡처 영역에 포함된다.

```tsx
import { ScrollLayout } from '@/components/common/scroll-layout';

import KakaoScript from './_components/kakao-script';
import { SermonContent } from './_components/sermon-content';
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
      </div>
      <KakaoScript />
    </ScrollLayout>
  );
}
```

- [ ] **Step 6: lint와 빌드 확인**

```bash
pnpm lint && pnpm --filter web build
```

Expected: 두 명령 모두 성공. 실패하면 다음 단계로 넘어가지 않는다.

- [ ] **Step 7: dev 서버에서 수동 확인**

`pnpm dev` 실행 후 설교 페이지를 하드 리로드한다. 확인 항목:
- 로딩 중 가로 스크롤바가 생기지 않는다.
- 로딩 중 세로 스크롤바가 생기지 않는다(스피너 아래 푸터가 접혀 있지 않다).
- 스피너가 화면 세로 가운데에 있다.
- 본문이 뜬 뒤 푸터가 맨 아래에 정상 표시된다.

- [ ] **Step 8: 커밋**

```bash
git add apps/web/src/lib/motion.ts "apps/web/src/app/sermon/[id]/_constants/sermon-motion.ts" "apps/web/src/app/sermon/[id]/_components/sermon-status.tsx" "apps/web/src/app/sermon/[id]/_components/sermon-content.tsx" "apps/web/src/app/sermon/[id]/page.tsx"
git commit -m "$(cat <<'EOF'
Fix: 설교 페이지 로딩 중 스크롤바가 생기는 문제 수정

- 라우트용 loading.tsx 재사용을 페이지 전용 SermonStatus로 분리
- 상태 영역 높이를 스크롤 컨테이너 가시 영역에 맞춰 가로·세로 넘침 제거
- 로딩 중에도 렌더되던 SermonFooter를 성공 분기로 이동
- 등장 모션 상수를 _constants/sermon-motion.ts에 정의
EOF
)"
```

---

### Task 2: 스피너 ↔ 본문 크로스페이드

스피너가 exit 애니메이션 없이 즉시 언마운트되어 본문이 툭 나타난다. 네 갈래를 `AnimatePresence mode="wait"`로 감싸 순차 핸드오프로 바꾼다.

`mode="wait"`를 쓰는 이유: 스피너는 세로 가운데 정렬이고 본문은 상단 정렬이라 겹쳐서 교차 페이드하면 서로 다른 위치의 두 덩어리가 동시에 움직여 지저분해진다. `_components/link-input-status-msg.tsx`도 같은 패턴을 쓴다.

**Files:**
- Modify: `apps/web/src/app/sermon/[id]/_components/sermon-content.tsx`

**Interfaces:**
- Consumes: `SermonStatus` (Task 1)
- Produces: 없음

- [ ] **Step 1: `SermonContent`를 `AnimatePresence`로 감싸기**

`apps/web/src/app/sermon/[id]/_components/sermon-content.tsx` 전체를 아래로 교체한다.

`console.error`를 `useEffect`로 옮긴다. 분기가 JSX 표현식 안으로 들어가 렌더 중 실행할 자리가 없어지고, 렌더 중 부수효과는 React 19 Strict Mode에서 두 번 실행된다.

중첩 삼항은 이 코드베이스의 기존 패턴이다(`link-input-status-msg.tsx` 참고).

`key`는 `AnimatePresence`가 어떤 자식이 교체되었는지 판단하는 기준이므로 네 갈래 모두에 서로 다른 값을 준다.

```tsx
'use client';

import { useEffect } from 'react';

import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { AnimatePresence } from 'framer-motion';

import { useSermonData } from '../_hooks/use-sermon-data';
import { SermonBody } from './sermon-body';
import { SermonContentInfo } from './sermon-content-info';
import { SermonFooter } from './sermon-footer';
import { SermonStatus } from './sermon-status';

interface SermonContentProps {
  videoId: string;
}

export function SermonContent({ videoId }: SermonContentProps) {
  const { data, isLoading, error } = useSermonData({ videoId });

  useEffect(() => {
    if (!error) return;

    console.error(`설교 데이터 로딩 실패: ${error}`);
  }, [error]);

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <SermonStatus key="loading">
          <Spinner className="text-muted-foreground size-6" />
        </SermonStatus>
      ) : error ? (
        <SermonStatus key="error">
          <p>말씀을 불러오는 중에 문제가 발생했어요</p>
        </SermonStatus>
      ) : !data ? (
        <SermonStatus key="empty">
          <p>아직 마음판에 새겨진 말씀이 없어요</p>
        </SermonStatus>
      ) : (
        <div
          key="content"
          className="flex flex-1 flex-col items-center justify-center">
          <SermonBody summary={data.summary} />
          <Separator className="mt-16 mb-4" />
          <SermonContentInfo
            originalUrl={data.originalUrl}
            savedAt={data.savedAt}
          />
          <SermonFooter />
        </div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: lint와 빌드 확인**

```bash
pnpm lint && pnpm --filter web build
```

Expected: 두 명령 모두 성공.

- [ ] **Step 3: dev 서버에서 수동 확인**

설교 페이지를 하드 리로드한다. 확인 항목:
- 스피너가 즉시 사라지지 않고 0.25초 동안 흐려지며 살짝 작아진다.
- 스피너가 완전히 사라진 뒤 본문이 나타난다.
- 존재하지 않는 videoId로 접근했을 때 에러 문구도 페이드로 나타난다.

- [ ] **Step 4: 커밋**

```bash
git add "apps/web/src/app/sermon/[id]/_components/sermon-content.tsx"
git commit -m "$(cat <<'EOF'
Design: 설교 페이지 스피너와 본문 사이 전환을 페이드로 변경

- 로딩·에러·빈값·성공 분기를 AnimatePresence mode="wait"로 통합
- 렌더 중 실행되던 console.error를 useEffect로 이동
EOF
)"
```

---

### Task 3: 본문 블록 단위 순차 등장

요약 본문이 하나의 덩어리로 동시에 뜬다. `ReactMarkdown`의 `components`로 최상위 블록 태그를 모션 컴포넌트에 매핑하고, `SermonContent`의 성공 분기 컨테이너에 `staggerChildren`을 건다.

핵심 제약: **stagger 부모는 컨테이너 하나뿐이어야 한다.** `SermonBody`가 자체 stagger 부모를 가지면 본문 블록들과 구분선 이하가 서로 다른 체인에서 동시에 흐르기 시작해 본문이 끝나기 전에 구분선이 먼저 뜬다. 그래서 `SermonBody`의 루트는 모션이 아닌 일반 `<article>`로 두고, 마크다운 블록들이 바깥 컨테이너의 자식으로 등록되게 한다. variants 전파는 React context를 타므로 사이에 일반 DOM 요소가 있어도 끊기지 않는다.

**Files:**
- Modify: `apps/web/src/app/sermon/[id]/_components/sermon-body.tsx`
- Modify: `apps/web/src/app/sermon/[id]/_components/sermon-content.tsx`

**Interfaces:**
- Consumes: `SERMON_CONTENT_VARIANTS`, `SERMON_BLOCK_VARIANTS` (Task 1)
- Produces: 없음 (기존 `SermonBody` props 시그니처 `{ summary: string }` 유지)

- [ ] **Step 1: `SermonBody`의 마크다운 블록을 모션 컴포넌트에 매핑**

`apps/web/src/app/sermon/[id]/_components/sermon-body.tsx` 전체를 아래로 교체한다.

`MARKDOWN_COMPONENTS`는 반드시 모듈 스코프에 둔다. 컴포넌트 함수 안에서 만들면 렌더마다 새 참조가 되어 `ReactMarkdown`이 마크다운 트리를 리마운트하고 등장 애니메이션이 다시 돈다.

`li`는 매핑하지 않는다. 목록은 `ul`/`ol` 단위로 한 덩어리로 뜬다.

```tsx
'use client';

import { type ComponentProps, type JSX } from 'react';

import { m } from 'framer-motion';
import ReactMarkdown, {
  type Components,
  type ExtraProps,
} from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { SERMON_BLOCK_VARIANTS } from '../_constants/sermon-motion';

type BlockTag = 'h2' | 'h3' | 'h4' | 'p' | 'blockquote' | 'ul' | 'ol';

/** react-markdown이 넘기는 DOM props를 그대로 살리려면 스프레드가 필요한데,
 *  framer-motion이 onDrag·onAnimationStart 등의 타입을 재정의해 충돌한다.
 *  런타임에 마크다운 블록이 그 핸들러를 받을 일은 없어 단언으로 좁힌다. */
const createMotionBlock = (tag: BlockTag) => {
  const MotionTag = m[tag];

  function MotionBlock({
    node: _node,
    ...props
  }: JSX.IntrinsicElements[BlockTag] & ExtraProps) {
    return (
      <MotionTag
        variants={SERMON_BLOCK_VARIANTS}
        {...(props as ComponentProps<typeof MotionTag>)}
      />
    );
  }

  return MotionBlock;
};

/** 렌더마다 새로 만들면 ReactMarkdown이 트리를 리마운트해 등장 모션이 다시 돈다. */
const MARKDOWN_COMPONENTS: Components = {
  h2: createMotionBlock('h2'),
  h3: createMotionBlock('h3'),
  h4: createMotionBlock('h4'),
  p: createMotionBlock('p'),
  blockquote: createMotionBlock('blockquote'),
  ul: createMotionBlock('ul'),
  ol: createMotionBlock('ol'),
};

interface SermonBodyProps {
  summary: string;
}

export function SermonBody({ summary }: SermonBodyProps) {
  return (
    <article className="prose prose-lg dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={MARKDOWN_COMPONENTS}>
        {summary}
      </ReactMarkdown>
    </article>
  );
}
```

- [ ] **Step 2: 타입이 맞는지 빌드로 확인**

```bash
pnpm --filter web build
```

Expected: 성공. 단언 없이도 통과하는지 한 번 확인해보고, 통과하면 `as ComponentProps<typeof MotionTag>`와 그 위 주석을 지운 뒤 다시 빌드한다.

- [ ] **Step 3: 성공 분기 컨테이너에 stagger 걸기**

`apps/web/src/app/sermon/[id]/_components/sermon-content.tsx`를 수정한다.

import 문에서 `AnimatePresence`와 함께 `m`을 가져오고, 상수 두 개를 임포트한다.

```tsx
import { AnimatePresence, m } from 'framer-motion';

import {
  SERMON_BLOCK_VARIANTS,
  SERMON_CONTENT_VARIANTS,
} from '../_constants/sermon-motion';
```

성공 분기의 `<div key="content">` 블록을 아래로 교체한다.

`Separator`, `SermonContentInfo`, `SermonFooter`는 모션 props를 받지 않으므로 각각 `m.div`로 감싼다. 래퍼에 `w-full`을 주는 이유: 기존에는 이 셋이 `items-center` flex 컨테이너의 직접 자식이었고 각자 내부에 `w-full`을 갖고 있었다. 래퍼가 생기면 래퍼가 폭을 결정하므로 래퍼에 `w-full`이 필요하다.

```tsx
      ) : (
        <m.div
          key="content"
          className="flex flex-1 flex-col items-center justify-center"
          variants={SERMON_CONTENT_VARIANTS}
          initial="hidden"
          animate="visible">
          <SermonBody summary={data.summary} />
          <m.div className="w-full" variants={SERMON_BLOCK_VARIANTS}>
            <Separator className="mt-16 mb-4" />
          </m.div>
          <m.div className="w-full" variants={SERMON_BLOCK_VARIANTS}>
            <SermonContentInfo
              originalUrl={data.originalUrl}
              savedAt={data.savedAt}
            />
          </m.div>
          <m.div className="w-full" variants={SERMON_BLOCK_VARIANTS}>
            <SermonFooter />
          </m.div>
        </m.div>
      )}
```

- [ ] **Step 4: lint와 빌드 확인**

```bash
pnpm lint && pnpm --filter web build
```

Expected: 두 명령 모두 성공.

- [ ] **Step 5: dev 서버에서 수동 확인**

설교 페이지를 하드 리로드한다. 확인 항목:
- 제목 → 본문 말씀 인용 → 소제목 → 각 대지 → 예화 → 기도문 순으로 위에서부터 순차적으로 올라온다.
- 본문 블록이 전부 뜬 **뒤에** 구분선 → 출처 정보 → 푸터 순으로 이어진다. 구분선이 본문보다 먼저 뜨면 stagger 부모가 둘로 갈라진 것이므로 Step 1의 `<article>`이 `m.article`로 남아 있지 않은지 확인한다.
- 전체 캐스케이드가 1초 안에 끝난다.
- 애니메이션이 끝난 뒤 "말씀 카드로 저장하기"를 눌러 저장되는 PNG에 본문·구분선·출처·푸터가 모두 정상 밝기로 담긴다.

- [ ] **Step 6: 커밋**

```bash
git add "apps/web/src/app/sermon/[id]/_components/sermon-body.tsx" "apps/web/src/app/sermon/[id]/_components/sermon-content.tsx"
git commit -m "$(cat <<'EOF'
Design: 설교 본문을 마크다운 블록 단위로 순차 등장시키도록 변경

- ReactMarkdown components로 최상위 블록 태그를 모션 컴포넌트에 매핑
- stagger 부모를 SermonContent 컨테이너 하나로 통일해 등장 순서 보장
- 구분선·출처 정보·푸터를 같은 stagger 체인 뒤에 연결
EOF
)"
```

---

### Task 4: 동작 줄이기 설정 대응

OS의 "동작 줄이기"를 켠 사용자에게 이번 stagger를 포함한 앱 전역의 이동·스케일 애니메이션이 비활성화되고 opacity 전환만 남게 한다.

**Files:**
- Modify: `apps/web/src/components/providers/motion-provider.tsx`

**Interfaces:**
- Consumes: 없음
- Produces: 없음 (`MotionProvider` props 시그니처 변화 없음)

- [ ] **Step 1: `MotionConfig` 추가**

`apps/web/src/components/providers/motion-provider.tsx` 전체를 아래로 교체한다.

```tsx
'use client';

import { type PropsWithChildren } from 'react';

import { domAnimation, LazyMotion, MotionConfig } from 'framer-motion';

export function MotionProvider({ children }: PropsWithChildren) {
  return (
    <LazyMotion strict features={domAnimation}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
```

- [ ] **Step 2: lint와 빌드 확인**

```bash
pnpm lint && pnpm --filter web build
```

Expected: 두 명령 모두 성공.

- [ ] **Step 3: dev 서버에서 수동 확인**

macOS 시스템 설정 → 손쉬운 사용 → 디스플레이 → "동작 줄이기"를 켜고 설교 페이지를 하드 리로드한다. 확인 항목:
- 본문 블록이 위로 올라오는 이동 없이 흐려졌다 나타나기만 한다.
- 스피너가 작아지지 않고 흐려지기만 한다.
- 순차 등장 순서 자체는 유지된다.

확인 후 설정을 원래대로 되돌린다.

- [ ] **Step 4: 커밋**

```bash
git add apps/web/src/components/providers/motion-provider.tsx
git commit -m "$(cat <<'EOF'
Feat: 동작 줄이기 설정을 켠 사용자에게 이동 애니메이션 비활성화

- MotionConfig reducedMotion="user"를 MotionProvider에 추가
EOF
)"
```

---

## 최종 확인

모든 태스크 완료 후:

- [ ] `pnpm lint` 통과
- [ ] `pnpm --filter web build` 통과
- [ ] 메인 페이지에서 설교 링크 제출 → 설교 페이지 이동 경로에서도 전환이 동일하게 동작
- [ ] 설교 목록 시트에서 다른 설교로 이동했을 때도 전환이 동작
- [ ] `git status` 클린
